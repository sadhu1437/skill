from django.urls import path

from .views import AITechDetailView, AITechListView

urlpatterns = [
    path("", AITechListView.as_view(), name="ai-tech-list"),
    path("<slug:slug>/", AITechDetailView.as_view(), name="ai-tech-detail"),
]
