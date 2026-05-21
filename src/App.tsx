import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authContext";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import UserLogin from "./pages/user/UserLogin";

import UserDashboard from "./pages/user/UserDashboard";
import UserComplaints from "./pages/user/UserComplaints";
import UserMap from "./pages/user/UserMap";
import UserContacts from "./pages/user/UserContacts";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminMap from "./pages/admin/AdminMap";

import AdminGuard from "./components/AdminGuard";
import ChatBot from "./components/ChatBot";
import UserGuard from "./components/UserGuard";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<Register />} />

          {/* User routes — protected */}
          <Route path="/user" element={<UserGuard><UserDashboard /></UserGuard>} />
          <Route path="/user/complaints" element={<UserGuard><UserComplaints /></UserGuard>} />
          <Route path="/user/map" element={<UserGuard><UserMap /></UserGuard>} />
          <Route path="/user/contacts" element={<UserGuard><UserContacts /></UserGuard>} />

          {/* Admin routes — protected */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/complaints" element={<AdminGuard><AdminComplaints /></AdminGuard>} />
          <Route path="/admin/map" element={<AdminGuard><AdminMap /></AdminGuard>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ChatBot />
    </TooltipProvider>
  </AuthProvider>
);

export default App;
