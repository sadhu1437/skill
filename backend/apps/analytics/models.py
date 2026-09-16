from django.db import models


class AnalyticsEvent(models.Model):
    event_type = models.CharField(max_length=100)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.event_type
