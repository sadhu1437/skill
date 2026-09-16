from django.db import migrations


def seed_go_topic(apps, schema_editor):
    InterviewTopic = apps.get_model("interview", "InterviewTopic")
    InterviewTopic.objects.get_or_create(
        slug="go",
        defaults={
            "name": "Go",
            "description": "Go language interview questions and answers.",
            "icon": "code",
            "display_order": 12,
            "is_published": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [("interview", "0003_alter_interviewcodeexample_language")]
    operations = [migrations.RunPython(seed_go_topic, migrations.RunPython.noop)]
