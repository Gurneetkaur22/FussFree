import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintList from "@/components/ComplaintList";
import ComplaintCharts from "@/components/ComplaintCharts";
import SOSModal from "@/components/SOSModal";
import { getComplaints, getContacts } from "@/lib/store";
import { Complaint, Contact } from "@/lib/types";
import { toast } from "sonner";

const USER_NAV = [
  { label: "Dashboard", path: "/user" },
  { label: "My Complaints", path: "/user/complaints" },
  { label: "Map", path: "/user/map" },
  { label: "Contacts", path: "/user/contacts" },
];

const UserDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSOS, setShowSOS] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [c, ct] = await Promise.all([getComplaints(), getContacts()]);
      setComplaints(c);
      setContacts(ct);
    } catch {
      toast.error("Cannot reach backend. Make sure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <Layout navLinks={USER_NAV}>
      <div className="space-y-6">
        {/* Stats & charts */}
        <ComplaintCharts complaints={complaints} />

        {/* Form + List side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplaintForm onSubmit={refresh} onSOS={() => setShowSOS(true)} />
          <ComplaintList complaints={complaints.slice(0, 5)} onUpdate={refresh} />
        </div>
      </div>

      {showSOS && <SOSModal contacts={contacts} onClose={() => setShowSOS(false)} />}
    </Layout>
  );
};

export default UserDashboard;
