from django.db.models import Q
from rest_framework import generics, permissions

from .models import AITechPost
from .serializers import AITechPostSerializer


class AITechListView(generics.ListAPIView):
    serializer_class = AITechPostSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        queryset = AITechPost.objects.filter(is_published=True)
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(content__icontains=search) | Q(tags__icontains=search))
        post_type = self.request.query_params.get("post_type")
        if post_type:
            queryset = queryset.filter(post_type=post_type)
        return queryset.order_by("-published_at", "-created_at")


class AITechDetailView(generics.RetrieveAPIView):
    queryset = AITechPost.objects.filter(is_published=True)
    serializer_class = AITechPostSerializer
    lookup_field = "slug"
    permission_classes = (permissions.AllowAny,)
