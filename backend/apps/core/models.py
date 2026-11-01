from django.db import models


AD_TYPE_CHOICES = (
    ("display", "Display"),
    ("in_article", "In-article"),
)


class AdSenseSettings(models.Model):
    enabled = models.BooleanField(default=False)
    publisher_id = models.CharField(max_length=100, blank=True)
    placements = models.JSONField(default=list, blank=True)
    home_slot = models.CharField(max_length=100, blank=True)
    job_slot = models.CharField(max_length=100, blank=True)
    jobs_in_article_slot = models.CharField(max_length=100, blank=True)
    explore_display_slot = models.CharField(max_length=100, blank=True)
    explore_in_article_slot = models.CharField(max_length=100, blank=True)
    interview_slot = models.CharField(max_length=100, blank=True)
    interview_in_article_slot = models.CharField(max_length=100, blank=True)
    home_ad_type = models.CharField(max_length=20, choices=AD_TYPE_CHOICES, default="display")
    job_ad_type = models.CharField(max_length=20, choices=AD_TYPE_CHOICES, default="display")
    jobs_in_article_ad_type = models.CharField(max_length=20, choices=AD_TYPE_CHOICES, default="in_article")
    explore_display_ad_type = models.CharField(max_length=20, choices=AD_TYPE_CHOICES, default="display")
    explore_in_article_ad_type = models.CharField(max_length=20, choices=AD_TYPE_CHOICES, default="in_article")
    interview_ad_type = models.CharField(max_length=20, choices=AD_TYPE_CHOICES, default="display")
    interview_in_article_ad_type = models.CharField(max_length=20, choices=AD_TYPE_CHOICES, default="in_article")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "AdSense settings"
        verbose_name_plural = "AdSense settings"

    def __str__(self):
        return self.publisher_id or "AdSense settings"
