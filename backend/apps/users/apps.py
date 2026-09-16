from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.users"

    def ready(self):
        from django.contrib.auth import get_user_model

        try:
            User = get_user_model()
            user = User.objects.filter(email="admin@skillbloom.com").first()

            if user is None:
                user = User.objects.create_user(
                    username="admin",
                    email="admin@skillbloom.com",
                    password="SkillBloom@123",
                    is_staff=True,
                    is_superuser=True,
                )
            else:
                user.username = user.username or "admin"
                user.is_staff = True
                user.is_superuser = True
                user.save(update_fields=["username", "is_staff", "is_superuser"])

            if not user.check_password("SkillBloom@123"):
                user.set_password("SkillBloom@123")
                user.save(update_fields=["password"])
        except Exception:
            # App startup should not crash in a fresh environment before migrations finish.
            pass
