import re

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
from .serializers import ADSENSE_SETTINGS_FIELDS, AdPlacementSerializer, AdSenseSettingsSerializer


LEGACY_PLACEMENTS = {
    "home_slot": ("home", "Home", "home", "page_bottom", "home_ad_type"),
    "job_slot": ("jobs-listing", "Jobs listing", "jobs_listing", "page_top", "job_ad_type"),
    "jobs_in_article_slot": ("jobs-article", "Jobs article", "job_article", "in_article", "jobs_in_article_ad_type"),
    "explore_display_slot": ("explore-listing", "Explore listing", "explore_listing", "page_bottom", "explore_display_ad_type"),
    "explore_in_article_slot": ("explore-article", "Explore article", "explore_article", "in_article", "explore_in_article_ad_type"),
    "interview_slot": ("interview-index", "Interview index", "interview_index", "page_bottom", "interview_ad_type"),
    "interview_in_article_slot": ("interview-question", "Interview answer", "interview_question", "in_article", "interview_in_article_ad_type"),
}


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

    @staticmethod
    def serialize_settings(settings):
        data = AdSenseSettingsSerializer(settings).data
        placements = {placement["id"]: placement for placement in settings.placements}
        for field, (placement_id, _name, _surface, _position, type_field) in LEGACY_PLACEMENTS.items():
            placement = placements.get(placement_id, {})
            data[field] = placement.get("slot_id", "")
            data[type_field] = placement.get("ad_type", "display")
        data["content_slot"] = data["explore_in_article_slot"]
        return data

    def get(self, request):
        settings = AdSenseSettings.objects.first() or AdSenseSettings()
        return Response(self.serialize_settings(settings))

    def patch(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"detail": "Staff access required."}, status=403)
        if not isinstance(request.data, dict) and not hasattr(request.data, "dict"):
            return Response({"detail": "Expected a JSON object of AdSense settings."}, status=400)
        payload = request.data.dict() if hasattr(request.data, "dict") else dict(request.data)
        legacy_fields = (*LEGACY_PLACEMENTS, *(
            config[4] for config in LEGACY_PLACEMENTS.values()
        ), "content_slot")
        has_legacy_fields = any(field in request.data for field in legacy_fields)
        if has_legacy_fields and any(
            field in request.data for field in ("placements", "remove_placement_ids")
        ):
            return Response({"detail": "Submit dynamic placements or legacy slot fields, not both."}, status=400)

        current_placements = {
            placement["id"]: dict(placement)
            for placement in (AdSenseSettings.objects.first() or AdSenseSettings()).placements
        }
        for field, (placement_id, name, surface, position, type_field) in LEGACY_PLACEMENTS.items():
            slot_key = field
            supplied = slot_key in payload
            if field == "explore_in_article_slot" and "content_slot" in payload:
                if supplied and payload[field] != payload["content_slot"]:
                    return Response({"content_slot": "Conflicting Explore In-article slot values."}, status=400)
                payload[field] = payload["content_slot"]
                supplied = True
            type_supplied = type_field in payload
            if supplied or type_supplied:
                existing = current_placements.get(placement_id)
                slot_id = payload.pop(slot_key, existing.get("slot_id", "") if existing else "")
                ad_type = payload.pop(type_field, existing.get("ad_type", "display") if existing else "display")
                if ad_type not in ("display", "in_article"):
                    return Response({type_field: "Choose Display or In-article."}, status=400)
                if slot_id:
                    current_placements[placement_id] = {
                        "id": placement_id,
                        "name": name,
                        "surface": surface,
                        "position": position,
                        "slot_id": slot_id,
                        "ad_type": ad_type,
                    }
                else:
                    current_placements.pop(placement_id, None)
        payload.pop("content_slot", None)

        if "placements" in payload or "remove_placement_ids" in payload:
            remove_ids = payload.pop("remove_placement_ids", [])
            if (
                not isinstance(remove_ids, list)
                or any(not isinstance(placement_id, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,59}", placement_id)
                       for placement_id in remove_ids)
                or len(remove_ids) != len(set(remove_ids))
            ):
                return Response({"remove_placement_ids": "Provide unique valid placement IDs."}, status=400)

            incoming_placements = payload.pop("placements", [])
            placement_serializer = AdPlacementSerializer(data=incoming_placements, many=True)
            if not placement_serializer.is_valid():
                return Response({"placements": placement_serializer.errors}, status=400)

            for placement_id in remove_ids:
                current_placements.pop(placement_id, None)
            for placement in placement_serializer.validated_data:
                current_placements[placement["id"]] = placement
            payload["placements"] = list(current_placements.values())
        elif has_legacy_fields:
            payload["placements"] = list(current_placements.values())

        unknown_fields = set(payload) - set(ADSENSE_SETTINGS_FIELDS)
        if unknown_fields:
            return Response(
                {"detail": f"Unknown AdSense setting(s): {', '.join(sorted(unknown_fields))}."},
                status=400,
            )

        settings = AdSenseSettings.objects.first() or AdSenseSettings()
        serializer = AdSenseSettingsSerializer(settings, data=payload, partial=True)
        serializer.is_valid(raise_exception=False)
        if serializer.errors:
            return Response(serializer.errors, status=400)
        serializer.save()
        saved = serializer.instance
        placements_by_id = {placement["id"]: placement for placement in saved.placements}
        for field, (placement_id, _name, _surface, _position, type_field) in LEGACY_PLACEMENTS.items():
            placement = placements_by_id.get(placement_id, {})
            setattr(saved, field, placement.get("slot_id", ""))
            setattr(saved, type_field, placement.get("ad_type", "display"))
        saved.save(update_fields=(*LEGACY_PLACEMENTS.keys(), *(
            config[4] for config in LEGACY_PLACEMENTS.values()
        ), "updated_at"))
        return Response(self.serialize_settings(serializer.instance))


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
