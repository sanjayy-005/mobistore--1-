from rest_framework import serializers
from .models import Brand, Category, Product, WishlistItem


class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "product_count"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]


class ProductListSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source="brand.name")
    brand_slug = serializers.CharField(source="brand.slug")
    category = serializers.CharField(source="category.name")
    image = serializers.SerializerMethodField()
    discount_percent = serializers.SerializerMethodField()
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "brand", "brand_slug", "category", "price", "mrp",
                  "discount_percent", "image", "rating", "stock", "in_stock", "ram", "storage"]

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return obj.image_link or ""

    def get_discount_percent(self, obj):
        if obj.mrp and obj.mrp > obj.price:
            return int(round((obj.mrp - obj.price) / obj.mrp * 100))
        return 0


class ProductDetailSerializer(ProductListSerializer):
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + [
            "description", "display", "camera", "battery", "processor", "os"]


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "added_at"]
