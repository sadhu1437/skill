from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import filters, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.throttles import PublicReadThrottle
from .models import Job
from .serializers import JobCreateSerializer, JobSerializer


class LatestJobsView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)

    def get(self, request):
        jobs = (
            Job.objects.filter(is_published=True)
            .filter(Q(deadline__isnull=True) | Q(deadline__gte=timezone.now()))
            .select_related("company")
            .order_by("-published_at", "-priority", "-created_at")[:6]
        )
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)


class JobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "title",
        "company__name",
        "location",
        "qualification",
        "job_type",
        "work_mode",
    ]
    ordering_fields = ["published_at", "deadline", "company__name"]
    ordering = ["-published_at"]

    def get_queryset(self):
        queryset = (
            Job.objects.filter(is_published=True)
            .filter(Q(deadline__isnull=True) | Q(deadline__gte=timezone.now()))
            .select_related("company")
        )
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(company__name__icontains=search)
                | Q(location__icontains=search)
                | Q(qualification__icontains=search)
            )
        company = self.request.query_params.get("company")
        if company:
            queryset = queryset.filter(company__name__icontains=company)
        location = self.request.query_params.get("location")
        if location:
            queryset = queryset.filter(location__icontains=location)
        experience = self.request.query_params.get("experience")
        if experience:
            queryset = queryset.filter(experience__icontains=experience)
        qualification = self.request.query_params.get("qualification")
        if qualification:
            queryset = queryset.filter(qualification__icontains=qualification)
        job_type = self.request.query_params.get("job_type")
        if job_type:
            queryset = queryset.filter(job_type__icontains=job_type)
        work_mode = self.request.query_params.get("work_mode")
        if work_mode:
            queryset = queryset.filter(work_mode__icontains=work_mode)
        batch = self.request.query_params.get("batch")
        if batch:
            queryset = queryset.filter(eligible_batch__icontains=batch)
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(title__icontains=category)
        return queryset.order_by("-published_at", "-priority", "-created_at")


class JobDetailView(generics.RetrieveAPIView):
    queryset = Job.objects.filter(is_published=True).select_related("company")
    serializer_class = JobSerializer
    lookup_field = "slug"
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)

    def get_object(self):
        obj = super().get_object()
        if obj.deadline and obj.deadline < timezone.now():
            self.permission_denied(self.request, message="Job expired")
        return obj


class JobCreateView(generics.CreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobCreateSerializer
    permission_classes = (permissions.IsAdminUser,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = serializer.save()

        if job.is_published and not job.published_at:
            job.published_at = timezone.now()
            job.save(update_fields=["published_at"])

        response_serializer = JobSerializer(job)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class JobManageDetailView(generics.RetrieveUpdateAPIView):
    queryset = Job.objects.all().select_related("company")
    serializer_class = JobCreateSerializer
    lookup_field = "slug"
    permission_classes = (permissions.IsAdminUser,)

    def get_object(self):
        return get_object_or_404(Job, slug=self.kwargs.get("slug"))

    def perform_update(self, serializer):
        job = serializer.save()
        if job.is_published and not job.published_at:
            job.published_at = timezone.now()
            job.save(update_fields=["published_at"])


class JobDeleteView(generics.DestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    lookup_field = "slug"
    permission_classes = (permissions.IsAdminUser,)

    def get_object(self):
        slug = self.kwargs.get("slug")
        return get_object_or_404(Job, slug=slug)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
