import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/authContext";

interface AccessDeniedProps {
  message?: string;
}

/**
 * Shown when a user tries to access a page they don't have permission for.
 */
const AccessDenied = ({ message = "You don't have permission to access this page." }: AccessDeniedProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-sm mx-auto px-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-danger/10 p-4">
            <ShieldX className="h-10 w-10 text-danger" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground text-sm">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button
            className="gradient-primary border-0"
            onClick={() => navigate(isAdmin ? "/admin" : "/user")}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
