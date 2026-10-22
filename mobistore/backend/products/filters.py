import django_filters as df
from .models import Product


class ProductFilter(df.FilterSet):
    brand = df.CharFilter(field_name="brand__slug")
    category = df.CharFilter(field_name="category__slug")
    min_price = df.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = df.NumberFilter(field_name="price", lookup_expr="lte")
    ram = df.NumberFilter(field_name="ram")
    in_stock = df.BooleanFilter(method="filter_in_stock")

    class Meta:
        model = Product
        fields = ["brand", "category", "min_price", "max_price", "ram", "is_featured", "in_stock"]

    def filter_in_stock(self, qs, name, value):
        return qs.filter(stock__gt=0) if value else qs
