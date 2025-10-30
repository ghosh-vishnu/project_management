from rest_framework import serializers
from .models import Contract
from leads.models import Lead


class LeadMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ['id', 'name']


class ContractListSerializer(serializers.ModelSerializer):
    lead_name = LeadMiniSerializer(read_only=True)

    class Meta:
        model = Contract
        fields = ['id', 'name', 'lead_name', 'start_date', 'end_date', 'status', 'budget', 'description']


class ContractCreateSerializer(serializers.ModelSerializer):
    lead_name_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Contract
        fields = ['id', 'name', 'lead_name_id', 'start_date', 'end_date', 'status', 'budget', 'description']

    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError({'end_date': 'Must be on or after start_date'})
        status_value = attrs.get('status')
        if status_value and status_value not in dict(Contract.STATUS_CHOICES):
            raise serializers.ValidationError({'status': 'Invalid status'})
        return attrs

    def create(self, validated_data):
        lead_id = validated_data.pop('lead_name_id')
        lead = Lead.objects.get(id=lead_id)
        return Contract.objects.create(lead_name=lead, **validated_data)

    def update(self, instance, validated_data):
        lead_id = validated_data.pop('lead_name_id', None)
        if lead_id is not None:
            try:
                lead = Lead.objects.get(id=lead_id)
                instance.lead_name = lead
            except Lead.DoesNotExist:
                raise serializers.ValidationError({'lead_name_id': 'Lead does not exist'})
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance


