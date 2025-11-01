from rest_framework import serializers
from .models import BankAccount


class BankAccountListSerializer(serializers.ModelSerializer):
    """Serializer for listing bank accounts"""
    
    class Meta:
        model = BankAccount
        fields = [
            'id', 'bank_name', 'account_holder_name', 'account_number',
            'account_type', 'branch', 'ifsc_code', 'contact_number',
            'status', 'created_at', 'updated_at'
        ]


class BankAccountCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating bank accounts"""
    # Accept human-readable status/account_type labels from frontend
    status = serializers.CharField(write_only=True, required=True)
    account_type = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = BankAccount
        fields = [
            'id', 'bank_name', 'account_holder_name', 'account_number',
            'account_type', 'branch', 'ifsc_code', 'contact_number', 'status'
        ]
    
    def validate(self, attrs):
        """Normalize status/account_type"""
        # Normalize status
        status_value = attrs.get('status')
        if status_value is not None:
            raw = str(status_value).strip().lower()
            mapping = {
                'open': 'open',
                'close': 'close',
                'closed': 'close',
            }
            normalized = mapping.get(raw, raw.lower())
            valid_values = [choice[0] for choice in BankAccount.STATUS_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({
                    'status': f'Invalid status: {status_value}'
                })
            attrs['status'] = normalized
        
        # Normalize account_type
        account_type_value = attrs.get('account_type')
        if account_type_value is not None:
            raw = str(account_type_value).strip().lower()
            mapping = {
                'savings': 'savings',
                'current': 'current',
            }
            normalized = mapping.get(raw, raw.lower())
            valid_values = [choice[0] for choice in BankAccount.ACCOUNT_TYPE_CHOICES]
            if normalized not in valid_values:
                raise serializers.ValidationError({
                    'account_type': f'Invalid account type: {account_type_value}'
                })
            attrs['account_type'] = normalized
        
        return attrs
    
    def create(self, validated_data):
        """Create a new bank account"""
        return BankAccount.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """Update an existing bank account"""
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance

