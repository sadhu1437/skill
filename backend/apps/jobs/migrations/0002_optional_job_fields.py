from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="job",
            name="location",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name="job",
            name="title",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
