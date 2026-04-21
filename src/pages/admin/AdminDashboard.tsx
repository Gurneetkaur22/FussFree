import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import AdminGuard from "@/components/AdminGuard";
import ComplaintCharts from "@/components/ComplaintCharts";
import { getComplaints } from "@/lib/store";
import { Complaint } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, MapPin, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const ADMIN_NAV = [
  { label: "Dashboard", path: "/admin" },
  { label: "All Complaints", path: "/admin/complaints" },
  { label: "Map", path: "/admin/map" },
];

const AdminDashboard = () => {
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

  const pending = complaints.filter((c) => c.status === "Pending").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const high = complaints.filter((c) => c.priority === "High").length;

  return (
    <AdminGuard>
      <Layout navLinks={ADMIN_NAV} isAdmin onLogout={handleLogout}>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>

          {/* Quick stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <ClipboardList className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-primary">{complaints.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-warning mx-auto mb-1" />
                <p className="text-2xl font-bold text-warning">{pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-success mx-auto mb-1" />
                <p className="text-2xl font-bold text-success">{resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-danger mx-auto mb-1" />
                <p className="text-2xl font-bold text-danger">{high}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <ComplaintCharts complaints={complaints} isAdmin />

          {/* Quick action */}
          <div className="flex gap-4">
            <Button className="gradient-primary border-0" onClick={() => navigate("/admin/complaints")}>
              <ClipboardList className="h-4 w-4 mr-2" /> Manage All Complaints
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/map")}>
              <MapPin className="h-4 w-4 mr-2" /> View Map
            </Button>
          </div>
        </div>
      </Layout>
    </AdminGuard>
  );
};

export default AdminDashboard;
