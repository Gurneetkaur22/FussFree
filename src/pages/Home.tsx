import { useNavigate } from "react-router-dom";
import { Shield, UserCircle, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="gradient-header shadow-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="gradient-primary rounded-xl p-2">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">FussFree</h1>
          </div>
          <ThemeToggle className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-card/10" />
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex items-center justify-center">
          <div className="gradient-primary rounded-full p-5 shadow-2xl">
            <Shield className="h-14 w-14 text-primary-foreground" />
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-3 text-foreground">Welcome to FussFree</h2>
        <p className="text-muted-foreground text-lg max-w-md mb-2">
          A safe platform to report ragging, harassment, and bullying incidents on campus.
        </p>
        <p className="text-muted-foreground text-sm max-w-sm mb-10">
          All complaints are handled confidentially. Your safety is our priority.
        </p>

        {/* Portal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
          {/* User Portal */}
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 border border-border hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 rounded-full p-4">
              <UserCircle className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">User Portal</h3>
              <p className="text-sm text-muted-foreground">
                File complaints, view your submissions, and access emergency contacts.
              </p>
            </div>
            <Button
              className="gradient-primary border-0 w-full"
              onClick={() => navigate("/user")}
            >
              Enter as User
            </Button>
          </div>

          {/* Admin Portal */}
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 border border-border hover:shadow-lg transition-shadow">
            <div className="bg-warning/10 rounded-full p-4">
              <Lock className="h-10 w-10 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Admin Portal</h3>
              <p className="text-sm text-muted-foreground">
                Manage complaints, view analytics, and resolve reported incidents.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-warning/40 text-warning hover:bg-warning/10"
              onClick={() => navigate("/admin/login")}
            >
              Enter as Admin
            </Button>
          </div>
        </div>

        {/* Emergency notice */}
        <div className="mt-10 flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-4 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>In immediate danger? Go to User Portal and press the SOS button.</span>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
        FussFree — Campus Safety Platform
      </footer>
    </div>
  );
};

export default Home;
