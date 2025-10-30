from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']


class ClientListSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'user', 'phone', 'gender', 'address', 'country', 'state', 'pincode', 'is_active'
        ]


class ClientCreateSerializer(serializers.ModelSerializer):
    user = serializers.DictField(write_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'user', 'phone', 'gender', 'address', 'country', 'state', 'pincode', 'is_active'
        ]

    def validate_user(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('user must be an object')
        # Create vs Update behavior
        is_create = self.instance is None

        # Email validation
        email_present = 'email' in value and value.get('email') is not None
        if is_create:
            if not email_present or not value.get('email'):
                raise serializers.ValidationError({'email': 'Email is required'})
            if User.objects.filter(email=value.get('email')).exists():
                raise serializers.ValidationError({'email': 'Email already exists'})
        else:
            # On update, email is optional; if provided and changed, ensure unique
            if email_present and value.get('email') and value.get('email') != self.instance.user.email:
                if User.objects.filter(email=value.get('email')).exclude(id=self.instance.user.id).exists():
                    raise serializers.ValidationError({'email': 'Email already exists'})

        # Password validation
        password = value.get('password', None)
        confirm = value.get('confirm_password', None)
        if is_create:
            if not password:
                raise serializers.ValidationError({'password': 'Password is required'})
            if password != confirm:
                raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})
        else:
            # On update, password is optional; if provided, confirm must match
            if password is not None and password != '':
                if password != confirm:
                    raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})

        return value

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        email = user_data.get('email')
        password = user_data.get('password')
        user = User.objects.create_user(username=email.split('@')[0], email=email, password=password)
        return Client.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data is not None:
            email = user_data.get('email')
            if email and email != instance.user.email:
                if User.objects.filter(email=email).exclude(id=instance.user.id).exists():
                    raise serializers.ValidationError({'user': {'email': 'Email already exists'}})
                instance.user.email = email
                instance.user.username = email.split('@')[0]
            password = user_data.get('password')
            confirm = user_data.get('confirm_password')
            if password:
                if password != confirm:
                    raise serializers.ValidationError({'user': {'confirm_password': 'Passwords do not match'}})
                instance.user.set_password(password)
            instance.user.save()

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance


