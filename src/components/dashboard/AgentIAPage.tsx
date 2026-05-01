"use client";

import { useState } from "react";
import {
  Bot,
  Power,
  Save,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Languages,
  MessageCircle,
  BookOpen,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ──────────────────── Types ──────────────────── */
interface FAQEntry {
  id: string;
  question: string;
  answer: string;
}

/* ──────────────────── Mock Data ──────────────────── */
const initialFAQs: FAQEntry[] = [
  {
    id: "faq-1",
    question: "Quels sont vos modes de livraison ?",
    answer:
      "Nous livrons à Dakar et dans toute la région de Dakar. La livraison standard prend 24-48h et coûte 1 500 FCFA. La livraison express est disponible le jour même pour 2 500 FCFA.",
  },
  {
    id: "faq-2",
    question: "Proposez-vous des retours ou échanges ?",
    answer:
      "Oui, vous disposez de 7 jours après réception pour demander un échange si l'article ne convient pas. L'article doit être dans son état d'origine. Les retours sont traités sous 48h.",
  },
  {
    id: "faq-3",
    question: "Comment passer commande sur WhatsApp ?",
    answer:
      "C'est très simple ! Envoyez-moi le nom du produit souhaité et la quantité. Je vous enregistrerai la commande et vous enverrai un récapitulatif avec le total. Vous pouvez aussi m'envoyer une photo du produit que vous souhaitez commander.",
  },
  {
    id: "faq-4",
    question: "Acceptez-vous les paiements à la livraison ?",
    answer:
      "Oui, nous acceptons le paiement à la livraison pour les commandes à Dakar. Nous acceptons également Wave, Orange Money et les virements bancaires pour les commandes en province.",
  },
];

/* ──────────────────── Main Component ──────────────────── */
export default function AgentIAPage() {
  /* Agent Status */
  const [isActive, setIsActive] = useState(true);

  /* Agent Identity */
  const [agentName, setAgentName] = useState("Sophia");
  const [agentDescription, setAgentDescription] = useState(
    "Sophia est une assistante commerciale chaleureuse et professionnelle. Elle connaît parfaitement vos produits et aide les clients à passer commande facilement."
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Bonjour ! 👋 Je suis Sophia, l'assistante de [Nom de la boutique]. Comment puis-je vous aider aujourd'hui ?"
  );

  /* Language */
  const [language, setLanguage] = useState("francais");

  /* Response Style */
  const [responseStyle, setResponseStyle] = useState("amical");

  /* Auto-Reply */
  const [autoReply, setAutoReply] = useState(true);
  const [replyDelay, setReplyDelay] = useState([5]);

  /* FAQ */
  const [faqs, setFaqs] = useState<FAQEntry[]>(initialFAQs);
  const [showAddFAQ, setShowAddFAQ] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  /* Save State */
  const [saved, setSaved] = useState(false);

  /* Handlers */
  const handleAddFAQ = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const entry: FAQEntry = {
      id: `faq-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };
    setFaqs((prev) => [...prev, entry]);
    setNewQuestion("");
    setNewAnswer("");
    setShowAddFAQ(false);
  };

  const handleRemoveFAQ = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#E8F8EF]">
            <Bot className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Configuration de l&apos;agent IA
            </h1>
            <p className="text-sm text-gray-500">
              Personnalisez le comportement et les réponses de votre agent
            </p>
          </div>
        </div>
      </div>

      {/* ── Agent Status Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isActive ? "bg-[#25D366] animate-pulse" : "bg-gray-300"
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Statut de l&apos;agent
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isActive
                  ? "Votre agent répond actuellement aux clients"
                  : "Votre agent est en pause et ne répond pas"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={
                isActive
                  ? "bg-[#E8F8EF] text-[#16A34A] border-[#25D366]/20 px-3 py-1"
                  : "bg-red-50 text-red-600 border-red-200 px-3 py-1"
              }
            >
              {isActive ? "Actif" : "Inactif"}
            </Badge>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-[#25D366]"
            />
          </div>
        </div>
      </div>

      {/* ── Agent Identity Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#16A34A]" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Identité de l&apos;agent
          </h2>
        </div>

        {/* Agent Name */}
        <div className="space-y-2">
          <Label htmlFor="agent-name" className="text-sm font-medium text-gray-700">
            Nom de l&apos;agent
          </Label>
          <Input
            id="agent-name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Nom de votre agent IA"
            className="w-full"
          />
        </div>

        {/* Agent Description */}
        <div className="space-y-2">
          <Label
            htmlFor="agent-desc"
            className="text-sm font-medium text-gray-700"
          >
            Personnalité / Description
          </Label>
          <Textarea
            id="agent-desc"
            value={agentDescription}
            onChange={(e) => setAgentDescription(e.target.value)}
            placeholder="Décrivez la personnalité de votre agent..."
            rows={3}
            className="w-full resize-none"
          />
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Cette description aide l&apos;IA à adopter le bon ton dans ses
            réponses.
          </p>
        </div>

        {/* Welcome Message */}
        <div className="space-y-2">
          <Label
            htmlFor="welcome-msg"
            className="text-sm font-medium text-gray-700"
          >
            Message d&apos;accueil
          </Label>
          <Textarea
            id="welcome-msg"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Message envoyé automatiquement quand un client écrit pour la première fois..."
            rows={3}
            className="w-full resize-none"
          />
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Utilisez [Nom de la boutique] comme variable dynamique.
          </p>
        </div>
      </div>

      {/* ── Language & Style Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <Languages className="w-4 h-4 text-[#16A34A]" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Langue &amp; Style
          </h2>
        </div>

        {/* Language Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Langue de l&apos;agent
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full sm:w-64">
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

        {/* Response Style */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Style de réponse
          </Label>
          <RadioGroup
            value={responseStyle}
            onValueChange={setResponseStyle}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {[
              {
                value: "amical",
                label: "Amical",
                desc: "Chaleureux et proche du client",
                emoji: "😊",
              },
              {
                value: "professionnel",
                label: "Professionnel",
                desc: "Sérieux et concis",
                emoji: "💼",
              },
              {
                value: "decontracte",
                label: "Décontracté",
                desc: "Cool et décontracté",
                emoji: "✌️",
              },
            ].map((style) => (
              <label
                key={style.value}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  responseStyle === style.value
                    ? "border-[#25D366] bg-[#E8F8EF]"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <RadioGroupItem
                  value={style.value}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {style.emoji} {style.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">{style.desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* ── Auto-Reply Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#16A34A]" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Réponse automatique
            </h2>
          </div>
          <Switch
            checked={autoReply}
            onCheckedChange={setAutoReply}
            className="data-[state=checked]:bg-[#25D366]"
          />
        </div>

        <p className="text-xs text-gray-500">
          L&apos;agent répond automatiquement aux messages des clients après un
          délai défini.
        </p>

        {autoReply && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Délai avant réponse
              </Label>
              <span className="text-sm font-bold text-[#16A34A]">
                {replyDelay[0]}s
              </span>
            </div>
            <Slider
              value={replyDelay}
              onValueChange={setReplyDelay}
              min={1}
              max={30}
              step={1}
              className="w-full [&_[data-slot=slider-range]]:bg-[#25D366] [&_[data-slot=slider-thumb]]:border-[#25D366]"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1 seconde</span>
              <span>15 secondes</span>
              <span>30 secondes</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Knowledge Base Card (FAQ) ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#16A34A]" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Base de connaissances
            </h2>
          </div>
          <Badge className="bg-[#E8F8EF] text-[#16A34A] border-[#25D366]/20">
            {faqs.length} FAQ{faqs.length > 1 ? "s" : ""}
          </Badge>
        </div>

        <p className="text-xs text-gray-500">
          Ajoutez des questions fréquentes pour enrichir les réponses de votre
          agent. Il pourra les utiliser pour répondre plus précisément aux
          clients.
        </p>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-gray-100"
            >
              <AccordionTrigger className="text-sm font-medium text-gray-800 hover:no-underline">
                <div className="flex items-center gap-2 pr-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#E8F8EF] flex items-center justify-center text-xs font-bold text-[#16A34A]">
                    {index + 1}
                  </span>
                  <span className="text-left">{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-8 space-y-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                  <button
                    onClick={() => handleRemoveFAQ(faq.id)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer cette FAQ
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Add FAQ Button / Form */}
        {!showAddFAQ ? (
          <button
            onClick={() => setShowAddFAQ(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:text-[#16A34A] hover:border-[#25D366]/30 hover:bg-[#E8F8EF]/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ajouter une FAQ
          </button>
        ) : (
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Nouvelle FAQ
              </p>
              <button
                onClick={() => {
                  setShowAddFAQ(false);
                  setNewQuestion("");
                  setNewAnswer("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">
                Question
              </Label>
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ex: Quels sont vos horaires d'ouverture ?"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">
                Réponse
              </Label>
              <Textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Ex: Nous sommes ouverts du lundi au samedi de 8h à 20h."
                rows={3}
                className="w-full resize-none"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddFAQ(false);
                  setNewQuestion("");
                  setNewAnswer("");
                }}
                className="text-gray-500 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleAddFAQ}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
                className="bg-[#25D366] hover:bg-[#16A34A] text-white cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Product Catalog Status Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E8F8EF]">
              <ShoppingCart className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Catalogue de produits
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Synchronisation automatique avec votre boutique
              </p>
            </div>
          </div>
          <Badge className="bg-[#E8F8EF] text-[#16A34A] border-[#25D366]/20 px-3 py-1 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            12 produits synchronisés
          </Badge>
        </div>
      </div>

      {/* ── Save Button ── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        {saved && (
          <div className="flex items-center gap-2 text-sm font-medium text-[#16A34A] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CheckCircle2 className="w-4 h-4" />
            Configuration sauvegardée avec succès !
          </div>
        )}
        <Button
          onClick={handleSave}
          className="bg-[#25D366] hover:bg-[#16A34A] text-white px-6 cursor-pointer"
        >
          <Save className="w-4 h-4 mr-2" />
          Enregistrer la configuration
        </Button>
      </div>
    </div>
  );
}
