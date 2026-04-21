import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import AdminGuard from "@/components/AdminGuard";
import LocationMap from "@/components/LocationMap";
import { getComplaints } from "@/lib/store";
import { Complaint } from "@/lib/types";
import { toast } from "sonner";

const ADMIN_NAV = [
  { label: "Dashboard", path: "/admin" },
  { label: "All Complaints", path: "/admin/complaints" },
  { label: "Map", path: "/admin/map" },
];

const AdminMap = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const c = await getComplaints();
      setComplaints(c);
    } catch {
      toast.error("Cannot reach backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleLogout = () => {
    sessionStorage.removeItem("fussfree_admin");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AdminGuard>
      <Layout navLinks={ADMIN_NAV} isAdmin onLogout={handleLogout}>
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Complaint Map</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Geographic view of all reported incidents across campus.
            </p>
          </div>
          <LocationMap complaints={complaints} />
        </div>
      </Layout>
    </AdminGuard>
  );
};

export default AdminMap;
