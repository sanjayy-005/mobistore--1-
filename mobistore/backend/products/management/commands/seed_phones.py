"""Load brands, categories and 56 sample phones.  Run:  python manage.py seed_phones

Specs and prices are approximate sample data (INR) - edit them in the admin panel.
"""
import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from products.models import Brand, Category, Product

CATEGORIES = {
    "Flagship": "Top-tier cameras, chips and displays",
    "Premium": "Near-flagship power for less",
    "Mid-range": "The sweet spot of price and performance",
    "Budget": "Everyday phones under Rs. 15,000",
    "Foldable": "Flip and fold designs",
}

# Brand|Name|Category|Price|RAM|Storage|Display|Camera|Battery|Processor
DATA = """
Apple|iPhone 16 Pro Max|Flagship|144900|8|256|6.9" Super Retina XDR OLED, 120Hz|48MP + 48MP + 12MP triple|4685 mAh|Apple A18 Pro
Apple|iPhone 16 Pro|Flagship|119900|8|128|6.3" Super Retina XDR OLED, 120Hz|48MP + 48MP + 12MP triple|3582 mAh|Apple A18 Pro
Apple|iPhone 16 Plus|Premium|89900|8|128|6.7" Super Retina XDR OLED|48MP + 12MP dual|4674 mAh|Apple A18
Apple|iPhone 16|Premium|79900|8|128|6.1" Super Retina XDR OLED|48MP + 12MP dual|3561 mAh|Apple A18
Apple|iPhone 16e|Mid-range|59900|8|128|6.1" Super Retina XDR OLED|48MP single|4005 mAh|Apple A18
Apple|iPhone 15|Premium|69900|6|128|6.1" Super Retina XDR OLED|48MP + 12MP dual|3349 mAh|Apple A16 Bionic
Apple|iPhone 15 Plus|Premium|79900|6|128|6.7" Super Retina XDR OLED|48MP + 12MP dual|4383 mAh|Apple A16 Bionic
Apple|iPhone 14|Mid-range|59900|6|128|6.1" Super Retina XDR OLED|12MP + 12MP dual|3279 mAh|Apple A15 Bionic
Samsung|Galaxy S25 Ultra|Flagship|129999|12|256|6.9" Dynamic AMOLED 2X, 120Hz|200MP + 50MP + 10MP + 50MP quad|5000 mAh|Snapdragon 8 Elite
Samsung|Galaxy S25+|Flagship|99999|12|256|6.7" Dynamic AMOLED 2X, 120Hz|50MP + 12MP + 10MP triple|4900 mAh|Snapdragon 8 Elite
Samsung|Galaxy S25|Premium|80999|12|128|6.2" Dynamic AMOLED 2X, 120Hz|50MP + 12MP + 10MP triple|4000 mAh|Snapdragon 8 Elite
Samsung|Galaxy S24 FE|Premium|54999|8|128|6.7" Dynamic AMOLED 2X, 120Hz|50MP + 12MP + 8MP triple|4700 mAh|Exynos 2400e
Samsung|Galaxy Z Fold6|Foldable|164999|12|256|7.6" Dynamic AMOLED 2X foldable|50MP + 12MP + 10MP triple|4400 mAh|Snapdragon 8 Gen 3
Samsung|Galaxy Z Flip6|Foldable|109999|12|256|6.7" Dynamic AMOLED 2X foldable|50MP + 12MP dual|4000 mAh|Snapdragon 8 Gen 3
Samsung|Galaxy A56 5G|Mid-range|41999|8|128|6.7" Super AMOLED, 120Hz|50MP + 12MP + 5MP triple|5000 mAh|Exynos 1580
Samsung|Galaxy M35 5G|Budget|19999|6|128|6.6" Super AMOLED, 120Hz|50MP + 8MP + 2MP triple|6000 mAh|Exynos 1380
OnePlus|OnePlus 13|Flagship|69999|12|256|6.82" LTPO AMOLED, 120Hz|50MP + 50MP + 50MP triple|6000 mAh|Snapdragon 8 Elite
OnePlus|OnePlus 13R|Premium|42999|12|256|6.78" LTPO AMOLED, 120Hz|50MP + 50MP + 8MP triple|6000 mAh|Snapdragon 8 Gen 3
OnePlus|OnePlus 12|Flagship|64999|12|256|6.82" LTPO AMOLED, 120Hz|50MP + 48MP + 64MP triple|5400 mAh|Snapdragon 8 Gen 3
OnePlus|OnePlus 12R|Premium|39999|8|128|6.78" LTPO AMOLED, 120Hz|50MP + 8MP + 2MP triple|5500 mAh|Snapdragon 8 Gen 2
OnePlus|OnePlus Nord 4|Mid-range|29999|8|128|6.74" AMOLED, 120Hz|50MP + 8MP dual|5500 mAh|Snapdragon 7+ Gen 3
OnePlus|OnePlus Nord CE4|Mid-range|24999|8|128|6.7" AMOLED, 120Hz|50MP + 8MP dual|5500 mAh|Snapdragon 7 Gen 3
OnePlus|OnePlus Nord CE4 Lite|Budget|19999|8|128|6.67" AMOLED, 120Hz|50MP + 2MP dual|5500 mAh|Snapdragon 695
OnePlus|OnePlus Nord CE3|Mid-range|22999|8|128|6.7" AMOLED, 120Hz|50MP + 8MP + 2MP triple|5000 mAh|Snapdragon 782G
Xiaomi|Xiaomi 15|Flagship|64999|12|256|6.36" LTPO AMOLED, 120Hz|50MP + 50MP + 50MP Leica triple|5240 mAh|Snapdragon 8 Elite
Xiaomi|Xiaomi 14T Pro|Premium|49999|12|256|6.67" AMOLED, 144Hz|50MP + 50MP + 12MP Leica triple|5000 mAh|Dimensity 9300+
Xiaomi|Redmi Note 14 Pro+ 5G|Mid-range|29999|8|256|6.67" AMOLED, 120Hz|200MP + 8MP + 2MP triple|5110 mAh|Snapdragon 7s Gen 3
Xiaomi|Redmi Note 14 Pro 5G|Mid-range|23999|8|128|6.67" AMOLED, 120Hz|50MP + 8MP + 2MP triple|5110 mAh|Dimensity 7300 Ultra
Xiaomi|Redmi Note 14 5G|Budget|17999|6|128|6.67" AMOLED, 120Hz|50MP + 2MP dual|5110 mAh|Dimensity 6080
Xiaomi|Redmi 13 5G|Budget|13999|6|128|6.79" IPS LCD, 120Hz|108MP + 2MP dual|5030 mAh|Snapdragon 4 Gen 2 AE
Xiaomi|POCO X7 Pro 5G|Mid-range|27999|8|256|6.67" AMOLED, 120Hz|50MP + 8MP dual|6550 mAh|Dimensity 8400 Ultra
Xiaomi|POCO F6|Premium|29999|8|256|6.67" AMOLED, 120Hz|50MP + 8MP dual|5000 mAh|Snapdragon 8s Gen 3
Vivo|Vivo X200 Pro|Flagship|94999|16|512|6.78" LTPO AMOLED, 120Hz|50MP + 200MP + 50MP Zeiss triple|6000 mAh|Dimensity 9400
Vivo|Vivo X200|Flagship|65999|12|256|6.67" LTPO AMOLED, 120Hz|50MP + 50MP + 50MP Zeiss triple|5800 mAh|Dimensity 9400
Vivo|Vivo V40 Pro|Premium|49999|12|256|6.78" AMOLED, 120Hz|50MP + 50MP + 50MP Zeiss triple|5500 mAh|Dimensity 9200+
Vivo|Vivo V40|Mid-range|34999|8|128|6.78" AMOLED, 120Hz|50MP + 50MP dual|5500 mAh|Snapdragon 7 Gen 3
Vivo|Vivo T3 Ultra|Mid-range|31999|8|128|6.78" AMOLED, 120Hz|50MP + 8MP dual|5500 mAh|Dimensity 9200+
Vivo|Vivo T3x 5G|Budget|13499|6|128|6.72" IPS LCD, 120Hz|50MP + 2MP dual|6000 mAh|Snapdragon 6 Gen 1
Vivo|Vivo Y200e 5G|Budget|15999|6|128|6.67" AMOLED, 120Hz|50MP + 2MP dual|5000 mAh|Snapdragon 4 Gen 2
Vivo|Vivo Y58 5G|Budget|18999|8|128|6.72" IPS LCD, 120Hz|50MP + 2MP dual|6000 mAh|Snapdragon 4 Gen 2
Oppo|Oppo Find X8|Flagship|69999|12|256|6.59" LTPO AMOLED, 120Hz|50MP + 50MP + 50MP Hasselblad triple|5630 mAh|Dimensity 9400
Oppo|Oppo Find N3 Flip|Foldable|94999|12|256|6.8" LTPO AMOLED foldable|50MP + 48MP + 32MP triple|4300 mAh|Dimensity 9200
Oppo|Oppo Reno12 Pro 5G|Premium|36999|12|256|6.7" AMOLED, 120Hz|50MP + 50MP + 8MP triple|5000 mAh|Dimensity 7300 Energy
Oppo|Oppo Reno12 5G|Mid-range|32999|8|256|6.7" AMOLED, 120Hz|50MP + 8MP + 2MP triple|5000 mAh|Dimensity 7300 Energy
Oppo|Oppo F27 Pro+ 5G|Mid-range|27999|8|128|6.7" AMOLED, 120Hz|64MP + 2MP dual|5000 mAh|Dimensity 7050
Oppo|Oppo A3 Pro 5G|Budget|17999|8|128|6.67" AMOLED, 120Hz|50MP + 2MP dual|5000 mAh|Dimensity 6300
Oppo|Oppo K12x 5G|Budget|12999|6|128|6.67" LCD, 120Hz|50MP + 2MP dual|5500 mAh|Dimensity 6300
Oppo|Oppo A79 5G|Budget|16999|8|128|6.72" LCD, 90Hz|50MP + 2MP dual|5000 mAh|Dimensity 6020
Realme|Realme GT 7 Pro|Flagship|59999|12|256|6.78" LTPO AMOLED, 120Hz|50MP + 50MP + 8MP triple|6500 mAh|Snapdragon 8 Elite
Realme|Realme 13 Pro+ 5G|Mid-range|32999|8|256|6.7" curved AMOLED, 120Hz|50MP + 50MP + 8MP triple|5200 mAh|Snapdragon 7s Gen 2
Realme|Realme 13 Pro 5G|Mid-range|26999|8|128|6.7" curved AMOLED, 120Hz|50MP + 8MP dual|5200 mAh|Snapdragon 7s Gen 2
Realme|Realme 12 Pro+ 5G|Mid-range|29999|8|256|6.7" curved AMOLED, 120Hz|50MP + 64MP + 8MP triple|5000 mAh|Snapdragon 7s Gen 2
Realme|Realme Narzo 70 Pro 5G|Budget|19999|8|128|6.67" AMOLED, 120Hz|50MP + 8MP dual|5000 mAh|Dimensity 7050
Realme|Realme Narzo N65 5G|Budget|11499|4|128|6.67" LCD, 120Hz|50MP single|5000 mAh|Dimensity 6300
Realme|Realme C65 5G|Budget|10499|4|128|6.67" LCD, 120Hz|50MP single|5000 mAh|Dimensity 6300
Realme|Realme P2 Pro 5G|Mid-range|23999|8|128|6.7" curved AMOLED, 120Hz|50MP + 8MP dual|5200 mAh|Snapdragon 7s Gen 2
""".strip().splitlines()


