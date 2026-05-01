"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  Wifi,
  BatteryFull,
  Signal,
  ChevronLeft,
  MoreVertical,
  Video,
  Phone,
  Search,
  Smile,
  Paperclip,
  Camera,
  Mic,
  Check,
  CheckCheck,
  Lock,
  ArrowDown,
} from "lucide-react";

/* ──────────────────── Types ──────────────────── */
interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: string;
  read?: boolean;
}

/* ──────────────────── Mock Data ──────────────────── */
const mockAIResponses = [
  "Bonjour ! 😊 Merci pour votre message. Je suis là pour vous aider. Qu'est-ce que je peux faire pour vous aujourd'hui ?",
  "Bien sûr ! Nous avons plusieurs articles disponibles. Voici nos meilleurs produits :\n\n👗 Robes Wax — 5 000 FCFA\n🧣 Foulards — 3 500 FCFA\n Fascinatrice — 2 000 FCFA\n\nLaquelle vous intéresse ?",
  "Parfait choix ! 🎉 Je vous prépare le récapitulatif de votre commande.\n\n🧾 Commande #1248\n• 2x Robes Wax : 10 000 FCFA\n• 1x Pagne Tissé : 4 000 FCFA\n📦 Livraison à Dakar : 1 500 FCFA\n\n💰 Total : 15 500 FCFA\n\nVoulez-vous confirmer ?",
  "Votre commande a été confirmée avec succès ! ✅\n\nVous recevrez une confirmation par WhatsApp sous peu. La livraison est prévue sous 24-48h.\n\nMerci pour votre confiance ! 🙏",
  "Bien sûr, voici le suivi de votre commande #1247 :\n\n📦 Statut : En cours de livraison\n🚚 Livreur : Mamadou Diop\n📍 Position : Médina, Dakar\n⏰ Arrivée estimée : Aujourd'hui entre 14h et 17h",
  "Notre politique de prix est très flexible. 💡\n\nPour les commandes de plus de 3 articles, nous offrons une remise de 10%. Pour les commandes en gros (10+ articles), c'est 20% de réduction.",
  "Merci pour votre confiance ! N'hésitez pas à me contacter à tout moment. Je suis disponible 24h/24. 😊",
];

const initialMessages: Message[] = [
  {
    id: "init-1",
    text: "Bonjour ! 👋 Je suis Sophia, l'assistante de Golaine Boutique. Comment puis-je vous aider aujourd'hui ?",
    sender: "agent",
    timestamp: "10:30",
    read: true,
  },
  {
    id: "init-2",
    text: "Bonjour Sophia ! Je voudrais voir vos robes wax disponibles. C'est pour une commande.",
    sender: "user",
    timestamp: "10:30",
    read: true,
  },
  {
    id: "init-3",
    text: "Avec plaisir ! 🎉 Voici notre collection de robes wax :\n\n👗 S-400 — Ankara Premium : 7 500 FCFA\n👗 S-401 — Wax Hollandais : 5 500 FCFA\n👗 S-402 — Bazin Riche : 12 000 FCFA\n👗 S-403 — Wax Imprimé Tropical : 6 000 FCFA\n\nToutes les tailles sont disponibles (S, M, L, XL). Laquelle vous plaît le plus ?",
    sender: "agent",
    timestamp: "10:31",
    read: true,
  },
];

/* ──────────────────── Helpers ──────────────────── */
function getTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

/* ──────────────────── Typing Indicator ──────────────────── */
function WATypingIndicator() {
  return (
    <div className="wa-typing">
      <div className="wa-typing-dot" />
      <div className="wa-typing-dot" />
      <div className="wa-typing-dot" />
    </div>
  );
}

