import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintList from "@/components/ComplaintList";
import ContactsPanel from "@/components/ContactsPanel";
import ComplaintCharts from "@/components/ComplaintCharts";
import SOSModal from "@/components/SOSModal";
import AdminLogin from "@/components/AdminLogin";
import LocationMap from "@/components/LocationMap";
import { getComplaints, getContacts } from "@/lib/store";
import { Complaint, Contact, ViewMode } from "@/lib/types";
import { toast } from "sonner";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("user");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSOS, setShowSOS] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(
    () => sessionStorage.getItem("fussfree_admin") === "true"
  );

  const refresh = useCallback(async () => {
    try {
      const [c, ct] = await Promise.all([getComplaints(), getContacts()]);
      setComplaints(c);
      setContacts(ct);
    } catch {
      toast.error("Cannot reach backend. Make sure the backend server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleViewChange = (mode: ViewMode) => {
    if (mode === "admin" && !isAdminAuth) {
      setShowAdminLogin(true);
      return;
    }
    setViewMode(mode === "user" ? "user" : "admin");
  };

  const handleAdminLogin = () => {
    setIsAdminAuth(true);
    setShowAdminLogin(false);
    setViewMode("admin");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("fussfree_admin");
    setIsAdminAuth(false);
    setViewMode("user");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground text-sm">Connecting to backend…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        viewMode={viewMode}
        onViewChange={handleViewChange}
        isAdminAuth={isAdminAuth}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <ComplaintCharts complaints={complaints} isAdmin={viewMode === "admin"} />
        <LocationMap complaints={complaints} />

        {viewMode === "user" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ComplaintForm onSubmit={refresh} onSOS={() => setShowSOS(true)} />
              <ContactsPanel contacts={contacts} onUpdate={refresh} />
            </div>
            <ComplaintList complaints={complaints} onUpdate={refresh} />
          </div>
        ) : (
          <div className="space-y-6">
            <ComplaintList complaints={complaints} isAdmin onUpdate={refresh} />
          </div>
        )}
      </main>

      {showSOS && <SOSModal contacts={contacts} onClose={() => setShowSOS(false)} />}
      {showAdminLogin && (
        <AdminLogin onLogin={handleAdminLogin} onCancel={() => setShowAdminLogin(false)} />
      )}
    </div>
  );
};

export default Index;
