# backend/analysis/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("analyze/", views.analyze_view, name="analyze"),
    path("upload/", views.upload_view, name="upload"),
    path("schema/", views.schema_view, name="schema"),
    path("download/", views.download_view, name="download"),
]
