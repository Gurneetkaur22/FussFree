import { useState } from "react";
import { Phone, Plus, Trash2, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/lib/types";
import { addContact, deleteContact } from "@/lib/store";
import { toast } from "sonner";

interface ContactsProps {
  contacts: Contact[];
  onUpdate: () => void;
}

const ContactsPanel = ({ contacts, onUpdate }: ContactsProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async () => {
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }
    try {
      await addContact({ name, email, phone: phone || undefined });
      toast.success("Contact added!");
      setName("");
      setEmail("");
      setPhone("");
      setShowForm(false);
      onUpdate();
    } catch {
      toast.error("Failed to add contact. Is the backend running?");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteContact(id);
    toast.success("Contact removed");
    onUpdate();
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-primary" /> Emergency Contacts
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-3">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Button size="sm" onClick={handleAdd} className="gradient-primary border-0 w-full">
              Save Contact
            </Button>
          </div>
        )}
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3" /> {c.email}
                </p>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="shrink-0 text-danger hover:bg-danger/10" onClick={() => handleDelete(c.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="text-center text-muted-foreground py-4 text-sm">No emergency contacts added.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsPanel;
