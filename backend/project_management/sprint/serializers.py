from rest_framework import serializers
from django.contrib.auth.models import User
from projects.models import Project
from .models import Sprint, SprintTask, SprintComment, SprintRetrospective
from django.utils import timezone


class UserMiniSerializer(serializers.ModelSerializer):
    """Serializer for user information in tasks and comments"""
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name']
    
    def get_name(self, obj):
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full or obj.username


class ProjectMiniSerializer(serializers.ModelSerializer):
    """Serializer for project information in sprints"""
    class Meta:
        model = Project
        fields = ['id', 'title']


class SprintTaskSerializer(serializers.ModelSerializer):
    """Serializer for sprint tasks"""
    assigned_to = UserMiniSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = SprintTask
        fields = [
            'id', 'sprint', 'title', 'assigned_to', 'assigned_to_id',
            'status', 'due_date', 'description', 'priority',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        # Handle assigned_to_id from request context
        request = self.context.get('request')
        assigned_to_id = None
        
        # Remove assigned_to_id from validated_data (it's write_only)
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        # If not in validated_data, check request data
        if assigned_to_id is None and request and 'assigned_to_id' in request.data:
            assigned_to_id = request.data.get('assigned_to_id')
        
        # Handle user assignment
        if assigned_to_id is not None and assigned_to_id != "" and assigned_to_id != 0:
            try:
                validated_data['assigned_to'] = User.objects.get(id=int(assigned_to_id))
            except (User.DoesNotExist, ValueError, TypeError):
                validated_data['assigned_to'] = None
        else:
            # Set to None if not provided or explicitly null/empty
            validated_data['assigned_to'] = None
        
        task = SprintTask.objects.create(**validated_data)
        # Update sprint progress after creating task
        task.sprint.progress = task.sprint.calculate_progress()
        task.sprint.save()
        return task
    
    def update(self, instance, validated_data):
        # Handle assigned_to_id - check if it was provided in the request
        request = self.context.get('request')
        
        # Check if assigned_to_id was provided in the request (even if None)
        if request and 'assigned_to_id' in request.data:
            assigned_to_id = request.data.get('assigned_to_id')
            
            # Remove from validated_data if present (we handle it separately)
            validated_data.pop('assigned_to_id', None)
            
            # Handle user assignment
            if assigned_to_id is not None and assigned_to_id != "" and assigned_to_id != 0:
                try:
                    instance.assigned_to = User.objects.get(id=int(assigned_to_id))
                except (User.DoesNotExist, ValueError, TypeError):
                    instance.assigned_to = None
            else:
                # Explicitly set to None to unassign
                instance.assigned_to = None
        else:
            # If not provided in request, remove from validated_data
            validated_data.pop('assigned_to_id', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update sprint progress after updating task
        instance.sprint.progress = instance.sprint.calculate_progress()
        instance.sprint.save()
        
        return instance


class SprintCommentSerializer(serializers.ModelSerializer):
    """Serializer for sprint comments"""
    user = UserMiniSerializer(read_only=True)
    content = serializers.CharField(required=True, allow_blank=False)
    
    class Meta:
        model = SprintComment
        fields = [
            'id', 'sprint', 'user', 'content',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'sprint', 'user']
    
    def validate_content(self, value):
        """Validate that content is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Comment content cannot be empty.")
        return value.strip()


class SprintRetrospectiveSerializer(serializers.ModelSerializer):
    """Serializer for sprint retrospective"""
    class Meta:
        model = SprintRetrospective
        fields = [
            'id', 'sprint', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SprintListSerializer(serializers.ModelSerializer):
    """Serializer for sprint list view"""
    project = ProjectMiniSerializer(read_only=True)
    project_id = serializers.IntegerField(write_only=True)
    remaining_days = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Sprint
        fields = [
            'id', 'name', 'project', 'project_id', 'start_date', 'end_date',
            'progress', 'status', 'description', 'remaining_days', 'tasks_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_remaining_days(self, obj):
        try:
            return obj.get_remaining_days()
        except Exception:
            return 0
    
    def get_tasks_count(self, obj):
        try:
            return obj.tasks.count()
        except Exception:
            return 0


class SprintDetailSerializer(serializers.ModelSerializer):
    """Serializer for sprint detail view"""
    project = ProjectMiniSerializer(read_only=True)
    project_id = serializers.IntegerField(write_only=True)
    remaining_days = serializers.SerializerMethodField()
    tasks = SprintTaskSerializer(many=True, read_only=True)
    comments = SprintCommentSerializer(many=True, read_only=True)
    retrospective = SprintRetrospectiveSerializer(read_only=True)
    
    class Meta:
        model = Sprint
        fields = [
            'id', 'name', 'project', 'project_id', 'start_date', 'end_date',
            'progress', 'status', 'description', 'remaining_days',
            'tasks', 'comments', 'retrospective',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_remaining_days(self, obj):
        return obj.get_remaining_days()


class SprintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating sprints"""
    project_id = serializers.IntegerField(write_only=True)
    progress = serializers.IntegerField(read_only=True)  # Auto-calculated, not user input
    
    class Meta:
        model = Sprint
        fields = [
            'id', 'name', 'project_id', 'start_date', 'end_date',
            'progress', 'status', 'description'
        ]
        read_only_fields = ['progress']
    
    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError({
                'end_date': 'End date must be on or after start date'
            })
        
        # Normalize status - make it optional with a default
        status_value = attrs.get('status')
        if status_value:
            status_mapping = {
                'active': 'active',
                'completed': 'completed',
                'upcoming': 'upcoming',
            }
            normalized = status_mapping.get(status_value.lower(), status_value.lower())
            attrs['status'] = normalized
        else:
            # If no status provided, it will use the default from model
            pass
        
        # Remove progress from validated_data if present (it's auto-calculated)
        attrs.pop('progress', None)
        
        return attrs
    
    def create(self, validated_data):
        project_id = validated_data.pop('project_id')
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise serializers.ValidationError({
                'project_id': 'Project not found'
            })
        
        # Auto-update status based on dates
        sprint = Sprint.objects.create(project=project, **validated_data)
        sprint.update_status()
        return sprint
    
    def update(self, instance, validated_data):
        project_id = validated_data.pop('project_id', None)
        if project_id:
            try:
                instance.project = Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                raise serializers.ValidationError({
                    'project_id': 'Project not found'
                })
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Auto-update status based on dates
        instance.update_status()
        instance.save()
        return instance

