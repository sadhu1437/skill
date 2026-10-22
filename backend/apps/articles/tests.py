from io import BytesIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from PIL import Image
from rest_framework.test import APIClient


class ArticleInlineImageUploadTests(TestCase):
    def setUp(self):
        user = get_user_model().objects.create_user(
            username="content-admin",
            email="content-admin@example.com",
            password="test-password",
            is_staff=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=user)

    def make_png(self):
        image = Image.new("RGB", (2, 2), color="blue")
        image_data = BytesIO()
        image.save(image_data, format="PNG")
        return SimpleUploadedFile("article-image.png", image_data.getvalue(), content_type="image/png")

    @patch("apps.articles.views.default_storage.url", return_value="/media/explore/content/image.png")
    @patch("apps.articles.views.default_storage.save", return_value="explore/content/image.png")
    def test_staff_can_upload_an_inline_article_image(self, save_image, image_url):
        response = self.client.post(
            reverse("explore-inline-image-upload"),
            {"image": self.make_png()},
            format="multipart",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["url"], "http://testserver/media/explore/content/image.png")
        save_image.assert_called_once()
        image_url.assert_called_once_with("explore/content/image.png")

    def test_rejects_non_image_uploads(self):
        invalid_file = SimpleUploadedFile("notes.txt", b"not an image", content_type="text/plain")
        response = self.client.post(
            reverse("explore-inline-image-upload"),
            {"image": invalid_file},
            format="multipart",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("image", response.data)
