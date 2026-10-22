import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { errorText, inr } from "../api.js";
import { useAuth, useToast } from "../store.jsx";
import useFetch from "../components/useFetch.js";
import { Empty, ErrorBox, Loader } from "../components/States.jsx";

const STATUS_TONE = { placed: "primary", shipped: "info", delivered: "success", cancelled: "secondary" };

function Details() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name, phone: user.phone || "", address: user.address || "",
    city: user.city || "", state: user.state || "", pincode: user.pincode || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try { setUser((await api.patch("/auth/me/", f)).data); toast("Profile saved", "success"); }
    catch (err) { setError(errorText(err)); }
    setBusy(false);
  };
  return (
    <form className="panel" onSubmit={save}>
      <div className="row g-3">
        <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" required value={f.name} onChange={on("name")} /></div>
        <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" disabled value={user.email} /></div>
        <div className="col-md-6"><label className="form-label">Mobile number</label><input className="form-control" value={f.phone} onChange={on("phone")} /></div>
        <div className="col-12"><label className="form-label">Address</label><textarea className="form-control" rows="2" value={f.address} onChange={on("address")} /></div>
        <div className="col-md-4"><label className="form-label">City</label><input className="form-control" value={f.city} onChange={on("city")} /></div>
        <div className="col-md-4"><label className="form-label">State</label><input className="form-control" value={f.state} onChange={on("state")} /></div>
        <div className="col-md-4"><label className="form-label">PIN code</label><input className="form-control" value={f.pincode} onChange={on("pincode")} /></div>
      </div>
      {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}
      <button className="btn btn-primary mt-3" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

function Orders() {
  const { data, loading, error, reload } = useFetch("/orders/");
  if (loading) return <Loader label="Loading your orders…" />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (data.length === 0) return <Empty icon="bi-receipt" title="No orders yet" text="Once you place an order it will appear here." to="/products" action="Browse phones" />;
  return data.map((o) => (
    <div className="panel mb-3" key={o.id}>
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
        <div><strong>Order #{o.id}</strong> <span className="text-muted small ms-2">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
        <span className={`badge text-bg-${STATUS_TONE[o.status]} text-capitalize align-self-start`}>{o.status}</span>
      </div>
      {o.items.map((i) => <div className="d-flex justify-content-between small py-1" key={i.id}><span>{i.product_name} × {i.quantity}</span><span>{inr(i.line_total)}</span></div>)}
      <hr className="my-2" />
      <div className="d-flex justify-content-between fw-semibold"><span>Total (cash on delivery)</span><span>{inr(o.total)}</span></div>
    </div>
  ));
}

export default function Profile() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") === "orders" ? "orders" : "details";
  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      <h1 className="h3">Hi, {user.name.split(" ")[0]}</h1>
      <ul className="nav nav-pills my-3">
        <li className="nav-item"><button className={`nav-link ${tab === "details" ? "active" : ""}`} onClick={() => setSp({})}>My details</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === "orders" ? "active" : ""}`} onClick={() => setSp({ tab: "orders" })}>Order history</button></li>
        <li className="nav-item"><Link className="nav-link" to="/wishlist">Wishlist</Link></li>
      </ul>
      {tab === "details" ? <Details /> : <Orders />}
    </div>
  );
}
