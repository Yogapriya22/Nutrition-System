import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps pages that require login (like the Dashboard). If there's no
// logged-in user, it redirects to /login instead of rendering the page.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
