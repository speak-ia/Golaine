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
  Loader2,
} from "lucide-react";
import { conversationsService } from "@features/conversations/service";
import { SearchInput } from "@shared/components/feedback/SearchInput";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { StatusPill } from "@shared/components/feedback/StatusPill";
import { useServiceQuery } from "@shared/hooks/useServiceQuery";
import { matchesQuery } from "@shared/utils/filter";
import { toastIfFailed } from "@shared/utils/toastResult";
import { cn } from "@shared/utils/cn";
import type { Conversation, ConversationFilterTab, Message } from "@shared/types/domainTypes";

type FilterTab = ConversationFilterTab;


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
    <div className="mb-3 grid grid-cols-3 gap-1.5 rounded-xl bg-gray-50 p-2 sm:gap-2 sm:p-3">
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [threadMessages, setThreadMessages] = useState<Record<number, Message[]>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadConversations = useCallback(() => conversationsService.list(), []);
  const onListSuccess = useCallback((data: Conversation[]) => {
    setConversations(data);
  }, []);

  const { state: listState } = useServiceQuery(loadConversations, {
    showToastOnError: true,
    onSuccess: onListSuccess,
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;
  const currentMessages = useMemo(
    () => (selectedId ? (threadMessages[selectedId] ?? []) : []),
    [selectedId, threadMessages],
  );

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = matchesQuery(c, searchQuery, ["name", "phone", "lastMessage"]);
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const activeCount = conversations.filter((c) => c.status === "active").length;
  const totalMessagesCount = Object.values(threadMessages).reduce(
    (sum, msgs) => sum + msgs.length,
    0,
  );

  /* ── Scroll to bottom ── */
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, messagesLoading, scrollToBottom]);

  const loadMessagesForThread = useCallback(async (id: number) => {
    setMessagesLoading(true);
    const result = await conversationsService.getMessages(id);
    setMessagesLoading(false);
    if (toastIfFailed(result)) return;
    setThreadMessages((prev) => ({ ...prev, [id]: result.data }));
  }, []);

  const handleSelectConversation = useCallback(
    async (id: number) => {
      setSelectedId(id);
      setMobileShowChat(true);

      const readResult = await conversationsService.markRead(id);
      if (!toastIfFailed(readResult)) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
        );
      }

      if (!threadMessages[id]) {
        await loadMessagesForThread(id);
      }

      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [threadMessages, loadMessagesForThread],
  );

  /* ── Back to list (mobile) ── */
  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !selectedId || isSending) return;

    setIsSending(true);
    const result = await conversationsService.sendMessage(
      selectedId,
      inputValue.trim(),
      "client",
    );
    setIsSending(false);

    if (toastIfFailed(result)) return;

    const msg = result.data;
    setThreadMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), msg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, lastMessage: msg.text, time: msg.time }
          : c,
      ),
    );
    setInputValue("");
  }, [inputValue, selectedId, isSending]);

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
        {listState.status === "loading" && conversations.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        ) : null}
        <div className="space-y-0.5">
          {filteredConversations.map((conv) => {
            const isSelected = selectedId === conv.id;
            const gradient = conv.gradient || "from-gray-400 to-gray-500";

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
      selectedConversation.gradient || "from-gray-400 to-gray-500";

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
            {messagesLoading && currentMessages.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : null}
            {currentMessages.map((msg) => (
              <div
                key={msg.id ?? `${selectedId}-${msg.time}-${msg.text.slice(0, 8)}`}
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

            {isSending ? (
              <div className="flex justify-start mb-2">
                <div className="bg-white rounded-lg px-3 py-2 text-xs text-gray-500 border border-gray-100">
                  Envoi…
                </div>
              </div>
            ) : null}

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
              disabled={
                !inputValue.trim() ||
                selectedConversation.status === "closed" ||
                isSending
              }
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                inputValue.trim() &&
                selectedConversation.status !== "closed" &&
                !isSending
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
