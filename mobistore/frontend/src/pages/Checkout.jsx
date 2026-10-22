import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api, { errorText } from "../api.js";
import { useAuth, useCart } from "../store.jsx";
import { OrderSummary } from "./Cart.jsx";

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: user.name || "", phone: user.phone || "", address: user.address || "",
    city: user.city || "", state: user.state || "", pincode: user.pincode || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const { data } = await api.post("/orders/", {
        ...form, payment_method: "COD",
        cart: items.map((i) => ({ product: i.id, quantity: i.quantity })),
      });
      clear();
      navigate(`/order-confirmation/${data.id}`, { replace: true });
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  const Field = ({ k, label, ...rest }) => (
    <div key={k} className={rest.col || "col-12"}>
      <label className="form-label" htmlFor={k}>{label}</label>
      <input id={k} className="form-control" required value={form[k]} onChange={on(k)} {...rest.input} />
    </div>
  );

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Checkout</h1>
      <form className="row g-4" onSubmit={submit}>
        <div className="col-lg-8">
          <div className="panel">
            <h2 className="h5 mb-3">Delivery address</h2>
            <div className="row g-3">
              {Field({ k: "full_name", label: "Full name", col: "col-md-6" })}
              {Field({ k: "phone", label: "Mobile number", col: "col-md-6", input: { type: "tel", pattern: "[0-9]{10}", title: "10-digit mobile number" } })}
              <div className="col-12">
                <label className="form-label" htmlFor="address">Address</label>
                <textarea id="address" className="form-control" rows="2" required value={form.address} onChange={on("address")} placeholder="House no., street, area" />
              </div>
              {Field({ k: "city", label: "City", col: "col-md-4" })}
              {Field({ k: "state", label: "State", col: "col-md-4" })}
              {Field({ k: "pincode", label: "PIN code", col: "col-md-4", input: { inputMode: "numeric", pattern: "[0-9]{6}", title: "6-digit PIN code" } })}
            </div>
          </div>
          <div className="panel mt-3">
            <h2 className="h5 mb-3">Payment</h2>
            <label className="filter-opt border rounded p-3">
              <input type="radio" checked readOnly /> <span><strong>Cash on delivery</strong><br /><small className="text-muted">Pay in cash when your phone arrives.</small></span>
            </label>
          </div>
        </div>
        <div className="col-lg-4">
          <OrderSummary items={items} subtotal={subtotal} />
          {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}
          <button className="btn btn-primary btn-lg w-100 mt-3" disabled={busy}>
            {busy ? <><span className="spinner-border spinner-border-sm me-2" />Placing order…</> : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
}
