from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0002_optional_job_fields"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="job",
            index=models.Index(
                fields=["is_published", "deadline", "published_at"],
                name="job_public_feed_idx",
            ),
        ),
    ]
