import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../components/useFetch.js";
import PhoneImage from "../components/PhoneImage.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { ErrorBox, Loader } from "../components/States.jsx";
import { useCart, useToast, useWishlist } from "../store.jsx";
import { inr } from "../api.js";

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: p, loading, error, reload } = useFetch(`/products/${slug}/`);
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  if (loading) return <div className="container py-5"><Loader /></div>;
  if (error) return <div className="container py-5"><ErrorBox message={error.includes("Not found") ? "This phone doesn't exist." : error} onRetry={reload} /></div>;

  const liked = ids.has(p.id);
  const max = Math.min(p.stock, 10);
  const specs = [["Brand", p.brand], ["Type", p.category], ["Display", p.display], ["Processor", p.processor],
    ["RAM", `${p.ram} GB`], ["Storage", `${p.storage} GB`], ["Rear camera", p.camera], ["Battery", p.battery], ["Operating system", p.os]];

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb"><ol className="breadcrumb small">
        <li className="breadcrumb-item"><Link to="/">Home</Link></li>
        <li className="breadcrumb-item"><Link to={`/products?brand=${p.brand_slug}`}>{p.brand}</Link></li>
        <li className="breadcrumb-item active" aria-current="page">{p.name}</li>
      </ol></nav>

      <div className="row g-4">
        <div className="col-md-5"><div className="detail-media"><PhoneImage product={p} /></div></div>
        <div className="col-md-7">
          <div className="text-muted">{p.brand} · {p.category}</div>
          <h1 className="h2">{p.name}</h1>
          <div className="d-flex align-items-center gap-3 mb-3">
            <span className="rating-pill"><i className="bi bi-star-fill" /> {p.rating}</span>
            {p.in_stock
              ? <span className="text-success fw-semibold"><i className="bi bi-check-circle-fill" /> {p.stock <= 5 ? `Only ${p.stock} left in stock` : "In stock"}</span>
              : <span className="text-danger fw-semibold"><i className="bi bi-x-circle-fill" /> Out of stock</span>}
          </div>
          <div className="d-flex align-items-baseline gap-3 mb-1">
            <span className="price price-lg">{inr(p.price)}</span>
            {p.discount_percent > 0 && <><span className="mrp fs-5">{inr(p.mrp)}</span><span className="badge text-bg-success">{p.discount_percent}% off</span></>}
          </div>
          <div className="small text-muted mb-4">Inclusive of all taxes · Free delivery</div>

          <div className="spec-chips mb-4">
            <span><i className="bi bi-cpu" /> {p.processor}</span><span><i className="bi bi-memory" /> {p.ram}GB + {p.storage}GB</span>
            <span><i className="bi bi-battery-full" /> {p.battery}</span>
          </div>

          {p.in_stock && (
            <div className="d-flex align-items-center gap-3 mb-3">
              <label className="fw-semibold" htmlFor="qty">Quantity</label>
              <div className="qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"><i className="bi bi-dash" /></button>
                <input id="qty" readOnly value={qty} />
                <button onClick={() => setQty(Math.min(max, qty + 1))} aria-label="Increase quantity"><i className="bi bi-plus" /></button>
              </div>
            </div>
          )}
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary btn-lg" disabled={!p.in_stock} onClick={() => { add(p, qty); toast(`${p.name} added to cart`); }}>
              <i className="bi bi-bag-plus me-1" /> Add to cart
            </button>
            <button className="btn btn-dark btn-lg" disabled={!p.in_stock} onClick={() => { add(p, qty); navigate("/checkout"); }}>Buy now</button>
            <button className={`btn btn-lg ${liked ? "btn-danger" : "btn-outline-secondary"}`} onClick={() => toggle(p.id)} aria-pressed={liked}>
              <i className={`bi ${liked ? "bi-heart-fill" : "bi-heart"}`} /> {liked ? "Saved" : "Wishlist"}
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        <div className="col-lg-7">
          <h2 className="h5">Specifications</h2>
          <table className="table spec-table"><tbody>
            {specs.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
          </tbody></table>
        </div>
        <div className="col-lg-5">
          <h2 className="h5">About this phone</h2>
          <p className="text-muted">{p.description}</p>
        </div>
      </div>

      {p.related?.length > 0 && (
        <section className="mt-4">
          <h2 className="h5 mb-3">More from {p.brand}</h2>
          <div className="row g-3">{p.related.map((r) => <div key={r.id} className="col-6 col-lg-3"><ProductCard p={r} /></div>)}</div>
        </section>
      )}
    </div>
  );
}
