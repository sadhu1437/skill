from rest_framework import serializers

from apps.core.security import safe_upload_filename, validate_file_upload
from .models import PDFResource


class PDFResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFResource
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "category",
            "tags",
            "author",
            "pdf",
            "thumbnail",
            "is_featured",
            "is_published",
            "download_count",
            "published_at",
            "created_at",
        )
        read_only_fields = ("id", "slug", "download_count", "published_at", "created_at")

    def validate_pdf(self, value):
        is_valid, error_message = validate_file_upload(value, ["pdf"], 10 * 1024 * 1024)
        if not is_valid:
            raise serializers.ValidationError(error_message)
        value.name = safe_upload_filename(value.name)
        return value

    def validate_thumbnail(self, value):
        if not value:
            return value
        is_valid, error_message = validate_file_upload(value, ["jpg", "jpeg", "png", "webp"], 5 * 1024 * 1024)
        if not is_valid:
            raise serializers.ValidationError(error_message)
        value.name = safe_upload_filename(value.name)
        return value
