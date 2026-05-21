import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/authContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await adminLogin(email, password);
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
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
          <CardTitle className="text-xl font-bold text-primary-foreground">Admin Login</CardTitle>
          <p className="text-primary-foreground/70 text-sm mt-1">FussFree Admin Portal</p>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="gradient-primary border-0 w-full"
          >
            {loading ? "Signing in…" : "Login to Admin Portal"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Default: <span className="font-mono">admin@fussfree.com</span> / <span className="font-mono">admin123</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
