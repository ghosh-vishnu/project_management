# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('projects', '0002_alter_project_client_delete_client'),
        ('clients', '0001_initial'),
        ('setting', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Income',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, help_text='Income amount', max_digits=15)),
                ('payment_mode', models.CharField(choices=[('upi', 'UPI'), ('credit_card', 'Credit Card'), ('debit_card', 'Debit Card'), ('cash', 'Cash'), ('others', 'Others')], default='cash', max_length=20)),
                ('payment_id', models.CharField(help_text='Payment transaction ID or reference number', max_length=200)),
                ('income_date', models.DateField(help_text='Date when income was received')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('bank_account', models.ForeignKey(blank=True, help_text='Bank account where income was received', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='incomes', to='setting.bankaccount')),
                ('client', models.ForeignKey(blank=True, help_text='Client associated with this income', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='incomes', to='clients.client')),
                ('project', models.ForeignKey(blank=True, help_text='Project associated with this income', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='incomes', to='projects.project')),
            ],
            options={
                'verbose_name': 'Income',
                'verbose_name_plural': 'Incomes',
                'ordering': ['-income_date', '-created_at'],
            },
        ),
    ]

