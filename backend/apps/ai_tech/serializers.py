from rest_framework import serializers

from apps.core.security import safe_upload_filename, validate_file_upload
from .models import AITechPost


class AITechPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = AITechPost
        fields = (
            "id",
            "title",
            "slug",
            "post_type",
            "excerpt",
            "content",
            "thumbnail",
            "tags",
            "author",
            "source_name",
            "source_url",
            "youtube_url",
            "is_featured",
            "is_published",
            "published_at",
            "updated_at",
            "seo_title",
            "seo_description",
        )

    def validate_thumbnail(self, value):
        if not value:
            return value
        is_valid, error_message = validate_file_upload(value, ["jpg", "jpeg", "png", "gif", "webp"], 5 * 1024 * 1024)
        if not is_valid:
            raise serializers.ValidationError(error_message)
        value.name = safe_upload_filename(value.name)
        return value
