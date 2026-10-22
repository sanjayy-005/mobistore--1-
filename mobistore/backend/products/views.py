from django.db.models import Count
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import ProductFilter
from .models import Brand, Category, Product, WishlistItem
from .serializers import (BrandSerializer, CategorySerializer, ProductDetailSerializer,
                          ProductListSerializer, WishlistSerializer)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.select_related("brand", "category")
    filterset_class = ProductFilter
    search_fields = ["name", "brand__name", "processor", "category__name"]
    ordering_fields = ["price", "rating", "created_at", "name"]
    lookup_field = "slug"

    def get_serializer_class(self):
        return ProductDetailSerializer if self.action == "retrieve" else ProductListSerializer

    @staticmethod
    def _related(product):
        return Product.objects.filter(brand=product.brand).exclude(pk=product.pk)[:4]

    def retrieve(self, request, *args, **kwargs):
        product = self.get_object()
        data = ProductDetailSerializer(product, context={"request": request}).data
        data["related"] = ProductListSerializer(
            self._related(product), many=True, context={"request": request}).data
        return Response(data)


class BrandList(generics.ListAPIView):
    queryset = Brand.objects.annotate(product_count=Count("products"))
    serializer_class = BrandSerializer
    pagination_class = None


class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related(
            "product__brand", "product__category")
        return Response(WishlistSerializer(items, many=True, context={"request": request}).data)

    def post(self, request):
        try:
            product = Product.objects.get(pk=request.data.get("product"))
        except (Product.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        WishlistItem.objects.get_or_create(user=request.user, product=product)
        return Response({"product": product.pk}, status=status.HTTP_201_CREATED)


class WishlistDelete(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id):
        WishlistItem.objects.filter(user=request.user, product_id=product_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
