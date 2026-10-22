import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, useCart, useWishlist } from "../store.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const wish = useWishlist();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky-top">
      <div className="topbar text-center small py-1">
        Free delivery on every order · Cash on delivery available · 7-day replacement
      </div>
      <nav className="navbar navbar-expand-lg site-nav">
        <div className="container">
          <Link className="navbar-brand brand-mark" to="/"><i className="bi bi-phone-fill" /> MobiStore</Link>
          <div className="d-flex align-items-center gap-2 order-lg-3">
            <Link to="/wishlist" className="icon-link" aria-label="Wishlist">
              <i className="bi bi-heart" />{wish.count > 0 && <span className="count-dot">{wish.count}</span>}
            </Link>
            <Link to="/cart" className="icon-link" aria-label="Cart">
              <i className="bi bi-bag" />{count > 0 && <span className="count-dot">{count}</span>}
            </Link>
            <button className="navbar-toggler ms-1" type="button" data-bs-toggle="collapse"
              data-bs-target="#mainNav" aria-controls="mainNav" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>
          </div>
          <div className="collapse navbar-collapse order-lg-2" id="mainNav">
            <form className="nav-search mx-lg-4 my-3 my-lg-0" onSubmit={submit} role="search">
              <i className="bi bi-search" />
              <input value={q} onChange={(e) => setQ(e.target.value)} className="form-control"
                placeholder="Search phones, brands or chipsets" aria-label="Search phones" />
            </form>
            <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-1">
              <li className="nav-item"><NavLink className="nav-link" to="/" end>Home</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/products">All phones</NavLink></li>
              {user ? (
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle me-1" />{user.name.split(" ")[0]}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/profile">My profile</Link></li>
                    <li><Link className="dropdown-item" to="/profile?tab=orders">Order history</Link></li>
                    <li><Link className="dropdown-item" to="/wishlist">Wishlist</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={async () => { await logout(); navigate("/"); }}>Log out</button></li>
                  </ul>
                </li>
              ) : (
                <>
                  <li className="nav-item"><NavLink className="nav-link" to="/login">Log in</NavLink></li>
                  <li className="nav-item"><Link className="btn btn-primary btn-sm ms-lg-2" to="/register">Sign up</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
