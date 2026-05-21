import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  if (isLoading) return null;
  if (!isAuthenticated || !isAdmin) return null;
  return <>{children}</>;
};

export default AdminGuard;
