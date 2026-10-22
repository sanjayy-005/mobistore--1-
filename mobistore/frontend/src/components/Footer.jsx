import { Link } from "react-router-dom";

const BRANDS = [["apple", "Apple"], ["samsung", "Samsung"], ["oneplus", "OnePlus"], ["xiaomi", "Xiaomi"],
  ["vivo", "Vivo"], ["oppo", "Oppo"], ["realme", "Realme"]];

export default function Footer() {
  return (
    <footer className="site-footer mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="brand-mark text-white mb-2"><i className="bi bi-phone-fill" /> MobiStore</div>
            <p className="text-white-50 mb-0">Genuine phones from the brands you trust, delivered to your door with a full manufacturer warranty.</p>
          </div>
          <div className="col-6 col-lg-2">
            <h6>Shop</h6>
            <ul className="list-unstyled">
              <li><Link to="/products">All phones</Link></li>
              <li><Link to="/products?category=flagship">Flagship</Link></li>
              <li><Link to="/products?category=budget">Budget</Link></li>
              <li><Link to="/products?category=foldable">Foldable</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h6>Brands</h6>
            <ul className="list-unstyled">
              {BRANDS.map(([slug, label]) => <li key={slug}><Link to={`/products?brand=${slug}`}>{label}</Link></li>)}
            </ul>
          </div>
          <div className="col-lg-3">
            <h6>Your account</h6>
            <ul className="list-unstyled">
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/profile?tab=orders">Order history</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary mt-4" />
        <p className="small text-white-50 mb-0">© {new Date().getFullYear()} MobiStore. Prices and specifications are sample data.</p>
      </div>
    </footer>
  );
}
