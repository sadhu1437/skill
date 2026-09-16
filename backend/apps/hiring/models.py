from django.db import models


class HiringPattern(models.Model):
    company = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    eligibility = models.TextField(blank=True)
    assessment = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company
