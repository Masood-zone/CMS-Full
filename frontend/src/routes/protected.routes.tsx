import type React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LoadingOverlay from "@/components/shared/page-loader/loading-overlay";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({
  children,
  roles = [],
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect based on user role
    const redirectPath = user.role === "TEACHER" ? "/teacher" : "/admin";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
