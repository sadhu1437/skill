from django.db import migrations, models
import django.db.models.deletion


def migrate_legacy_questions(apps, schema_editor):
    Topic = apps.get_model("interview", "InterviewTopic")
    Question = apps.get_model("interview", "InterviewQuestion")
    existing_topics = [
        ("Java", "java"), ("Python", "python"), ("SQL", "sql"), ("HTML", "html"),
        ("CSS", "css"), ("JavaScript", "javascript"), ("Data Structures", "data-structures"),
        ("React JS", "react-js"), ("C#", "csharp"), ("C", "c"), ("C++", "cpp"),
    ]
    for order, (name, slug) in enumerate(existing_topics):
        Topic.objects.get_or_create(
            slug=slug,
            defaults={"name": name, "description": f"{name} interview questions and answers.", "display_order": order, "is_published": True},
        )
    for question in Question.objects.all().iterator():
        name = (question.legacy_topic or "General").strip() or "General"
        topic, _ = Topic.objects.get_or_create(
            name=name,
            defaults={
                "slug": name.lower().replace(" ", "-"),
                "description": f"{name} interview questions and answers.",
                "is_published": question.is_published,
            },
        )
        if question.is_published and not topic.is_published:
            topic.is_published = True
            topic.save(update_fields=["is_published"])
        question.topic_id = topic.id
        question.title = question.question[:255]
        question.slug = f"legacy-{question.id}"
        question.difficulty = {"Easy": "easy", "Hard": "hard"}.get(question.difficulty, "medium")
        question.save(update_fields=["topic", "title", "slug", "difficulty"])


class Migration(migrations.Migration):
    dependencies = [("interview", "0001_initial")]

    operations = [
        migrations.RenameField(model_name="interviewquestion", old_name="topic", new_name="legacy_topic"),
        migrations.AddField(model_name="interviewquestion", name="title", field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name="interviewquestion", name="slug", field=models.SlugField(blank=True, max_length=280, null=True, unique=True)),
        migrations.AddField(model_name="interviewquestion", name="explanation", field=models.TextField(blank=True)),
        migrations.AddField(model_name="interviewquestion", name="example", field=models.TextField(blank=True)),
        migrations.AddField(model_name="interviewquestion", name="key_points", field=models.TextField(blank=True)),
        migrations.AddField(model_name="interviewquestion", name="problem_statement", field=models.TextField(blank=True)),
        migrations.AddField(model_name="interviewquestion", name="input_format", field=models.TextField(blank=True)),
        migrations.AddField(model_name="interviewquestion", name="output_format", field=models.TextField(blank=True)),
        migrations.AddField(model_name="interviewquestion", name="constraints", field=models.TextField(blank=True)),
        migrations.AddField(model_name="interviewquestion", name="tags", field=models.CharField(blank=True, max_length=500)),
        migrations.AddField(model_name="interviewquestion", name="question_type", field=models.CharField(choices=[("conceptual", "Conceptual"), ("coding", "Coding"), ("mcq", "Multiple Choice"), ("scenario", "Scenario Based"), ("sql", "SQL Query"), ("output", "Output Based"), ("behavioral", "Behavioral"), ("technical", "Technical")], default="conceptual", max_length=30)),
        migrations.AddField(model_name="interviewquestion", name="display_order", field=models.PositiveIntegerField(default=0)),
        migrations.AddField(model_name="interviewquestion", name="seo_title", field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name="interviewquestion", name="seo_description", field=models.CharField(blank=True, max_length=320)),
        migrations.AddField(model_name="interviewquestion", name="updated_at", field=models.DateTimeField(auto_now=True)),
        migrations.AlterField(model_name="interviewquestion", name="difficulty", field=models.CharField(choices=[("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")], default="medium", max_length=20)),
        migrations.AlterModelOptions(name="interviewquestion", options={"ordering": ["display_order", "-created_at"]}),
        migrations.CreateModel(
            name="InterviewTopic",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120, unique=True)),
                ("slug", models.SlugField(max_length=140, unique=True)),
                ("description", models.TextField(blank=True)),
                ("icon", models.CharField(blank=True, default="code", max_length=80)),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("is_published", models.BooleanField(default=False)),
                ("seo_title", models.CharField(blank=True, max_length=255)),
                ("seo_description", models.CharField(blank=True, max_length=320)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["display_order", "name"], "indexes": [models.Index(fields=["is_published", "display_order"], name="interview_topic_pub_order_idx")]},
        ),
        migrations.AddField(model_name="interviewquestion", name="topic", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="questions", to="interview.interviewtopic")),
        migrations.CreateModel(
            name="InterviewCodeExample",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("language", models.CharField(choices=[("python", "Python"), ("java", "Java"), ("javascript", "Javascript"), ("c", "C"), ("cpp", "Cpp"), ("csharp", "Csharp"), ("sql", "Sql")], default="python", max_length=30)),
                ("code", models.TextField()),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="code_examples", to="interview.interviewquestion")),
            ],
            options={"ordering": ["display_order", "id"]},
        ),
        migrations.RunPython(migrate_legacy_questions, migrations.RunPython.noop),
        migrations.AddIndex(model_name="interviewquestion", index=models.Index(fields=["topic", "is_published", "display_order"], name="interview_topic_pub_idx")),
        migrations.AddIndex(model_name="interviewquestion", index=models.Index(fields=["question_type", "difficulty"], name="interview_type_diff_idx")),
    ]
