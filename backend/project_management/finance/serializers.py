from rest_framework import serializers
from .models import Income, Expense
from projects.models import Project
from clients.models import Client
from setting.models import BankAccount
from employee.models import Employee


class ProjectMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title']


class ClientMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name']


class BankAccountMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['id', 'account_holder_name', 'bank_name']


class IncomeListSerializer(serializers.ModelSerializer):
    """Serializer for listing incomes"""
    client_name = ClientMiniSerializer(source='client', read_only=True)
    project_name = ProjectMiniSerializer(source='project', read_only=True)
    bank_account = BankAccountMiniSerializer(read_only=True)
    
    class Meta:
        model = Income
        fields = [
            'id', 'client_name', 'project_name', 'amount',
            'payment_mode', 'payment_id', 'income_date',
            'bank_account', 'created_at', 'updated_at'
        ]


class IncomeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating incomes"""
    client_name_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    project_name_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    bank_account_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    payment_mode = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Income
        fields = [
            'id', 'client_name_id', 'project_name_id', 'amount',
            'payment_mode', 'payment_id', 'income_date', 'bank_account_id'
        ]
    
    def validate(self, attrs):
        """Normalize payment_mode"""
        payment_mode_value = attrs.get('payment_mode')
        if payment_mode_value is not None:
            raw = str(payment_mode_value).strip().lower()
            mapping = {
                'upi': 'upi',
                'credit card': 'credit_card',
                'debit card': 'debit_card',
                'cash': 'cash',
                'others': 'others',
            }
            normalized = mapping.get(raw, raw.replace(' ', '_').lower())
            valid_values = [choice[0] for choice in Income.PAYMENT_MODE_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({
                    'payment_mode': f'Invalid payment mode: {payment_mode_value}'
                })
            attrs['payment_mode'] = normalized
        
        # Validate amount is positive
        amount = attrs.get('amount')
        if amount is not None and amount <= 0:
            raise serializers.ValidationError({
                'amount': 'Amount must be greater than zero'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create a new income record"""
        client_id = validated_data.pop('client_name_id', None)
        project_id = validated_data.pop('project_name_id', None)
        bank_account_id = validated_data.pop('bank_account_id', None)
        
        client = None
        if client_id:
            try:
                client = Client.objects.get(id=client_id)
            except Client.DoesNotExist:
                raise serializers.ValidationError({
                    'client_name_id': 'Client not found'
                })
        
        project = None
        if project_id:
            try:
                project = Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                raise serializers.ValidationError({
                    'project_name_id': 'Project not found'
                })
        
        bank_account = None
        if bank_account_id:
            try:
                bank_account = BankAccount.objects.get(id=bank_account_id)
            except BankAccount.DoesNotExist:
                raise serializers.ValidationError({
                    'bank_account_id': 'Bank account not found'
                })
        
        return Income.objects.create(
            client=client,
            project=project,
            bank_account=bank_account,
            **validated_data
        )
    
    def update(self, instance, validated_data):
        """Update an existing income record"""
        client_id = validated_data.pop('client_name_id', None)
        project_id = validated_data.pop('project_name_id', None)
        bank_account_id = validated_data.pop('bank_account_id', None)
        
        if client_id is not None:
            if client_id == 0 or client_id == '':
                instance.client = None
            else:
                try:
                    instance.client = Client.objects.get(id=client_id)
                except Client.DoesNotExist:
                    raise serializers.ValidationError({
                        'client_name_id': 'Client not found'
                    })
        
        if project_id is not None:
            if project_id == 0 or project_id == '':
                instance.project = None
            else:
                try:
                    instance.project = Project.objects.get(id=project_id)
                except Project.DoesNotExist:
                    raise serializers.ValidationError({
                        'project_name_id': 'Project not found'
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


class EmployeeMiniSerializer(serializers.ModelSerializer):
    """Mini serializer for Employee"""
    class Meta:
        model = Employee
        fields = ['id', 'name']


class ExpenseListSerializer(serializers.ModelSerializer):
    """Serializer for listing expenses"""
    purchased_by = EmployeeMiniSerializer(read_only=True)
    bank_account = BankAccountMiniSerializer(read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'name', 'amount', 'date', 'purchased_by',
            'purchased_from', 'bank_account', 'payment_mode',
            'payment_id', 'created_at', 'updated_at'
        ]


class ExpenseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating expenses"""
    purchased_by_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    bank_account_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    payment_mode = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'name', 'amount', 'date', 'purchased_by_id',
            'purchased_from', 'bank_account_id', 'payment_mode',
            'payment_id'
        ]
    
    def validate(self, attrs):
        """Normalize payment_mode and validate data"""
        payment_mode_value = attrs.get('payment_mode')
        if payment_mode_value is not None:
            raw = str(payment_mode_value).strip().lower()
            mapping = {
                'upi': 'upi',
                'credit card': 'credit_card',
                'debit card': 'debit_card',
                'cash': 'cash',
                'others': 'others',
            }
            normalized = mapping.get(raw, raw.replace(' ', '_').lower())
            valid_values = [choice[0] for choice in Expense.PAYMENT_MODE_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({
                    'payment_mode': f'Invalid payment mode: {payment_mode_value}'
                })
            attrs['payment_mode'] = normalized
        
        # Validate amount is positive
        amount = attrs.get('amount')
        if amount is not None and amount <= 0:
            raise serializers.ValidationError({
                'amount': 'Amount must be greater than zero'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create a new expense record"""
        purchased_by_id = validated_data.pop('purchased_by_id', None)
        bank_account_id = validated_data.pop('bank_account_id', None)
        
        purchased_by = None
        if purchased_by_id:
            try:
                purchased_by = Employee.objects.get(id=purchased_by_id)
            except Employee.DoesNotExist:
                raise serializers.ValidationError({
                    'purchased_by_id': 'Employee not found'
                })
        
        bank_account = None
        if bank_account_id:
            try:
                bank_account = BankAccount.objects.get(id=bank_account_id)
            except BankAccount.DoesNotExist:
                raise serializers.ValidationError({
                    'bank_account_id': 'Bank account not found'
                })
        
        return Expense.objects.create(
            purchased_by=purchased_by,
            bank_account=bank_account,
            **validated_data
        )
    
    def update(self, instance, validated_data):
        """Update an existing expense record"""
        purchased_by_id = validated_data.pop('purchased_by_id', None)
        bank_account_id = validated_data.pop('bank_account_id', None)
        
        if purchased_by_id is not None:
            if purchased_by_id == 0 or purchased_by_id == '':
                instance.purchased_by = None
            else:
                try:
                    instance.purchased_by = Employee.objects.get(id=purchased_by_id)
                except Employee.DoesNotExist:
                    raise serializers.ValidationError({
                        'purchased_by_id': 'Employee not found'
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

