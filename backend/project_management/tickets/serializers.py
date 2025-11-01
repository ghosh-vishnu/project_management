from rest_framework import serializers
from .models import Ticket
from projects.models import Project
from clients.models import Client
from employee.models import Employee


class ProjectMiniSerializer(serializers.ModelSerializer):
    """Mini serializer for project in ticket list"""
    class Meta:
        model = Project
        fields = ['id', 'title']


class ClientMiniSerializer(serializers.ModelSerializer):
    """Mini serializer for client in ticket list"""
    class Meta:
        model = Client
        fields = ['id', 'name']


class EmployeeMiniSerializer(serializers.ModelSerializer):
    """Mini serializer for employee in ticket list"""
    class Meta:
        model = Employee
        fields = ['id', 'name']


class TicketListSerializer(serializers.ModelSerializer):
    """Serializer for listing tickets"""
    project_name = ProjectMiniSerializer(source='project', read_only=True)
    client_name = ClientMiniSerializer(source='client', read_only=True)
    assign_to = EmployeeMiniSerializer(source='assigned_to', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'project_name', 'client_name', 'assign_to',
            'priority', 'status', 'description', 'created_at', 'updated_at'
        ]


class TicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating tickets"""
    project_name_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    client_name_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    assign_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    # Accept human-readable status/priority labels from frontend
    status = serializers.CharField(write_only=True, required=True)
    priority = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'project_name_id', 'client_name_id', 'assign_to_id',
            'priority', 'status', 'description'
        ]
    
    def validate(self, attrs):
        """Normalize status/priority"""
        # Normalize status
        status_value = attrs.get('status')
        if status_value is not None:
            raw = str(status_value).strip().lower()
            mapping = {
                'open': 'open',
                'close': 'close',
                'closed': 'close',
            }
            normalized = mapping.get(raw, raw.lower())
            valid_values = [choice[0] for choice in Ticket.STATUS_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({
                    'status': f'Invalid status: {status_value}'
                })
            attrs['status'] = normalized
        
        # Normalize priority
        priority_value = attrs.get('priority')
        if priority_value is not None:
            raw = str(priority_value).strip().lower()
            mapping = {
                'high': 'high',
                'medium': 'medium',
                'low': 'low',
            }
            normalized = mapping.get(raw, raw.lower())
            valid_values = [choice[0] for choice in Ticket.PRIORITY_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({
                    'priority': f'Invalid priority: {priority_value}'
                })
            attrs['priority'] = normalized
        
        return attrs
    
    def create(self, validated_data):
        """Create a new ticket"""
        project_id = validated_data.pop('project_name_id', None)
        client_id = validated_data.pop('client_name_id', None)
        employee_id = validated_data.pop('assign_to_id', None)
        
        project = None
        if project_id:
            try:
                project = Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                raise serializers.ValidationError({
                    'project_name_id': 'Project not found'
                })
        
        client = None
        if client_id:
            try:
                client = Client.objects.get(id=client_id)
            except Client.DoesNotExist:
                raise serializers.ValidationError({
                    'client_name_id': 'Client not found'
                })
        
        employee = None
        if employee_id:
            try:
                employee = Employee.objects.get(id=employee_id)
            except Employee.DoesNotExist:
                raise serializers.ValidationError({
                    'assign_to_id': 'Employee not found'
                })
        
        return Ticket.objects.create(
            project=project,
            client=client,
            assigned_to=employee,
            **validated_data
        )
    
    def update(self, instance, validated_data):
        """Update an existing ticket"""
        project_id = validated_data.pop('project_name_id', None)
        client_id = validated_data.pop('client_name_id', None)
        employee_id = validated_data.pop('assign_to_id', None)
        
        if project_id is not None:
            if project_id == 0 or project_id == '':
                instance.project = None
            else:
                try:
                    instance.project = Project.objects.get(id=project_id)
                except Project.DoesNotExist:
                    raise serializers.ValidationError({
                        'project_name_id': 'Project not found'
                    })
        
        if client_id is not None:
            if client_id == 0 or client_id == '':
                instance.client = None
            else:
                try:
                    instance.client = Client.objects.get(id=client_id)
                except Client.DoesNotExist:
                    raise serializers.ValidationError({
                        'client_name_id': 'Client not found'
                    })
        
        if employee_id is not None:
            if employee_id == 0 or employee_id == '':
                instance.assigned_to = None
            else:
                try:
                    instance.assigned_to = Employee.objects.get(id=employee_id)
                except Employee.DoesNotExist:
                    raise serializers.ValidationError({
                        'assign_to_id': 'Employee not found'
                    })
        
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        instance.save()
        return instance

