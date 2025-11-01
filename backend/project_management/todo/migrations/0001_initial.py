# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('projects', '0002_alter_project_client_delete_client'),
    ]

    operations = [
        migrations.CreateModel(
            name='ToDo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('todo_name', models.CharField(max_length=200)),
                ('priority', models.CharField(choices=[('highest', 'Highest'), ('high', 'High'), ('medium', 'Medium'), ('low', 'Low'), ('lowest', 'Lowest')], default='medium', max_length=20)),
                ('status', models.CharField(choices=[('not_started', 'Not Started'), ('planning', 'Planning'), ('in_progress', 'In Progress'), ('paused', 'Paused'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='not_started', max_length=20)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project', models.ForeignKey(blank=True, help_text='Project this todo belongs to', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='todos', to='projects.project')),
            ],
            options={
                'verbose_name': 'ToDo',
                'verbose_name_plural': 'ToDos',
                'ordering': ['-created_at'],
            },
        ),
    ]

