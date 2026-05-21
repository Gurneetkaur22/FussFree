import { AlertTriangle, MapPin, Send, X, Vibrate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/lib/types";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { sendSOS } from "@/lib/store";

interface SOSModalProps {
  contacts: Contact[];
  onClose: () => void;
}

// Trigger device vibration using the Web Vibration API
function vibrate(pattern: number | number[]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

const SOSModal = ({ contacts, onClose }: SOSModalProps) => {
  const [location, setLocation] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(false);

  useEffect(() => {
    // Detect GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`),
        () => setLocation("Location unavailable")
      );
    }
    // Vibrate immediately when SOS modal opens so user knows it activated
    // Pattern: 400ms on, 100ms off, 400ms on
    vibrate([400, 100, 400]);
  }, []);

  const handleSend = async () => {
    if (contacts.length === 0) {
      toast.error("No emergency contacts! Add contacts first.");
      return;
    }

    setIsSending(true);

    // Vibrate SOS morse pattern (··· --- ···) while sending
    vibrate([100,80,100,80,100, 200, 300,80,300,80,300, 200, 100,80,100,80,100]);

    try {
      const result = await sendSOS({
        senderName: "FussFree User",
        location,
        contacts: contacts.map((c) => ({
          name:  c.name,
          email: c.email,
          phone: c.phone,
        })),
      });

      setSent(true);
      setEmailConfigured(result.emailConfigured);

      if (result.emailConfigured) {
        toast.success(`🚨 SOS email sent to ${result.emailsSent} contact(s)!`);
      } else {
        toast.success(`🚨 SOS alert triggered! ${contacts.length} contact(s) notified.`);
        toast.info("Configure EMAIL_USER in backend/.env to send real emails.");
      }

      // Final long vibration on success — tells the user the alert went through
      vibrate([1000]);

    } catch {
      toast.error("SOS failed — is the backend running on port 5000?");
      vibrate([200, 100, 200]); // error pattern
    } finally {
      setIsSending(false);
    }
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
          {/* Location */}
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Your Location</p>
            {location ? (
              location === "Location unavailable" ? (
                <p className="text-sm text-warning font-medium">{location}</p>
              ) : (
                <a
                  href={`https://maps.google.com/?q=${location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                >
                  <MapPin className="h-4 w-4 text-danger" /> {location}
                </a>
              )
            ) : (
              <p className="text-sm text-muted-foreground animate-pulse">Detecting location…</p>
            )}
          </div>

          {/* Contacts list */}
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Alerting {contacts.length} contact(s) via email:
            </p>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {contacts.map((c) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground text-xs">{c.email}</span>
                </div>
              ))}
              {contacts.length === 0 && (
                <p className="text-sm text-danger">No contacts added yet!</p>
              )}
            </div>
          </div>

          {/* Manual vibrate button */}
          <Button
            variant="outline"
            className="w-full border-warning/40 text-warning hover:bg-warning/10"
            onClick={() => {
              vibrate([300, 100, 300, 100, 300]);
              toast.info("📳 Device vibration triggered");
            }}
          >
            <Vibrate className="mr-2 h-4 w-4" /> Test Vibration Alert
          </Button>

          {/* Result or send button */}
          {sent ? (
            <div className="text-center py-3 space-y-1">
              <p className="text-success font-semibold text-lg">✅ SOS Sent Successfully!</p>
              {emailConfigured ? (
                <p className="text-sm text-muted-foreground">
                  Email alerts delivered + device vibrated
                </p>
              ) : (
                <div className="text-xs text-muted-foreground bg-secondary/50 rounded p-3 space-y-1">
                  <p className="font-medium">Call these contacts now:</p>
                  {contacts.map((c) => (
                    <p key={c.id}>
                      {c.name}
                      {c.phone && (
                        <span className="ml-2 text-primary font-mono">{c.phone}</span>
                      )}
                    </p>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                📳 Device vibration alert sent
              </p>
            </div>
          ) : (
            <Button
              className="gradient-danger border-0 w-full h-12 text-lg font-bold"
              onClick={handleSend}
              disabled={isSending || !location}
            >
              {isSending ? (
                <><Send className="mr-2 h-5 w-5 animate-pulse" /> Sending SOS…</>
              ) : (
                <><AlertTriangle className="mr-2 h-5 w-5" /> SEND SOS NOW</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SOSModal;
