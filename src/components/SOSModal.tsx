import { AlertTriangle, MapPin, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/lib/types";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface SOSModalProps {
  contacts: Contact[];
  onClose: () => void;
}

const SOSModal = ({ contacts, onClose }: SOSModalProps) => {
  const [location, setLocation] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`),
        () => setLocation("Location unavailable")
      );
    }
  }, []);

  const handleSend = () => {
    if (contacts.length === 0) {
      toast.error("No emergency contacts! Add contacts first.");
      return;
    }
    setIsSending(true);
    // Simulate sending SOS
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      toast.success(`🚨 SOS sent to ${contacts.length} contact(s)!`);
      // In production, this would call the backend API
      contacts.forEach((c) => {
        console.log(`SOS sent to ${c.name} (${c.email}) — Location: ${location}`);
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-danger/50 shadow-2xl">
        <CardHeader className="gradient-danger rounded-t-lg text-center relative">
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-2 text-danger-foreground/70 hover:text-danger-foreground hover:bg-danger-foreground/10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="mx-auto mb-2">
            <AlertTriangle className="h-12 w-12 text-danger-foreground animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-danger-foreground">
            🚨 Emergency SOS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Your Location</p>
            {location ? (
              <a
                href={`https://maps.google.com/?q=${location}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
              >
                <MapPin className="h-4 w-4 text-danger" /> {location}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground animate-pulse">Detecting location...</p>
            )}
          </div>

          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground mb-2">Alerting {contacts.length} contact(s):</p>
            <div className="space-y-1">
              {contacts.map((c) => (
                <p key={c.id} className="text-sm font-medium">{c.name} — {c.email}</p>
              ))}
              {contacts.length === 0 && (
                <p className="text-sm text-danger">No contacts added yet!</p>
              )}
            </div>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-success font-semibold text-lg">✅ SOS Sent Successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">Help is on the way</p>
            </div>
          ) : (
            <Button
              className="gradient-danger border-0 w-full h-12 text-lg font-bold"
              onClick={handleSend}
              disabled={isSending || !location}
            >
              {isSending ? (
                <>
                  <Send className="mr-2 h-5 w-5 animate-pulse" /> Sending SOS...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-5 w-5" /> SEND SOS NOW
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SOSModal;
