from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("articles", "0003_performance_indexes"),
    ]

    operations = [
        migrations.AddField(
            model_name="articlecomment",
            name="is_edited",
            field=models.BooleanField(default=False),
        ),
    ]
