# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='BankAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bank_name', models.CharField(max_length=200)),
                ('account_holder_name', models.CharField(max_length=200)),
                ('account_number', models.CharField(max_length=50)),
                ('account_type', models.CharField(choices=[('savings', 'Savings'), ('current', 'Current')], default='savings', max_length=20)),
                ('branch', models.CharField(max_length=200)),
                ('ifsc_code', models.CharField(max_length=20)),
                ('contact_number', models.CharField(max_length=20)),
                ('status', models.CharField(choices=[('open', 'Open'), ('close', 'Close')], default='open', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Bank Account',
                'verbose_name_plural': 'Bank Accounts',
                'ordering': ['-created_at'],
            },
        ),
    ]

