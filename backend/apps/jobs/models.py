from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Company(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Job(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="jobs")
    title = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=255, unique=True)
    location = models.CharField(max_length=255, blank=True)
    work_mode = models.CharField(max_length=50, default="Hybrid")
    job_type = models.CharField(max_length=50, default="Full Time")
    experience = models.CharField(max_length=100, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    eligible_batch = models.CharField(max_length=100, blank=True)
    salary = models.CharField(max_length=100, blank=True)
    job_id = models.CharField(max_length=100, blank=True)
    short_description = models.TextField(blank=True)
    description = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True)
    eligibility = models.TextField(blank=True)
    required_skills = models.TextField(blank=True)
    preferred_skills = models.TextField(blank=True)
    selection_process = models.TextField(blank=True)
    application_process = models.TextField(blank=True)
    interview_preparation = models.TextField(blank=True)
    fraud_alert = models.TextField(blank=True)
    official_url = models.URLField(blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    priority = models.PositiveIntegerField(default=0)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-priority", "-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["published_at"]),
            models.Index(fields=["deadline"]),
            models.Index(fields=["is_published"]),
            models.Index(fields=["company"]),
            models.Index(fields=["location"]),
            models.Index(fields=["job_type"]),
            models.Index(fields=["work_mode"]),
            models.Index(fields=["is_published", "deadline", "published_at"], name="job_public_feed_idx"),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "job"
            slug = base
            index = 1
            while Job.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{index}"
                index += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        if not self.deadline:
            return False
        return timezone.now() > self.deadline

    def __str__(self):
        return f"{self.company.name} - {self.title}"
