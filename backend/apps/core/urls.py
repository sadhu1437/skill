from django.urls import path

from .views import AdSenseSettingsView, HealthCheckView, HomePageContentView

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("home/", HomePageContentView.as_view(), name="homepage-content"),
    path("adsense/", AdSenseSettingsView.as_view(), name="adsense-settings"),
]
