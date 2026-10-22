import useFetch from "../components/useFetch.js";
import ProductCard from "../components/ProductCard.jsx";
import { Empty, ErrorBox, SkeletonGrid } from "../components/States.jsx";
import { useWishlist } from "../store.jsx";

export default function Wishlist() {
  const { data, loading, error, reload } = useFetch("/wishlist/");
  const { ids } = useWishlist();
  // Hide items the user un-hearted on this page without refetching.
  const items = (data || []).filter((w) => ids.has(w.product.id));

  return (
    <div className="container py-4">
      <h1 className="h3 mb-3">Your wishlist</h1>
      {loading ? <SkeletonGrid n={4} /> : error ? <ErrorBox message={error} onRetry={reload} /> :
        items.length === 0 ? <Empty icon="bi-heart" title="Nothing saved yet" text="Tap the heart on any phone to save it here." to="/products" action="Browse phones" /> : (
          <div className="row g-3">{items.map((w) => <div key={w.id} className="col-6 col-md-4 col-xl-3"><ProductCard p={w.product} /></div>)}</div>
        )}
    </div>
  );
}
