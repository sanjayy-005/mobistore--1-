from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Profile


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name")
    phone = serializers.CharField(source="profile.phone", required=False, allow_blank=True)
    address = serializers.CharField(source="profile.address", required=False, allow_blank=True)
    city = serializers.CharField(source="profile.city", required=False, allow_blank=True)
    state = serializers.CharField(source="profile.state", required=False, allow_blank=True)
    pincode = serializers.CharField(source="profile.pincode", required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "name", "email", "phone", "address", "city", "state", "pincode"]
        read_only_fields = ["id", "email"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        profile, _ = Profile.objects.get_or_create(user=instance)
        for key, value in profile_data.items():
            setattr(profile, key, value)
        profile.save()
        return instance


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, data):
        user = User.objects.create_user(
            username=data["email"], email=data["email"],
            password=data["password"], first_name=data["name"],
        )
        Profile.objects.create(user=user, phone=data.get("phone", ""))
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["email"].lower(), password=data["password"])
        if not user:
            raise serializers.ValidationError("Incorrect email or password.")
        data["user"] = user
        return data
