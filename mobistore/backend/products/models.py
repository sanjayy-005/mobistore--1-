from django.conf import settings
from django.db import models


class Brand(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(unique=True)
    description = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, max_length=170)
    brand = models.ForeignKey(Brand, related_name="products", on_delete=models.PROTECT)
    category = models.ForeignKey(Category, related_name="products", on_delete=models.PROTECT)
    description = models.TextField(blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField("MRP", max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)

    # Image: upload a file in admin, OR paste an external image URL.
    image = models.ImageField(upload_to="phones/", blank=True)
    image_link = models.URLField(max_length=500, blank=True)

    ram = models.PositiveSmallIntegerField("RAM (GB)")
    storage = models.PositiveSmallIntegerField("Storage (GB)")
    display = models.CharField(max_length=120)
    camera = models.CharField(max_length=120)
    battery = models.CharField(max_length=60)
    processor = models.CharField(max_length=80)
    os = models.CharField("Operating system", max_length=40, default="Android 15")

    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.2)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "id"]

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0


class WishlistItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="wishlist", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")
        ordering = ["-added_at"]
