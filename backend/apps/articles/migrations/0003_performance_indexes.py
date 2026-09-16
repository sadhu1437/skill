from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("articles", "0002_seed_explore_categories"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="article",
            index=models.Index(
                fields=["status", "published_at", "created_at"],
                name="article_public_order_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="article",
            index=models.Index(
                fields=["status", "views", "likes", "published_at"],
                name="article_trending_idx",
            ),
        ),
    ]
