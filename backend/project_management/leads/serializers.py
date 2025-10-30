from rest_framework import serializers
from .models import Lead
from employee.models import Employee


class AssignedEmployeeMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name']


class LeadListSerializer(serializers.ModelSerializer):
    assign_to = AssignedEmployeeMiniSerializer(read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'contact', 'lead_source', 'status',
            'assign_to', 'description', 'created_at'
        ]


class LeadDetailSerializer(LeadListSerializer):
    class Meta(LeadListSerializer.Meta):
        fields = LeadListSerializer.Meta.fields + ['updated_at']


class LeadCreateSerializer(serializers.ModelSerializer):
    assign_to_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'contact', 'lead_source', 'status',
            'assign_to_id', 'description'
        ]

    def validate_assign_to_id(self, value: int) -> int:
        if value is None:
            raise serializers.ValidationError('assign_to_id is required')
        try:
            Employee.objects.only('id').get(id=value)
        except Employee.DoesNotExist:
            raise serializers.ValidationError('Employee does not exist')
        return value

    def create(self, validated_data):
        assign_to_id = validated_data.pop('assign_to_id')
        employee = Employee.objects.get(id=assign_to_id)
        return Lead.objects.create(assign_to=employee, **validated_data)

    def update(self, instance, validated_data):
        assign_to_id = validated_data.pop('assign_to_id', None)
        if assign_to_id is not None:
            try:
                employee = Employee.objects.get(id=assign_to_id)
                instance.assign_to = employee
            except Employee.DoesNotExist:
                raise serializers.ValidationError({'assign_to_id': 'Employee does not exist'})
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance

