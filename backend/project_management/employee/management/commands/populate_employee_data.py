"""
Django management command to populate Department and Designation data
Run with: python manage.py populate_employee_data
"""
from django.core.management.base import BaseCommand
from employee.models import Department, Designation


class Command(BaseCommand):
    help = 'Populate Department and Designation data'

    def handle(self, *args, **options):
        self.stdout.write('Starting data population...\n')
        
        # Populate Departments
        self.stdout.write('Creating Departments...')
        departments = [
            ("Project Management", "Managing projects, resources, and timelines"),
            ("Development", "Software development and coding"),
            ("Design", "UI/UX and creative design work"),
            ("Quality Assurance", "Testing and quality control"),
            ("Human Resources", "HR management and talent acquisition"),
            ("Sales & Marketing", "Business development and marketing"),
            ("Finance & Accounts", "Financial management and accounting"),
            ("Support & Operations", "Customer support and operations"),
            ("IT Infrastructure", "IT systems and network management"),
            ("Research & Innovation", "Research and development activities"),
        ]
        
        for title, description in departments:
            dept, created = Department.objects.get_or_create(
                title=title,
                defaults={'description': description}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {title}'))
            else:
                self.stdout.write(f'- Already exists: {title}')
        
        self.stdout.write(self.style.SUCCESS('\n✅ All departments created!\n'))
        
        # Populate Designations
        self.stdout.write('Creating Designations...')
        designations_data = {
            "Project Management": [
                "Project Manager",
                "Assistant Project Manager",
                "Project Coordinator",
                "Project Analyst",
            ],
            "Development": [
                "Full Stack Developer",
                "Backend Developer (Python/Django)",
                "Frontend Developer (React/Angular)",
                "Software Engineer",
                "Intern Developer",
            ],
            "Design": [
                "UI/UX Designer",
                "Graphic Designer",
                "Frontend Designer",
                "Creative Lead",
            ],
            "Quality Assurance": [
                "QA Engineer",
                "QA Lead",
                "Software Tester",
                "Automation Tester",
            ],
            "Human Resources": [
                "HR Manager",
                "HR Executive",
                "Talent Acquisition Specialist",
            ],
            "Sales & Marketing": [
                "Business Development Executive",
                "Sales Manager",
                "Digital Marketing Executive",
                "SEO Specialist",
            ],
            "Finance & Accounts": [
                "Accounts Executive",
                "Finance Officer",
                "Billing & Payroll Executive",
            ],
            "Support & Operations": [
                "Support Engineer",
                "Technical Support Executive",
                "Operations Manager",
            ],
            "IT Infrastructure": [
                "System Administrator",
                "Network Engineer",
                "Cloud Administrator",
            ],
            "Research & Innovation": [
                "R&D Specialist",
                "Product Researcher",
                "Data Analyst",
            ],
        }
        
        count = 0
        for dept_title, designation_list in designations_data.items():
            self.stdout.write(f'\n📁 {dept_title}:')
            for designation_title in designation_list:
                desig, created = Designation.objects.get_or_create(
                    title=designation_title,
                    defaults={'description': f"{designation_title} in {dept_title}"}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {designation_title}'))
                    count += 1
                else:
                    self.stdout.write(f'  - Already exists: {designation_title}')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Created {count} new designations!'))
        self.stdout.write(self.style.SUCCESS('\n🎉 Data population completed successfully!'))

