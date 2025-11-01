# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('employee', '0006_userprofile'),
        ('projects', '0002_alter_project_client_delete_client'),
        ('clients', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('priority', models.CharField(choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')], default='medium', max_length=20)),
                ('status', models.CharField(choices=[('open', 'Open'), ('close', 'Close')], default='open', max_length=20)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('assigned_to', models.ForeignKey(blank=True, help_text='Employee assigned to this ticket', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_tickets', to='employee.employee')),
                ('client', models.ForeignKey(blank=True, help_text='Client associated with this ticket', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tickets', to='clients.client')),
                ('project', models.ForeignKey(blank=True, help_text='Project this ticket belongs to', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tickets', to='projects.project')),
            ],
            options={
                'verbose_name': 'Ticket',
                'verbose_name_plural': 'Tickets',
                'ordering': ['-created_at'],
            },
        ),
    ]

