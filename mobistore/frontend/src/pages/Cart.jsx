import { Link, useNavigate } from "react-router-dom";
import { useCart, useToast } from "../store.jsx";
import PhoneImage from "../components/PhoneImage.jsx";
import { Empty } from "../components/States.jsx";
import { inr } from "../api.js";

export function OrderSummary({ items, subtotal }) {
  return (
    <div className="summary-card">
      <h2 className="h5">Order summary</h2>
      {items.map((i) => (
        <div className="d-flex justify-content-between small mb-1" key={i.id}>
          <span className="text-truncate me-2">{i.name} × {i.quantity}</span><span>{inr(Number(i.price) * i.quantity)}</span>
        </div>
      ))}
      <hr />
      <div className="d-flex justify-content-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
      <div className="d-flex justify-content-between"><span>Delivery</span><span className="text-success">Free</span></div>
      <hr />
      <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>{inr(subtotal)}</span></div>
    </div>
  );
}

export default function Cart() {
  const { items, setQty, remove, clear, subtotal, count } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  if (items.length === 0)
    return <div className="container py-5"><Empty icon="bi-bag" title="Your cart is empty" text="Phones you add will show up here." to="/products" action="Browse phones" /></div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Your cart <span className="text-muted fs-6">({count} item{count > 1 ? "s" : ""})</span></h1>
        <button className="btn btn-link text-danger" onClick={() => { clear(); toast("Cart cleared"); }}>Clear cart</button>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          {items.map((i) => (
            <div className="cart-row" key={i.id}>
              <Link to={`/products/${i.slug}`} className="cart-thumb"><PhoneImage product={i} /></Link>
              <div className="flex-grow-1">
                <div className="small text-muted">{i.brand}</div>
                <Link to={`/products/${i.slug}`} className="fw-semibold text-dark text-decoration-none">{i.name}</Link>
                <div className="price mt-1">{inr(i.price)}</div>
                <button className="btn btn-link btn-sm text-danger p-0 mt-1" onClick={() => remove(i.id)}><i className="bi bi-trash" /> Remove</button>
              </div>
              <div className="text-end">
                <div className="qty mb-2">
                  <button onClick={() => setQty(i.id, i.quantity - 1)} aria-label="Decrease quantity"><i className="bi bi-dash" /></button>
                  <input readOnly value={i.quantity} aria-label="Quantity" />
                  <button onClick={() => setQty(i.id, i.quantity + 1)} aria-label="Increase quantity"><i className="bi bi-plus" /></button>
                </div>
                <div className="fw-bold">{inr(Number(i.price) * i.quantity)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="col-lg-4">
          <OrderSummary items={items} subtotal={subtotal} />
          <button className="btn btn-primary btn-lg w-100 mt-3" onClick={() => navigate("/checkout")}>Proceed to checkout</button>
          <Link to="/products" className="btn btn-outline-secondary w-100 mt-2">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
