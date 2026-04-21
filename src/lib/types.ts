export interface Complaint {
  id: string;
  category: string;
  description: string;
  location: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "Resolved";
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export type ViewMode = "user" | "admin";
