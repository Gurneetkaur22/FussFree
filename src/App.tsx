import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

import UserDashboard from "./pages/user/UserDashboard";
import UserComplaints from "./pages/user/UserComplaints";
import UserMap from "./pages/user/UserMap";
import UserContacts from "./pages/user/UserContacts";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminMap from "./pages/admin/AdminMap";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Home />} />

        {/* User routes */}
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/user/complaints" element={<UserComplaints />} />
        <Route path="/user/map" element={<UserMap />} />
        <Route path="/user/contacts" element={<UserContacts />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />
        <Route path="/admin/map" element={<AdminMap />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
