from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "MobiStore Admin"
admin.site.site_title = "MobiStore"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("products.urls")),
    path("api/orders/", include("orders.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
