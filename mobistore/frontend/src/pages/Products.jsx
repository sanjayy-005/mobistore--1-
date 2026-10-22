import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useFetch from "../components/useFetch.js";
import ProductCard from "../components/ProductCard.jsx";
import { Empty, ErrorBox, SkeletonGrid } from "../components/States.jsx";

const SORTS = [
  ["-created_at", "Newest first"], ["price", "Price: low to high"], ["-price", "Price: high to low"],
  ["-rating", "Top rated"], ["name", "Name: A to Z"],
];
const PRICE_PRESETS = [["Under ₹15,000", "", 15000], ["₹15,000 – ₹30,000", 15000, 30000],
  ["₹30,000 – ₹60,000", 30000, 60000], ["Above ₹60,000", 60000, ""]];

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const get = (k, d = "") => sp.get(k) ?? d;
  const [search, setSearch] = useState(get("search"));
  const [minP, setMinP] = useState(get("min_price"));
  const [maxP, setMaxP] = useState(get("max_price"));

  useEffect(() => { setSearch(get("search")); setMinP(get("min_price")); setMaxP(get("max_price")); }, [sp]);

  const set = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === "" || v == null ? next.delete(k) : next.set(k, v)));
    if (!("page" in patch)) next.delete("page");
    setSp(next);
  };

  const params = {
    search: get("search"), brand: get("brand"), category: get("category"),
    min_price: get("min_price"), max_price: get("max_price"), ram: get("ram"),
    in_stock: get("in_stock") || undefined, ordering: get("ordering", "-created_at"),
    page: get("page", 1), page_size: 12,
  };
  Object.keys(params).forEach((k) => params[k] === "" && delete params[k]);

  const list = useFetch("/products/", params);
  const brands = useFetch("/brands/");
  const cats = useFetch("/categories/");
  const total = list.data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / 12));
  const page = Number(get("page", 1));
  const activeCount = ["search", "brand", "category", "min_price", "max_price", "ram", "in_stock"].filter((k) => get(k)).length;

  const Radio = ({ name, value, label, count }) => (
    <label key={name + value} className="filter-opt">
      <input type="radio" name={name} checked={get(name) === value} onChange={() => set({ [name]: value })} />
      <span>{label}</span>{count != null && <small className="text-muted ms-auto">{count}</small>}
    </label>
  );

  const filters = (
    <div className="filters">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h6 mb-0">Filters</h2>
        {activeCount > 0 && <button className="btn btn-link btn-sm p-0" onClick={() => setSp(new URLSearchParams())}>Clear all</button>}
      </div>
      <h3 className="filter-h">Brand</h3>
      {Radio({ name: "brand", value: "", label: "All brands" })}
      {(brands.data || []).map((b) => Radio({ name: "brand", value: b.slug, label: b.name, count: b.product_count }))}
      <h3 className="filter-h">Type</h3>
      {Radio({ name: "category", value: "", label: "All types" })}
      {(cats.data || []).map((c) => Radio({ name: "category", value: c.slug, label: c.name }))}
      <h3 className="filter-h">Price</h3>
      {PRICE_PRESETS.map(([label, lo, hi]) => (
        <label className="filter-opt" key={label}>
          <input type="radio" name="price" checked={String(lo) === get("min_price") && String(hi) === get("max_price")}
            onChange={() => set({ min_price: lo, max_price: hi })} /><span>{label}</span>
        </label>
      ))}
      <div className="d-flex gap-2 mt-2">
        <input className="form-control form-control-sm" type="number" min="0" placeholder="Min ₹" value={minP} onChange={(e) => setMinP(e.target.value)} aria-label="Minimum price" />
        <input className="form-control form-control-sm" type="number" min="0" placeholder="Max ₹" value={maxP} onChange={(e) => setMaxP(e.target.value)} aria-label="Maximum price" />
        <button className="btn btn-outline-primary btn-sm" onClick={() => set({ min_price: minP, max_price: maxP })}>Go</button>
      </div>
      <h3 className="filter-h">RAM</h3>
      {Radio({ name: "ram", value: "", label: "Any" })}
      {[4, 6, 8, 12, 16].map((r) => Radio({ name: "ram", value: String(r), label: `${r} GB` }))}
      <div className="form-check form-switch mt-3">
        <input className="form-check-input" type="checkbox" id="instock" checked={get("in_stock") === "true"}
          onChange={(e) => set({ in_stock: e.target.checked ? "true" : "" })} />
        <label className="form-check-label" htmlFor="instock">In stock only</label>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-0">{get("search") ? `Results for “${get("search")}”` : "All phones"}</h1>
          <div className="text-muted small">{list.loading ? "Loading…" : `${total} phone${total === 1 ? "" : "s"} found`}</div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <form onSubmit={(e) => { e.preventDefault(); set({ search }); }} className="d-none d-md-block">
            <input className="form-control form-control-sm" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search in results" aria-label="Search phones" />
          </form>
          <select className="form-select form-select-sm w-auto" value={get("ordering", "-created_at")}
            onChange={(e) => set({ ordering: e.target.value })} aria-label="Sort phones">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button className="btn btn-outline-dark btn-sm d-lg-none" data-bs-toggle="collapse" data-bs-target="#filterPanel">
            <i className="bi bi-sliders" /> Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>

      <div className="row g-4">
        <aside className="col-lg-3">
          <div className="collapse d-lg-block" id="filterPanel">{filters}</div>
        </aside>
        <section className="col-lg-9">
          {list.loading ? <SkeletonGrid n={6} /> : list.error ? <ErrorBox message={list.error} onRetry={list.reload} /> :
            list.data.results.length === 0 ? (
              <Empty icon="bi-search" title="No phones match your filters" text="Try removing a filter or searching for something else." />
            ) : (
              <>
                <div className="row g-3">
                  {list.data.results.map((p) => <div key={p.id} className="col-6 col-md-4"><ProductCard p={p} /></div>)}
                </div>
                {pages > 1 && (
                  <nav className="mt-4" aria-label="Pages">
                    <ul className="pagination justify-content-center flex-wrap">
                      <li className={`page-item ${page <= 1 ? "disabled" : ""}`}><button className="page-link" onClick={() => set({ page: page - 1 })}>Previous</button></li>
                      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                        <li key={n} className={`page-item ${n === page ? "active" : ""}`}><button className="page-link" onClick={() => set({ page: n })}>{n}</button></li>
                      ))}
                      <li className={`page-item ${page >= pages ? "disabled" : ""}`}><button className="page-link" onClick={() => set({ page: page + 1 })}>Next</button></li>
                    </ul>
                  </nav>
                )}
              </>
            )}
        </section>
      </div>
    </div>
  );
}
