from django.contrib import admin

from .models import Article, ArticleBookmark, ArticleComment, ArticleLike, ExploreCategory, ExploreTag


@admin.register(ExploreCategory)
class ExploreCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ExploreTag)
class ExploreTagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "status", "is_featured", "views", "likes", "published_at")
    list_filter = ("status", "is_featured", "comments_enabled", "category")
    search_fields = ("title", "short_description", "content", "tags__name")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)


admin.site.register(ArticleLike)
admin.site.register(ArticleBookmark)
admin.site.register(ArticleComment)
