from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import AdSenseSettings


class AdSenseSettingsTests(APITestCase):
    endpoint = "/api/core/adsense/"
    home_placement = {
        "id": "home",
        "name": "Home",
        "surface": "home",
        "position": "page_bottom",
        "slot_id": "8098220433",
        "ad_type": "display",
    }

    def setUp(self):
        self.staff = get_user_model().objects.create_user(
            username="adsense-staff",
            email="adsense-staff@example.test",
            password="test-password",
            is_staff=True,
        )
        self.client.force_authenticate(self.staff)

    def test_public_get_returns_all_placements_and_legacy_explore_alias(self):
        self.client.force_authenticate(None)
        response = self.client.get(self.endpoint)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["enabled"])
        self.assertEqual(response.data["content_slot"], "")
        self.assertEqual(response.data["placements"], [])
        self.assertIn("jobs_in_article_slot", response.data)
        self.assertIn("explore_display_ad_type", response.data)
        self.assertIn("interview_in_article_slot", response.data)

    def test_patch_persists_values_and_accepts_legacy_content_slot(self):
        response = self.client.patch(
            self.endpoint,
            {
                "enabled": True,
                "publisher_id": "ca-pub-8687126461256058",
                "content_slot": "5865653813",
                "explore_in_article_ad_type": "in_article",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["explore_in_article_slot"], "5865653813")
        self.assertEqual(response.data["content_slot"], "5865653813")
        self.assertEqual(response.data["explore_in_article_ad_type"], "in_article")
        self.assertEqual(AdSenseSettings.objects.count(), 1)
        self.assertEqual(
            AdSenseSettings.objects.get().placements[0]["surface"],
            "explore_article",
        )

    def test_patch_updates_only_submitted_fields(self):
        AdSenseSettings.objects.create(
            enabled=True,
            publisher_id="ca-pub-8687126461256058",
            placements=[
                self.home_placement,
                {
                    "id": "explore-article",
                    "name": "Explore article",
                    "surface": "explore_article",
                    "position": "in_article",
                    "slot_id": "5865653813",
                    "ad_type": "in_article",
                },
            ],
        )

        response = self.client.patch(
            self.endpoint,
            {"explore_display_slot": "8098220433"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        settings = AdSenseSettings.objects.get()
        self.assertEqual(len(settings.placements), 3)
        self.assertTrue(settings.enabled)
        self.assertEqual(settings.publisher_id, "ca-pub-8687126461256058")
        self.assertEqual(settings.placements[0]["slot_id"], "8098220433")
        self.assertEqual(settings.placements[1]["slot_id"], "5865653813")
        self.assertEqual(settings.placements[2]["slot_id"], "8098220433")

    def test_patch_merges_dynamic_placements_and_removes_only_explicit_ids(self):
        AdSenseSettings.objects.create(
            enabled=True,
            publisher_id="ca-pub-8687126461256058",
            placements=[
                self.home_placement,
                {
                    "id": "explore-article",
                    "name": "Explore article",
                    "surface": "explore_article",
                    "position": "in_article",
                    "slot_id": "5865653813",
                    "ad_type": "in_article",
                },
            ],
        )
        new_placement = {
            "id": "jobs-listing-extra",
            "name": "Jobs listing extra",
            "surface": "jobs_listing",
            "position": "page_top",
            "slot_id": "8098220433",
            "ad_type": "display",
        }

        response = self.client.patch(self.endpoint, {"placements": [new_placement]}, format="json")
        self.assertEqual(response.status_code, 200)
        settings = AdSenseSettings.objects.get()
        self.assertEqual(len(settings.placements), 3)
        self.assertEqual({placement["id"] for placement in settings.placements}, {
            "home",
            "explore-article",
            "jobs-listing-extra",
        })

        response = self.client.patch(
            self.endpoint,
            {"placements": [], "remove_placement_ids": ["explore-article"]},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        settings.refresh_from_db()
        self.assertEqual({placement["id"] for placement in settings.placements}, {
            "home",
            "jobs-listing-extra",
        })

    def test_patch_rejects_invalid_publisher_slot_and_type(self):
        invalid_payloads = (
            {"publisher_id": "ca-pub-not-a-number"},
            {"placements": [{**self.home_placement, "slot_id": "abc123"}]},
            {"placements": [{**self.home_placement, "ad_type": "responsive"}]},
            {"placements": [{**self.home_placement, "surface": "/admin-panel"}]},
            {"placements": [{**self.home_placement, "surface": "home", "position": "in_article"}]},
            {"placements": [], "remove_placement_ids": ["bad id"]},
        )

        for payload in invalid_payloads:
            with self.subTest(payload=payload):
                response = self.client.patch(self.endpoint, payload, format="json")
                self.assertEqual(response.status_code, 400)
        self.assertFalse(AdSenseSettings.objects.exists())

    def test_patch_rejects_duplicate_ids_and_duplicate_page_positions(self):
        response = self.client.patch(
            self.endpoint,
            {
                "placements": [
                    self.home_placement,
                    {
                        **self.home_placement,
                        "id": "home-two",
                        "name": "Second home placement",
                    },
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(AdSenseSettings.objects.exists())

    def test_patch_rejects_arbitrary_markup_fields(self):
        response = self.client.patch(
            self.endpoint,
            {
                "placements": [{
                    **self.home_placement,
                    "script": "<script>alert(1)</script>",
                }],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(AdSenseSettings.objects.exists())

    def test_patch_accepts_new_valid_supported_placement(self):
        placement = {
            "id": "job-side",
            "name": "Jobs sidebar",
            "surface": "jobs_listing",
            "position": "page_bottom",
            "slot_id": "8098220433",
            "ad_type": "display",
        }

        response = self.client.patch(
            self.endpoint,
            {
                "enabled": True,
                "publisher_id": "ca-pub-8687126461256058",
                "placements": [placement],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["placements"], [placement])

    def test_patch_requires_publisher_and_slot_when_enabling(self):
        response = self.client.patch(
            self.endpoint,
            {"enabled": True},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(AdSenseSettings.objects.exists())

    def test_non_staff_cannot_patch_but_can_read_public_configuration(self):
        self.client.force_authenticate(get_user_model().objects.create_user(
            username="regular-user",
            email="regular-user@example.test",
            password="test-password",
        ))

        self.assertEqual(self.client.get(self.endpoint).status_code, 200)
        self.assertEqual(
            self.client.patch(self.endpoint, {"home_slot": "8098220433"}, format="json").status_code,
            403,
        )
