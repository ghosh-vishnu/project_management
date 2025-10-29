from django.db import models
from employee.models import Employee


class Team(models.Model):
    """
    Team model to manage project teams
    A team has a lead (Employee) and multiple members (Employees)
    """
    name = models.CharField(max_length=255, unique=True, help_text="Team name")
    team_lead = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='led_teams',
        help_text="Team lead/manager"
    )
    members = models.ManyToManyField(
        Employee,
        related_name='team_memberships',
        blank=True,
        help_text="Team members"
    )
    note = models.TextField(blank=True, null=True, help_text="Additional notes about the team")
    is_active = models.BooleanField(default=True, help_text="Whether the team is active")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Team"
        verbose_name_plural = "Teams"

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        """Get total number of team members including team lead"""
        count = self.members.count()
        if self.team_lead and self.team_lead not in self.members.all():
            count += 1
        return count

    @property
    def total_members(self):
        """Get all team members including team lead"""
        all_members = list(self.members.all())
        if self.team_lead and self.team_lead not in all_members:
            all_members.insert(0, self.team_lead)
        return all_members
