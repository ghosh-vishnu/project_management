"""
Django management command to completely reset the database
This will drop all tables and recreate them fresh
Run with: python manage.py reset_database
"""
from django.core.management.base import BaseCommand
from django.core import management
from django.db import connection


class Command(BaseCommand):
    help = 'Completely reset the database - drop all tables and recreate them'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('⚠️  WARNING: This will DELETE ALL DATA from the database!'))
        self.stdout.write('')
        
        try:
            # Drop all tables
            self.stdout.write('🗑️  Dropping all tables...')
            with connection.cursor() as cursor:
                # Disable foreign key constraints temporarily
                cursor.execute("SET session_replication_role = 'replica';")
                
                # Get all table names
                cursor.execute("""
                    SELECT tablename FROM pg_tables 
                    WHERE schemaname = 'public'
                """)
                tables = [row[0] for row in cursor.fetchall()]
                
                if tables:
                    # Drop each table one by one
                    for table in tables:
                        try:
                            cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
                        except Exception as e:
                            self.stdout.write(self.style.WARNING(f'Could not drop {table}: {e}'))
                    
                    # Re-enable constraints
                    cursor.execute("SET session_replication_role = 'origin';")
                    self.stdout.write(self.style.SUCCESS(f'✅ Dropped {len(tables)} tables'))
                else:
                    self.stdout.write('ℹ️  No tables found to drop')
            
            # Recreate all tables
            self.stdout.write('')
            self.stdout.write('🔨 Recreating tables with migrations...')
            management.call_command('migrate', verbosity=0)
            self.stdout.write(self.style.SUCCESS('✅ All tables recreated!'))
            
            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS('🎉 Database reset completed successfully!'))
            self.stdout.write('')
            self.stdout.write('📝 Next steps:')
            self.stdout.write('   1. Create a superuser: python manage.py createsuperuser')
            self.stdout.write('   2. Populate departments/designations: python manage.py populate_employee_data')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
            self.stdout.write(self.style.WARNING('Make sure your database connection is properly configured.'))

