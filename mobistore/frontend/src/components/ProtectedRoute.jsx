import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store.jsx";
import { Loader } from "./States.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