class Command(BaseCommand):
    help = "Seed brands, categories and sample phones."

    def handle(self, *args, **opts):
        rng = random.Random(42)
        cats = {}
        for name, desc in CATEGORIES.items():
            cats[name], _ = Category.objects.get_or_create(
                slug=slugify(name.replace("+", " plus ")), defaults={"name": name, "description": desc})

        seen_brand = set()
        created = 0
        for line in DATA:
            brand_n, name, cat, price, ram, storage, display, camera, battery, cpu = line.split("|")
            brand, _ = Brand.objects.get_or_create(slug=slugify(brand_n), defaults={"name": brand_n})
            price = Decimal(price)
            mrp = (price * Decimal("1.12") / 100).quantize(Decimal("1")) * 100 - 1
            first_of_brand = brand_n not in seen_brand
            seen_brand.add(brand_n)
            desc = (f"The {name} pairs the {cpu} with {ram}GB RAM and {storage}GB storage. "
                    f"Enjoy a {display} display, a {camera} camera system and a {battery} battery "
                    f"built for all-day use.")
            _, was_created = Product.objects.update_or_create(
                slug=slugify(name.replace("+", " plus ")),
                defaults=dict(
                    name=name, brand=brand, category=cats[cat], description=desc,
                    price=price, mrp=mrp, stock=rng.choice([0, 3, 8, 15, 25, 40, 60]) if rng.random() < .1 else rng.choice([5, 12, 20, 35, 50]),
                    ram=int(ram), storage=int(storage), display=display, camera=camera,
                    battery=battery, processor=cpu,
                    os="iOS 18" if brand_n == "Apple" else "Android 15",
                    rating=Decimal(str(round(rng.uniform(4.0, 4.8), 1))),
                    is_featured=first_of_brand or price > 90000,
                ),
            )
            created += was_created
        self.stdout.write(self.style.SUCCESS(
            f"Done. {created} new phones ({Product.objects.count()} total), "
            f"{Brand.objects.count()} brands, {Category.objects.count()} categories."))
