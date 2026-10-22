from django.test import SimpleTestCase

from .serializers import JobSerializer


class JobRichContentTests(SimpleTestCase):
    def test_job_description_keeps_safe_formatting_and_removes_unsafe_markup(self):
        serializer = JobSerializer(data={
            "description": '<p><strong>Deployment pool</strong> and <em>aging</em>.</p><script>alert(1)</script>',
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(
            serializer.validated_data["description"],
            "<p><strong>Deployment pool</strong> and <em>aging</em>.</p>alert(1)",
        )
