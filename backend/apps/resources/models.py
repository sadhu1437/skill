from django.db import models
from django.utils.text import slugify


class PDFResource(models.Model):
    CATEGORY_CHOICES = [
        ("Programming", "Programming"),
        ("DSA", "DSA"),
        ("Java", "Java"),
        ("Python", "Python"),
        ("SQL", "SQL"),
        ("Web Development", "Web Development"),
        ("AI/ML", "AI/ML"),
        ("Aptitude", "Aptitude"),
        ("Interview", "Interview"),
        ("Placement", "Placement"),
        ("Resume", "Resume"),
        ("Company Preparation", "Company Preparation"),
        ("Other", "Other"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField(blank=True)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default="Other")
    tags = models.CharField(max_length=500, blank=True)
    author = models.CharField(max_length=255, blank=True)
    pdf = models.FileField(upload_to="pdfs/")
    thumbnail = models.ImageField(upload_to="pdf_thumbnails/", blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    download_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["category"]),
            models.Index(fields=["is_published"]),
            models.Index(fields=["published_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
