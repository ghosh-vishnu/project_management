#!/usr/bin/env python
"""
Script to remove unused Django apps and clean up database
"""
import os
import shutil
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_management.settings')
django.setup()

# Apps that are actually being used
USED_APPS = [
    'authentication',
    'employee', 
    'projects'
]

# Apps to remove
UNUSED_APPS = [
    'announcements',
    'clients', 
    'companies',
    'deals',
    'documentation',
    'finance',
    'invoices',
    'leads',
    'login',
    'meeting_schedule',
    'notifications',
    'proposal',
    'reports',
    'reset_password',
    'roles_permission',
    'setting',
    'sprint',
    'tasks',
    'teams',
    'tickets',
    'timesheet'
]

def remove_app_directories():
    """Remove unused app directories"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for app in UNUSED_APPS:
        app_path = os.path.join(base_dir, app)
        if os.path.exists(app_path):
            print(f"Removing {app} directory...")
            try:
                shutil.rmtree(app_path)
                print(f"✓ Removed {app}")
            except Exception as e:
                print(f"✗ Failed to remove {app}: {e}")
        else:
            print(f"- {app} directory not found")

def update_settings():
    """Update settings.py to remove unused apps"""
    settings_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'project_management', 'settings.py')
    
    if os.path.exists(settings_file):
        with open(settings_file, 'r') as f:
            content = f.read()
        
        # Remove unused apps from INSTALLED_APPS
        lines = content.split('\n')
        new_lines = []
        in_installed_apps = False
        
        for line in lines:
            if 'INSTALLED_APPS = [' in line:
                in_installed_apps = True
                new_lines.append(line)
            elif in_installed_apps and line.strip() == ']':
                in_installed_apps = False
                new_lines.append(line)
            elif in_installed_apps:
                # Check if this line contains an unused app
                app_name = line.strip().strip("',\"")
                if app_name in UNUSED_APPS:
                    print(f"Removing {app_name} from INSTALLED_APPS")
                    continue
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)
        
        # Write updated content
        with open(settings_file, 'w') as f:
            f.write('\n'.join(new_lines))
        
        print("✓ Updated settings.py")

def main():
    print("🧹 Cleaning up unused Django apps...")
    print(f"Used apps: {USED_APPS}")
    print(f"Unused apps to remove: {UNUSED_APPS}")
    
    # Remove app directories
    remove_app_directories()
    
    # Update settings
    update_settings()
    
    print("\n✅ Cleanup completed!")
    print("\nNext steps:")
    print("1. Run: python manage.py makemigrations")
    print("2. Run: python manage.py migrate")
    print("3. Restart your Django server")

if __name__ == "__main__":
    main()
