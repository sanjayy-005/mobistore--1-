import { Link } from "react-router-dom";

export function Loader({ label = "Loading…" }) {
  return (
    <div className="state-box" role="status">
      <div className="spinner-border text-primary" aria-hidden="true" />
      <p className="mt-3 mb-0 text-muted">{label}</p>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="state-box">
      <i className="bi bi-wifi-off fs-1 text-danger" />
      <h5 className="mt-2">We couldn't load this</h5>
      <p className="text-muted">{message}</p>
      {onRetry && <button className="btn btn-primary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Empty({ icon = "bi-inbox", title, text, to, action }) {
  return (
    <div className="state-box">
      <i className={`bi ${icon} fs-1 text-muted`} />
      <h5 className="mt-2">{title}</h5>
      {text && <p className="text-muted">{text}</p>}
      {to && <Link to={to} className="btn btn-primary">{action}</Link>}
    </div>
  );
}

export function SkeletonGrid({ n = 8 }) {
  return (
    <div className="row g-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="col-6 col-md-4 col-xl-3">
          <div className="skeleton-card"><div className="sk sk-img" /><div className="sk sk-line" /><div className="sk sk-line short" /></div>
        </div>
      ))}
    </div>
  );
}
