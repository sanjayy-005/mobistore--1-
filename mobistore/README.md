# MobiStore – Mobile Phone E-Commerce (React + Django REST + MySQL)

```
mobistore/
  backend/    Django + Django REST Framework API (MySQL)
  frontend/   React (Vite) + Bootstrap 5
```

## 1. Backend (Django + MySQL)

Create the database first (MySQL 8):

```sql
CREATE DATABASE mobistore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then:

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt   # mysqlclient needs MySQL dev headers (see below)
cp .env.example .env              # set DB_USER / DB_PASSWORD
python manage.py makemigrations accounts products orders
python manage.py migrate
python manage.py seed_phones      # loads 56 phones, 7 brands, 5 categories
python manage.py createsuperuser  # for /admin
python manage.py runserver        # http://127.0.0.1:8000
```

`mysqlclient` install help: Windows/macOS usually install from wheels; on Ubuntu run
`sudo apt install libmysqlclient-dev pkg-config build-essential python3-dev` first.

## 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173
```

Vite proxies `/api` and `/media` to Django on port 8000, so just run both servers.

## 3. Product images

Without photos the site shows a clean branded phone placeholder. To use real photos (check each image's license first):

- **Local files:** save `backend/media/phones/<slug>.jpg|png|webp`
  (for example `iphone-16-pro-max.png`), then run `python manage.py attach_images`.
  List every slug with `python manage.py attach_images --list`.
- **URLs:** copy `image_urls.csv.example` to `image_urls.csv`, fill in `slug,url` rows, then run
  `python manage.py attach_images --csv image_urls.csv`.
- **Admin:** upload an image or paste a URL on each product at `/admin`.

## 4. API reference

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/products/` | `search`, `brand`, `category`, `min_price`, `max_price`, `ram`, `in_stock`, `is_featured`, `ordering` (`price`, `-price`, `-rating`, `name`, `-created_at`), `page`, `page_size` |
| GET | `/api/products/<slug>/` | Details, specs, related phones |
| GET | `/api/brands/`, `/api/categories/` | |
| POST | `/api/auth/register/`, `/api/auth/login/` | Returns `{token, user}`; send `Authorization: Token <token>` |
| POST | `/api/auth/logout/` | |
| GET/PATCH | `/api/auth/me/` | Profile and default address |
| GET/POST | `/api/wishlist/` | POST `{product: id}` |
| DELETE | `/api/wishlist/<product_id>/` | |
| GET/POST | `/api/orders/` | POST `{full_name, phone, address, city, state, pincode, payment_method:"COD", cart:[{product, quantity}]}` |
| GET | `/api/orders/<id>/` | Own orders only |

Orders are priced server-side from current product prices, and stock is decremented inside a database transaction. Manage products, stock and order status in `/admin`.

## Notes

- Payment is Cash on Delivery only; no payment gateway is wired in.
- Prices and specs in the seed data are approximate samples. Edit them in the admin.
- For production: set `DJANGO_DEBUG=0`, a strong `DJANGO_SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ORIGINS`, run `npm run build`, and serve behind a real web server.
