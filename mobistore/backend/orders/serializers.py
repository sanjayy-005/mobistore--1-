from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from products.models import Product
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "image", "price", "quantity", "line_total"]


class CartLineSerializer(serializers.Serializer):
    product = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=10)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    cart = CartLineSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = ["id", "full_name", "phone", "address", "city", "state", "pincode",
                  "payment_method", "status", "subtotal", "shipping_fee", "total",
                  "created_at", "items", "cart"]
        read_only_fields = ["id", "status", "subtotal", "shipping_fee", "total", "created_at"]

    def validate_cart(self, value):
        if not value:
            raise serializers.ValidationError("Your cart is empty.")
        return value

    def validate_pincode(self, value):
        if not (value.isdigit() and len(value) == 6):
            raise serializers.ValidationError("Enter a valid 6-digit PIN code.")
        return value

    def validate_payment_method(self, value):
        if value != "COD":
            raise serializers.ValidationError("Only Cash on Delivery is available right now.")
        return value

    @transaction.atomic
    def create(self, validated):
        cart = validated.pop("cart")
        ids = [line["product"] for line in cart]
        products = {p.id: p for p in Product.objects.select_for_update().filter(id__in=ids)}

        subtotal = Decimal("0")
        lines = []
        for line in cart:
            product = products.get(line["product"])
            if not product:
                raise serializers.ValidationError({"cart": "A product in your cart no longer exists."})
            if product.stock < line["quantity"]:
                raise serializers.ValidationError(
                    {"cart": f"Only {product.stock} unit(s) of {product.name} left in stock."})
            subtotal += product.price * line["quantity"]
            lines.append((product, line["quantity"]))

        order = Order.objects.create(
            user=self.context["request"].user, subtotal=subtotal,
            shipping_fee=Decimal("0"), total=subtotal, **validated)
        request = self.context["request"]
        for product, qty in lines:
            image = product.image_link
            if product.image:
                image = request.build_absolute_uri(product.image.url)
            OrderItem.objects.create(order=order, product=product, product_name=product.name,
                                     image=image, price=product.price, quantity=qty)
            product.stock -= qty
            product.save(update_fields=["stock"])
        return order
