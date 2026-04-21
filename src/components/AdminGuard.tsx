import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const isAuth = sessionStorage.getItem("fussfree_admin") === "true";

  useEffect(() => {
    if (!isAuth) navigate("/admin/login");
  }, [isAuth, navigate]);

  if (!isAuth) return null;
  return <>{children}</>;
};

export default AdminGuard;
