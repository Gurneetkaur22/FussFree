import { useState } from "react";
import { MapPin, Mic, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addComplaint } from "@/lib/store";
import { toast } from "sonner";

const CATEGORIES = ["Ragging", "Harassment", "Bullying", "Discrimination", "Cyberbullying", "Stalking", "Other"];

interface ComplaintFormProps {
  onSubmit: () => void;
  onSOS: () => void;
}

const ComplaintForm = ({ onSubmit, onSOS }: ComplaintFormProps) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const getLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
          toast.success("Location captured!");
        },
        () => {
          toast.error("Could not get location. Please enter manually.");
          setIsLocating(false);
        }
      );
    } else {
      toast.error("Geolocation not supported");
      setIsLocating(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setDescription(event.results[0][0].transcript);
      setIsListening(false);
      toast.success("Voice captured!");
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition failed");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSubmit = async () => {
    if (!category || !description || !priority) {
      toast.error("Please fill in category, description, and priority");
      return;
    }
    try {
      await addComplaint({
        category,
        description,
        location: location || "Not provided",
        priority: priority as "Low" | "Medium" | "High",
      });
      toast.success("Complaint submitted successfully!");
      setCategory("");
      setDescription("");
      setLocation("");
      setPriority("");
      onSubmit();
    } catch {
      toast.error("Failed to submit complaint. Is the backend running?");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Send className="h-5 w-5 text-primary" />
          Report Complaint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Textarea
            placeholder="Describe the incident..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={`absolute right-2 top-2 h-8 w-8 ${isListening ? "text-danger animate-pulse" : "text-muted-foreground"}`}
            onClick={startVoice}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Location (lat,lng)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={getLocation}
            disabled={isLocating}
            className="shrink-0"
          >
            <MapPin className={`h-4 w-4 ${isLocating ? "animate-pulse text-primary" : "text-danger"}`} />
          </Button>
        </div>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Select Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} className="gradient-primary border-0 flex-1">
            <Send className="mr-2 h-4 w-4" /> Submit
          </Button>
          <Button onClick={onSOS} className="gradient-danger border-0 flex-1">
            <AlertTriangle className="mr-2 h-4 w-4" /> SOS
          </Button>
          <Button onClick={startVoice} variant="secondary" className="flex-1" disabled={isListening}>
            <Mic className="mr-2 h-4 w-4" /> {isListening ? "Listening..." : "Voice"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplaintForm;
