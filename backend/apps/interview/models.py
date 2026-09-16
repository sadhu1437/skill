from django.db import models
from django.utils.text import slugify


class InterviewTopic(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=80, blank=True, default="code")
    display_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.CharField(max_length=320, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name"]
        indexes = [models.Index(fields=["is_published", "display_order"], name="interview_topic_pub_order_idx")]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class InterviewQuestion(models.Model):
    QUESTION_TYPES = [
        ("conceptual", "Conceptual"), ("coding", "Coding"), ("mcq", "Multiple Choice"),
        ("scenario", "Scenario Based"), ("sql", "SQL Query"), ("output", "Output Based"),
        ("behavioral", "Behavioral"), ("technical", "Technical"),
    ]
    DIFFICULTIES = [("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")]

    topic = models.ForeignKey(InterviewTopic, on_delete=models.PROTECT, related_name="questions", null=True, blank=True)
    title = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=280, unique=True, null=True, blank=True)
    question = models.TextField()
    answer = models.TextField(blank=True)
    explanation = models.TextField(blank=True)
    example = models.TextField(blank=True)
    key_points = models.TextField(blank=True)
    problem_statement = models.TextField(blank=True)
    input_format = models.TextField(blank=True)
    output_format = models.TextField(blank=True)
    constraints = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True)
    question_type = models.CharField(max_length=30, choices=QUESTION_TYPES, default="conceptual")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTIES, default="medium")
    company = models.CharField(max_length=100, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.CharField(max_length=320, blank=True)
    legacy_topic = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "-created_at"]
        indexes = [
            models.Index(fields=["topic", "is_published", "display_order"], name="interview_topic_pub_idx"),
            models.Index(fields=["question_type", "difficulty"], name="interview_type_diff_idx"),
        ]

    def save(self, *args, **kwargs):
        if not self.title:
            self.title = self.question[:255]
        if not self.slug:
            base_slug = slugify(self.title) or "interview-question"
            self.slug = base_slug
            suffix = 2
            while InterviewQuestion.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{base_slug}-{suffix}"
                suffix += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or self.question[:80]


class InterviewCodeExample(models.Model):
    LANGUAGES = [(value, value.title()) for value in ("python", "java", "javascript", "c", "cpp", "csharp", "go", "sql")]
    question = models.ForeignKey(InterviewQuestion, on_delete=models.CASCADE, related_name="code_examples")
    language = models.CharField(max_length=30, choices=LANGUAGES, default="python")
    code = models.TextField()
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return f"{self.question.title} ({self.language})"
