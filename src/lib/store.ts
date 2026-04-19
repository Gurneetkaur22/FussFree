import { Complaint, Contact } from "./types";

const API = "http://localhost:5000/api";

// ─── Complaints ────────────────────────────────────────────────────────────

export async function getComplaints(): Promise<Complaint[]> {
  const res = await fetch(`${API}/complaints`);
  if (!res.ok) throw new Error("Failed to fetch complaints");
  return res.json();
}

export async function addComplaint(
  complaint: Omit<Complaint, "id" | "status" | "createdAt">
): Promise<Complaint> {
  const res = await fetch(`${API}/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(complaint),
  });
  if (!res.ok) throw new Error("Failed to add complaint");
  return res.json();
}

export async function resolveComplaint(id: string): Promise<void> {
  const res = await fetch(`${API}/complaints/${id}/resolve`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to resolve complaint");
}

export async function deleteComplaint(id: string): Promise<void> {
  const res = await fetch(`${API}/complaints/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete complaint");
}

// ─── Contacts ──────────────────────────────────────────────────────────────

export async function getContacts(): Promise<Contact[]> {
  const res = await fetch(`${API}/contacts`);
  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
}

export async function addContact(
  contact: Omit<Contact, "id">
): Promise<Contact> {
  const res = await fetch(`${API}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });
  if (!res.ok) throw new Error("Failed to add contact");
  return res.json();
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`${API}/contacts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete contact");
}
