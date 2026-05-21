import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, RefreshCw, Minimize2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/apiConfig";

const API = API_URL;

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  message: string;
  timestamp: Date;
  isTyping?: boolean;
}

const QUICK_REPLIES = [
  "How do I file a complaint?",
  "SOS / Emergency help",
  "Helpline numbers",
  "What is FussFree?",
  "I'm being bullied",
  "Ragging complaint",
];

// Renders markdown-lite: **bold**, line breaks, bullet points
function RenderMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        // Bold pattern
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        );
        // Bullet point
        if (line.startsWith("- ") || line.match(/^\d+\./)) {
          return (
            <div key={i} className="flex gap-1.5">
              <span className="mt-0.5 shrink-0 text-xs">•</span>
              <span>{rendered}</span>
            </div>
          );
        }
        return <p key={i}>{rendered}</p>;
      })}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// Generate a session id per browser session
const SESSION_ID = `session_${Math.random().toString(36).slice(2)}_${Date.now()}`;

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "bot",
  message:
    "👋 **Hi! I'm FussFree Assistant.**\n\nI'm here to help you with campus safety. Ask me about:\n- 🚨 Emergency / SOS\n- 📝 Filing a complaint\n- 📞 Helpline numbers\n- 🔒 Privacy & security\n\nOr pick a quick option below 👇",
  timestamp: new Date(),
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        message: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setShowQuickReplies(false);

      // Add typing indicator
      const typingId = `typing_${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: typingId, role: "bot", message: "", timestamp: new Date(), isTyping: true },
      ]);

      try {
        const res = await fetch(`${API}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, sessionId: SESSION_ID }),
        });
        const data = await res.json();

        // Remove typing indicator & add real response
        setMessages((prev) => {
          const without = prev.filter((m) => m.id !== typingId);
          return [
            ...without,
            {
              id: `bot_${Date.now()}`,
              role: "bot",
              message: data.message || "Sorry, I didn't get that. Try again!",
              timestamp: new Date(),
            },
          ];
        });

        if (!isOpen || isMinimized) setUnreadCount((c) => c + 1);
      } catch {
        setMessages((prev) => {
          const without = prev.filter((m) => m.id !== typingId);
          return [
            ...without,
            {
              id: `bot_${Date.now()}`,
              role: "bot",
              message:
                "⚠️ I'm having trouble connecting right now. Make sure the backend is running.\n\nFor emergencies, call **112** immediately.",
              timestamp: new Date(),
            },
          ];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isOpen, isMinimized]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  const handleReset = () => {
    setMessages([WELCOME_MSG]);
    setShowQuickReplies(true);
    setInput("");
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleMinimize = () => {
    setIsMinimized((v) => !v);
  };

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{ background: "var(--gradient-primary, linear-gradient(135deg,hsl(220,90%,56%),hsl(250,80%,60%)))" }}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-primary" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl border border-border bg-background transition-all duration-300 ${
            isMinimized ? "h-14 w-80" : "h-[560px] w-[380px] max-h-[90vh]"
          }`}
          style={{ maxWidth: "calc(100vw - 2rem)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-t-2xl cursor-pointer select-none"
            style={{ background: "var(--gradient-primary, linear-gradient(135deg,hsl(220,90%,56%),hsl(250,80%,60%)))" }}
            onClick={handleMinimize}
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">FussFree Assistant</p>
                <p className="text-[10px] text-white/70 leading-tight">
                  {isLoading ? "Typing…" : "Online · Campus Safety AI"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleReset}
                className="h-7 w-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset chat"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleMinimize}
                className="h-7 w-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <ChevronDown className="h-3.5 w-3.5 rotate-180" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                        msg.role === "bot"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {msg.role === "bot" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      }`}
                    >
                      {msg.isTyping ? (
                        <TypingDots />
                      ) : msg.role === "bot" ? (
                        <RenderMessage text={msg.message} />
                      ) : (
                        <p className="text-sm">{msg.message}</p>
                      )}
                      {!msg.isTyping && (
                        <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60 text-right" : "text-muted-foreground"}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              {showQuickReplies && (
                <div className="px-3 pb-2">
                  <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Quick questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLIES.map((r) => (
                      <button
                        key={r}
                        onClick={() => handleQuickReply(r)}
                        disabled={isLoading}
                        className="text-xs px-2.5 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-3 pb-3 pt-2 border-t border-border"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything…"
                  disabled={isLoading}
                  maxLength={1000}
                  className="flex-1 text-sm rounded-full border border-input bg-background px-4 py-2 outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                  style={{ background: "var(--gradient-primary, linear-gradient(135deg,hsl(220,90%,56%),hsl(250,80%,60%)))" }}
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