/* ──────────────────── Main Component ──────────────────── */
export default function TesterAgentPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Auto-scroll to bottom */
  useEffect(() => {
    if (chatContainerRef.current) {
      const el = chatContainerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isTyping]);

  /* Track scroll position for scroll-to-bottom button */
  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const el = chatContainerRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  /* Cleanup timeout on unmount */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /* Focus input on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* Send message */
  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: "user",
      timestamp: getTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    /* Auto-resize textarea back to single line */
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const delay = 1200 + Math.random() * 1000;
    timeoutRef.current = setTimeout(() => {
      /* Keyword-based contextual response selection */
      const lowerText = text.toLowerCase();
      let response: string;

      if (lowerText.includes("prix") || lowerText.includes("combien") || lowerText.includes("coût") || lowerText.includes("tarif")) {
        response = "Voici nos prix :\n\n👗 Robes Wax — à partir de 5 000 FCFA\n🧣 Pagnes Tissé — 8 000 FCFA\n💅 Huile d'Argan Bio — 12 000 FCFA\n👜 Sac À Main — 6 500 FCFA\n\nLaquelle vous intéresse ?";
      } else if (lowerText.includes("livraison") || lowerText.includes("commande") || lowerText.includes("envoyer")) {
        response = "Voici le suivi de votre commande :\n\n📦 Statut : En cours de préparation\n🚚 Livraison prévue sous 24-48h\n📍 Dakar et environs\n\nVoulez-vous commander autre chose ?";
      } else if (lowerText.includes("merci") || lowerText.includes("super") || lowerText.includes("parfait")) {
        response = "De rien ! 😊 Merci pour votre confiance. N'hésitez pas à me contacter à tout moment si vous avez d'autres questions. Je suis disponible 24h/24 ! 🙏";
      } else if (lowerText.includes("bonjour") || lowerText.includes("salut") || lowerText.includes("hello")) {
        response = "Bonjour ! 😊 Bienvenue chez Golaine Boutique ! Je suis Sophia, votre assistante virtuelle.\n\nComment puis-je vous aider aujourd'hui ? Je peux vous présenter nos produits, gérer vos commandes ou répondre à vos questions.";
      } else {
        response = mockAIResponses[responseIndex % mockAIResponses.length];
      }

      const agentMsg: Message = {
        id: `msg-${Date.now()}-agent`,
        text: response,
        sender: "agent",
        timestamp: getTimestamp(),
        read: true,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
      setResponseIndex((prev) => prev + 1);
    }, delay);
  };

  /* Auto-resize textarea */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 100) + "px";
  };

  /* Key press */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Scroll to bottom */
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* ── Page Header ── */}
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Tester l&apos;agent IA
        </h1>
      </div>

      {/* ── Phone Mockup Container ── */}
      <div className="flex-1 flex items-center justify-center py-4">
        {/* ── Phone Mockup ── */}
        <div className="relative flex-shrink-0">
          <div className="phone-frame">
            <div className="phone-screen">
              {/* Notch */}
              <div className="phone-notch" />

              {/* Status Bar */}
              <div className="phone-status-bar">
                <span>{getTimestamp()}</span>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <BatteryFull className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* WhatsApp Header */}
              <div className="wa-header">
                <button className="wa-icon-btn !w-8 !h-8">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-[#e9edef] truncate">
                    Sophia — Agent IA
                  </p>
                  <p className="text-[12px] text-[#8696a0]">
                    {isTyping ? "en train d'écrire..." : "en ligne"}
                  </p>
                </div>
                <div className="flex items-center gap-0">
                  <button className="wa-icon-btn !w-9 !h-9">
                    <Video className="w-[19px] h-[19px]" />
                  </button>
                  <button className="wa-icon-btn !w-9 !h-9">
                    <Phone className="w-[19px] h-[19px]" />
                  </button>
                  <button className="wa-icon-btn !w-9 !h-9">
                    <Search className="w-[19px] h-[19px]" />
                  </button>
                  <button className="wa-icon-btn !w-9 !h-9">
                    <MoreVertical className="w-[19px] h-[19px]" />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div
                ref={chatContainerRef}
                onScroll={handleChatScroll}
                className="wa-chat-bg"
              >
                {/* Encryption notice */}
                <div className="wa-encryption">
                  <Lock className="w-3 h-3 flex-shrink-0" />
                  <span>Les messages sont chiffrés de bout en bout.</span>
                </div>

                {/* Date chip */}
                <div className="wa-date-chip">
                  Aujourd&apos;hui
                </div>

                {/* Messages */}
                {messages.map((msg) => (
                  <div key={msg.id} className={`wa-bubble wa-bubble--${msg.sender === "user" ? "out" : "in"}`}>
                    <p className="wa-bubble-text">{msg.text}</p>
                    <div className="wa-bubble-meta">
                      <span className="wa-bubble-time">{msg.timestamp}</span>
                      {msg.sender === "user" && (
                        msg.read
                          ? <CheckCheck className="w-3.5 h-3.5 wa-bubble-check" />
                          : <Check className="w-3.5 h-3.5 text-[#53bdeb]" />
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && <WATypingIndicator />}
              </div>

              {/* Scroll to bottom button */}
              {showScrollBtn && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-[72px] right-5 z-20 w-8 h-8 rounded-full bg-[#202c33] border border-[#2a3942] flex items-center justify-center cursor-pointer shadow-lg new-msg-arrow"
                >
                  <ArrowDown className="w-4 h-4 text-[#8696a0]" />
                </button>
              )}

              {/* Input Bar */}
              <div className="wa-input-bar">
                <button className="wa-icon-btn">
                  <Smile className="w-[22px] h-[22px]" />
                </button>
                <button className="wa-icon-btn">
                  <Paperclip className="w-[22px] h-[22px]" style={{ transform: 'rotate(45deg)' }} />
                </button>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message"
                  disabled={isTyping}
                  className="wa-input"
                  rows={1}
                />
                <button className="wa-icon-btn">
                  <Camera className="w-[22px] h-[22px]" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="wa-send-btn"
                >
                  {inputValue.trim() && !isTyping ? (
                    <Send className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-[#8696a0]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
