"""Attach real product photos.

Option A - files:  put images in  media/phones/<product-slug>.jpg|png|webp
                   e.g. media/phones/iphone-16-pro-max.png, then run:
                   python manage.py attach_images

Option B - URLs:   python manage.py attach_images --csv image_urls.csv
                   (CSV columns: slug,url  - one product per row)

Run `python manage.py attach_images --list` to print every slug.
"""
import csv
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from products.models import Product

EXTS = (".jpg", ".jpeg", ".png", ".webp")


class Command(BaseCommand):
    help = "Attach product images from media/phones/ or a slug,url CSV file."

    def add_arguments(self, parser):
        parser.add_argument("--csv", help="CSV file with slug,url columns")
        parser.add_argument("--list", action="store_true", help="Print all product slugs")

    def handle(self, *args, **opts):
        if opts["list"]:
            for slug in Product.objects.values_list("slug", flat=True):
                self.stdout.write(slug)
            return

        count = 0
        if opts["csv"]:
            with open(opts["csv"], newline="", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    count += Product.objects.filter(slug=row["slug"].strip()).update(
                        image_link=row["url"].strip())
        else:
            folder = Path(settings.MEDIA_ROOT) / "phones"
            for path in folder.iterdir() if folder.exists() else []:
                if path.suffix.lower() in EXTS:
                    count += Product.objects.filter(slug=path.stem).update(image=f"phones/{path.name}")
        self.stdout.write(self.style.SUCCESS(f"Images attached to {count} products."))
