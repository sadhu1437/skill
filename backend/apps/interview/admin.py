from django.contrib import admin

from .models import InterviewCodeExample, InterviewQuestion, InterviewTopic


@admin.register(InterviewTopic)
class InterviewTopicAdmin(admin.ModelAdmin):
    list_display = ("name", "display_order", "is_published", "updated_at")
    list_filter = ("is_published",)
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "question_type", "difficulty", "is_published", "display_order")
    list_filter = ("is_published", "question_type", "difficulty", "topic")
    search_fields = ("title", "question", "answer", "tags")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("topic",)


@admin.register(InterviewCodeExample)
class InterviewCodeExampleAdmin(admin.ModelAdmin):
    list_display = ("question", "language", "display_order")
    list_filter = ("language",)
    search_fields = ("question__title", "code")
