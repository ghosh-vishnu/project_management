from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Meeting
from employee.models import Employee


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class MeetingListSerializer(serializers.ModelSerializer):
    scheduled_by = UserMiniSerializer(read_only=True, allow_null=True)
    attendee_count = serializers.SerializerMethodField()
    scheduled_by_employee = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Meeting
        fields = [
            "id",
            "name",
            "start_at",
            "meeting_link",
            "duration_minutes",
            "status",
            "scheduled_by",
            "scheduled_by_employee",
            "attendee_count",
        ]

    def get_attendee_count(self, obj):
        return obj.attendees.count()

    def get_scheduled_by_employee(self, obj):
        if obj.scheduled_by_id:
            emp = Employee.objects.filter(user_id=obj.scheduled_by_id).only('id', 'name').first()
            if emp:
                return {"id": emp.id, "name": emp.name}
        return None


class MeetingSerializer(serializers.ModelSerializer):
    scheduled_by = UserMiniSerializer(read_only=True, allow_null=True)
    scheduled_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='scheduled_by', write_only=True, required=False
    )
    # Accept employee ids for convenience from frontend
    scheduled_by_employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), write_only=True, required=False
    )
    attendees = UserMiniSerializer(many=True, read_only=True)
    attendee_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), write_only=True, source='attendees', required=False
    )
    attendee_employee_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Employee.objects.all(), write_only=True, required=False
    )
    # Read-only employee projections for frontend forms (use employee ids)
    scheduled_by_employee = serializers.SerializerMethodField(read_only=True)
    attendee_employees = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Meeting
        fields = [
            "id",
            "name",
            "start_at",
            "meeting_link",
            "duration_minutes",
            "status",
            "note",
            "scheduled_by",
            "scheduled_by_id",
            "scheduled_by_employee_id",
            "scheduled_by_employee",
            "attendees",
            "attendee_ids",
            "attendee_employee_ids",
            "attendee_employees",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        # Pop employee-based fields if provided and map to users
        scheduled_by_employee = validated_data.pop('scheduled_by_employee_id', None)
        attendee_employees = validated_data.pop('attendee_employee_ids', [])

        meeting = super().create(validated_data)

        if scheduled_by_employee is not None and hasattr(scheduled_by_employee, 'user'):
            meeting.scheduled_by = scheduled_by_employee.user
            meeting.save(update_fields=["scheduled_by"])

        if attendee_employees:
            users = [emp.user for emp in attendee_employees if hasattr(emp, 'user')]
            if users:
                meeting.attendees.set(users)

        return meeting

    def update(self, instance, validated_data):
        scheduled_by_employee = validated_data.pop('scheduled_by_employee_id', None)
        attendee_employees = validated_data.pop('attendee_employee_ids', None)

        meeting = super().update(instance, validated_data)

        if scheduled_by_employee is not None and hasattr(scheduled_by_employee, 'user'):
            meeting.scheduled_by = scheduled_by_employee.user
            meeting.save(update_fields=["scheduled_by"])

        if attendee_employees is not None:
            users = [emp.user for emp in attendee_employees if hasattr(emp, 'user')]
            meeting.attendees.set(users)

        return meeting

    def get_scheduled_by_employee(self, obj):
        if obj.scheduled_by_id:
            emp = Employee.objects.filter(user_id=obj.scheduled_by_id).only('id', 'name').first()
            if emp:
                return {"id": emp.id, "name": emp.name}
        return None

    def get_attendee_employees(self, obj):
        user_ids = list(obj.attendees.values_list('id', flat=True))
        if not user_ids:
            return []
        employees = Employee.objects.filter(user_id__in=user_ids).only('id', 'name')
        return [{"id": e.id, "name": e.name} for e in employees]

