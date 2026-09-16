from django.db import models
from django.utils.text import slugify


class AITechPost(models.Model):
    POST_TYPE_CHOICES = [
        ("news", "Latest AI News"),
        ("ai_update", "AI Updates"),
        ("company", "Company Updates"),
        ("fact", "Interesting Facts"),
        ("tool", "AI Tools"),
        ("developer", "Developer News"),
        ("career", "Career & Industry Trends"),
        ("explained", "Technology Explained"),
        ("weekly", "Weekly AI Roundup"),
        ("video", "YouTube Videos"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    post_type = models.CharField(max_length=30, choices=POST_TYPE_CHOICES, default="news")
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    thumbnail = models.ImageField(upload_to="ai_posts/", blank=True, null=True)
    tags = models.CharField(max_length=500, blank=True)
    author = models.CharField(max_length=255, blank=True)
    source_name = models.CharField(max_length=255, blank=True)
    source_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_published"]),
            models.Index(fields=["post_type"]),
            models.Index(fields=["published_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
