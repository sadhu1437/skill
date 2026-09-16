from django.urls import path

from .views import (
    InterviewQuestionCreateView, InterviewQuestionDeleteView, InterviewQuestionDetailView,
    InterviewQuestionListView, InterviewQuestionManageDetailView, InterviewTopicCreateView,
    InterviewTopicDetailView, InterviewTopicListView, InterviewTopicManageDetailView,
)

urlpatterns = [
    path("topics/", InterviewTopicListView.as_view(), name="interview-topic-list"),
    path("topics/create/", InterviewTopicCreateView.as_view(), name="interview-topic-create"),
    path("topics/manage/<slug:slug>/", InterviewTopicManageDetailView.as_view(), name="interview-topic-manage-detail"),
        path("topics/<slug:slug>/", InterviewTopicDetailView.as_view(), name="interview-topic-detail"),
    path("questions/", InterviewQuestionListView.as_view(), name="interview-question-list"),
    path("questions/manage/<slug:slug>/", InterviewQuestionManageDetailView.as_view(), name="interview-question-manage-detail"),
        path("questions/<slug:slug>/", InterviewQuestionDetailView.as_view(), name="interview-question-detail"),
    path("create/", InterviewQuestionCreateView.as_view(), name="interview-question-create"),
    path("delete/<int:pk>/", InterviewQuestionDeleteView.as_view(), name="interview-question-delete"),
    path("", InterviewQuestionListView.as_view(), name="interview-question-legacy-list"),
]
