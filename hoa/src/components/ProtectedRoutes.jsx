// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // If there is no token, send them to login.
  // We include 'state' so we can redirect them back after they log in if we want.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user's role isn't allowed for this route, kick them to login
  if (roles && !roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
