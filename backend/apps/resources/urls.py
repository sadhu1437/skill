from django.urls import path

from .views import PDFListView, PDFResourceCreateView, PDFResourceDeleteView, PDFResourceDetailView

urlpatterns = [
    path("create/", PDFResourceCreateView.as_view(), name="pdf-create"),
    path("delete/<slug:slug>/", PDFResourceDeleteView.as_view(), name="pdf-delete"),
    path("", PDFListView.as_view(), name="pdf-list"),
    path("<slug:slug>/", PDFResourceDetailView.as_view(), name="pdf-detail"),
]
