from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class ExploreCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ExploreTag(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Article(models.Model):
    STATUS_CHOICES = [("draft", "Draft"), ("published", "Published"), ("scheduled", "Scheduled")]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=280)
    category = models.ForeignKey(ExploreCategory, on_delete=models.PROTECT, related_name="articles", null=True, blank=True)
    tags = models.ManyToManyField(ExploreTag, blank=True, related_name="articles")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="explore_articles")
    short_description = models.TextField(blank=True)
    content = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="explore/covers/", blank=True, null=True)
    video_url = models.URLField(blank=True)
    reading_time = models.PositiveIntegerField(default=3)
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    is_featured = models.BooleanField(default=False)
    comments_enabled = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["is_featured", "status"]),
            models.Index(fields=["status", "published_at", "created_at"], name="article_public_order_idx"),
            models.Index(fields=["status", "views", "likes", "published_at"], name="article_trending_idx"),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "article"
            candidate = base
            index = 1
            while Article.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base}-{index}"
                index += 1
            self.slug = candidate
        if self.status == "published" and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def is_public(self):
        return self.status == "published" and (not self.scheduled_at or self.scheduled_at <= timezone.now())

    def __str__(self):
        return self.title


class ArticleLike(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="like_records")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="article_likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["article", "user"], name="unique_article_like")]


class ArticleBookmark(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="bookmark_records")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="article_bookmarks")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["article", "user"], name="unique_article_bookmark")]


class ArticleComment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="article_comments")
    body = models.TextField()
    is_approved = models.BooleanField(default=True)
    is_edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
