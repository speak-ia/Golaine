"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Phone,
  MessageSquare,
  Users,
  TrendingUp,
  Check,
} from "lucide-react";
import { SearchInput } from "@shared/components/feedback/SearchInput";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { StatusPill } from "@shared/components/feedback/StatusPill";
import { matchesQuery } from "@shared/utils/filter";
import { cn } from "@shared/utils/cn";
import type { Conversation, ConversationFilterTab, Message } from "@shared/types/domainTypes";

type FilterTab = ConversationFilterTab;

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */

const initialConversations: Conversation[] = [
  { id: 1, name: "Fatou Diallo", phone: "+221 77 234 56 78", lastMessage: "D'accord, je confirme la commande !", time: "14:32", unread: 2, status: "active", avatar: "FD", gradient: "from-emerald-500 to-green-600" },
  { id: 2, name: "Moussa Traoré", phone: "+225 07 89 12 34", lastMessage: "C'est combien le sac à main ?", time: "13:15", unread: 0, status: "active", avatar: "MT", gradient: "from-amber-500 to-orange-600" },
  { id: 3, name: "Aminata Sow", phone: "+221 78 456 78 90", lastMessage: "Merci pour la livraison rapide 🙏", time: "11:40", unread: 0, status: "closed", avatar: "AS", gradient: "from-violet-500 to-purple-600" },
  { id: 4, name: "Ibrahim Keita", phone: "+223 76 123 45 67", lastMessage: "Bonjour, je cherche des robes wax", time: "10:22", unread: 1, status: "active", avatar: "IK", gradient: "from-cyan-500 to-blue-600" },
  { id: 5, name: "Awa Ndiaye", phone: "+221 77 890 12 34", lastMessage: "Pouvez-vous me faire une réduction ?", time: "09:55", unread: 0, status: "active", avatar: "AN", gradient: "from-rose-500 to-pink-600" },
  { id: 6, name: "Oumar Ba", phone: "+221 76 567 89 01", lastMessage: "Je veux commander 5 bissap", time: "Hier", unread: 0, status: "closed", avatar: "OB", gradient: "from-teal-500 to-emerald-600" },
  { id: 7, name: "Mariam Coulibaly", phone: "+223 70 234 56 78", lastMessage: "Le collier est-il toujours disponible ?", time: "Hier", unread: 3, status: "active", avatar: "MC", gradient: "from-fuchsia-500 to-pink-600" },
  { id: 8, name: "Cheikh Sy", phone: "+221 78 345 67 89", lastMessage: "Bonsoir, je voudrais passer commande", time: "Lun", unread: 0, status: "active", avatar: "CS", gradient: "from-indigo-500 to-violet-600" },
  { id: 9, name: "Fatima Diop", phone: "+221 77 678 90 12", lastMessage: "Merci beaucoup !", time: "Dim", unread: 0, status: "closed", avatar: "FD", gradient: "from-yellow-500 to-amber-600" },
  { id: 10, name: "Boubacar Diallo", phone: "+223 71 456 78 90", lastMessage: "Quelle est la différence entre les deux ?", time: "Sam", unread: 0, status: "active", avatar: "BD", gradient: "from-lime-500 to-green-600" },
];

