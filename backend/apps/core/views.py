from django.db import connection
from django.db.models import Q
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response

from apps.jobs.models import Job
from apps.jobs.serializers import JobSerializer
from .models import AdSenseSettings


class ApiRootView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        return Response({
            "name": "SkillBloom API",
            "status": "ok",
            "endpoints": {
                "auth": "/api/auth/",
                "jobs": "/api/jobs/",
                "homepage": "/api/core/home/",
                "resources": "/api/resources/",
                "interview": "/api/interview/",
                "admin_panel": "http://localhost:5173/admin-panel",
            },
        })


class HealthCheckView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = ()

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            return Response({"status": "ok", "database": "ok"})
        except Exception:
            return Response({"status": "degraded", "database": "unavailable"}, status=503)


class AdSenseSettingsView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        settings = AdSenseSettings.objects.first()
        if not settings:
            return Response({"enabled": False, "publisher_id": "", "home_slot": "", "job_slot": "", "content_slot": "", "interview_slot": ""})
        return Response({
            "enabled": settings.enabled,
            "publisher_id": settings.publisher_id,
            "home_slot": settings.home_slot,
            "job_slot": settings.job_slot,
            "content_slot": settings.content_slot,
            "interview_slot": settings.interview_slot,
        })

    def patch(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"detail": "Staff access required."}, status=403)
        settings, _ = AdSenseSettings.objects.get_or_create(pk=1)
        for field in ("enabled", "publisher_id", "home_slot", "job_slot", "content_slot", "interview_slot"):
            if field in request.data:
                setattr(settings, field, request.data[field])
        settings.save()
        return self.get(request)


class HomePageContentView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    @method_decorator(cache_page(60))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        jobs = (
            Job.objects.filter(is_published=True)
            .filter(Q(deadline__isnull=True) | Q(deadline__gte=timezone.now()))
            .select_related("company")
            .order_by("-published_at", "-priority", "-created_at")[:6]
        )

        hero = {
            "title": "No.1 Career Developer",
            "subtitle": "Access Jobs, PDFs & Crack Your Next Interview",
            "cta_primary": "/jobs",
            "cta_secondary": "/pdfs",
        }

        sections = [
            {"title": "Learning PDFs", "slug": "pdfs", "description": "Curated study material for coding, aptitude, and interview prep."},
            {"title": "Hiring Patterns", "slug": "hiring-patterns", "description": "Insights into company-specific hiring processes and selection rounds."},
            {"title": "Interview Questions", "slug": "interview", "description": "Real-world interview prep for core skills and technical rounds."},
            {"title": "Coding Practice", "slug": "coding", "description": "Problem sets and daily exercises to sharpen your logic."},
            {"title": "Career Roadmaps", "slug": "roadmaps", "description": "Follow structured learning paths to reach your target role."},
            {"title": "Job Opportunities", "slug": "jobs", "description": "Fresh roles from startups, MNCs, and tech companies."},
        ]

        data = {
            "hero": hero,
            "sections": sections,
            "jobs": JobSerializer(jobs, many=True).data,
        }
        return Response(data)
