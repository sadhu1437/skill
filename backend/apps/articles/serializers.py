import json
import logging

import bleach
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from rest_framework import serializers

from apps.core.security import sanitize_html, sanitize_input, safe_upload_filename, validate_file_upload, validate_url
from .models import Article, ArticleComment, ExploreCategory, ExploreTag

User = get_user_model()
logger = logging.getLogger("django.security")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExploreCategory
        fields = ("id", "name", "slug", "description", "is_active", "order")
        read_only_fields = ("id", "slug")


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExploreTag
        fields = ("id", "name", "slug")
        read_only_fields = ("id", "slug")


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class ArticleSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=ExploreCategory.objects.filter(is_active=True), write_only=True, required=False, allow_null=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.JSONField(write_only=True, required=False)
    author = AuthorSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ("id", "title", "slug", "category", "category_id", "tags", "tag_names", "author", "short_description", "content", "cover_image", "video_url", "reading_time", "views", "likes", "shares", "status", "is_featured", "comments_enabled", "published_at", "scheduled_at", "seo_title", "seo_description", "created_at", "updated_at", "is_liked", "is_bookmarked")
        read_only_fields = ("id", "slug", "author", "views", "likes", "shares", "published_at", "created_at", "updated_at", "is_liked", "is_bookmarked")

    def get_is_liked(self, obj):
        user = self.context["request"].user
        if hasattr(obj, "_is_liked"):
            return bool(obj._is_liked)
        return bool(user.is_authenticated and obj.like_records.filter(user=user).exists())

    def get_is_bookmarked(self, obj):
        user = self.context["request"].user
        if hasattr(obj, "_is_bookmarked"):
            return bool(obj._is_bookmarked)
        return bool(user.is_authenticated and obj.bookmark_records.filter(user=user).exists())

    def _normalize_tag_names(self, value):
        if value is None:
            return []
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = value.split(",")
        if isinstance(value, dict):
            value = list(value.values())
        if not isinstance(value, (list, tuple, set)):
            value = [value]
        normalized = []
        for tag in value:
            if isinstance(tag, dict):
                tag = tag.get("name", "")
            tag = str(tag).strip()
            if tag:
                normalized.append(tag)
        return normalized

    def _set_tags(self, article, names):
        names = self._normalize_tag_names(names)
        tags = []
        for name in names:
            clean_name = str(name).strip()
            if clean_name:
                tag, _ = ExploreTag.objects.get_or_create(name=clean_name, defaults={"slug": slugify(clean_name)})
                tags.append(tag)
        article.tags.set(tags)

    def validate_content(self, value):
        """Sanitize HTML content to prevent XSS"""
        if not value:
            return value
        
        # Sanitize HTML content
        sanitized = sanitize_html(value)
        logger.info("Article content sanitized during validation")
        return sanitized

    def validate_short_description(self, value):
        """Sanitize short description"""
        if not value:
            return value
        
        # Short description should not contain HTML
        # Just ensure it's properly escaped
        return sanitize_input(value, max_length=500)

    def validate_video_url(self, value):
        """Validate video URL"""
        if not value:
            return value
        
        if not validate_url(value):
            raise serializers.ValidationError("Invalid video URL. Only http/https protocols are allowed.")
        
        return value

    def validate_cover_image(self, value):
        if not value:
            return value
        is_valid, error_message = validate_file_upload(
            value,
            allowed_extensions=["jpg", "jpeg", "png", "gif", "webp"],
            max_size=5 * 1024 * 1024,
        )
        if not is_valid:
            raise serializers.ValidationError(error_message)
        value.name = safe_upload_filename(value.name)
        return value

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        article = Article.objects.create(author=self.context["request"].user, **validated_data)
        self._set_tags(article, tag_names)
        return article

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        article = super().update(instance, validated_data)
        if tag_names is not None:
            self._set_tags(article, tag_names)
        return article


class CommentSerializer(serializers.ModelSerializer):
    user = AuthorSerializer(read_only=True)

    class Meta:
        model = ArticleComment
        fields = ("id", "user", "body", "is_edited", "created_at")
        read_only_fields = ("id", "user", "is_edited", "created_at")

    def validate_body(self, value):
        """Sanitize comment body to prevent XSS"""
        if not value:
            raise serializers.ValidationError("Comment cannot be empty.")
        
        # Limit comment length
        if len(value) > 5000:
            raise serializers.ValidationError("Comment is too long (max 5000 characters).")
        
        # Sanitize HTML but with more restrictive tags
        sanitized = bleach.clean(
            value,
            tags=["strong", "em", "u", "a", "br"],  # Very limited tags for comments
            attributes={"a": ["href"]},
            strip=True,
        )
        
        logger.info("Comment body sanitized during validation")
        return sanitized
