"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { fetchWithTimeout } from "@shared/http/fetchWithTimeout";
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
  RotateCcw,
  Loader2,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: string;
  read?: boolean;
}

type SlotSummary = {
  slotIndex: number;
  displayName: string;
  status: "connected" | "inactive" | "locked";
};

type TestContext = {
  slotIndex: number;
  displayName: string;
  phone: string | null;
  status: "connected" | "inactive" | "locked";
  agentName: string;
  welcomeMessage: string;
  autoResponse: boolean;
};

function getTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

function welcomeOnly(welcomeMessage: string): Message[] {
  return [
    {
      id: "welcome",
      text: welcomeMessage,
      sender: "agent",
      timestamp: getTimestamp(),
      read: true,
    },
  ];
}

function WATypingIndicator() {
  return (
    <div className="wa-typing">
      <div className="wa-typing-dot" />
      <div className="wa-typing-dot" />
      <div className="wa-typing-dot" />
    </div>
  );
}

export default function AgentTesterPage() {
  const [slots, setSlots] = useState<SlotSummary[]>([]);
  const [context, setContext] = useState<TestContext | null>(null);
  const [slotIndex, setSlotIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadContext = useCallback(async (index: number) => {
    setLoading(true);
    try {
      const res = await fetchWithTimeout(
        `/api/agents/test-context?slot=${index}`,
        { method: "GET" },
      );
      const data = (await res.json().catch(() => ({}))) as {
        slots?: SlotSummary[];
        context?: TestContext;
        error?: { message?: string };
      };

      if (!res.ok || !data.context) {
        toast.error(data.error?.message ?? "Impossible de charger la configuration");
        return;
      }

      setSlots(data.slots ?? []);
      setContext(data.context);
      setSlotIndex(data.context.slotIndex);
      setMessages(welcomeOnly(data.context.welcomeMessage));
    } catch {
      toast.error("Erreur réseau lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContext(1);
  }, [loadContext]);

  useEffect(() => {
    if (chatContainerRef.current) {
      const el = chatContainerRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading, slotIndex]);

  const handleSlotChange = (index: number) => {
    if (index === slotIndex || isTyping) return;
    void loadContext(index);
  };

  const resetConversation = () => {
    if (!context) return;
    setMessages(welcomeOnly(context.welcomeMessage));
    setInputValue("");
  };

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const el = chatContainerRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isTyping || !context) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: "user",
      timestamp: getTimestamp(),
    };

    const historyPayload = [...messages, userMsg].map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("model" as const),
      text: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    void (async () => {
      try {
        const res = await fetchWithTimeout("/api/agents/test-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotIndex: context.slotIndex,
            messages: historyPayload,
          }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          text?: string;
          error?: { message?: string };
        };

        if (res.ok && typeof body.text === "string" && body.text.trim()) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-agent`,
              text: body.text!.trim(),
              sender: "agent",
              timestamp: getTimestamp(),
              read: true,
            },
          ]);
          return;
        }

        toast.error(body.error?.message ?? "Réponse IA indisponible");
      } catch {
        toast.error("Impossible de joindre l'assistant IA");
      }
    })().finally(() => {
      setIsTyping(false);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 100) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const testableSlots = slots.filter((s) => s.status !== "locked");
  const headerTitle = context?.displayName ?? "Agent IA";
  const headerSubtitle = context
    ? isTyping
      ? "en train d'écrire..."
      : context.status === "connected"
        ? `${context.agentName} · connecté`
        : `${context.agentName} · hors ligne`
    : "";

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Tester l&apos;agent IA
        </h1>
        <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
          Simulation WhatsApp avec Gemini et la configuration enregistrée sur
          l&apos;onglet Agent IA.
        </p>
      </div>

      {testableSlots.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4 px-2">
          {testableSlots.map((s) => (
            <button
              key={s.slotIndex}
              type="button"
              disabled={loading || isTyping}
              onClick={() => handleSlotChange(s.slotIndex)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                slotIndex === s.slotIndex
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300"
              }`}
            >
              {s.displayName}
              {s.status === "connected" && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-300" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center mb-2">
        <button
          type="button"
          onClick={resetConversation}
          disabled={loading || isTyping || !context}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-700 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Réinitialiser la conversation
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-x-auto px-2 py-4 sm:px-4">
        <div className="relative max-w-[min(100vw-1rem,340px)] origin-top scale-[0.88] transition-transform sm:scale-100">
          {loading ? (
            <div className="phone-frame flex items-center justify-center min-h-[520px]">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="phone-notch" />

                <div className="phone-status-bar">
                  <span>{getTimestamp()}</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5" />
                    <Wifi className="w-3.5 h-3.5" />
                    <BatteryFull className="w-4.5 h-4.5" />
                  </div>
                </div>

                <div className="wa-header">
                  <button type="button" className="wa-icon-btn !w-8 !h-8" aria-hidden>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#e9edef] truncate">
                      {headerTitle}
                    </p>
                    <p className="text-[12px] text-[#8696a0] truncate">
                      {headerSubtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-0">
                    <button type="button" className="wa-icon-btn !w-9 !h-9" aria-hidden>
                      <Video className="w-[19px] h-[19px]" />
                    </button>
                    <button type="button" className="wa-icon-btn !w-9 !h-9" aria-hidden>
                      <Phone className="w-[19px] h-[19px]" />
                    </button>
                    <button type="button" className="wa-icon-btn !w-9 !h-9" aria-hidden>
                      <Search className="w-[19px] h-[19px]" />
                    </button>
                    <button type="button" className="wa-icon-btn !w-9 !h-9" aria-hidden>
                      <MoreVertical className="w-[19px] h-[19px]" />
                    </button>
                  </div>
                </div>

                <div
                  ref={chatContainerRef}
                  onScroll={handleChatScroll}
                  className="wa-chat-bg"
                >
                  <div className="wa-encryption">
                    <Lock className="w-3 h-3 flex-shrink-0" />
                    <span>Les messages sont chiffrés de bout en bout.</span>
                  </div>

                  <div className="wa-date-chip">Aujourd&apos;hui</div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`wa-bubble wa-bubble--${msg.sender === "user" ? "out" : "in"}`}
                    >
                      <p className="wa-bubble-text whitespace-pre-wrap">{msg.text}</p>
                      <div className="wa-bubble-meta">
                        <span className="wa-bubble-time">{msg.timestamp}</span>
                        {msg.sender === "user" &&
                          (msg.read ? (
                            <CheckCheck className="w-3.5 h-3.5 wa-bubble-check" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-[#53bdeb]" />
                          ))}
                      </div>
                    </div>
                  ))}

                  {isTyping && <WATypingIndicator />}
                </div>

                {showScrollBtn && (
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="absolute bottom-[72px] right-5 z-20 w-8 h-8 rounded-full bg-[#202c33] border border-[#2a3942] flex items-center justify-center cursor-pointer shadow-lg new-msg-arrow"
                  >
                    <ArrowDown className="w-4 h-4 text-[#8696a0]" />
                  </button>
                )}

                <div className="wa-input-bar">
                  <button type="button" className="wa-icon-btn" aria-hidden>
                    <Smile className="w-[22px] h-[22px]" />
                  </button>
                  <button type="button" className="wa-icon-btn" aria-hidden>
                    <Paperclip
                      className="w-[22px] h-[22px]"
                      style={{ transform: "rotate(45deg)" }}
                    />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Message"
                    disabled={isTyping || loading}
                    className="wa-input"
                    rows={1}
                  />
                  <button type="button" className="wa-icon-btn" aria-hidden>
                    <Camera className="w-[22px] h-[22px]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping || loading}
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
          )}
        </div>
      </div>

      {context && !context.autoResponse && (
        <p className="text-center text-xs text-amber-700 mt-2 px-4">
          Réponse automatique désactivée dans Agent IA — le test manuel reste
          disponible ici.
        </p>
      )}
    </div>
  );
}
