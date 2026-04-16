import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

const FAQ: Record<string, string> = {
  "hostel timings": "Hostel gates close at 10:00 PM and open at 6:00 AM. Late entry requires warden permission.",
  "mess timings": "Breakfast: 7:30–9:00 AM | Lunch: 12:30–2:00 PM | Dinner: 7:30–9:00 PM",
  "wifi password": "Contact the hostel office for Wi-Fi credentials. Default network: HostelNet.",
  "warden contact": "Warden: Dr. Sharma — Phone: +91 98765 43210 — Office: Admin Block, Room 102.",
  "fees": "Monthly hostel fee is approximately ₹4,250 including mess, Wi-Fi, and utilities.",
  "complaint": "You can raise a complaint from the Complaints section in the sidebar. Select a category and describe your issue.",
  "attendance": "Your attendance is tracked daily. Check the Attendance section for your calendar view and stats.",
  "bill": "Your current bill is ₹4,250. Check the Bills section for a detailed breakdown.",
};

const findAnswer = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(FAQ)) {
    if (lower.includes(key)) return val;
  }
  return "I'm not sure about that. Try asking about hostel timings, mess timings, wifi, fees, complaints, attendance, or bills.";
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hi! I'm HostelBot 🏠 Ask me about timings, fees, complaints, or anything hostel-related!", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: input, sender: "user" };
    const botMsg: Message = { id: (Date.now() + 1).toString(), text: findAnswer(input), sender: "bot" };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#7c5cbf] text-primary-foreground shadow-elevated flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-card rounded-xl border border-border shadow-elevated animate-scale-in flex flex-col" style={{ height: "28rem" }}>
          <div className="px-4 py-3 border-b border-border gradient-primary rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary-foreground" />
              <span className="font-semibold text-primary-foreground">HostelBot</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.sender === "user" ? "justify-end" : ""}`}>
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                  m.sender === "user"
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}>
                  {m.text}
                </div>
                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-border">
            <form
              onSubmit={e => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about hostel..."
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="submit" className="p-2 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
