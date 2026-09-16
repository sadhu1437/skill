from django.urls import path
from .views import CSRFTokenView, CurrentUserView, LoginView, RefreshTokenView, RegisterView, UserProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", RefreshTokenView.as_view(), name="token_refresh"),
    path("csrf-token/", CSRFTokenView.as_view(), name="csrf-token"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
]
