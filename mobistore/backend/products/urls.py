from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("products", views.ProductViewSet, basename="product")

urlpatterns = router.urls + [
    path("brands/", views.BrandList.as_view()),
    path("categories/", views.CategoryList.as_view()),
    path("wishlist/", views.WishlistView.as_view()),
    path("wishlist/<int:product_id>/", views.WishlistDelete.as_view()),
]
