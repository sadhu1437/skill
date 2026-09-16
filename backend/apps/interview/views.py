from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import filters, generics, permissions, status
from rest_framework.response import Response

from apps.core.throttles import PublicReadThrottle
from .models import InterviewQuestion, InterviewTopic
from .serializers import InterviewQuestionSerializer, InterviewTopicSerializer


class PublishedTopicQuerysetMixin:
    def get_queryset(self):
        return InterviewTopic.objects.filter(is_published=True).annotate(
            question_count=Count("questions", filter=Q(questions__is_published=True))
        ).order_by("display_order", "name")


class InterviewTopicListView(PublishedTopicQuerysetMixin, generics.ListAPIView):
    serializer_class = InterviewTopicSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)


class InterviewTopicDetailView(PublishedTopicQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = InterviewTopicSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)
    lookup_field = "slug"


class InterviewQuestionListView(generics.ListAPIView):
    serializer_class = InterviewQuestionSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("title", "question", "answer", "explanation", "tags", "topic__name")
    ordering_fields = ("display_order", "created_at", "difficulty")
    ordering = ("display_order", "-created_at")

    def get_queryset(self):
        queryset = InterviewQuestion.objects.filter(
            is_published=True, topic__is_published=True
        ).select_related("topic").prefetch_related("code_examples")
        topic = self.request.query_params.get("topic")
        if topic:
            queryset = queryset.filter(topic__slug=topic)
        difficulty = self.request.query_params.get("difficulty")
        if difficulty in {"easy", "medium", "hard"}:
            queryset = queryset.filter(difficulty=difficulty)
        question_type = self.request.query_params.get("question_type")
        if question_type:
            queryset = queryset.filter(question_type=question_type)
        return queryset


class InterviewQuestionDetailView(generics.RetrieveAPIView):
    serializer_class = InterviewQuestionSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)
    lookup_field = "slug"

    def get_queryset(self):
        return InterviewQuestion.objects.filter(
            is_published=True, topic__is_published=True
        ).select_related("topic").prefetch_related("code_examples")


class InterviewQuestionCreateView(generics.CreateAPIView):
    queryset = InterviewQuestion.objects.all()
    serializer_class = InterviewQuestionSerializer
    permission_classes = (permissions.IsAdminUser,)


class InterviewTopicCreateView(generics.CreateAPIView):
    queryset = InterviewTopic.objects.all()
    serializer_class = InterviewTopicSerializer
    permission_classes = (permissions.IsAdminUser,)


class InterviewTopicManageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InterviewTopic.objects.all()
    serializer_class = InterviewTopicSerializer
    permission_classes = (permissions.IsAdminUser,)
    lookup_field = "slug"


class InterviewQuestionManageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InterviewQuestion.objects.all().select_related("topic").prefetch_related("code_examples")
    serializer_class = InterviewQuestionSerializer
    permission_classes = (permissions.IsAdminUser,)
    lookup_field = "slug"


class InterviewQuestionDeleteView(generics.DestroyAPIView):
    queryset = InterviewQuestion.objects.all()
    serializer_class = InterviewQuestionSerializer
    permission_classes = (permissions.IsAdminUser,)

    def get_object(self):
        return get_object_or_404(InterviewQuestion, pk=self.kwargs.get("pk"))

    def delete(self, request, *args, **kwargs):
        self.get_object().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
