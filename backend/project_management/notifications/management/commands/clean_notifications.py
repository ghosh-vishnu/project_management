"""
Management command to clean all notifications from database
Usage: python manage.py clean_notifications
"""
from django.core.management.base import BaseCommand
from notifications.models import Notification


class Command(BaseCommand):
    help = 'Delete all notifications from the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Skip confirmation prompt',
        )

    def handle(self, *args, **options):
        count = Notification.objects.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('No notifications found. Database is already clean.')
            )
            return
        
        if not options['confirm']:
            confirm = input(
                f'Are you sure you want to delete {count} notification(s)? (yes/no): '
            )
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.WARNING('Operation cancelled.'))
                return
        
        deleted = Notification.objects.all().delete()[0]
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {deleted} notification(s).')
        )


