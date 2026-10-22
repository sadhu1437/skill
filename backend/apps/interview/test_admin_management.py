from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import InterviewQuestion, InterviewTopic


class InterviewQuestionAdminManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = get_user_model().objects.create_user(
            username="interview-admin",
            email="interview-admin@example.com",
            password="test-password",
            is_staff=True,
        )
        self.topic = InterviewTopic.objects.create(
            name="Admin Management Java",
            slug="admin-management-java",
            is_published=True,
        )
        self.question = InterviewQuestion.objects.create(
            topic=self.topic,
            title="Explain inheritance",
            question="What is inheritance?",
            is_published=False,
        )

    def test_staff_can_list_unpublished_questions(self):
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.get(reverse("interview-question-manage-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], self.question.slug)
        self.assertFalse(response.data["results"][0]["is_published"])

    def test_staff_can_update_and_delete_question(self):
        self.client.force_authenticate(user=self.staff_user)
        detail_url = reverse(
            "interview-question-manage-detail",
            kwargs={"slug": self.question.slug},
        )

        update_response = self.client.patch(detail_url, {"title": "Updated inheritance"})
        self.assertEqual(update_response.status_code, 200)
        self.question.refresh_from_db()
        self.assertEqual(self.question.title, "Updated inheritance")

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(InterviewQuestion.objects.filter(pk=self.question.pk).exists())

    def test_non_staff_cannot_list_managed_questions(self):
        response = self.client.get(reverse("interview-question-manage-list"))

        self.assertEqual(response.status_code, 401)
