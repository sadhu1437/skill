from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.middleware.csrf import get_token
from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.core.security import safe_upload_filename, validate_file_upload
from apps.core.throttles import AnonymousAuthThrottle

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AnonymousAuthThrottle,)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "profile_image")
        read_only_fields = ("id", "email")

    def validate_profile_image(self, value):
        if not value:
            return value
        is_valid, error_message = validate_file_upload(
            value,
            allowed_extensions=["jpg", "jpeg", "png", "webp"],
            max_size=5 * 1024 * 1024,
        )
        if not is_valid:
            raise serializers.ValidationError(error_message)
        value.name = safe_upload_filename(value.name)
        return value


class LoginView(TokenObtainPairView):
    throttle_classes = (AnonymousAuthThrottle,)


class RefreshTokenView(TokenRefreshView):
    throttle_classes = (AnonymousAuthThrottle,)


class CSRFTokenView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AnonymousAuthThrottle,)

    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class CurrentUserView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response({
            "id": request.user.id,
            "email": request.user.email,
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser,
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user
