from django.db.models import Exists, F, OuterRef, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAuthorOrAdmin
from apps.core.throttles import ArticleActionThrottle, ArticleWriteThrottle, CommentThrottle, PublicReadThrottle
from .models import Article, ArticleBookmark, ArticleComment, ArticleLike, ExploreCategory, ExploreTag
from .serializers import ArticleSerializer, CategorySerializer, CommentSerializer, TagSerializer


def public_articles(user=None):
    now = timezone.now()
    queryset = Article.objects.filter(status="published").filter(Q(scheduled_at__isnull=True) | Q(scheduled_at__lte=now)).select_related("category", "author").prefetch_related("tags")
    if user and user.is_authenticated:
        queryset = queryset.annotate(
            _is_liked=Exists(ArticleLike.objects.filter(article=OuterRef("pk"), user=user)),
            _is_bookmarked=Exists(ArticleBookmark.objects.filter(article=OuterRef("pk"), user=user)),
        )
    return queryset


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = ExploreCategory.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)

    def get_permissions(self):
        return (permissions.IsAdminUser(),) if self.request.method == "POST" else (permissions.AllowAny(),)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ExploreCategory.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"
    permission_classes = (permissions.IsAdminUser,)


class TagListView(generics.ListCreateAPIView):
    queryset = ExploreTag.objects.all().order_by("name")
    serializer_class = TagSerializer
    permission_classes = (permissions.IsAdminUser,)


class ArticleListView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)

    def get_queryset(self):
        queryset = public_articles(self.request.user)
        search = (self.request.query_params.get("search") or self.request.query_params.get("q") or "").strip()[:200]
        category = self.request.query_params.get("category", "").strip()[:120]
        tag = self.request.query_params.get("tag", "").strip()[:100]
        ordering = self.request.query_params.get("ordering", "latest")
        if ordering not in {"latest", "trending"}:
            ordering = "latest"
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(short_description__icontains=search) | Q(content__icontains=search))
        if category:
            queryset = queryset.filter(category__slug=category)
        if tag:
            queryset = queryset.filter(tags__slug=tag)
        if ordering == "trending":
            return queryset.order_by("-views", "-likes", "-published_at")
        return queryset.order_by("-published_at", "-created_at")


class FeaturedArticleListView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return public_articles(self.request.user).filter(is_featured=True).order_by("-published_at", "-created_at")[:6]


class TrendingArticleListView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return public_articles(self.request.user).order_by("-views", "-likes", "-published_at")[:12]


class LatestArticleListView(generics.ListAPIView):
    serializer_class = ArticleSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return public_articles(self.request.user).order_by("-published_at", "-created_at")[:12]


class ArticleDetailView(generics.RetrieveAPIView):
    serializer_class = ArticleSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "slug"

    def get_queryset(self):
        return public_articles(self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Article.objects.filter(pk=instance.pk).update(views=F("views") + 1)
        instance.refresh_from_db()
        return Response(self.get_serializer(instance).data)


class ArticleManageListCreateView(generics.ListCreateAPIView):
    queryset = Article.objects.all().select_related("category", "author").prefetch_related("tags")
    serializer_class = ArticleSerializer
    permission_classes = (permissions.IsAdminUser,)
    throttle_classes = (ArticleWriteThrottle,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        return super().get_queryset().order_by("-updated_at")


class ArticleManageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all().select_related("category", "author").prefetch_related("tags")
    serializer_class = ArticleSerializer
    permission_classes = (IsAuthorOrAdmin,)
    throttle_classes = (ArticleWriteThrottle,)
    lookup_field = "slug"
    parser_classes = (MultiPartParser, FormParser, JSONParser)


class ArticleActionView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (ArticleActionThrottle,)

    def post(self, request, slug, action):
        article = get_object_or_404(public_articles(request.user), slug=slug)
        if action == "share":
            Article.objects.filter(pk=article.pk).update(shares=F("shares") + 1)
            article.refresh_from_db()
            return Response({"shares": article.shares})
        if not request.user.is_authenticated:
            return Response({"detail": "Sign in required for this action."}, status=status.HTTP_401_UNAUTHORIZED)
        if action == "like":
            record, created = ArticleLike.objects.get_or_create(article=article, user=request.user)
            if not created:
                record.delete()
            Article.objects.filter(pk=article.pk).update(likes=F("likes") + (1 if created else -1))
            article.refresh_from_db()
            return Response({"liked": created, "likes": article.likes})
        if action == "bookmark":
            record, created = ArticleBookmark.objects.get_or_create(article=article, user=request.user)
            if not created:
                record.delete()
            return Response({"bookmarked": created})
        return Response({"detail": "Unknown action."}, status=status.HTTP_400_BAD_REQUEST)


class ArticleCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (CommentThrottle,)

    def get_queryset(self):
        return ArticleComment.objects.filter(article__slug=self.kwargs["slug"], article__comments_enabled=True, is_approved=True).select_related("user")

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            from rest_framework.exceptions import NotAuthenticated
            raise NotAuthenticated("Sign in required to comment.")
        article = get_object_or_404(public_articles(self.request.user), slug=self.kwargs["slug"])
        if not article.comments_enabled:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Comments are disabled for this article.")
        serializer.save(user=self.request.user, article=article)


class ArticleCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticated,)
    throttle_classes = (CommentThrottle,)
    http_method_names = ("get", "patch", "delete", "head", "options")

    def get_queryset(self):
        return ArticleComment.objects.filter(
            article__slug=self.kwargs["slug"],
            article__comments_enabled=True,
            is_approved=True,
        ).select_related("user")

    def get_object(self):
        comment = get_object_or_404(self.get_queryset(), pk=self.kwargs["comment_id"])
        if comment.user_id != self.request.user.id and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only manage your own comments.")
        return comment

    def perform_update(self, serializer):
        serializer.save(is_edited=True)


class ArticleAnalyticsView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        all_articles = Article.objects.all()
        return Response({
            "total_articles": all_articles.count(),
            "published_articles": all_articles.filter(status="published").count(),
            "drafts": all_articles.filter(status="draft").count(),
            "scheduled": all_articles.filter(status="scheduled").count(),
            "total_views": sum(all_articles.values_list("views", flat=True)),
            "total_likes": sum(all_articles.values_list("likes", flat=True)),
            "most_viewed": ArticleSerializer(all_articles.order_by("-views")[:5], many=True, context={"request": request}).data,
            "most_liked": ArticleSerializer(all_articles.order_by("-likes")[:5], many=True, context={"request": request}).data,
            "recent": ArticleSerializer(all_articles.order_by("-published_at", "-created_at")[:5], many=True, context={"request": request}).data,
        })
