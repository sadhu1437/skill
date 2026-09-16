from rest_framework import serializers

from .models import InterviewCodeExample, InterviewQuestion, InterviewTopic


class InterviewTopicSerializer(serializers.ModelSerializer):
    question_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = InterviewTopic
        fields = ("id", "name", "slug", "description", "icon", "display_order", "is_published", "seo_title", "seo_description", "question_count", "created_at", "updated_at")
        read_only_fields = ("id", "slug", "question_count", "created_at", "updated_at")


class InterviewCodeExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewCodeExample
        fields = ("id", "language", "code", "display_order")
        read_only_fields = ("id",)


class InterviewQuestionSerializer(serializers.ModelSerializer):
    topic = InterviewTopicSerializer(read_only=True)
    topic_id = serializers.PrimaryKeyRelatedField(source="topic", queryset=InterviewTopic.objects.all(), write_only=True, required=False, allow_null=True)
    code_examples = InterviewCodeExampleSerializer(many=True, required=False)
    preview = serializers.SerializerMethodField()

    class Meta:
        model = InterviewQuestion
        fields = ("id", "topic", "topic_id", "title", "slug", "question", "preview", "answer", "explanation", "example", "key_points", "problem_statement", "input_format", "output_format", "constraints", "tags", "question_type", "difficulty", "company", "display_order", "is_published", "seo_title", "seo_description", "code_examples", "created_at", "updated_at")
        read_only_fields = ("id", "slug", "preview", "created_at", "updated_at")

    def get_preview(self, obj):
        return obj.question[:180]

    def create(self, validated_data):
        code_examples = validated_data.pop("code_examples", [])
        question = InterviewQuestion.objects.create(**validated_data)
        self._save_code_examples(question, code_examples)
        return question

    def update(self, instance, validated_data):
        code_examples = validated_data.pop("code_examples", None)
        question = super().update(instance, validated_data)
        if code_examples is not None:
            instance.code_examples.all().delete()
            self._save_code_examples(instance, code_examples)
        return question

    def _save_code_examples(self, question, examples):
        InterviewCodeExample.objects.bulk_create([InterviewCodeExample(question=question, **example) for example in examples])


class LegacyInterviewQuestionSerializer(InterviewQuestionSerializer):
    class Meta(InterviewQuestionSerializer.Meta):
        fields = ("id", "question", "answer", "difficulty", "legacy_topic", "company", "is_published", "created_at")
        read_only_fields = ("id", "created_at")
