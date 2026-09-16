from django.db import models


class CodingProblem(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=50, default="Medium")
    topic = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=100, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
