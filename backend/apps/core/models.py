from django.db import models


class AdSenseSettings(models.Model):
    enabled = models.BooleanField(default=False)
    publisher_id = models.CharField(max_length=100, blank=True)
    home_slot = models.CharField(max_length=100, blank=True)
    job_slot = models.CharField(max_length=100, blank=True)
    content_slot = models.CharField(max_length=100, blank=True)
    interview_slot = models.CharField(max_length=100, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "AdSense settings"
        verbose_name_plural = "AdSense settings"

    def __str__(self):
        return self.publisher_id or "AdSense settings"
