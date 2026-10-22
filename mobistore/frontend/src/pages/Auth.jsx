import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useToast } from "../store.jsx";
import { errorText } from "../api.js";

function AuthShell({ title, sub, children, footer }) {
  return (
    <div className="container py-5">
      <div className="auth-card">
        <h1 className="h3">{title}</h1>
        <p className="text-muted">{sub}</p>
        {children}
        <p className="text-center text-muted mt-4 mb-0">{footer}</p>
      </div>
    </div>
  );
}

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const from = useLocation().state?.from || "/";
  const [f, setF] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try { const u = await login(f.email, f.password); toast(`Welcome back, ${u.name.split(" ")[0]}`); navigate(from, { replace: true }); }
    catch (err) { setError(errorText(err)); setBusy(false); }
  };
  return (
    <AuthShell title="Log in" sub="Access your orders, wishlist and saved address."
      footer={<>New here? <Link to="/register" state={{ from }}>Create an account</Link></>}>
      <form onSubmit={submit}>
        <label className="form-label" htmlFor="email">Email</label>
        <input id="email" type="email" className="form-control mb-3" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <label className="form-label" htmlFor="password">Password</label>
        <input id="password" type="password" className="form-control mb-3" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const from = useLocation().state?.from || "/";
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={from} replace />;

  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try { await register(f); toast("Account created. Welcome to MobiStore!"); navigate(from, { replace: true }); }
    catch (err) { setError(errorText(err)); setBusy(false); }
  };
  return (
    <AuthShell title="Create your account" sub="Save phones, track orders and check out faster."
      footer={<>Already registered? <Link to="/login" state={{ from }}>Log in</Link></>}>
      <form onSubmit={submit}>
        <label className="form-label" htmlFor="name">Full name</label>
        <input id="name" className="form-control mb-3" required autoComplete="name" value={f.name} onChange={on("name")} />
        <label className="form-label" htmlFor="remail">Email</label>
        <input id="remail" type="email" className="form-control mb-3" required autoComplete="email" value={f.email} onChange={on("email")} />
        <label className="form-label" htmlFor="phone">Mobile number</label>
        <input id="phone" type="tel" className="form-control mb-3" autoComplete="tel" value={f.phone} onChange={on("phone")} />
        <label className="form-label" htmlFor="rpassword">Password</label>
        <input id="rpassword" type="password" className="form-control" minLength={8} required autoComplete="new-password" value={f.password} onChange={on("password")} />
        <div className="form-text mb-3">At least 8 characters.</div>
        {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
      </form>
    </AuthShell>
  );
}
