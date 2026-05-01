"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  RotateCcw,
  Phone,
  FlaskConical,
  Bot,
  User,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ──────────────────── Types ──────────────────── */
interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: string;
}

/* ──────────────────── Mock Data ──────────────────── */
const mockAIResponses = [
  "Bonjour ! 😊 Merci pour votre message. Je suis là pour vous aider. Qu'est-ce que je peux faire pour vous aujourd'hui ?",
  "Bien sûr ! Nous avons plusieurs articles disponibles. Voici nos meilleurs produits :\n\n👗 Robes Wax à 5 000 FCFA\nolor: 3 500 FCFA\n Fascinatrice à 2 000 FCFA\n\nLaquelle vous intéresse ?",
  "Parfait choix ! 🎉 Je vous prépare le récapitulatif de votre commande.\n\n🧾 Commande #1248\n• 2x Robes Wax : 10 000 FCFA\n• 1x Pagne Tissé : 4 000 FCFA\n📦 Livraison à Dakar : 1 500 FCFA\n\n💰 Total : 15 500 FCFA\n\nVoulez-vous confirmer ?",
  "Votre commande a été confirmée avec succès ! ✅\n\nVous recevrez une confirmation par WhatsApp sous peu. La livraison est prévue sous 24-48h.\n\nMerci pour votre confiance ! N'hésitez pas si vous avez d'autres questions. 🙏",
  "Bien sûr, voici le suivi de votre commande #1247 :\n\n📦 Statut : En cours de livraison\n🚚 Livreur : Mamadou Diop\n📍 Position : Médina, Dakar\n⏰ Arrivée estimée : Aujourd'hui entre 14h et 17h\n\nVous serez notifié à la livraison !",
  "Notre politique de prix est très flexible. 💡\n\nPour les commandes de plus de 3 articles, nous offrons une remise de 10%. Pour les commandes en gros (10+ articles), c'est 20% de réduction.\n\nCombien d'articles souhaitez-vous commander ?",
  "Merci pour votre confiance ! N'hésitez pas à me contacter à tout moment si vous avez d'autres questions. Je suis disponible 24h/24. 😊",
];

const initialMessages: Message[] = [
  {
    id: "init-1",
    text: "Bonjour ! 👋 Je suis Sophia, l'assistante de Venteo Boutique. Comment puis-je vous aider aujourd'hui ?",
    sender: "agent",
    timestamp: "10:30",
  },
  {
    id: "init-2",
    text: "Bonjour Sophia ! Je voudrais voir vos robes wax disponibles. C'est pour une commande.",
    sender: "user",
    timestamp: "10:30",
  },
  {
    id: "init-3",
    text: "Avec plaisir ! 🎉 Voici notre collection de robes wax :\n\n👗 S-400 — Ankara Premium : 7 500 FCFA\n👗 S-401 — Wax Hollandais : 5 500 FCFA\n👗 S-402 — Bazin Riche : 12 000 FCFA\n👗 S-403 — Wax Imprimé Tropical : 6 000 FCFA\n\nToutes les tailles sont disponibles (S, M, L, XL). Laquelle vous plaît le plus ?",
    sender: "agent",
    timestamp: "10:31",
  },
];

/* ──────────────────── Helpers ──────────────────── */
function getTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString().padStart(2, "0")}`;
}

/* ──────────────────── Typing Indicator ──────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-[#E8F8EF] flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-[#16A34A]" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#25D366] animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-[#25D366] animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-[#25D366] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Main Component ──────────────────── */
export default function TesterAgentPage() {
  /* Config State */
  const [phoneNumber, setPhoneNumber] = useState("+221 77 123 45 67");
  const [scenario, setScenario] = useState("commande");
  const [language, setLanguage] = useState("francais");

  /* Chat State */
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);

  /* Refs */
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll to bottom */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* Focus input on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* Send message handler */
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

    /* Simulate AI response after 1-2 seconds */
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const aiResponse = mockAIResponses[responseIndex % mockAIResponses.length];
      const agentMsg: Message = {
        id: `msg-${Date.now()}-agent`,
        text: aiResponse,
        sender: "agent",
        timestamp: getTimestamp(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
      setResponseIndex((prev) => prev + 1);
    }, delay);
  };

  /* Reset conversation */
  const handleReset = () => {
    setMessages(initialMessages);
    setInputValue("");
    setIsTyping(false);
    setResponseIndex(0);
    inputRef.current?.focus();
  };

  /* Key press handler */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#E8F8EF]">
          <FlaskConical className="w-5 h-5 text-[#16A34A]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Tester l&apos;agent IA
          </h1>
          <p className="text-sm text-gray-500">
            Simulez une conversation avec votre agent pour évaluer ses
            réponses
          </p>
        </div>
      </div>

      {/* ── Main Content: Config + Chat ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* ── Left Panel: Config ── */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          {/* Scenario Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#16A34A]" />
              Configuration du test
            </h2>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">
                Numéro simulé
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-9 w-full"
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
            </div>

            {/* Scenario */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">
                Scénario de test
              </Label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un scénario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commande">
                    🛒 Nouvelle commande
                  </SelectItem>
                  <SelectItem value="question">
                    ❓ Question produit
                  </SelectItem>
                  <SelectItem value="livraison">
                    📦 Suivi livraison
                  </SelectItem>
                  <SelectItem value="negociation">
                    💰 Négociation prix
                  </SelectItem>
                  <SelectItem value="generale">
                    💬 Conversation générale
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">
                Langue
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir une langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="francais">🇫🇷 Français</SelectItem>
                  <SelectItem value="english">🇬🇧 English</SelectItem>
                  <SelectItem value="wolof">🇸🇳 Wolof</SelectItem>
                  <SelectItem value="bambara">🇲🇱 Bambara</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-gray-200 hover:border-[#25D366] hover:text-[#16A34A] hover:bg-[#E8F8EF] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Nouvelle conversation
          </Button>

          {/* Info Card */}
          <div className="bg-[#E8F8EF] rounded-2xl p-4 border border-[#25D366]/20">
            <p className="text-xs text-[#16A34A] font-medium flex items-start gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Ce simulateur vous permet de tester les réponses de votre agent.
                Les messages envoyés ici ne sont pas réels et n&apos;affectent
                pas vos clients.
              </span>
            </p>
          </div>
        </div>

        {/* ── Right Panel: Chat Window ── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col min-h-0 overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#16A34A] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                Sophia — Agent IA
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-xs text-[#16A34A] font-medium">En ligne</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#E8F8EF] px-3 py-1.5 rounded-full">
              <span className="text-xs font-medium text-[#16A34A]">
                Mode test
              </span>
              <FlaskConical className="w-3.5 h-3.5 text-[#16A34A]" />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#F9FAFB]/50 min-h-0">
            {/* Simulated date separator */}
            <div className="flex items-center justify-center py-2">
              <span className="text-[11px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Aujourd&apos;hui
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Agent avatar */}
                {msg.sender === "agent" && (
                  <div className="w-8 h-8 rounded-full bg-[#E8F8EF] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-[#16A34A]" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-[#25D366] to-[#16A34A] text-white rounded-2xl rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === "user"
                        ? "text-white/60"
                        : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp}
                    {msg.sender === "agent" && " ✓✓"}
                  </span>
                </div>

                {/* User avatar */}
                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}

            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrire un message..."
                disabled={isTyping}
                className="flex-1 rounded-full px-4 py-2.5 bg-gray-50 border-gray-200 focus:border-[#25D366] focus:ring-[#25D366]/20"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
                className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#16A34A] text-white flex-shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
