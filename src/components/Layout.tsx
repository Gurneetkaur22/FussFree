import { ReactNode } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Shield, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

interface LayoutProps {
  children: ReactNode;
  isAdmin?: boolean;
  navLinks: { label: string; path: string }[];
  onLogout?: () => void;
}

const Layout = ({ children, isAdmin = false, navLinks, onLogout }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="gradient-header sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="gradient-primary rounded-xl p-2">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-primary-foreground">FussFree</span>
              {isAdmin && (
                <span className="text-xs bg-warning/20 text-warning-foreground border border-warning/30 rounded-full px-2 py-0.5 font-medium">
                  Admin
                </span>
              )}
            </div>

            {/* Nav links */}
            <nav className="hidden sm:flex items-center gap-1 bg-card/10 rounded-lg p-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      active
                        ? "bg-card/20 text-primary-foreground"
                        : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-card/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              <ThemeToggle className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-card/10" />
              <Button
                size="sm"
                variant="ghost"
                className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-card/10"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4 mr-1" /> Home
              </Button>
              {isAdmin && onLogout && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-card/10"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              )}
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="flex sm:hidden gap-1 mt-2 overflow-x-auto">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    active
                      ? "bg-card/20 text-primary-foreground"
                      : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-card/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="text-center py-3 text-xs text-muted-foreground border-t border-border">
        FussFree — Campus Safety Platform
      </footer>
    </div>
  );
};

export default Layout;
