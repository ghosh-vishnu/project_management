from rest_framework import serializers
from .models import Proposal


class ProposalListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = [
            'id', 'proposal_value', 'client_lead', 'proposal_date',
            'valid_until', 'proposal_title', 'description', 'status', 'created_at'
        ]


class ProposalDetailSerializer(ProposalListSerializer):
    class Meta(ProposalListSerializer.Meta):
        fields = ProposalListSerializer.Meta.fields + ['updated_at']


class ProposalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = [
            'id', 'proposal_value', 'client_lead', 'proposal_date',
            'valid_until', 'proposal_title', 'description', 'status'
        ]

    def validate(self, attrs):
        # Ensure valid_until is not before proposal_date
        proposal_date = attrs.get('proposal_date')
        valid_until = attrs.get('valid_until')
        if proposal_date and valid_until and valid_until < proposal_date:
            raise serializers.ValidationError({'valid_until': 'Must be on or after proposal_date'})
        # Validate status choice
        status_value = attrs.get('status')
        if status_value and status_value not in dict(Proposal.STATUS_CHOICES):
            raise serializers.ValidationError({'status': 'Invalid status'})
        return attrs

