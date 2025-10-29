from rest_framework import serializers
from .models import Team
from employee.serializers import EmployeeListSerializer


class TeamListSerializer(serializers.ModelSerializer):
    """Serializer for listing teams with basic info"""
    team_lead = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'team_lead', 'member_count', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_team_lead(self, obj):
        if obj.team_lead:
            return {
                'id': obj.team_lead.id,
                'name': obj.team_lead.name,
                'email': obj.team_lead.user.email if obj.team_lead.user else None,
                'designation': obj.team_lead.designation,
            }
        return None
    
    def get_member_count(self, obj):
        return obj.member_count


class TeamDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for team with all related data"""
    team_lead = serializers.SerializerMethodField()
    team_members = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_team_lead(self, obj):
        if obj.team_lead:
            return {
                'id': obj.team_lead.id,
                'name': obj.team_lead.name,
                'email': obj.team_lead.user.email if obj.team_lead.user else None,
                'designation': obj.team_lead.designation,
                'department': obj.team_lead.department,
                'contact_no': obj.team_lead.contact_no,
            }
        return None
    
    def get_team_members(self, obj):
        members = obj.members.all()
        return [
            {
                'id': member.id,
                'name': member.name,
                'email': member.user.email if member.user else None,
                'designation': member.designation,
                'department': member.department,
            }
            for member in members
        ]
    
    def get_member_count(self, obj):
        return obj.member_count


class TeamCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating teams"""
    team_lead_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    team_members_id = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Team
        fields = ['name', 'note', 'team_lead_id', 'team_members_id', 'is_active']
    
    def validate_team_lead_id(self, value):
        if value:
            from employee.models import Employee
            try:
                Employee.objects.get(id=value, is_active=True)
            except Employee.DoesNotExist:
                raise serializers.ValidationError("Team lead not found or is inactive.")
        return value
    
    def validate_team_members_id(self, value):
        if value:
            from employee.models import Employee
            active_employees = Employee.objects.filter(id__in=value, is_active=True).count()
            if active_employees != len(value):
                raise serializers.ValidationError("Some team members not found or are inactive.")
        return value
    
    def create(self, validated_data):
        team_lead_id = validated_data.pop('team_lead_id', None)
        team_members_id = validated_data.pop('team_members_id', [])
        
        # Get team lead
        team_lead = None
        if team_lead_id:
            from employee.models import Employee
            try:
                team_lead = Employee.objects.get(id=team_lead_id)
            except Employee.DoesNotExist:
                pass
        
        # Create team
        team = Team.objects.create(team_lead=team_lead, **validated_data)
        
        # Add team members
        if team_members_id:
            from employee.models import Employee
            members = Employee.objects.filter(id__in=team_members_id)
            team.members.set(members)
        
        return team
    
    def update(self, instance, validated_data):
        team_lead_id = validated_data.pop('team_lead_id', None)
        team_members_id = validated_data.pop('team_members_id', None)
        
        # Update team lead
        if team_lead_id is not None:
            from employee.models import Employee
            if team_lead_id:
                try:
                    instance.team_lead = Employee.objects.get(id=team_lead_id)
                except Employee.DoesNotExist:
                    pass
            else:
                instance.team_lead = None
        
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update team members if provided
        if team_members_id is not None:
            from employee.models import Employee
            members = Employee.objects.filter(id__in=team_members_id)
            instance.members.set(members)
        
        return instance

