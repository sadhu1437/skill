from django.urls import path

from .views import (
	ArticleActionView,
	ArticleAnalyticsView,
	ArticleCommentListCreateView,
	ArticleCommentDetailView,
	ArticleDetailView,
	ArticleListView,
	ArticleManageDetailView,
	ArticleManageListCreateView,
	CategoryDetailView,
	CategoryListCreateView,
	FeaturedArticleListView,
	LatestArticleListView,
	TagListView,
	TrendingArticleListView,
)

urlpatterns = [
	path("categories/", CategoryListCreateView.as_view(), name="explore-categories"),
	path("categories/<slug:slug>/", CategoryDetailView.as_view(), name="explore-category-detail"),
	path("tags/", TagListView.as_view(), name="explore-tags"),
	path("featured/", FeaturedArticleListView.as_view(), name="explore-featured"),
	path("trending/", TrendingArticleListView.as_view(), name="explore-trending"),
	path("latest/", LatestArticleListView.as_view(), name="explore-latest"),
	path("manage/analytics/", ArticleAnalyticsView.as_view(), name="explore-analytics"),
	path("manage/", ArticleManageListCreateView.as_view(), name="explore-manage-list"),
	path("manage/<slug:slug>/", ArticleManageDetailView.as_view(), name="explore-manage-detail"),
	path("<slug:slug>/action/<str:action>/", ArticleActionView.as_view(), name="explore-action"),
	path("<slug:slug>/comments/", ArticleCommentListCreateView.as_view(), name="explore-comments"),
	path("<slug:slug>/comments/<int:comment_id>/", ArticleCommentDetailView.as_view(), name="explore-comment-detail"),
	path("<slug:slug>/", ArticleDetailView.as_view(), name="explore-detail"),
	path("", ArticleListView.as_view(), name="explore-list"),
]
