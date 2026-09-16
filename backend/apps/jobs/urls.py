from django.urls import path

from .views import JobCreateView, JobDeleteView, JobDetailView, JobListView, JobManageDetailView, LatestJobsView

urlpatterns = [
    path("latest/", LatestJobsView.as_view(), name="latest-jobs"),
    path("create/", JobCreateView.as_view(), name="job-create"),
    path("manage/<slug:slug>/", JobManageDetailView.as_view(), name="job-manage-detail"),
    path("delete/<slug:slug>/", JobDeleteView.as_view(), name="job-delete"),
    path("", JobListView.as_view(), name="job-list"),
    path("<slug:slug>/", JobDetailView.as_view(), name="job-detail"),
]
