import { MapPin, CheckCircle, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Complaint } from "@/lib/types";
import { resolveComplaint, deleteComplaint } from "@/lib/store";

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

const ComplaintList = ({ complaints, isAdmin = false, onUpdate }: ComplaintListProps) => {
  const handleResolve = async (id: string) => {
    await resolveComplaint(id);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await deleteComplaint(id);
    onUpdate();
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          📋 Complaints
          <Badge variant="secondary" className="ml-auto">{complaints.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {complaints.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No complaints yet.</p>
        )}
        {complaints.map((c) => (
          <div
            key={c.id}
            className="relative rounded-xl border-l-4 border-primary bg-secondary/30 p-4 transition-all hover:shadow-md"
          >
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <Badge className={categoryColors[c.category] || categoryColors.Other}>
                {c.category}
              </Badge>
              <Badge variant="outline" className={priorityColors[c.priority]}>
                {c.priority}
              </Badge>
            </div>

            <p className="font-medium text-card-foreground mb-2">{c.description}</p>

            {c.location && c.location !== "Not provided" && (
              <a
                href={`https://maps.google.com/?q=${c.location}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-2"
              >
                <MapPin className="h-3.5 w-3.5 text-danger" /> View Location
              </a>
            )}

            <div className="flex items-center justify-between mt-2">
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
                {isAdmin && c.status === "Pending" && (
                  <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10" onClick={() => handleResolve(c.id)}>
                    Resolve
                  </Button>
                )}
                {isAdmin && (
                  <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/10" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ComplaintList;
