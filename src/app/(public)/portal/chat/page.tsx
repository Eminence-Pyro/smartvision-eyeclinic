"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Loader2, Phone, Video } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; id: string; }

const QUICK_PROMPTS = [
  "What services do you offer?",
  "How do I book an appointment?",
  "What is phacoemulsification?",
  "What are your opening hours?",
  "How do I prepare for eye surgery?",
  "What is glaucoma?",
];

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello ${session?.user?.name?.split(" ")[0] || "there"}! 👋 I'm Zinny, your Anya Eye Clinic assistant.

I can answer questions about our services, help you understand procedures, guide you on appointments, and more.

For medical emergencies, please call us directly. How can I help you today?`,
    }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/portal/login");
  }, [status, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: Message = { id: `u_${Date.now()}`, role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: `a_${Date.now()}`, role: "assistant",
        content: data.reply || "Sorry, I'm having trouble right now. Please try again.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`, role: "assistant",
        content: "Connection error. Please check your internet and try again.",
      }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/portal/dashboard" className="text-gray-400 hover:text-brand"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 brand-gradient rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Zinny</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">Anya Eye Clinic AI · Online</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/portal/appointments"
              className="flex items-center gap-1.5 text-xs border border-brand text-brand px-3 py-1.5 rounded-xl font-semibold hover:bg-brand-50">
              <Video className="h-3.5 w-3.5" /> Book Telemedicine
            </Link>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full px-4 py-6 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "brand-gradient text-white rounded-br-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
            }`}>
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-brand" />
              <span className="text-gray-500 text-sm">Zinny is typing…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts (show only at start) */}
      {messages.length <= 1 && (
        <div className="max-w-3xl mx-auto w-full px-4 pb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)}
              className="text-xs px-3 py-1.5 bg-white border border-brand-200 text-brand rounded-full hover:bg-brand-50 transition-colors">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-4 flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask Zinny anything about Anya Eye Clinic…"
            disabled={loading}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand disabled:opacity-60"
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="brand-gradient text-white rounded-xl px-5 disabled:opacity-60 transition-all">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
