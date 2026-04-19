import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { chat as chatApi } from "../services/api";
import { connectSocket, sendMessage, emitTyping, emitStopTyping, disconnectSocket } from "../services/socket";

interface Message {
  _id: string;
  text: string;
  sender: { id: string; role: string; name: string };
  createdAt: string;
  read: boolean;
}

interface Conversation {
  conversationId: string;
  partner: { id: string; name: string; subtitle: string; role: string };
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

export default function ChatWidget() {
  const { farmerUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "chat">("list");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Connect socket on mount
  useEffect(() => {
    try {
      const socket = connectSocket();

      socket.on("receive_message", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
        // If chat is not open or different conversation, increment unread
        if (!open || msg.sender.role !== "lender") return;
        setUnreadTotal((prev) => Math.max(0, prev));
      });

      socket.on("message_sent", (msg: Message) => {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });

      socket.on("partner_typing", () => setPartnerTyping(true));
      socket.on("partner_stop_typing", () => setPartnerTyping(false));

      return () => {
        disconnectSocket();
      };
    } catch {
      // No token yet
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  // Fetch conversations when opening
  useEffect(() => {
    if (open && view === "list") {
      setLoading(true);
      chatApi.getConversations("farmer")
        .then((data) => setConversations(data.conversations || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, view]);

  // Fetch unread count
  useEffect(() => {
    chatApi.getUnread("farmer")
      .then((data) => setUnreadTotal(data.unread || 0))
      .catch(() => {});
  }, [open]);

  const openChat = async (conv: Conversation) => {
    setActiveConv(conv);
    setView("chat");
    setLoading(true);
    try {
      const data = await chatApi.getMessages(conv.partner.id, "farmer");
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    }
    setLoading(false);
  };

  const handleSend = () => {
    if (!input.trim() || !activeConv) return;
    sendMessage(activeConv.partner.id, "lender", input.trim(), farmerUser?.name || "Farmer");
    setInput("");
    emitStopTyping(activeConv.partner.id, "lender");
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!activeConv) return;
    if (val.trim()) {
      emitTyping(activeConv.partner.id, "lender");
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(activeConv.partner.id, "lender");
      }, 2000);
    } else {
      emitStopTyping(activeConv.partner.id, "lender");
    }
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <>
      {/* FLOATING BUBBLE */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-full bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && unreadTotal > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C0392B] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadTotal}
          </div>
        )}
      </button>

      {/* CHAT PANEL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 md:bottom-24 right-6 w-[340px] h-[440px] bg-white dark:bg-[#1A3A1A] rounded-[16px] shadow-2xl border border-[#1A3A1A]/10 dark:border-white/10 flex flex-col overflow-hidden z-50"
          >
            {/* HEADER */}
            <div className="h-14 bg-[#1A3A1A] dark:bg-[#0D1A0D] flex items-center px-4 gap-3 shrink-0">
              {view === "chat" && (
                <button onClick={() => { setView("list"); setActiveConv(null); }} className="text-white/80 hover:text-white">
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-[14px] font-medium truncate">
                  {view === "chat" ? activeConv?.partner.name : "Messages"}
                </h3>
                {view === "chat" && partnerTyping && (
                  <span className="text-[#64B43C] text-[11px]">typing...</span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={24} className="animate-spin text-[#64B43C]" />
                </div>
              ) : view === "list" ? (
                /* CONVERSATION LIST */
                conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <MessageCircle size={40} className="text-[#E8F5E0] dark:text-white/20 mb-3" />
                    <p className="text-[13px] text-[#6B7B5E] dark:text-white/60">No messages yet. Lenders will contact you when they review your loan application.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {conversations.map((conv) => (
                      <button
                        key={conv.conversationId}
                        onClick={() => openChat(conv)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#E8F5E0] dark:hover:bg-white/5 transition-colors text-left border-b border-[#1A3A1A]/5 dark:border-white/5"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#1A3A1A] dark:bg-[#64B43C] flex items-center justify-center text-white dark:text-[#1A3A1A] text-[12px] font-bold shrink-0">
                          {conv.partner.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-medium text-[#1A3A1A] dark:text-white truncate">{conv.partner.name}</span>
                            <span className="text-[10px] text-[#6B7B5E] dark:text-white/40 shrink-0">{timeAgo(conv.lastTime)}</span>
                          </div>
                          <p className="text-[12px] text-[#6B7B5E] dark:text-white/50 truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="w-5 h-5 rounded-full bg-[#64B43C] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                /* MESSAGE VIEW */
                <div className="flex flex-col gap-2 p-3">
                  {messages.map((msg) => {
                    const isMine = msg.sender.role === "farmer";
                    return (
                      <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-[12px] text-[13px] ${
                          isMine
                            ? "bg-[#1A3A1A] text-white rounded-br-[4px]"
                            : "bg-[#E8F5E0] dark:bg-white/10 text-[#1A3A1A] dark:text-white rounded-bl-[4px]"
                        }`}>
                          {msg.text}
                          <div className={`text-[9px] mt-1 ${isMine ? "text-white/50" : "text-[#6B7B5E] dark:text-white/40"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {partnerTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#E8F5E0] dark:bg-white/10 px-3 py-2 rounded-[12px] rounded-bl-[4px] text-[13px] text-[#6B7B5E] dark:text-white/50">
                        <span className="animate-pulse">typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* INPUT BAR (chat view only) */}
            {view === "chat" && (
              <div className="h-14 border-t border-[#1A3A1A]/10 dark:border-white/10 flex items-center px-3 gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 h-9 px-3 rounded-[8px] bg-[#FAFBF7] dark:bg-[#111E11] border border-[#1A3A1A]/10 dark:border-white/10 text-[13px] text-[#1A3A1A] dark:text-white outline-none focus:border-[#64B43C]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-full bg-[#1A3A1A] dark:bg-[#64B43C] text-white dark:text-[#1A3A1A] flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
