#!/usr/bin/env python
"""
Script to fix designation format in database
Converts desig-Department-Index format to actual designation names
"""
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_management.settings')
django.setup()

from employee.models import Employee

# Designation mapping based on department
DESIGNATION_MAPPING = {
    'Project Management': {
        '0': 'Project Manager', 
        '1': 'Assistant Project Manager', 
        '2': 'Project Coordinator', 
        '3': 'Project Analyst'
    },
    'Development': {
        '0': 'Full Stack Developer', 
        '1': 'Backend Developer (Python/Django)', 
        '2': 'Frontend Developer (React/Angular)', 
        '3': 'Software Engineer', 
        '4': 'Intern Developer'
    },
    'Design': {
        '0': 'UI/UX Designer', 
        '1': 'Graphic Designer', 
        '2': 'Frontend Designer', 
        '3': 'Creative Lead'
    },
    'Quality Assurance': {
        '0': 'QA Engineer', 
        '1': 'QA Lead', 
        '2': 'Software Tester', 
        '3': 'Automation Tester'
    },
    'Human Resources': {
        '0': 'HR Manager', 
        '1': 'HR Executive', 
        '2': 'Talent Acquisition Specialist'
    },
    'Sales & Marketing': {
        '0': 'Business Development Executive', 
        '1': 'Sales Manager', 
        '2': 'Digital Marketing Executive', 
        '3': 'SEO Specialist'
    },
    'Finance & Accounts': {
        '0': 'Accounts Executive', 
        '1': 'Finance Officer', 
        '2': 'Billing & Payroll Executive'
    },
    'Support & Operations': {
        '0': 'Support Engineer', 
        '1': 'Technical Support Executive', 
        '2': 'Operations Manager'
    },
    'IT Infrastructure': {
        '0': 'System Administrator', 
        '1': 'Network Engineer', 
        '2': 'Cloud Administrator'
    },
    'Research & Innovation': {
        '0': 'R&D Specialist', 
        '1': 'Product Researcher', 
        '2': 'Data Analyst'
    },
}

def fix_designation_format():
    """Fix designation format for all employees"""
    employees = Employee.objects.all()
    fixed_count = 0
    
    for emp in employees:
        if emp.designation and emp.designation.startswith('desig-'):
            # Parse format: desig-Department-Index
            parts = emp.designation.split('-')
            if len(parts) >= 3:
                department = parts[1]
                index = parts[2]
                
                # Get correct designation
                if department in DESIGNATION_MAPPING:
                    desig_map = DESIGNATION_MAPPING[department]
                    if index in desig_map:
                        old_designation = emp.designation
                        emp.designation = desig_map[index]
                        emp.save()
                        print(f"✓ Fixed {emp.name}: {old_designation} → {emp.designation}")
                        fixed_count += 1
                    else:
                        print(f"✗ Invalid index {index} for {emp.name}")
                else:
                    print(f"✗ Invalid department {department} for {emp.name}")
            else:
                print(f"✗ Invalid format for {emp.name}: {emp.designation}")
        else:
            print(f"- {emp.name}: {emp.designation} (already correct)")
    
    print(f"\n✅ Fixed {fixed_count} employees")

if __name__ == "__main__":
    print("🔧 Fixing designation format in database...")
    fix_designation_format()
