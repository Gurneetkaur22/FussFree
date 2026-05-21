import { useAuth } from "@/lib/authContext";
import { Complaint } from "@/lib/types";

/**
 * Central hook for role-based access control.
 * Returns permission helpers based on the current user's role.
 */
export function usePermissions() {
  const { user, isAdmin, isAuthenticated } = useAuth();

  return {
    // ── Complaint permissions ──────────────────────────────────
    /** Admin sees all; user sees only their own (handled by API too) */
    canViewAllComplaints: isAdmin,

    /** Any authenticated user can submit complaints */
    canSubmitComplaint: isAuthenticated,

    /** Admin can resolve any; users cannot resolve */
    canResolveComplaint: isAdmin,

    /** Admin can delete any; user can delete their own pending complaints */
    canDeleteComplaint: (complaint: Complaint) => {
      if (!isAuthenticated) return false;
      if (isAdmin) return true;
      return (
        complaint.userId === String(user?.id) &&
        complaint.status === "Pending"
      );
    },

    // ── Contact permissions ────────────────────────────────────
    /** Both roles can view contacts */
    canViewContacts: isAuthenticated,

    /** Only admin can add/delete contacts */
    canManageContacts: isAuthenticated,

    // ── Admin area permissions ─────────────────────────────────
    canAccessAdminArea: isAdmin,

    // ── Utilities ─────────────────────────────────────────────
    isAdmin,
    isAuthenticated,
    currentUserId: user ? String(user.id) : null,
    currentUserName: user?.name ?? null,
    currentUserRole: user?.role ?? null,
  };
}
