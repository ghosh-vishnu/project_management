from rest_framework import serializers
from .models import ToDo
from projects.models import Project


class ProjectMiniSerializer(serializers.ModelSerializer):
    """Mini serializer for project in todo list"""
    class Meta:
        model = Project
        fields = ['id', 'title']


class ToDoListSerializer(serializers.ModelSerializer):
    """Serializer for listing todos"""
    project_name = ProjectMiniSerializer(source='project', read_only=True)
    
    class Meta:
        model = ToDo
        fields = [
            'id', 'todo_name', 'project_name', 
            'priority', 'status', 'start_date', 'end_date', 
            'description', 'created_at', 'updated_at'
        ]


class ToDoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating todos"""
    project_name_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    # Accept human-readable status/priority labels from frontend
    status = serializers.CharField(write_only=True, required=True)
    priority = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = ToDo
        fields = [
            'id', 'todo_name', 'project_name_id',
            'priority', 'status', 'start_date', 'end_date', 'description'
        ]
    
    def validate(self, attrs):
        """Validate dates and normalize status/priority"""
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        
        if start and end and end < start:
            raise serializers.ValidationError({
                'end_date': 'End date must be on or after start date'
            })
        
        # Normalize status
        status_value = attrs.get('status')
        if status_value is not None:
            raw = str(status_value).strip().lower()
            mapping = {
                'not started': 'not_started',
                'planning': 'planning',
                'in progress': 'in_progress',
                'paused': 'paused',
                'completed': 'completed',
                'cancelled': 'cancelled',
            }
            normalized = mapping.get(raw, raw.replace(' ', '_'))
            valid_values = [choice[0] for choice in ToDo.STATUS_CHOICES]
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
                'highest': 'highest',
                'high': 'high',
                'medium': 'medium',
                'low': 'low',
                'lowest': 'lowest',
            }
            normalized = mapping.get(raw, raw.lower())
            valid_values = [choice[0] for choice in ToDo.PRIORITY_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({
                    'priority': f'Invalid priority: {priority_value}'
                })
            attrs['priority'] = normalized
        
        return attrs
    
    def create(self, validated_data):
        """Create a new todo"""
        project_id = validated_data.pop('project_name_id', None)
        
        project = None
        if project_id:
            try:
                project = Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                raise serializers.ValidationError({
                    'project_name_id': 'Project not found'
                })
        
        return ToDo.objects.create(
            project=project,
            **validated_data
        )
    
    def update(self, instance, validated_data):
        """Update an existing todo"""
        project_id = validated_data.pop('project_name_id', None)
        
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
        
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        instance.save()
        return instance

