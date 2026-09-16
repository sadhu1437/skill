from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from apps.core.throttles import PublicReadThrottle
from .models import PDFResource
from .serializers import PDFResourceSerializer


class PDFListView(generics.ListAPIView):
    serializer_class = PDFResourceSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)

    def get_queryset(self):
        queryset = PDFResource.objects.filter(is_published=True)
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(tags__icontains=search))
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
        return queryset.order_by("-published_at", "-created_at")


class PDFResourceDetailView(generics.RetrieveAPIView):
    queryset = PDFResource.objects.filter(is_published=True)
    serializer_class = PDFResourceSerializer
    lookup_field = "slug"
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (PublicReadThrottle,)


class PDFResourceCreateView(generics.CreateAPIView):
    queryset = PDFResource.objects.all()
    serializer_class = PDFResourceSerializer
    permission_classes = (permissions.IsAdminUser,)
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        resource = serializer.save()
        if resource.is_published and not resource.published_at:
            resource.published_at = timezone.now()
            resource.save(update_fields=("published_at",))


class PDFResourceDeleteView(generics.DestroyAPIView):
    queryset = PDFResource.objects.all()
    serializer_class = PDFResourceSerializer
    permission_classes = (permissions.IsAdminUser,)
    lookup_field = "slug"

    def get_object(self):
        slug = self.kwargs.get("slug")
        return get_object_or_404(PDFResource, slug=slug)

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
