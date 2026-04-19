import { useState } from "react";
import { Shield, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const AdminLogin = ({ onLogin, onCancel }: AdminLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("fussfree_admin", "true");
      toast.success("Welcome, Admin!");
      onLogin();
    } else {
      toast.error("Invalid credentials. Try admin / admin123");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
      <Card className="w-full max-w-sm mx-4 shadow-2xl">
        <CardHeader className="gradient-primary rounded-t-lg text-center">
          <div className="mx-auto mb-2">
            <Shield className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-bold text-primary-foreground">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
          <div className="flex gap-2">
            <Button onClick={handleLogin} className="gradient-primary border-0 flex-1">
              Login
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Default: admin / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
