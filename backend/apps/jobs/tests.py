from django.contrib.auth import get_user_model
from django.db import models
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from apps.interview.models import InterviewQuestion
from apps.resources.models import PDFResource
from .models import Company, Job


class JobOrderingAndPublishingTests(TestCase):
    def setUp(self):
        company = Company.objects.create(name="SkillBloom Labs")
        self.job_older = Job.objects.create(
            company=company,
            title="Senior Backend Engineer",
            slug="senior-backend-engineer",
            location="Remote",
            work_mode="Remote",
            job_type="Full Time",
            is_published=True,
            published_at=timezone.now() - timezone.timedelta(days=2),
            deadline=timezone.now() + timezone.timedelta(days=30),
        )
        self.job_newer = Job.objects.create(
            company=company,
            title="Frontend Engineer",
            slug="frontend-engineer",
            location="Bengaluru",
            work_mode="Hybrid",
            job_type="Full Time",
            is_published=True,
            published_at=timezone.now(),
            deadline=timezone.now() + timezone.timedelta(days=15),
        )

    def test_newest_published_jobs_are_first(self):
        newest = list(Job.objects.filter(is_published=True).order_by('-published_at')[:2])
        self.assertEqual(newest[0].title, "Frontend Engineer")
        self.assertEqual(newest[1].title, "Senior Backend Engineer")

    def test_expired_jobs_are_not_active(self):
        expired = Job.objects.create(
            company=self.job_newer.company,
            title="Expired Job",
            slug="expired-job",
            location="Pune",
            work_mode="Office",
            job_type="Contract",
            is_published=True,
            published_at=timezone.now() - timezone.timedelta(days=2),
            deadline=timezone.now() - timezone.timedelta(days=1),
        )
        active_jobs = Job.objects.filter(is_published=True).filter(models.Q(deadline__isnull=True) | models.Q(deadline__gte=timezone.now()))
        self.assertNotIn(expired, active_jobs)

    def test_job_slug_generation(self):
        self.assertEqual(self.job_newer.slug, "frontend-engineer")


class JobAdminDeleteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="admin",
            email="admin@skillbloom.com",
            password="StrongPass123!",
            is_staff=True,
            is_superuser=True,
        )
        self.company = Company.objects.create(name="SkillBloom Labs")
        self.job = Job.objects.create(
            company=self.company,
            title="Senior Backend Engineer",
            slug="senior-backend-engineer",
            location="Hyderabad",
            work_mode="Hybrid",
            job_type="Full Time",
            experience="2+ years",
            qualification="B.Tech / B.E",
            short_description="Build systems for long-term growth.",
            description="Responsible for backend products and APIs.",
            responsibilities="Design and develop backend services.",
            eligibility="Bachelor's degree in engineering.",
            official_url="https://example.com/jobs/backend",
            is_published=True,
            published_at=timezone.now(),
            deadline=timezone.now() + timezone.timedelta(days=30),
        )

    def test_admin_can_delete_a_job_with_slug(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(reverse("job-delete", kwargs={"slug": self.job.slug}))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Job.objects.filter(pk=self.job.pk).exists())

    def test_admin_can_delete_uploaded_pdf_resource(self):
        resource = PDFResource.objects.create(
            title="Java PDF",
            slug="java-pdf",
            category="Java",
            description="Java notes",
            pdf="pdfs/java.pdf",
            is_published=True,
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(reverse("pdf-delete", kwargs={"slug": resource.slug}))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(PDFResource.objects.filter(pk=resource.pk).exists())

    def test_admin_can_delete_interview_question(self):
        question = InterviewQuestion.objects.create(
            question="What is polymorphism?",
            answer="It is method overriding.",
            topic="Java",
            company="TCS",
            is_published=True,
        )
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(reverse("interview-question-delete", kwargs={"pk": question.pk}))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(InterviewQuestion.objects.filter(pk=question.pk).exists())


from django.db.models import Q