const initialMessages: Record<number, Message[]> = {
  1: [
    { sender: "client", text: "Bonjour ! Je voudrais commander 3 robes wax", time: "14:20" },
    { sender: "agent", text: "Bonjour Fatou ! 😊 Avec plaisir. Les robes Wax S-400 sont à 5 000 FCFA chacune. Total: 15 000 FCFA. Voulez-vous confirmer ?", time: "14:21" },
    { sender: "client", text: "Oui ! Et ajoutez 2 pagnes tissés aussi", time: "14:25" },
    { sender: "agent", text: "Parfait ! 🧾\n\n3× Robes Wax S-400 = 15 000 FCFA\n2× Pagne Tissé Premium = 16 000 FCFA\n\nTotal: 31 000 FCFA\n\nVoulez-vous confirmer la commande ?", time: "14:26" },
    { sender: "client", text: "D'accord, je confirme la commande !", time: "14:32" },
  ],
  2: [
    { sender: "client", text: "Bonjour, quels sacs à main avez-vous ?", time: "13:00" },
    { sender: "agent", text: "Bonjour Moussa ! 👋 Nous avons plusieurs modèles :\n\n👜 Sac Ville en cuir — 12 000 FCFA\n👜 Sac Palette beige — 8 500 FCFA\n👜 Sac Bandoulière wax — 6 000 FCFA\n\nLequel vous intéresse ?", time: "13:02" },
    { sender: "client", text: "C'est combien le sac à main ?", time: "13:15" },
  ],
  3: [
    { sender: "client", text: "Bonjour, je voudrais passer une commande", time: "11:00" },
    { sender: "agent", text: "Bonjour Aminata ! 😊 Bienvenue ! Que souhaitez-vous commander aujourd'hui ?", time: "11:01" },
    { sender: "client", text: "2 parfum shea butter svp", time: "11:05" },
    { sender: "agent", text: "Excellent choix ! ✨\n\n2× Parfum Shea Butter = 10 000 FCFA\n\nVotre commande est confirmée. Livraison prévue sous 48h.", time: "11:06" },
    { sender: "client", text: "Merci pour la livraison rapide 🙏", time: "11:40" },
  ],
  4: [
    { sender: "client", text: "Bonjour, je cherche des robes wax", time: "10:22" },
    { sender: "agent", text: "Bonjour Ibrahim ! 👋 Nous avons une belle collection de robes wax :\n\n👗 Modèle Dakar — 5 000 FCFA\n👗 Modèle Abidjan — 7 500 FCFA\n👗 Modèle Premium — 12 000 FCFA\n\nQuelle taille souhaitez-vous ?", time: "10:23" },
    { sender: "client", text: "Taille L pour la modèle Dakar svp", time: "10:30" },
    { sender: "agent", text: "Parfait ! La robe Wax Modèle Dakar en taille L est disponible. Total: 5 000 FCFA. Voulez-vous confirmer ?", time: "10:31" },
  ],
  5: [
    { sender: "client", text: "Bonjour ! Je suis intéressée par le collier en perles", time: "09:30" },
    { sender: "agent", text: "Bonjour Awa ! 😊 Le collier en perles artisanales est à 15 000 FCFA. Il est fait main et unique.", time: "09:32" },
    { sender: "client", text: "Pouvez-vous me faire une réduction ?", time: "09:55" },
    { sender: "agent", text: "Nous proposons 10% de réduction à partir de 2 articles. Si vous prenez aussi le bracelet assorti à 8 000 FCFA, le total serait de 20 700 FCFA au lieu de 23 000 FCFA. 🎁", time: "09:56" },
    { sender: "client", text: "D'accord, je vais réfléchir", time: "09:58" },
  ],
  6: [
    { sender: "client", text: "Bonjour, vous avez du bissap ?", time: "16:00" },
    { sender: "agent", text: "Bonjour Oumar ! 🌺 Oui, le jus de bissap est disponible :\n\n1L = 2 000 FCFA\n5L = 8 000 FCFA\n\nLivraison gratuite à Dakar !", time: "16:02" },
    { sender: "client", text: "Je veux commander 5 bissap", time: "16:10" },
    { sender: "agent", text: "Super ! 🧃\n\n5L Bissap = 8 000 FCFA\n\nCommande confirmée ! Livraison demain entre 9h et 12h.", time: "16:11" },
  ],
  7: [
    { sender: "client", text: "Bonjour, j'ai vu votre collier en or sur Instagram", time: "15:00" },
    { sender: "agent", text: "Bonjour Mariam ! ✨ Oui, le collier Doré Élégance est toujours en promotion à 35 000 FCFA au lieu de 45 000 FCFA.", time: "15:02" },
    { sender: "client", text: "Le collier est-il toujours disponible ?", time: "15:20" },
    { sender: "agent", text: "Oui, nous en avons encore 3 en stock ! 🎉 Souhaitez-vous le réserver ?", time: "15:21" },
    { sender: "client", text: "Comment se fait la livraison ?", time: "15:25" },
  ],
  8: [
    { sender: "client", text: "Bonsoir, je voudrais passer commande", time: "20:30" },
    { sender: "agent", text: "Bonsoir Cheikh ! 😊 Avec plaisir. Que souhaitez-vous commander ? Je suis là pour vous aider.", time: "20:31" },
  ],
  9: [
    { sender: "client", text: "Bonjour, la commande est-elle prête ?", time: "14:00" },
    { sender: "agent", text: "Bonjour Fatima ! Oui, votre commande #1245 est prête et sera livrée demain. 📦", time: "14:01" },
    { sender: "client", text: "Merci beaucoup !", time: "14:05" },
  ],
  10: [
    { sender: "client", text: "Bonjour, je compare vos deux modèles de chaussures", time: "11:00" },
    { sender: "agent", text: "Bonjour Boubacar ! 👋 Nous avons le modèle Confort à 15 000 FCFA et le modèle Premium à 22 000 FCFA. Les deux sont en cuir véritable.", time: "11:02" },
    { sender: "client", text: "Quelle est la différence entre les deux ?", time: "11:10" },
    { sender: "agent", text: "Bonne question ! Le modèle Premium a une semelle en caoutchouc antidérapante, un intérieur en daim et des finitures brodées à la main. Le modèle Confort est plus léger et idéal pour un usage quotidien.", time: "11:11" },
  ],
};

