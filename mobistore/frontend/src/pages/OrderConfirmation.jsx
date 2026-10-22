import { Link, useParams } from "react-router-dom";
import useFetch from "../components/useFetch.js";
import { ErrorBox, Loader } from "../components/States.jsx";
import { inr } from "../api.js";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { data: o, loading, error, reload } = useFetch(`/orders/${id}/`);
  if (loading) return <div className="container py-5"><Loader /></div>;
  if (error) return <div className="container py-5"><ErrorBox message={error} onRetry={reload} /></div>;

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <div className="text-center mb-4">
        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3.5rem" }} />
        <h1 className="h2 mt-2">Order placed</h1>
        <p className="text-muted">Your order number is <strong>#{o.id}</strong>. Pay {inr(o.total)} in cash when it arrives.</p>
      </div>
      <div className="panel">
        <h2 className="h6">Delivering to</h2>
        <p className="mb-3">{o.full_name} · {o.phone}<br />{o.address}, {o.city}, {o.state} {o.pincode}</p>
        <h2 className="h6">Items</h2>
        {o.items.map((i) => (
          <div className="d-flex justify-content-between py-1" key={i.id}><span>{i.product_name} × {i.quantity}</span><span>{inr(i.line_total)}</span></div>
        ))}
        <hr />
        <div className="d-flex justify-content-between fw-bold"><span>Total</span><span>{inr(o.total)}</span></div>
      </div>
      <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
        <Link to="/profile?tab=orders" className="btn btn-primary">View my orders</Link>
        <Link to="/products" className="btn btn-outline-secondary">Keep shopping</Link>
      </div>
    </div>
  );
}
