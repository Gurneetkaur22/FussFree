import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import LocationMap from "@/components/LocationMap";
import { getComplaints } from "@/lib/store";
import { Complaint } from "@/lib/types";
import { toast } from "sonner";

const USER_NAV = [
  { label: "Dashboard", path: "/user" },
  { label: "My Complaints", path: "/user/complaints" },
  { label: "Map", path: "/user/map" },
  { label: "Contacts", path: "/user/contacts" },
];

const UserMap = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Layout navLinks={USER_NAV}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Live Complaint Map</h2>
        <p className="text-muted-foreground text-sm">
          Blue marker shows your live location. Red markers show reported complaint locations.
        </p>
        <LocationMap complaints={complaints} />
      </div>
    </Layout>
  );
};

export default UserMap;
