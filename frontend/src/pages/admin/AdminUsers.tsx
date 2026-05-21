import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import AdminGuard from "@/components/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Shield, ShieldOff, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/authContext";
import { API_URL } from "@/lib/apiConfig";

const ADMIN_NAV = [
  { label: "Dashboard", path: "/admin" },
  { label: "All Complaints", path: "/admin/complaints" },
  { label: "Map", path: "/admin/map" },
  { label: "Users", path: "/admin/users" },
];

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

const API = API_URL;

const AdminUsers = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Cannot fetch users. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleRoleToggle = async (u: ManagedUser) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`${API}/users/${u.id}/role`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update role");
      }
      toast.success(`${u.name} is now ${newRole === "admin" ? "an Admin" : "a User"}`);
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleDelete = async (u: ManagedUser) => {
    try {
      const res = await fetch(`${API}/users/${u.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }
      toast.success(`${u.name} deleted`);
      refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <AdminGuard>
      <Layout navLinks={ADMIN_NAV} isAdmin>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> User Management
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Promote users to admin, demote admins, or remove accounts.
            </p>
          </div>

          {/* Summary stats */}
          <div className="flex gap-4">
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm">
              <span className="font-bold text-primary">{adminCount}</span>
              <span className="text-muted-foreground ml-1">Admins</span>
            </div>
            <div className="rounded-lg bg-secondary/50 border border-border px-4 py-2 text-sm">
              <span className="font-bold text-foreground">{userCount}</span>
              <span className="text-muted-foreground ml-1">Users</span>
            </div>
            <div className="rounded-lg bg-secondary/50 border border-border px-4 py-2 text-sm">
              <span className="font-bold text-foreground">{users.length}</span>
              <span className="text-muted-foreground ml-1">Total</span>
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">All Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-3 gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">{u.name}</span>
                          {isSelf && (
                            <Badge variant="outline" className="text-xs text-primary border-primary/30">
                              You
                            </Badge>
                          )}
                          <Badge
                            className={
                              u.role === "admin"
                                ? "bg-warning/20 text-warning-foreground border border-warning/30 text-xs"
                                : "bg-secondary text-muted-foreground border border-border text-xs"
                            }
                          >
                            {u.role === "admin" ? "⚙ Admin" : "👤 User"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{u.email}</p>
                        <p className="text-xs text-muted-foreground/60">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Role toggle */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSelf}
                          title={isSelf ? "Cannot change your own role" : u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          onClick={() => handleRoleToggle(u)}
                          className={
                            u.role === "admin"
                              ? "text-warning border-warning/30 hover:bg-warning/10"
                              : "text-primary border-primary/30 hover:bg-primary/10"
                          }
                        >
                          {u.role === "admin" ? (
                            <><ShieldOff className="h-3.5 w-3.5 mr-1" /> Demote</>
                          ) : (
                            <><Shield className="h-3.5 w-3.5 mr-1" /> Promote</>
                          )}
                        </Button>
                        {/* Delete */}
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={isSelf}
                          title={isSelf ? "Cannot delete yourself" : "Delete user"}
                          onClick={() => handleDelete(u)}
                          className="text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {users.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No users found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AdminGuard>
  );
};

export default AdminUsers;
