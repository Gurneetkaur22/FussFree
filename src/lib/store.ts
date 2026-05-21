import { Complaint, Contact } from "./types";

const API = "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("fussfree_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Complaints ────────────────────────────────────────────────────────────

export async function getComplaints(): Promise<Complaint[]> {
  const res = await fetch(`${API}/complaints`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch complaints");
  return res.json();
}

export async function addComplaint(
  complaint: Omit<Complaint, "id" | "status" | "createdAt" | "userId">
): Promise<Complaint> {
  const res = await fetch(`${API}/complaints`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(complaint),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add complaint");
  }
  return res.json();
}

export async function resolveComplaint(id: string): Promise<void> {
  const res = await fetch(`${API}/complaints/${id}/resolve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to resolve complaint");
  }
}

export async function deleteComplaint(id: string): Promise<void> {
  const res = await fetch(`${API}/complaints/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete complaint");
  }
}

// ─── Complaint Replies ──────────────────────────────────────────────────────

export async function getReplies(complaintId: string) {
  const res = await fetch(`${API}/complaints/${complaintId}/replies`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch replies");
  return res.json();
}

export async function addReply(complaintId: string, message: string) {
  const res = await fetch(`${API}/complaints/${complaintId}/replies`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add reply");
  }
  return res.json();
}

export async function deleteReply(complaintId: string, replyId: number) {
  const res = await fetch(`${API}/complaints/${complaintId}/replies/${replyId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete reply");
  }
}


export async function getContacts(): Promise<Contact[]> {
  const res = await fetch(`${API}/contacts`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

export async function addContact(
  contact: Omit<Contact, "id">
): Promise<Contact> {
  const res = await fetch(`${API}/contacts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(contact),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add contact");
  }
  return res.json();
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`${API}/contacts/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete contact");
  }
}

// ─── SOS ───────────────────────────────────────────────────────────────────

export async function sendSOS(payload: {
  senderName: string;
  location: string | null;
  contacts: { name: string; email: string; phone?: string }[];
}): Promise<{ success: boolean; message: string; emailConfigured: boolean; emailsSent: number }> {
  const res = await fetch(`${API}/sos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("SOS request failed");
  return res.json();
}
