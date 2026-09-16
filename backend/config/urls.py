from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from apps.core.views import ApiRootView, HealthCheckView

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("admin/", admin.site.urls),
    path("api/", ApiRootView.as_view(), name="api-root"),
    path("api/auth/", include("apps.users.urls")),
    path("api/jobs/", include("apps.jobs.urls")),
    path("api/resources/", include("apps.resources.urls")),
    path("api/ai-tech/", include("apps.ai_tech.urls")),
    path("api/courses/", include("apps.courses.urls")),
    path("api/interview/", include("apps.interview.urls")),
    path("api/coding/", include("apps.coding.urls")),
    path("api/roadmaps/", include("apps.roadmaps.urls")),
    path("api/hiring/", include("apps.hiring.urls")),
    path("api/explore/", include("apps.articles.urls")),
    path("api/core/", include("apps.core.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
