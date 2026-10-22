import { Link } from "react-router-dom";
import { inr } from "../api.js";
import { useCart, useToast, useWishlist } from "../store.jsx";
import PhoneImage from "./PhoneImage.jsx";

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const toast = useToast();
  const liked = ids.has(p.id);

  return (
    <article className="product-card h-100">
      <button className={`wish-btn ${liked ? "on" : ""}`} onClick={() => toggle(p.id)}
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={liked}>
        <i className={`bi ${liked ? "bi-heart-fill" : "bi-heart"}`} />
      </button>
      {p.discount_percent > 0 && <span className="deal-tag">{p.discount_percent}% off</span>}
      <Link to={`/products/${p.slug}`} className="card-media">
        <PhoneImage product={p} />
      </Link>
      <div className="card-body-x">
        <div className="small text-muted">{p.brand}</div>
        <h3 className="card-title-x"><Link to={`/products/${p.slug}`}>{p.name}</Link></h3>
        <div className="small text-muted mb-2">{p.ram}GB RAM · {p.storage}GB</div>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="rating-pill"><i className="bi bi-star-fill" /> {p.rating}</span>
          {!p.in_stock && <span className="badge text-bg-secondary">Out of stock</span>}
          {p.in_stock && p.stock <= 5 && <span className="small text-danger">Only {p.stock} left</span>}
        </div>
        <div className="d-flex align-items-baseline gap-2 mb-3">
          <span className="price">{inr(p.price)}</span>
          {p.discount_percent > 0 && <span className="mrp">{inr(p.mrp)}</span>}
        </div>
        <button className="btn btn-primary w-100" disabled={!p.in_stock}
          onClick={() => { add(p); toast(`${p.name} added to cart`); }}>
          <i className="bi bi-bag-plus me-1" /> {p.in_stock ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}
