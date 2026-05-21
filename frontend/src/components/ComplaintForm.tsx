import { useState } from "react";
import { MapPin, Mic, AlertTriangle, Send, Bot } from "lucide-react";
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

const PRIORITY_KEYWORDS: Record<"High" | "Medium", string[]> = {
  High: ["violence", "weapon", "knife", "gun", "beat", "hit", "assault", "rape", "threat", "kill", "blood", "attack"],
  Medium: ["bully", "harass", "stalk", "follow", "intimidate", "pressure", "force", "abuse", "discriminate"],
};

function keywordFallback(category: string, description: string): "High" | "Medium" | "Low" {
  const text = (category + " " + description).toLowerCase();
  if (PRIORITY_KEYWORDS.High.some((kw) => text.includes(kw))) return "High";
  if (PRIORITY_KEYWORDS.Medium.some((kw) => text.includes(kw))) return "Medium";
  return "Low";
}

async function detectPriorityWithAI(category: string, description: string): Promise<"High" | "Medium" | "Low"> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      system:
        "You are a school complaint severity classifier. Given a complaint category and description, reply with exactly one word: High, Medium, or Low. Nothing else.",
      messages: [
        {
          role: "user",
          content: `Category: ${category}\nDescription: ${description}\n\nPriority:`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error("API error");
  const data = await response.json();
  const text: string = data.content?.[0]?.text?.trim() ?? "";
  if (text === "High" || text === "Medium" || text === "Low") return text;
  throw new Error("Unexpected AI response: " + text);
}

const PRIORITY_EMOJI: Record<string, string> = { High: "🔴", Medium: "🟡", Low: "🟢" };

const ComplaintForm = ({ onSubmit, onSOS }: ComplaintFormProps) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedPriority, setDetectedPriority] = useState<string | null>(null);

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
    if (!category || !description) {
      toast.error("Please fill in category and description");
      return;
    }

    setIsSubmitting(true);
    setDetectedPriority(null);

    // Step 1: Detect priority
    toast("🤖 AI is detecting priority…", { duration: 3000 });
    let priority: "High" | "Medium" | "Low";
    try {
      priority = await detectPriorityWithAI(category, description);
    } catch {
      priority = keywordFallback(category, description);
      toast.warning("⚠️ AI unavailable — using keyword detection", { duration: 3000 });
    }

    setDetectedPriority(priority);

    // Step 2: Submit
    try {
      await addComplaint({
        category,
        description,
        location: location || "Not provided",
        priority,
      });
      toast.success(`✨ AI detected priority: ${PRIORITY_EMOJI[priority]} ${priority} — Complaint submitted!`);
      setCategory("");
      setDescription("");
      setLocation("");
      setDetectedPriority(null);
      onSubmit();
    } catch {
      toast.error("Failed to submit complaint. Is the backend running?");
    } finally {
      setIsSubmitting(false);
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

        {/* AI Priority Banner */}
        {isSubmitting && !detectedPriority && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            <Bot className="h-4 w-4 animate-pulse" />
            AI is detecting priority…
          </div>
        )}
        {detectedPriority && (
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium
            ${detectedPriority === "High" ? "border-danger/30 bg-danger/10 text-danger" :
              detectedPriority === "Medium" ? "border-warning/30 bg-warning/10 text-warning" :
              "border-success/30 bg-success/10 text-success"}`}>
            <Bot className="h-4 w-4" />
            ✨ AI detected priority: {PRIORITY_EMOJI[detectedPriority]} {detectedPriority}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            className="gradient-primary border-0 flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><span className="animate-spin mr-2">⏳</span> Detecting…</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Submit</>
            )}
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
