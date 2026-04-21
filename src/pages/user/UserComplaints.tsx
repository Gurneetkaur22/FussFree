import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintList from "@/components/ComplaintList";
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

const UserComplaints = () => {
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
      toast.error("Cannot reach backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Layout navLinks={USER_NAV}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">My Complaints</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplaintForm onSubmit={refresh} onSOS={() => setShowSOS(true)} />
          <ComplaintList complaints={complaints} onUpdate={refresh} />
        </div>
      </div>
      {showSOS && <SOSModal contacts={contacts} onClose={() => setShowSOS(false)} />}
    </Layout>
  );
};

export default UserComplaints;
