import re

from rest_framework import serializers

from .models import AdSenseSettings


ADSENSE_SETTINGS_FIELDS = ("enabled", "publisher_id", "placements")

SURFACE_CHOICES = (
    "home",
    "jobs_listing",
    "job_article",
    "explore_listing",
    "explore_article",
    "interview_index",
    "interview_question",
)

ARTICLE_SURFACES = {"job_article", "explore_article", "interview_question"}


class AdPlacementSerializer(serializers.Serializer):
    id = serializers.RegexField(r"^[a-z0-9][a-z0-9-]{0,59}$")
    name = serializers.CharField(max_length=80, trim_whitespace=True)
    surface = serializers.ChoiceField(choices=SURFACE_CHOICES)
    position = serializers.ChoiceField(choices=("page_top", "page_bottom", "in_article"))
    slot_id = serializers.RegexField(r"^\d{1,20}$")
    ad_type = serializers.ChoiceField(choices=("display", "in_article"))

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            return super().to_internal_value(data)
        unknown_fields = set(data) - set(self.fields)
        if unknown_fields:
            raise serializers.ValidationError(
                {"detail": f"Unsupported placement field(s): {', '.join(sorted(unknown_fields))}."}
            )
        return super().to_internal_value(data)

    def validate(self, attrs):
        is_article_surface = attrs["surface"] in ARTICLE_SURFACES
        if (attrs["position"] == "in_article") != is_article_surface:
            raise serializers.ValidationError(
                {"position": "Choose a position supported by the selected public page."}
            )
        return attrs


class AdSenseSettingsSerializer(serializers.ModelSerializer):
    placements = AdPlacementSerializer(many=True, required=False)

    class Meta:
        model = AdSenseSettings
        fields = ADSENSE_SETTINGS_FIELDS

    def validate_publisher_id(self, value):
        if value and not re.fullmatch(r"ca-pub-\d{16}", value):
            raise serializers.ValidationError("Enter a valid AdSense publisher ID (ca-pub- followed by 16 digits).")
        return value

    def validate(self, attrs):
        current = self.instance
        enabled = attrs.get("enabled", current.enabled if current else False)
        publisher_id = attrs.get("publisher_id", current.publisher_id if current else "")
        placements = attrs.get("placements", current.placements if current else [])

        errors = {}
        if publisher_id and not re.fullmatch(r"ca-pub-\d{16}", publisher_id):
            errors["publisher_id"] = "Enter a valid AdSense publisher ID (ca-pub- followed by 16 digits)."
        placement_ids = [placement["id"] for placement in placements]
        if len(placement_ids) != len(set(placement_ids)):
            errors["placements"] = "Placement IDs must be unique."
        positions = [(placement["surface"], placement["position"]) for placement in placements]
        if len(positions) != len(set(positions)):
            errors["placements"] = "Only one placement is allowed at each page position."
        if len(placements) > 30:
            errors["placements"] = "A maximum of 30 placements is supported."
        if enabled and not publisher_id:
            errors["publisher_id"] = "A publisher ID is required when AdSense is enabled."
        if enabled and not placements:
            errors["enabled"] = "Configure at least one ad slot before enabling AdSense."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs
