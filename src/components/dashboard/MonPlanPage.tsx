"use client";

import { useState } from "react";
import {
  Crown,
  Check,
  Zap,
  Building2,
  Download,
  Calendar,
  CreditCard,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Bot,
  Smartphone,
  ImageIcon,
  MessageSquare,
  FileText,
  BarChart3,
  Headphones,
  Shield,
} from "lucide-react";

/* ──────────────────── Types ──────────────────── */
interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  icon: React.ElementType;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
}

/* ──────────────────── Usage Progress Bar ──────────────────── */
function UsageBar({
  label,
  current,
  max,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  current: number;
  max: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            {isNearLimit && !isAtLimit && (
              <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-medium">
                <AlertCircle className="w-3 h-3" />
                Presque plein
              </span>
            )}
            {isAtLimit && (
              <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                <AlertCircle className="w-3 h-3" />
                Limite atteinte
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {current.toLocaleString("fr-FR")} / {max.toLocaleString("fr-FR")} utilisés
          </p>
        </div>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isAtLimit ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : ""
          }`}
          style={{
            width: `${percentage}%`,
            backgroundColor: isAtLimit ? undefined : isNearLimit ? undefined : color,
          }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">{percentage.toFixed(0)}% utilisé ce mois</p>
    </div>
  );
}

/* ──────────────────── Current Plan Card ──────────────────── */
function CurrentPlanCard() {
  return (
    <div className="bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-300" />
              <h3 className="text-lg font-bold">Plan Pro</h3>
            </div>
            <p className="text-white/70 text-sm">
              Idéal pour les entreprises en croissance
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            Actif
          </span>
        </div>

        <div className="flex items-end gap-1 mb-4">
          <span className="text-4xl font-bold">49 000</span>
          <span className="text-white/70 text-sm mb-1.5">FCFA / mois</span>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-white/15">
          <Calendar className="w-4 h-4 text-white/60" />
          <p className="text-sm text-white/70">
            Prochain renouvellement : <span className="text-white font-medium">15 février 2025</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Pricing Plan Card ──────────────────── */
function PricingPlanCard({
  plan,
  onSelect,
}: {
  plan: PricingPlan;
  onSelect: (planName: string) => void;
}) {
  const Icon = plan.icon;

  return (
    <div
      className={`relative bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
        plan.current
          ? "border-[#25D366] ring-2 ring-[#25D366]/20 shadow-md"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      {/* Popular badge */}
      {plan.popular && !plan.current && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#25D366] text-white text-xs font-bold rounded-full shadow-lg">
          Populaire
        </div>
      )}

      {/* Current plan badge */}
      {plan.current && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#25D366] text-white text-xs font-bold rounded-full shadow-lg">
          Plan actuel
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            plan.current ? "bg-[#E8F8EF]" : "bg-gray-50"
          }`}
        >
          <Icon className={`w-7 h-7 ${plan.current ? "text-[#25D366]" : "text-gray-400"}`} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-end justify-center gap-1">
          <span className={`text-3xl font-bold ${plan.current ? "text-[#16A34A]" : "text-gray-900"}`}>
            {plan.price}
          </span>
          <span className="text-gray-400 text-sm mb-1">FCFA</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{plan.period}</p>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {feature.included ? (
              <div className="w-5 h-5 rounded-full bg-[#E8F8EF] flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#25D366]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            )}
            <span
              className={`text-sm ${
                feature.included ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* Action button */}
      {plan.current ? (
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          Plan actuel
        </button>
      ) : (
        <button
          onClick={() => onSelect(plan.name)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#16A34A] text-sm font-semibold hover:bg-[#E8F8EF] transition-colors cursor-pointer border border-[#25D366]/30"
        >
          Changer de plan
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ──────────────────── Invoice Row ──────────────────── */
function InvoiceRow({
  id,
  date,
  description,
  amount,
  status,
}: {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "Payé" | "En attente" | "Échoué";
}) {
  const statusStyles = {
    "Payé": "bg-[#E8F8EF] text-[#16A34A]",
    "En attente": "bg-yellow-50 text-yellow-600",
    "Échoué": "bg-red-50 text-red-600",
  };

  const statusDots = {
    "Payé": "bg-[#25D366]",
    "En attente": "bg-yellow-500",
    "Échoué": "bg-red-500",
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
        <FileText className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-gray-500">{date}</p>
          <span className="text-xs text-gray-300">•</span>
          <p className="text-xs text-gray-500">{id}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">{amount}</p>
        <div className="flex items-center gap-1.5 justify-end mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`} />
          <span className={`text-xs font-medium ${statusStyles[status].split(" ")[1]}`}>
            {status}
          </span>
        </div>
      </div>
      <button className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-[#E8F8EF] hover:text-[#25D366] transition-colors text-gray-400 cursor-pointer flex-shrink-0">
        <Download className="w-4 h-4" />
      </button>
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

/* ──────────────────── Plans Data ──────────────────── */
const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "29 000",
    period: "FCFA / mois",
    icon: Zap,
    description: "Pour démarrer votre activité",
    features: [
      { text: "1 numéro WhatsApp", included: true },
      { text: "1 000 crédits IA / mois", included: true },
      { text: "10 analyses d'images", included: true },
      { text: "Rapport hebdomadaire", included: true },
      { text: "Support par email", included: true },
      { text: "Réponses IA avancées", included: false },
      { text: "Multi-numéros", included: false },
      { text: "API personnalisée", included: false },
    ],
  },
  {
    name: "Pro",
    price: "49 000",
    period: "FCFA / mois",
    icon: Crown,
    description: "Pour les entreprises en croissance",
    current: true,
    features: [
      { text: "2 numéros WhatsApp", included: true },
      { text: "5 000 crédits IA / mois", included: true },
      { text: "50 analyses d'images", included: true },
      { text: "Rapport hebdomadaire", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Réponses IA avancées", included: true },
      { text: "Multi-numéros", included: false },
      { text: "API personnalisée", included: false },
    ],
  },
  {
    name: "Business",
    price: "199 000",
    period: "FCFA / mois",
    icon: Building2,
    description: "Pour les grandes entreprises",
    popular: true,
    features: [
      { text: "10 numéros WhatsApp", included: true },
      { text: "50 000 crédits IA / mois", included: true },
      { text: "500 analyses d'images", included: true },
      { text: "Rapport quotidien", included: true },
      { text: "Support dédié 24/7", included: true },
      { text: "Réponses IA avancées", included: true },
      { text: "Multi-numéros", included: true },
      { text: "API personnalisée", included: true },
    ],
  },
];

const invoices = [
  {
    id: "INV-2025-001",
    date: "15 janvier 2025",
    description: "Plan Pro — Renouvellement mensuel",
    amount: "49 000 FCFA",
    status: "Payé" as const,
  },
  {
    id: "INV-2024-012",
    date: "15 décembre 2024",
    description: "Plan Pro — Renouvellement mensuel",
    amount: "49 000 FCFA",
    status: "Payé" as const,
  },
  {
    id: "INV-2024-011",
    date: "15 novembre 2024",
    description: "Plan Pro — Renouvellement mensuel",
    amount: "49 000 FCFA",
    status: "Payé" as const,
  },
  {
    id: "INV-2024-010",
    date: "15 octobre 2024",
    description: "Plan Starter → Mise à niveau Pro",
    amount: "29 000 FCFA",
    status: "Payé" as const,
  },
];

/* ──────────────────── Main Component ──────────────────── */
export default function MonPlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSelectPlan = (planName: string) => {
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon Plan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez votre abonnement et suivez votre consommation
        </p>
      </div>

      {/* Current plan + Usage stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current plan */}
        <div className="lg:col-span-1">
          <CurrentPlanCard />
        </div>

        {/* Usage stats */}
        <div className="lg:col-span-2 grid sm:grid-cols-1 gap-4">
          <UsageBar
            label="Crédits IA utilisés"
            current={3200}
            max={5000}
            icon={Bot}
            color="#25D366"
            bgColor="#E8F8EF"
          />
          <UsageBar
            label="Numéros WhatsApp"
            current={1}
            max={2}
            icon={Smartphone}
            color="#8B5CF6"
            bgColor="#F3F0FF"
          />
          <UsageBar
            label="Analyses d'images"
            current={30}
            max={50}
            icon={ImageIcon}
            color="#F97316"
            bgColor="#FFF7ED"
          />
        </div>
      </div>

      {/* Plan comparison */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Comparaison des plans
          </h2>
          <span className="text-xs text-gray-400">TTC, facturation mensuelle</span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <PricingPlanCard
              key={plan.name}
              plan={plan}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </div>

      {/* Billing history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Historique de facturation
          </h2>
          <button className="text-xs text-[#25D366] font-medium hover:underline cursor-pointer">
            Voir tout
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {invoices.map((invoice) => (
            <InvoiceRow
              key={invoice.id}
              id={invoice.id}
              date={invoice.date}
              description={invoice.description}
              amount={invoice.amount}
              status={invoice.status}
            />
          ))}
        </div>
      </div>

      {/* Need help */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Headphones className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Besoin d&apos;aide ?</h3>
              <p className="text-xs text-gray-500">
                Notre équipe est disponible pour répondre à vos questions sur les plans et la facturation.
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 whitespace-nowrap">
            <MessageSquare className="w-4 h-4" />
            Contacter le support
          </button>
        </div>
      </div>
    </div>
  );
}
