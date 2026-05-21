import { useState, useMemo } from "react";
import { MapPin, CheckCircle, Clock, Trash2, User, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Complaint } from "@/lib/types";
import { resolveComplaint, deleteComplaint } from "@/lib/store";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import ComplaintReplies from "@/components/ComplaintReplies";

interface ComplaintListProps {
  complaints: Complaint[];
  isAdmin?: boolean;
  onUpdate: () => void;
}

const priorityColors: Record<string, string> = {
  High: "bg-danger/10 text-danger border-danger/30",
  Medium: "bg-warning/10 text-warning border-warning/30",
  Low: "bg-success/10 text-success border-success/30",
};

const categoryColors: Record<string, string> = {
  Ragging: "bg-danger text-danger-foreground",
  Harassment: "bg-warning text-warning-foreground",
  Bullying: "bg-primary text-primary-foreground",
  Discrimination: "bg-accent text-accent-foreground",
  Cyberbullying: "bg-destructive text-destructive-foreground",
  Stalking: "bg-danger text-danger-foreground",
  Other: "bg-muted text-muted-foreground",
};

const CATEGORIES = ["Ragging", "Harassment", "Bullying", "Discrimination", "Cyberbullying", "Stalking", "Other"];

const ComplaintList = ({ complaints, isAdmin = false, onUpdate }: ComplaintListProps) => {
  const perms = usePermissions();
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleResolve = async (id: string) => {
    try {
      await resolveComplaint(id);
      toast.success("Complaint resolved.");
      onUpdate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve complaint.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComplaint(id);
      toast.success("Complaint deleted.");
      onUpdate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete complaint.");
    }
  };

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (filterCategory !== "all" && c.category !== filterCategory) return false;
      if (filterPriority !== "all" && c.priority !== filterPriority) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      return true;
    });
  }, [complaints, filterCategory, filterPriority, filterStatus]);

  const hasActiveFilter = filterCategory !== "all" || filterPriority !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setFilterCategory("all");
    setFilterPriority("all");
    setFilterStatus("all");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-lg flex-1">
            📋 {isAdmin ? "All Complaints" : "My Complaints"}
            <Badge variant="secondary" className="ml-auto">
              {filtered.length}{filtered.length !== complaints.length ? `/${complaints.length}` : ""}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant={showFilters ? "default" : "outline"}
            className="gap-1"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilter && <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-1.5">!</span>}
          </Button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">🔴 High</SelectItem>
                <SelectItem value="Medium">🟡 Medium</SelectItem>
                <SelectItem value="Low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilter && (
              <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 text-muted-foreground" onClick={clearFilters}>
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {hasActiveFilter ? "No complaints match the selected filters." : "No complaints yet."}
          </p>
        )}

        {filtered.map((c) => (
          <div
            key={c.id}
            className="relative rounded-xl border-l-4 border-primary bg-secondary/30 p-4 transition-all hover:shadow-md"
          >
            {/* Top badges */}
            <div className="mb-2 flex flex-wrap items-start gap-2">
              <Badge className={categoryColors[c.category] || categoryColors.Other}>
                {c.category}
              </Badge>

              <Badge variant="outline" className={priorityColors[c.priority]}>
                {c.priority === "High" ? "🔴" : c.priority === "Medium" ? "🟡" : "🟢"} {c.priority}
              </Badge>

              {isAdmin && c.userId && (
                <Badge variant="outline" className="border-muted-foreground/30 text-xs text-muted-foreground">
                  <User className="mr-1 h-3 w-3" />
                  User #{c.userId}
                </Badge>
              )}
            </div>

            <p className="mb-2 font-medium text-card-foreground">{c.description}</p>

            {c.location && c.location !== "Not provided" && (
              <a
                href={`https://maps.google.com/?q=${c.location}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <MapPin className="h-3.5 w-3.5 text-danger" />
                View Location
              </a>
            )}

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(c.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2">
                {c.status === "Resolved" ? (
                  <span className="flex items-center gap-1 text-sm font-semibold text-success">
                    <CheckCircle className="h-4 w-4" /> Resolved
                  </span>
                ) : (
                  <span className="text-sm font-medium text-warning">Pending</span>
                )}

                {perms.canResolveComplaint && c.status === "Pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-success/30 text-success hover:bg-success/10"
                    onClick={() => handleResolve(c.id)}
                  >
                    Resolve
                  </Button>
                )}

                {perms.canDeleteComplaint(c) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:bg-danger/10"
                    onClick={() => handleDelete(c.id)}
                    title={perms.isAdmin ? "Delete complaint" : "Delete your pending complaint"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <ComplaintReplies complaintId={c.id} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ComplaintList;
