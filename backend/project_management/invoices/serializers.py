from rest_framework import serializers
from .models import Invoice
from projects.models import Project
from clients.models import Client
from setting.models import BankAccount


class ProjectMiniSerializer(serializers.ModelSerializer):
    """Mini serializer for Project"""
    class Meta:
        model = Project
        fields = ['id', 'title']


class ClientMiniSerializer(serializers.ModelSerializer):
    """Mini serializer for Client"""
    class Meta:
        model = Client
        fields = ['id', 'name']


class BankAccountListSerializer(serializers.ModelSerializer):
    """Serializer for Bank Account"""
    class Meta:
        model = BankAccount
        fields = ['id', 'account_holder_name']


class InvoiceListSerializer(serializers.ModelSerializer):
    """Serializer for listing invoices"""
    project = ProjectMiniSerializer(read_only=True)
    client = ClientMiniSerializer(read_only=True)
    bank_account = BankAccountListSerializer(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'project', 'client', 'amount',
            'status', 'due_date', 'address', 'country', 'phone_number',
            'payment_method', 'bank_account', 'note', 'invoice_file',
            'created_at', 'updated_at'
        ]


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating invoices"""
    invoice_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    project_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    client_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    bank_account_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    status = serializers.CharField(write_only=True, required=False)
    payment_method = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'project_id', 'client_id', 'amount',
            'status', 'due_date', 'address', 'country', 'phone_number',
            'payment_method', 'bank_account_id', 'note', 'invoice_file'
        ]
    
    def validate(self, attrs):
        """Normalize status and payment_method"""
        status_value = attrs.get('status')
        if status_value is not None:
            raw = str(status_value).strip().lower()
            mapping = {
                'pending': 'pending',
                'paid': 'paid',
                'overdue': 'overdue',
            }
            normalized = mapping.get(raw, raw.replace(' ', '_').lower())
            valid_values = [choice[0] for choice in Invoice.STATUS_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({
                    'status': f'Invalid status: {status_value}'
                })
            attrs['status'] = normalized
        
        payment_method_value = attrs.get('payment_method')
        if payment_method_value:
            raw = str(payment_method_value).strip().lower()
            mapping = {
                'online': 'online',
                'bank transaction': 'bank_transaction',
                'bank_transaction': 'bank_transaction',
                'other': 'other',
                'others': 'other',
            }
            normalized = mapping.get(raw, raw.replace(' ', '_').lower())
            valid_values = [choice[0] for choice in Invoice.PAYMENT_METHOD_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({
                    'payment_method': f'Invalid payment method: {payment_method_value}'
                })
            attrs['payment_method'] = normalized
        
        # Validate amount is positive
        amount = attrs.get('amount')
        if amount is not None and amount <= 0:
            raise serializers.ValidationError({
                'amount': 'Amount must be greater than zero'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create a new invoice"""
        project_id = validated_data.pop('project_id', None)
        client_id = validated_data.pop('client_id', None)
        bank_account_id = validated_data.pop('bank_account_id', None)
        
        # Handle invoice_number - if empty or None, remove it so model's save() auto-generates it
        invoice_number = validated_data.pop('invoice_number', None)
        if invoice_number and invoice_number.strip():
            # Only set invoice_number if it's provided and not empty
            validated_data['invoice_number'] = invoice_number.strip()
        # Otherwise, leave it out so model's save() method auto-generates it
        
        project = None
        if project_id:
            try:
                project = Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                raise serializers.ValidationError({
                    'project_id': 'Project not found'
                })
        
        client = None
        if client_id:
            try:
                client = Client.objects.get(id=client_id)
            except Client.DoesNotExist:
                raise serializers.ValidationError({
                    'client_id': 'Client not found'
                })
        
        bank_account = None
        if bank_account_id:
            try:
                bank_account = BankAccount.objects.get(id=bank_account_id)
            except BankAccount.DoesNotExist:
                raise serializers.ValidationError({
                    'bank_account_id': 'Bank account not found'
                })
        
        return Invoice.objects.create(
            project=project,
            client=client,
            bank_account=bank_account,
            **validated_data
        )
    
    def update(self, instance, validated_data):
        """Update an existing invoice"""
        project_id = validated_data.pop('project_id', None)
        client_id = validated_data.pop('client_id', None)
        bank_account_id = validated_data.pop('bank_account_id', None)
        
        if project_id is not None:
            if project_id == 0 or project_id == '':
                instance.project = None
            else:
                try:
                    instance.project = Project.objects.get(id=project_id)
                except Project.DoesNotExist:
                    raise serializers.ValidationError({
                        'project_id': 'Project not found'
                    })
        
        if client_id is not None:
            if client_id == 0 or client_id == '':
                instance.client = None
            else:
                try:
                    instance.client = Client.objects.get(id=client_id)
                except Client.DoesNotExist:
                    raise serializers.ValidationError({
                        'client_id': 'Client not found'
                    })
        
        if bank_account_id is not None:
            if bank_account_id == 0 or bank_account_id == '':
                instance.bank_account = None
            else:
                try:
                    instance.bank_account = BankAccount.objects.get(id=bank_account_id)
                except BankAccount.DoesNotExist:
                    raise serializers.ValidationError({
                        'bank_account_id': 'Bank account not found'
                    })
        
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        instance.save()
        return instance