from django.db import migrations, models


PLACEMENT_FIELDS = (
    ("home_slot", "home_ad_type", "home", "Home", "home", "page_bottom"),
    ("job_slot", "job_ad_type", "jobs-listing", "Jobs listing", "jobs_listing", "page_top"),
    ("jobs_in_article_slot", "jobs_in_article_ad_type", "jobs-article", "Jobs article", "job_article", "in_article"),
    ("explore_display_slot", "explore_display_ad_type", "explore-listing", "Explore listing", "explore_listing", "page_bottom"),
    ("explore_in_article_slot", "explore_in_article_ad_type", "explore-article", "Explore article", "explore_article", "in_article"),
    ("interview_slot", "interview_ad_type", "interview-index", "Interview index", "interview_index", "page_bottom"),
    ("interview_in_article_slot", "interview_in_article_ad_type", "interview-question", "Interview answer", "interview_question", "in_article"),
)


def migrate_existing_placements(apps, schema_editor):
    settings_model = apps.get_model("core", "AdSenseSettings")
    for settings in settings_model.objects.all():
        placements = []
        for slot_field, type_field, placement_id, name, surface, position in PLACEMENT_FIELDS:
            slot_id = getattr(settings, slot_field, "")
            if not slot_id:
                continue
            placements.append({
                "id": placement_id,
                "name": name,
                "surface": surface,
                "position": position,
                "slot_id": slot_id,
                "ad_type": getattr(settings, type_field, "display"),
            })
        settings.placements = placements
        settings.save(update_fields=["placements"])


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0003_adsense_placement_settings"),
    ]

    operations = [
        migrations.AddField(
            model_name="adsensesettings",
            name="placements",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(migrate_existing_placements, migrations.RunPython.noop),
    ]
