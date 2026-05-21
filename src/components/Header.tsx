import { Shield, LogOut } from "lucide-react";
import { ViewMode } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  isAdminAuth?: boolean;
  onLogout?: () => void;
}

const Header = ({ viewMode, onViewChange, isAdminAuth, onLogout }: HeaderProps) => {
  return (
    <header className="gradient-header sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="gradient-primary rounded-xl p-2">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary-foreground">
            FussFree
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-card/10 p-1">
            <Button
              size="sm"
              variant={viewMode === "user" ? "default" : "ghost"}
              onClick={() => onViewChange("user")}
              className={viewMode === "user" ? "gradient-primary text-primary-foreground border-0" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-card/10"}
            >
              User
            </Button>
            <Button
              size="sm"
              variant={viewMode === "admin" ? "default" : "ghost"}
              onClick={() => onViewChange("admin")}
              className={viewMode === "admin" ? "gradient-primary text-primary-foreground border-0" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-card/10"}
            >
              Admin
            </Button>
          </div>
          {isAdminAuth && viewMode === "admin" && onLogout && (
            <Button size="sm" variant="ghost" onClick={onLogout} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-card/10">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
