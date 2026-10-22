import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../components/useFetch.js";
import ProductCard from "../components/ProductCard.jsx";
import PhoneImage from "../components/PhoneImage.jsx";
import { ErrorBox, SkeletonGrid } from "../components/States.jsx";
import { inr } from "../api.js";

const CAT_ICONS = { flagship: "bi-stars", premium: "bi-gem", "mid-range": "bi-speedometer2", budget: "bi-piggy-bank", foldable: "bi-layout-sidebar-inset-reverse" };
const PERKS = [
  ["bi-truck", "Free delivery", "On every order, all over India"],
  ["bi-shield-check", "Brand warranty", "Genuine, sealed phones"],
  ["bi-arrow-repeat", "7-day replacement", "If it arrives damaged"],
  ["bi-cash-coin", "Cash on delivery", "Pay when it reaches you"],
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const featured = useFetch("/products/", { is_featured: true, page_size: 8, ordering: "-price" });
  const deals = useFetch("/products/", { ordering: "price", in_stock: true, page_size: 4, category: "budget" });
  const brands = useFetch("/brands/");
  const cats = useFetch("/categories/");
  const hero = (featured.data?.results || []).slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="hero-title">Find the phone that fits the way you live.</h1>
              <p className="hero-sub">Compare 50+ phones from Apple, Samsung, OnePlus, Xiaomi, Vivo, Oppo and Realme. Genuine stock, honest prices, free delivery.</p>
              <form className="hero-search" onSubmit={(e) => { e.preventDefault(); navigate(`/products?search=${encodeURIComponent(q)}`); }}>
                <input className="form-control form-control-lg" value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Try “iPhone 16” or “Snapdragon 8”" aria-label="Search phones" />
                <button className="btn btn-primary btn-lg" type="submit">Search</button>
              </form>
              <div className="d-flex flex-wrap gap-2 mt-3">
                {(brands.data || []).map((b) => (
                  <Link key={b.id} to={`/products?brand=${b.slug}`} className="chip">{b.name}</Link>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-stack">
                {hero.map((p, i) => (
                  <Link key={p.id} to={`/products/${p.slug}`} className={`hero-phone hp-${i}`}>
                    <PhoneImage product={p} />
                    <span className="hero-phone-label">{p.name}<br /><b>{inr(p.price)}</b></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container perks">
        <div className="row g-3">
          {PERKS.map(([icon, title, text]) => (
            <div className="col-6 col-lg-3" key={title}>
              <div className="perk"><i className={`bi ${icon}`} /><div><strong>{title}</strong><div className="small text-muted">{text}</div></div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">Shop by type</h2>
        <div className="row g-3">
          {(cats.data || []).map((c) => (
            <div className="col-6 col-md-4 col-lg" key={c.id}>
              <Link to={`/products?category=${c.slug}`} className="cat-tile">
                <i className={`bi ${CAT_ICONS[c.slug] || "bi-phone"}`} />
                <strong>{c.name}</strong>
                <span className="small text-muted">{c.description}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="d-flex justify-content-between align-items-end mb-3">
          <h2 className="section-title mb-0">Featured phones</h2>
          <Link to="/products" className="small fw-semibold">View all phones</Link>
        </div>
        {featured.loading ? <SkeletonGrid /> : featured.error ? <ErrorBox message={featured.error} onRetry={featured.reload} /> : (
          <div className="row g-3">
            {featured.data.results.map((p) => <div key={p.id} className="col-6 col-md-4 col-xl-3"><ProductCard p={p} /></div>)}
          </div>
        )}
      </section>

      <section className="container section">
        <div className="promo">
          <div>
            <h2>Great phones under ₹20,000</h2>
            <p className="mb-0">5G, big batteries and smooth 120Hz screens without the flagship price.</p>
          </div>
          <Link to="/products?category=budget&ordering=price" className="btn btn-light btn-lg">Browse budget phones</Link>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">Lowest prices right now</h2>
        {deals.loading ? <SkeletonGrid n={4} /> : deals.error ? <ErrorBox message={deals.error} onRetry={deals.reload} /> : (
          <div className="row g-3">
            {deals.data.results.map((p) => <div key={p.id} className="col-6 col-md-4 col-xl-3"><ProductCard p={p} /></div>)}
          </div>
        )}
      </section>
    </>
  );
}
