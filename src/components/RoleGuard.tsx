import { ReactNode } from "react";
import { useAuth } from "@/lib/authContext";

interface RoleGuardProps {
  /** Required role(s). If the user doesn't have one, render fallback. */
  role: "admin" | "user" | ("admin" | "user")[];
  children: ReactNode;
  /** Optional fallback UI (default: nothing) */
  fallback?: ReactNode;
}

/**
 * RoleGuard — declarative role-based rendering.
 *
 * Usage:
 *   <RoleGuard role="admin">
 *     <AdminOnlyWidget />
 *   </RoleGuard>
 *
 *   <RoleGuard role={["admin", "user"]} fallback={<p>Not logged in</p>}>
 *     <AuthenticatedContent />
 *   </RoleGuard>
 */
const RoleGuard = ({ role, children, fallback = null }: RoleGuardProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <>{fallback}</>;

  const allowed = Array.isArray(role) ? role.includes(user.role) : user.role === role;
  return allowed ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;
