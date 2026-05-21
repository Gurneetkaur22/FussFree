export interface Complaint {
  id: string;
  userId: string | null;
  category: string;
  description: string;
  location: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "Resolved";
  createdAt: string;
}

export interface ComplaintReply {
  id: number;
  complaint_id: number;
  message: string;
  createdAt: string;
  adminName: string | null;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export type ViewMode = "user" | "admin";
