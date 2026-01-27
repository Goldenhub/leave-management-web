import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Permission } from "../types";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
}

export function ProtectedRoute({ children, requiredPermissions = [], requireAll = false }: ProtectedRouteProps) {
  const { isAuthenticated, hasPermission, hasAnyPermission, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll ? requiredPermissions.every((p) => hasPermission(p)) : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}

export function PublicRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
