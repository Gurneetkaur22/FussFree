import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("fussfree_admin", "true");
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } else {
      toast.error("Invalid credentials. Try admin / admin123");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Back button */}
      <div className="w-full max-w-sm mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
        </Button>
      </div>

      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="gradient-primary rounded-t-lg text-center pb-6">
          <div className="mx-auto mb-3 bg-white/20 rounded-full p-3 w-fit">
            <Shield className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-bold text-primary-foreground">
            Admin Login
          </CardTitle>
          <p className="text-primary-foreground/70 text-sm mt-1">
            FussFree Admin Portal
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="gradient-primary border-0 w-full"
          >
            Login to Admin Portal
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Default credentials: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
