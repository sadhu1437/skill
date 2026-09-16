from django.db import migrations
from django.utils.text import slugify


INITIAL_CATEGORIES = (
    "AI",
    "Technology",
    "Interesting Facts",
    "News",
    "Latest Trends",
    "Future & Innovation",
    "Tools & Apps",
    "Tips & Knowledge",
)


def seed_categories(apps, schema_editor):
    Category = apps.get_model("articles", "ExploreCategory")
    for order, name in enumerate(INITIAL_CATEGORIES):
        Category.objects.get_or_create(name=name, defaults={"slug": slugify(name), "order": order})


def remove_categories(apps, schema_editor):
    Category = apps.get_model("articles", "ExploreCategory")
    Category.objects.filter(name__in=INITIAL_CATEGORIES).delete()


class Migration(migrations.Migration):
    dependencies = [("articles", "0001_initial")]
    operations = [migrations.RunPython(seed_categories, remove_categories)]
