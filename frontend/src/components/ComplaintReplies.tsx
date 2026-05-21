import { useState, useEffect, useCallback } from "react";
import { Send, Trash2, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ComplaintReply } from "@/lib/types";
import { getReplies, addReply, deleteReply } from "@/lib/store";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";

interface ComplaintRepliesProps {
  complaintId: string;
}

const ComplaintReplies = ({ complaintId }: ComplaintRepliesProps) => {
  const { isAdmin } = usePermissions();
  const [replies, setReplies] = useState<ComplaintReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchReplies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReplies(complaintId);
      setReplies(data);
    } catch {
      // silently fail — replies are optional
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    if (expanded) fetchReplies();
  }, [expanded, fetchReplies]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const reply = await addReply(complaintId, message.trim());
      setReplies((prev) => [...prev, reply]);
      setMessage("");
      toast.success("Reply sent.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (replyId: number) => {
    try {
      await deleteReply(complaintId, replyId);
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
      toast.success("Reply deleted.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete reply.");
    }
  };

  return (
    <div className="mt-3 border-t border-border/40 pt-3">
      {/* Toggle button */}
      <button
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {replies.length > 0 || expanded
          ? `${replies.length} Admin Reply${replies.length !== 1 ? "ies" : ""}`
          : "Admin Replies"}
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Existing replies */}
          {loading ? (
            <p className="text-xs text-muted-foreground animate-pulse">Loading replies…</p>
          ) : replies.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No replies yet.</p>
          ) : (
            <div className="space-y-2">
              {replies.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-primary text-xs mb-1">
                        🛡️ {r.adminName || "Admin"}
                        <span className="ml-2 text-muted-foreground font-normal">
                          {new Date(r.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </p>
                      <p className="text-card-foreground leading-relaxed">{r.message}</p>
                    </div>
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-danger/60 hover:text-danger hover:bg-danger/10 shrink-0"
                        onClick={() => handleDelete(r.id)}
                        title="Delete reply"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply input — admin only */}
          {isAdmin && (
            <div className="flex gap-2 mt-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a reply to the complainant…"
                className="text-sm min-h-[72px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend();
                }}
              />
              <Button
                size="sm"
                className="self-end shrink-0"
                onClick={handleSend}
                disabled={sending || !message.trim()}
              >
                {sending ? (
                  <span className="animate-pulse">…</span>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          {isAdmin && (
            <p className="text-xs text-muted-foreground">Ctrl+Enter to send quickly</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplaintReplies;
