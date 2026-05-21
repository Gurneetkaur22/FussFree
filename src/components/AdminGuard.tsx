import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import AccessDenied from "@/components/AccessDenied";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not logged in at all → redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not admin → show access denied
  if (!isAdmin) {
    return (
      <AccessDenied message="This area is restricted to administrators only." />
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
