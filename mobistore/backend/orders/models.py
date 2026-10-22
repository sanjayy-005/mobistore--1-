from django.conf import settings
from django.db import models
from products.models import Product


class Order(models.Model):
    STATUS = [("placed", "Placed"), ("shipped", "Shipped"),
              ("delivered", "Delivered"), ("cancelled", "Cancelled")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="orders", on_delete=models.CASCADE)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=80)
    state = models.CharField(max_length=80)
    pincode = models.CharField(max_length=10)
    payment_method = models.CharField(max_length=20, default="COD")
    status = models.CharField(max_length=12, choices=STATUS, default="placed")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, null=True, on_delete=models.SET_NULL)
    product_name = models.CharField(max_length=150)
    image = models.CharField(max_length=500, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    @property
    def line_total(self):
        return self.price * self.quantity
