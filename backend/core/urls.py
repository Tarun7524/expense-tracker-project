"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tracker.views import index, delete_expense, export_excel, ExpenseViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register("expenses", ExpenseViewSet, basename="expenses")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Old Django template routes
    path("", index, name="index"),
    path("delete/<int:id>/", delete_expense, name="delete_expense"),
    path("export/", export_excel, name="export_excel"),

    # React API routes
    path("api/", include(router.urls)),
    path("api/export-excel/", export_excel, name="api_export_excel"),

    # JWT routes
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]