const mockAgentResponses: string[] = [
  "Merci pour votre message ! Je vais vérifier cela pour vous. ✅",
  "Bien sûr ! Laissez-moi vous proposer quelques options. 🛍️",
  "Très bonne question ! Voici ce que je peux vous offrir :\n\n📦 Livraison gratuite\n🎁 10% de réduction\n⚡ Livraison express en 24h\n\nQu'en pensez-vous ?",
  "Parfait ! Votre demande a bien été prise en compte. Nous vous confirmons sous peu. ✨",
  "Je comprends votre besoin ! Nos produits sont fabriqués artisanalement avec des matériaux de qualité. N'hésitez pas à me poser d'autres questions. 😊",
  "Super choix ! 🎉 Je prépare votre commande immédiatement. Vous recevrez une confirmation sous peu.",
  "Merci de votre confiance ! Voici un résumé :\n\n✅ Produit disponible\n✅ Prix confirmé\n✅ Livraison prévue sous 48h\n\nAutre chose que je puisse faire pour vous ?",
];

/* ═══════════════════════════════════════════════════════════════
   AVATAR COLORS (for dynamic gradients)
   ═══════════════════════════════════════════════════════════════ */

const avatarGradients: Record<string, string> = {
  FD: "from-emerald-500 to-green-600",
  MT: "from-amber-500 to-orange-600",
  AS: "from-violet-500 to-purple-600",
  IK: "from-cyan-500 to-blue-600",
  AN: "from-rose-500 to-pink-600",
  OB: "from-teal-500 to-emerald-600",
  MC: "from-fuchsia-500 to-pink-600",
  CS: "from-indigo-500 to-violet-600",
  BD: "from-lime-500 to-green-600",
  FD2: "from-yellow-500 to-amber-600",
};

