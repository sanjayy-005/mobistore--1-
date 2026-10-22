from django.contrib import admin
from .models import Brand, Category, Product, WishlistItem


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "brand", "category", "price", "stock", "is_featured")
    list_filter = ("brand", "category", "is_featured")
    list_editable = ("price", "stock", "is_featured")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


admin.site.register(WishlistItem)
