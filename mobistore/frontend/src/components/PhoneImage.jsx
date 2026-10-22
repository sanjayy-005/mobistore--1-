import { placeholderImage } from "../api.js";

export default function PhoneImage({ product, className = "", ...rest }) {
  const fallback = placeholderImage(product.brand_slug, product.name);
  return (
    <img
      src={product.image || fallback}
      alt={product.name}
      loading="lazy"
      className={className}
      onError={(e) => { if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }}
      {...rest}
    />
  );
}
