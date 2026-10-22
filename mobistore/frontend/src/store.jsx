import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./api.js";

const AuthCtx = createContext();
const CartCtx = createContext();
const WishCtx = createContext();
const ToastCtx = createContext();

export const useAuth = () => useContext(AuthCtx);
export const useCart = () => useContext(CartCtx);
export const useWishlist = () => useContext(WishCtx);
export const useToast = () => useContext(ToastCtx);

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, tone = "dark") => {
    setToast({ message, tone, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }} aria-live="polite">
        {toast && (
          <div className={`toast show align-items-center text-bg-${toast.tone} border-0`} role="status">
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(null)} aria-label="Close" />
            </div>
          </div>
        )}
      </div>
    </ToastCtx.Provider>
  );
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("ms_token"));

  useEffect(() => {
    if (!localStorage.getItem("ms_token")) return;
    api.get("/auth/me/").then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("ms_token"))
      .finally(() => setLoading(false));
  }, []);

  const finish = (data) => {
    localStorage.setItem("ms_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const login = async (email, password) => finish((await api.post("/auth/login/", { email, password })).data);
  const register = async (form) => finish((await api.post("/auth/register/", form)).data);
  const logout = async () => {
    try { await api.post("/auth/logout/"); } catch { /* token may already be invalid */ }
    localStorage.removeItem("ms_token");
    setUser(null);
  };
  const value = useMemo(() => ({ user, setUser, loading, login, register, logout }), [user, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ms_cart")) || []; } catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem("ms_cart", JSON.stringify(items));
  }, [items]);

  const add = (p, qty = 1) => setItems((cur) => {
    const found = cur.find((i) => i.id === p.id);
    const max = Math.min(p.stock, 10);
    if (found) return cur.map((i) => i.id === p.id ? { ...i, quantity: Math.min(i.quantity + qty, max), stock: p.stock } : i);
    return [...cur, { id: p.id, slug: p.slug, name: p.name, brand: p.brand, brand_slug: p.brand_slug,
      price: p.price, image: p.image, stock: p.stock, quantity: Math.min(qty, max) }];
  });
  const setQty = (id, quantity) => setItems((cur) =>
    cur.map((i) => i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock, 10)) } : i));
  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + Number(i.price) * i.quantity, 0);
  return <CartCtx.Provider value={{ items, add, setQty, remove, clear, count, subtotal }}>{children}</CartCtx.Provider>;
}

function WishlistProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [ids, setIds] = useState(new Set());

  useEffect(() => {
    if (!user) { setIds(new Set()); return; }
    api.get("/wishlist/").then((r) => setIds(new Set(r.data.map((w) => w.product.id)))).catch(() => {});
  }, [user]);

  const toggle = async (productId) => {
    if (!user) {
      toast("Log in to save phones to your wishlist");
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    const has = ids.has(productId);
    const next = new Set(ids);
    has ? next.delete(productId) : next.add(productId);
    setIds(next);
    try {
      has ? await api.delete(`/wishlist/${productId}/`) : await api.post("/wishlist/", { product: productId });
      toast(has ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      setIds(ids);
      toast("Couldn't update your wishlist", "danger");
    }
  };
  return <WishCtx.Provider value={{ ids, toggle, count: ids.size }}>{children}</WishCtx.Provider>;
}

export function Providers({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
