from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("resources", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="pdfresource",
            name="content",
            field=models.TextField(blank=True),
        ),
    ]