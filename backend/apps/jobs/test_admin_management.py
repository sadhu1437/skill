from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Company, Job


class JobAdminManagementListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff_user = get_user_model().objects.create_user(
            username="jobs-admin",
            email="jobs-admin@example.com",
            password="test-password",
            is_staff=True,
        )
        self.company = Company.objects.create(name="SkillBloom Labs")
        Job.objects.create(
            company=self.company,
            title="Published role",
            slug="published-role",
            is_published=True,
        )
        Job.objects.create(
            company=self.company,
            title="Draft role",
            slug="draft-role",
            is_published=False,
        )

    def test_staff_can_search_published_and_draft_jobs(self):
        self.client.force_authenticate(user=self.staff_user)

        response = self.client.get(
            reverse("job-manage-list"),
            {"search": "Draft role"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], "draft-role")

    def test_non_staff_cannot_list_managed_jobs(self):
        response = self.client.get(reverse("job-manage-list"))

        self.assertEqual(response.status_code, 401)