/* ═══════════════════════════════════════════════════════════════
   TYPING INDICATOR COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="bg-[#ECE5DD] rounded-tr-lg rounded-bl-lg rounded-br-lg px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATS BAR COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function StatsBar({ totalMessages, activeCount }: { totalMessages: number; activeCount: number }) {
  const stats = [
    {
      icon: MessageSquare,
      label: "Messages aujourd'hui",
      value: totalMessages.toString(),
      color: "text-[#25D366]",
      bg: "bg-[#E8F8EF]",
    },
    {
      icon: Users,
      label: "Conversations actives",
      value: activeCount.toString(),
      color: "text-[#F97316]",
      bg: "bg-orange-50",
    },
    {
      icon: TrendingUp,
      label: "Taux de réponse",
      value: "94%",
      color: "text-[#8B5CF6]",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl mb-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center gap-1 py-1.5">
          <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
            <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
          </div>
          <span className="text-sm font-bold text-gray-900">{stat.value}</span>
          <span className="text-[10px] text-gray-500 text-center leading-tight">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CONVERSATIONS PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function ConversationsPage() {
  /* ── State ── */
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<Record<number, Message[]>>(initialMessages);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const responseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Derived ── */
  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;
  const currentMessages = useMemo(
    () => (selectedId ? (messages[selectedId] ?? []) : []),
    [selectedId, messages],
  );

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = matchesQuery(c, searchQuery, ["name", "phone", "lastMessage"]);
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const activeCount = conversations.filter((c) => c.status === "active").length;
  const totalMessagesCount = Object.values(messages).reduce((sum, msgs) => sum + msgs.length, 0);

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping, scrollToBottom]);

  /* ── Select conversation ── */
  const handleSelectConversation = (id: number) => {
    setSelectedId(id);
    setMobileShowChat(true);
    // Clear unread
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
    // Focus input after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /* ── Back to list (mobile) ── */
  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  /* ── Send message ── */
  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedId) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newMessage: Message = {
      sender: "client",
      text: inputValue.trim(),
      time: timeStr,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), newMessage],
    }));

    // Update last message in conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, lastMessage: newMessage.text, time: timeStr }
          : c
      )
    );

    setInputValue("");

    // Show typing indicator, then respond
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(true);
    }, 1500);

    responseTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);

      const responseText =
        mockAgentResponses[Math.floor(Math.random() * mockAgentResponses.length)];
      const responseTime = new Date();
      const responseTimeStr = `${responseTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${responseTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const agentMessage: Message = {
        sender: "agent",
        text: responseText,
        time: responseTimeStr,
      };

      setMessages((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), agentMessage],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, lastMessage: responseText, time: responseTimeStr }
            : c
        )
      );
    }, 3500);
  };

  /* ── Cleanup timeouts on unmount ── */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
    };
  }, []);

  /* ── Handle key press ── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ═══════════════════════════════════════════════════════════
     FILTER TABS
     ═══════════════════════════════════════════════════════════ */

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "active", label: "Actives" },
    { key: "closed", label: "Fermées" },
  ];

  /* ═══════════════════════════════════════════════════════════
     LEFT PANEL – CONVERSATION LIST
     ═══════════════════════════════════════════════════════════ */

  const conversationList = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Conversations</h2>

        <div className="mb-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher…"
            inputClassName="rounded-xl border-gray-200 bg-gray-50 py-2.5 text-sm focus-visible:border-brand focus-visible:ring-brand/30"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 mb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filter === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.key === "active" && (
                <span className="ml-1 rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                  {activeCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-4 mb-2">
        <StatsBar totalMessages={totalMessagesCount} activeCount={activeCount} />
      </div>

      {/* Conversation Items */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="space-y-0.5">
          {filteredConversations.map((conv) => {
            const isSelected = selectedId === conv.id;
            const gradient =
              avatarGradients[conv.avatar] ?? "from-gray-400 to-gray-500";

            return (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-3 rounded-xl border-l-[3px] px-3 py-3 text-left transition-all",
                  isSelected
                    ? "border-brand bg-brand-tint"
                    : "border-transparent hover:bg-gray-50"
                )}
              >
                {/* Avatar */}
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <span className="text-xs font-bold text-white">
                    {conv.avatar}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isSelected ? "text-gray-900" : "text-gray-900"
                      }`}
                    >
                      {conv.name}
                    </span>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {conv.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {filteredConversations.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title="Aucune conversation trouvée"
              description="Modifiez la recherche ou le filtre pour afficher d'autres discussions."
              className="py-12"
            />
          )}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     RIGHT PANEL – CHAT VIEW
     ═══════════════════════════════════════════════════════════ */

  const chatView = () => {
    if (!selectedConversation) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#F0F2F5]">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
            <MessageSquare className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            Vos conversations
          </h3>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Sélectionnez une conversation pour commencer à discuter avec vos clients.
          </p>
        </div>
      );
    }

    const gradient =
      avatarGradients[selectedConversation.avatar] ??
      "from-gray-400 to-gray-500";

    return (
      <div className="flex flex-col h-full bg-[#ECE5DD]">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
          {/* Back button (mobile) */}
          <button
            onClick={handleBackToList}
            className="md:hidden w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
          >
            <span className="text-xs font-bold text-white">
              {selectedConversation.avatar}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {selectedConversation.name}
              </h3>
              <StatusPill
                label={selectedConversation.status === "active" ? "Actif" : "Fermé"}
                variant={selectedConversation.status === "active" ? "success" : "neutral"}
                size="sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedConversation.phone}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer">
              <Phone className="w-4 h-4 text-gray-500" />
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Chat Wallpaper Pattern */}
        <div className="flex-1 overflow-y-auto relative">
          {/* WhatsApp-style wallpaper */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />

          {/* Messages */}
          <div className="relative z-10 px-4 py-4">
            {currentMessages.map((msg, idx) => (
              <div
                key={`${selectedId}-${idx}`}
                className={`flex mb-2 ${
                  msg.sender === "client" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative max-w-[75%] sm:max-w-[65%] px-3.5 py-2 shadow-sm ${
                    msg.sender === "client"
                      ? "bg-[#005C4B] text-white rounded-tl-lg rounded-bl-lg rounded-br-none"
                      : "bg-white text-gray-900 rounded-tr-lg rounded-bl-lg rounded-br-lg border border-gray-100/50"
                  }`}
                >
                  {/* Pre-formatted text for multiline support */}
                  <p className="text-[13.5px] leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 -mb-0.5 ${
                      msg.sender === "client"
                        ? "text-white/50"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="text-[10px]">{msg.time}</span>
                    {msg.sender === "agent" && (
                      <Check className="w-3 h-3 text-[#53BDEB]" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="px-3 py-3 bg-[#F0F2F5] border-t border-gray-200">
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200/50">
            <input
              ref={inputRef}
              type="text"
              placeholder="Écrire un message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={selectedConversation.status === "closed"}
              className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || selectedConversation.status === "closed"}
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                inputValue.trim() && selectedConversation.status !== "closed"
                  ? "bg-[#25D366] hover:bg-[#16A34A] text-white shadow-md shadow-[#25D366]/25"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {selectedConversation.status === "closed" && (
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Cette conversation est fermée
            </p>
          )}
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="h-[calc(100vh-7rem)] sm:h-[calc(100vh-5.5rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
      {/* ── Left Panel ── */}
      <div
        className={`w-full md:w-[340px] md:min-w-[340px] md:max-w-[340px] border-r border-gray-100 flex-shrink-0 ${
          mobileShowChat ? "hidden md:flex md:flex-col" : "flex flex-col"
        }`}
      >
        {conversationList()}
      </div>

      {/* ── Right Panel ── */}
      <div
        className={`flex-1 min-w-0 ${
          mobileShowChat ? "flex flex-col" : "hidden md:flex md:flex-col"
        }`}
      >
        {chatView()}
      </div>
    </div>
  );
}
