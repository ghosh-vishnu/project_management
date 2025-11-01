from rest_framework import serializers
from django.contrib.auth.models import User
from clients.models import Client as RealClient
from .models import Project
from employee.models import Employee


class EmployeeMiniSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name']

    def get_name(self, obj):
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full or obj.username


class ClientMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealClient
        fields = ['id', 'name']


class ProjectListSerializer(serializers.ModelSerializer):
    assigned_to = EmployeeMiniSerializer(read_only=True)
    client_name = ClientMiniSerializer(source='client', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date', 'status',
            'assigned_to', 'client_name', 'budget'
        ]


class ProjectCreateSerializer(serializers.ModelSerializer):
    assigned_to_id = serializers.IntegerField(write_only=True)
    client_name_id = serializers.IntegerField(write_only=True)
    # Override to accept human-readable labels from the frontend, then normalize in validate()
    status = serializers.CharField(write_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date', 'status',
            'assigned_to_id', 'client_name_id', 'budget'
        ]

    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError({'end_date': 'Must be on or after start_date'})
        # Normalize status to internal choices robustly
        status_value = attrs.get('status')
        if status_value is not None:
            raw = str(status_value).strip()
            # Common display-to-internal mapping
            mapping = {
                'not started': 'not_started',
                'planning': 'planning',
                'in progress': 'in_progress',
                'paused': 'paused',
                'completed': 'completed',
                'cancelled': 'cancelled',
            }
            key = raw.lower()
            normalized = mapping.get(key, key.replace('  ', ' ').replace(' ', '_'))
            valid_values = [choice[0] for choice in Project.STATUS_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({'status': f'Invalid status: {raw}'})
            attrs['status'] = normalized
        return attrs

    def create(self, validated_data):
        user_id = validated_data.pop('assigned_to_id')
        client_id = validated_data.pop('client_name_id')
        # Frontend supplies Employee.id for assigned_to; resolve to the underlying User
        user = None
        try:
            emp = Employee.objects.select_related('user').get(id=user_id)
            user = emp.user
        except Employee.DoesNotExist:
            # Fallback: if the frontend ever sends a User id directly
            user = User.objects.get(id=user_id)
        client = RealClient.objects.get(id=client_id)
        return Project.objects.create(assigned_to=user, client=client, **validated_data)

    def update(self, instance, validated_data):
        user_id = validated_data.pop('assigned_to_id', None)
        client_id = validated_data.pop('client_name_id', None)
        if user_id is not None:
            try:
                emp = Employee.objects.select_related('user').get(id=user_id)
                instance.assigned_to = emp.user
            except Employee.DoesNotExist:
                instance.assigned_to = User.objects.get(id=user_id)
        if client_id is not None:
            instance.client = RealClient.objects.get(id=client_id)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance

# projects/serializers.py
from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
