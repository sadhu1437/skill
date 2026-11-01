from django.db import migrations, models


AD_TYPE_CHOICES = (
    ("display", "Display"),
    ("in_article", "In-article"),
)


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0002_adsense_interview_slot"),
    ]

    operations = [
        migrations.RenameField(
            model_name="adsensesettings",
            old_name="content_slot",
            new_name="explore_in_article_slot",
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="jobs_in_article_slot",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="explore_display_slot",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="interview_in_article_slot",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="home_ad_type",
            field=models.CharField(choices=AD_TYPE_CHOICES, default="display", max_length=20),
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="job_ad_type",
            field=models.CharField(choices=AD_TYPE_CHOICES, default="display", max_length=20),
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="jobs_in_article_ad_type",
            field=models.CharField(choices=AD_TYPE_CHOICES, default="in_article", max_length=20),
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="explore_display_ad_type",
            field=models.CharField(choices=AD_TYPE_CHOICES, default="display", max_length=20),
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="explore_in_article_ad_type",
            field=models.CharField(choices=AD_TYPE_CHOICES, default="in_article", max_length=20),
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="interview_ad_type",
            field=models.CharField(choices=AD_TYPE_CHOICES, default="display", max_length=20),
        ),
        migrations.AddField(
            model_name="adsensesettings",
            name="interview_in_article_ad_type",
            field=models.CharField(choices=AD_TYPE_CHOICES, default="in_article", max_length=20),
        ),
    ]
