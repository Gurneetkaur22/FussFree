import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import ContactsPanel from "@/components/ContactsPanel";
import SOSModal from "@/components/SOSModal";
import { getContacts } from "@/lib/store";
import { Contact } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const USER_NAV = [
  { label: "Dashboard", path: "/user" },
  { label: "My Complaints", path: "/user/complaints" },
  { label: "Map", path: "/user/map" },
  { label: "Contacts", path: "/user/contacts" },
];

const UserContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSOS, setShowSOS] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const ct = await getContacts();
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
      <div className="space-y-6 max-w-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Emergency Contacts</h2>
          <Button
            className="gradient-danger border-0"
            onClick={() => setShowSOS(true)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" /> SOS
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Add trusted contacts you want to alert in an emergency. Press SOS to quickly call for help.
        </p>
        <ContactsPanel contacts={contacts} onUpdate={refresh} />
      </div>
      {showSOS && <SOSModal contacts={contacts} onClose={() => setShowSOS(false)} />}
    </Layout>
  );
};

export default UserContacts;
