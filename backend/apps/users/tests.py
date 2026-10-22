from django.test import SimpleTestCase, override_settings


@override_settings(CORS_ALLOWED_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"])
class LocalDevelopmentCORSTests(SimpleTestCase):
    def test_local_vite_origin_can_post_to_login(self):
        response = self.client.options(
            "/api/auth/login/",
            HTTP_ORIGIN="http://127.0.0.1:5173",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="content-type",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Access-Control-Allow-Origin"], "http://127.0.0.1:5173")
        self.assertIn("POST", response["Access-Control-Allow-Methods"])
