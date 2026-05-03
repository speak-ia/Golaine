"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CreditCard,
  Crown,
  Check,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useSessionStore } from "@features/auth/store/sessionStore";
import { formatMoney } from "@shared/utils/format";

type PlanName = "Starter" | "Pro" | "Business";

type PlanCardData = {
  name: PlanName;
  tag?: { label: string };
  icon: React.ElementType;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  features: Array<{ text: string; highlight?: boolean }>;
  cta: { label: string; sublabel?: string };
  tone: "starter" | "pro" | "business";
};

function PlanCard({
  plan,
  billing,
  currentPlan,
  onSelect,
  containerRef,
}: {
  plan: PlanCardData;
  billing: "monthly" | "annual";
  currentPlan: PlanName;
  onSelect: (_planName: PlanName) => void;
  containerRef?: (_el: HTMLDivElement | null) => void;
}) {
  const Icon = plan.icon;
  const isCurrent = currentPlan === plan.name;
  const price = billing === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice;
  const alternate = billing === "annual" ? plan.monthlyPrice : plan.annualMonthlyPrice;

  const isFeatured = plan.tone === "pro";
  const cardBase =
    "relative rounded-2xl border bg-white overflow-hidden transition-shadow duration-200";
  const borderClass = isFeatured
    ? "border-[#25D366] ring-2 ring-[#25D366]/20 shadow-lg"
    : "border-gray-100 hover:shadow-md";

  return (
    <div
      ref={containerRef}
      className={`${cardBase} ${borderClass} group`}
    >
      {plan.tag?.label && (
        <div className="absolute top-4 left-4 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F8EF] text-[#16A34A] text-xs font-bold border border-[#25D366]/20">
            <Zap className="w-3.5 h-3.5" />
            {plan.tag.label}
          </div>
        </div>
      )}

      <div
        className="relative p-6 outline-none ring-0 focus-within:ring-2 focus-within:ring-[#25D366]/20"
      >
        <div className="flex items-center gap-3 mb-5 pt-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isFeatured ? "bg-[#E8F8EF] border-[#25D366]/20" : "bg-gray-50 border-gray-100"
            }`}
          >
            <Icon className={`w-5 h-5 ${isFeatured ? "text-[#16A34A]" : "text-gray-500"}`} />
          </div>
          <div className="text-gray-900 font-bold text-lg">{plan.name}</div>
          {isCurrent && (
            <div className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F8EF] border border-[#25D366]/20 text-[11px] font-semibold text-[#16A34A]">
              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
              Actif
            </div>
          )}
        </div>

        <div className="flex items-end gap-1.5 mb-1">
          <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            {formatMoney(price)}
          </div>
          <div className="pb-2 text-sm text-gray-500">/mois</div>
        </div>
        <div className="text-xs text-gray-500 mb-6">
          ou <span className="text-gray-700 font-medium">{formatMoney(alternate)}/mois</span>{" "}
          en annuel
        </div>

        <div className="space-y-3.5 mb-7">
          {plan.features.map((f) => (
            <div key={f.text} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#25D366] mt-0.5 flex-shrink-0" />
              <span
                className={`text-sm leading-relaxed ${
                  f.highlight ? "text-[#16A34A] font-semibold" : "text-gray-600"
                }`}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onSelect(plan.name)}
          disabled={isCurrent}
          aria-disabled={isCurrent}
          className={`w-full rounded-2xl px-5 py-3.5 font-semibold transition-all ${
            isCurrent
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#25D366] to-[#16A34A] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:ring-offset-2 focus:ring-offset-white"
          }`}
        >
          <div className="text-sm">{plan.cta.label}</div>
          {plan.cta.sublabel && (
            <div className="text-[11px] font-medium opacity-80 mt-0.5">
              {plan.cta.sublabel}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────── Plan Change Modal Toast ──────────────────── */
function ChangeConfirmation({
  planName,
  onConfirm,
  onCancel,
}: {
  planName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-[#E8F8EF] flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-6 h-6 text-[#25D366]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center">Changer de plan ?</h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          Vous êtes sur le point de passer au <span className="font-semibold text-gray-900">{planName}</span>.
          Le changement sera effectif immédiatement et facturé au prorata.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#16A34A] transition-colors cursor-pointer"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

const PLANS: PlanCardData[] = [
  {
    name: "Starter",
    icon: TrendingUp,
    monthlyPrice: 29000,
    annualMonthlyPrice: 23200,
    tone: "starter",
    features: [
      { text: "1 numéro WhatsApp" },
      { text: "1 500 crédits / mois", highlight: true },
      { text: "1M caractères de base", highlight: true },
      { text: "CRM commandes" },
      { text: "25 analyses d’images / mois" },
      { text: "Support email" },
    ],
    cta: { label: "Commencer gratuitement", sublabel: "Parfait pour démarrer" },
  },
  {
    name: "Pro",
    icon: Crown,
    monthlyPrice: 49000,
    annualMonthlyPrice: 39170,
    tone: "pro",
    tag: { label: "Populaire" },
    features: [
      { text: "2 numéros WhatsApp" },
      { text: "5 000 crédits / mois", highlight: true },
      { text: "5M caractères de base", highlight: true },
      { text: "CRM commandes & rendez-vous" },
      { text: "50 analyses d’images / mois" },
      { text: "Support prioritaire" },
    ],
    cta: { label: "Commencer", sublabel: "Pour les professionnels" },
  },
  {
    name: "Business",
    icon: Building2,
    monthlyPrice: 199000,
    annualMonthlyPrice: 159170,
    tone: "business",
    features: [
      { text: "3 numéros WhatsApp" },
      { text: "25 000 crédits / mois", highlight: true },
      { text: "20M caractères de base", highlight: true },
      { text: "CRM commandes & rendez-vous" },
      { text: "250 analyses d’images / mois" },
      { text: "Support dédié + onboarding" },
    ],
    cta: { label: "Commencer", sublabel: "Pour les équipes" },
  },
];

/* ──────────────────── Main Component ──────────────────── */
export default function PlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const planIntent = useSessionStore((s) => s.planIntent);
  const setPlanIntent = useSessionStore((s) => s.setPlanIntent);

  useEffect(() => {
    if (!planIntent) return;
    const id = window.setTimeout(() => {
      setSelectedPlan(planIntent);
      setShowConfirmation(true);
      setPlanIntent(null);
    }, 0);
    return () => window.clearTimeout(id);
  }, [planIntent, setPlanIntent]);

  const currentPlan: PlanName = "Pro";

  const plans = useMemo(() => PLANS, []);
  const planRefs = useRef<Record<PlanName, HTMLDivElement | null>>({
    Starter: null,
    Pro: null,
    Business: null,
  });

  const handleSelectPlan = (planName: PlanName) => {
    setSelectedPlan(planName);
    setShowConfirmation(true);
  };

  const handleConfirmChange = () => {
    setShowConfirmation(false);
    setSelectedPlan(null);
  };

  const handleCancelChange = () => {
    setShowConfirmation(false);
    setSelectedPlan(null);
  };

  useEffect(() => {
    if (!selectedPlan) return;
    const el = planRefs.current[selectedPlan];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedPlan]);

  return (
    <div className="space-y-6">
      {/* Confirmation modal */}
      {showConfirmation && selectedPlan && (
        <ChangeConfirmation
          planName={selectedPlan}
          onConfirm={handleConfirmChange}
          onCancel={handleCancelChange}
        />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon Plan</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F8EF] text-[#16A34A] text-xs font-semibold border border-[#25D366]/20">
              <Check className="w-3.5 h-3.5" />
              Actuel : {currentPlan}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Une tarification simple, pensée pour la croissance. Passez à l’annuel et économisez.
          </p>
        </div>

        {/* Billing toggle (UX: visible mobile + clavier) */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={billing === "monthly" ? "text-gray-900 font-semibold" : ""}>
              Mensuel
            </span>
            <button
              onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
              className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 ${
                billing === "annual" ? "bg-[#16a34a]" : "bg-gray-200"
              }`}
              aria-label="Basculer la facturation mensuelle/annuelle"
              aria-pressed={billing === "annual"}
              type="button"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  billing === "annual" ? "translate-x-6" : ""
                }`}
              />
            </button>
            <span className={billing === "annual" ? "text-gray-900 font-semibold" : ""}>
              Annuel
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0a0f0d] text-white/80 text-[11px] font-semibold border border-[#1f2a25]">
            <Zap className="w-3.5 h-3.5 text-[#22c55e]" />
            -20% en annuel
          </span>
        </div>
      </div>

      {/* Plans (design proche de l'image) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => (
            <PlanCard
              key={p.name}
              plan={p}
              billing={billing}
              currentPlan={currentPlan}
              onSelect={handleSelectPlan}
              containerRef={(el) => {
                planRefs.current[p.name] = el;
              }}
            />
          ))}
        </div>
        <p className="mt-6 text-xs text-gray-400">
          Prix affichés en FCFA. Le mode annuel applique une réduction estimée et affiche un équivalent mensuel.
        </p>
      </div>
    </div>
  );
}
