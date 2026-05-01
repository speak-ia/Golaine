"use client";

import { useState } from "react";
import {
  QrCode,
  Smartphone,
  Settings,
  Link2,
  ScanLine,
  CheckCircle2,
  Unplug,
  RefreshCw,
  MessageSquare,
  Bot,
  TrendingUp,
  Phone,
  Calendar,
  Shield,
  Clock,
  Zap,
  AlertTriangle,
} from "lucide-react";

/* ──────────────────── Types ──────────────────── */
type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

/* ──────────────────── Step Indicator ──────────────────── */
function StepIndicator({
  number,
  icon: Icon,
  label,
  active,
  completed,
}: {
  number: number;
  icon: React.ElementType;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            completed
              ? "bg-[#25D366] text-white"
              : active
                ? "bg-[#25D366]/10 text-[#25D366] ring-2 ring-[#25D366]/30"
                : "bg-gray-100 text-gray-400"
          }`}
        >
          {completed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
        </div>
        {number < 4 && (
          <div
            className={`w-0.5 h-8 mt-1 transition-all duration-300 ${
              completed ? "bg-[#25D366]" : "bg-gray-200"
            }`}
          />
        )}
      </div>
      <div className="pt-2">
        <p
          className={`text-sm font-semibold transition-colors ${
            completed ? "text-[#25D366]" : active ? "text-gray-900" : "text-gray-400"
          }`}
        >
          Étape {number}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ──────────────────── QR Code Placeholder ──────────────────── */
function QRCodePlaceholder() {
  return (
    <div className="relative w-56 h-56 mx-auto">
      {/* Outer glow */}
      <div className="absolute inset-0 bg-[#25D366]/10 rounded-2xl blur-xl" />
      {/* QR container */}
      <div className="relative w-full h-full bg-white rounded-2xl border-2 border-[#25D366]/20 p-4 flex items-center justify-center">
        <div className="grid grid-cols-11 gap-0.5 w-full h-full">
          {Array.from({ length: 121 }).map((_, i) => {
            const row = Math.floor(i / 11);
            const col = i % 11;
            const isCorner =
              (row < 3 && col < 3) ||
              (row < 3 && col > 7) ||
              (row > 7 && col < 3);
            const isFilled =
              isCorner ||
              Math.random() > 0.5;
            return (
              <div
                key={i}
                className={`rounded-[1px] ${isFilled ? "bg-gray-800" : "bg-gray-100"}`}
              />
            );
          })}
        </div>
      </div>
      {/* WhatsApp icon overlay */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
    </div>
  );
}

/* ──────────────────── Stat Card ──────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && (
            <p className="text-xs text-[#25D366] font-medium mt-1">{subValue}</p>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Connected Info Panel ──────────────────── */
function ConnectedInfoPanel({
  onDisconnect,
  onReconnect,
}: {
  onDisconnect: () => void;
  onReconnect: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#E8F8EF] flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-[#25D366]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Connexion active</h3>
          <p className="text-sm text-gray-500">Votre WhatsApp est synchronisé</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F8EF] text-[#16A34A] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          Connecté
        </span>
      </div>

      {/* Info grid */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <Phone className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Numéro</p>
            <p className="text-sm font-semibold text-gray-900">+221 77 123 45 67</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Connecté depuis</p>
            <p className="text-sm font-semibold text-gray-900">15 janvier 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <Shield className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Sécurité</p>
            <p className="text-sm font-semibold text-gray-900">Chiffrement E2E</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDisconnect}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer border border-red-200"
        >
          <Unplug className="w-4 h-4" />
          Déconnecter
        </button>
        <button
          onClick={onReconnect}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8F8EF] text-[#16A34A] text-sm font-semibold hover:bg-[#D1FAE5] transition-colors cursor-pointer border border-[#25D366]/20"
        >
          <RefreshCw className="w-4 h-4" />
          Reconnecter
        </button>
      </div>
    </div>
  );
}

/* ──────────────────── Disconnected Panel ──────────────────── */
function DisconnectedPanel({
  onConnect,
}: {
  onConnect: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Connexion perdue</h3>
          <p className="text-sm text-gray-500">Votre WhatsApp n'est plus synchronisé</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Déconnecté
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Votre session WhatsApp a expiré ou a été déconnectée. Veuillez rescanner le code QR pour
        rétablir la connexion.
      </p>
      <button
        onClick={onConnect}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#16A34A] transition-colors cursor-pointer"
      >
        <QrCode className="w-4 h-4" />
        Scanner le code QR
      </button>
    </div>
  );
}

/* ──────────────────── Reconnecting Panel ──────────────────── */
function ReconnectingPanel() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-yellow-500 animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Reconnexion en cours...</h3>
          <p className="text-sm text-gray-500">Veuillez patienter</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-600 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          Reconnexion
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full animate-pulse w-2/3" />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Tentative de reconnexion automatique...
      </p>
    </div>
  );
}

/* ──────────────────── Main Component ──────────────────── */
export default function WhatsAppConnectionPage() {
  const [status, setStatus] = useState<ConnectionStatus>("connected");
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleDisconnect = () => {
    setShowToast("WhatsApp déconnecté avec succès");
    setTimeout(() => setStatus("disconnected"), 600);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleReconnect = () => {
    setShowToast("Reconnexion en cours...");
    setStatus("reconnecting");
    setTimeout(() => {
      setStatus("connected");
      setShowToast("WhatsApp reconnecté avec succès !");
    }, 2500);
    setTimeout(() => setShowToast(null), 4000);
  };

  const handleScanQR = () => {
    setShowToast("Connexion en cours...");
    setStatus("reconnecting");
    setTimeout(() => {
      setStatus("connected");
      setShowToast("WhatsApp connecté avec succès !");
    }, 2000);
    setTimeout(() => setShowToast(null), 3500);
  };

  const steps = [
    { icon: Smartphone, label: "Ouvrez WhatsApp sur votre téléphone" },
    { icon: Settings, label: "Accédez aux Paramètres" },
    { icon: Link2, label: "Appuyez sur Appareils associés" },
    { icon: ScanLine, label: "Scannez le code QR ci-dessus" },
  ];

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              status === "connected"
                ? "bg-[#E8F8EF] border-[#25D366]/30 text-[#16A34A]"
                : status === "reconnecting"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                  : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {showToast}
          </div>
        </div>
      )}

      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Connecter WhatsApp</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez la connexion entre votre compte WhatsApp Business et Venteo
        </p>
      </div>

      {/* QR Code + Steps section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-5">
            <QrCode className="w-5 h-5 text-[#25D366]" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Code QR
            </h2>
          </div>
          <QRCodePlaceholder />
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Le code QR expire dans 14:32</span>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-[#25D366]" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Instructions
            </h2>
          </div>
          <div className="space-y-1">
            {steps.map((step, i) => (
              <StepIndicator
                key={i}
                number={i + 1}
                icon={step.icon}
                label={step.label}
                active={i === 0 && status !== "connected"}
                completed={status === "connected"}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Connection status panel */}
      {status === "connected" && (
        <ConnectedInfoPanel
          onDisconnect={handleDisconnect}
          onReconnect={handleReconnect}
        />
      )}
      {status === "disconnected" && (
        <DisconnectedPanel onConnect={handleScanQR} />
      )}
      {status === "reconnecting" && <ReconnectingPanel />}

      {/* Stats section */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Statistiques de connexion
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={MessageSquare}
            label="Messages envoyés"
            value="1 245"
            subValue="+156 ce mois"
            color="#25D366"
            bgColor="#E8F8EF"
          />
          <StatCard
            icon={Bot}
            label="Réponses IA"
            value="987"
            subValue="79% automatisées"
            color="#8B5CF6"
            bgColor="#F3F0FF"
          />
          <StatCard
            icon={TrendingUp}
            label="Taux de réponse"
            value="94%"
            subValue="+3% vs mois dernier"
            color="#F97316"
            bgColor="#FFF7ED"
          />
          <StatCard
            icon={Clock}
            label="Temps moyen"
            value="1.2s"
            subValue="Réponse instantanée"
            color="#0EA5E9"
            bgColor="#F0F9FF"
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-[#E8F8EF] to-[#D1FAE5] rounded-2xl p-5 border border-[#25D366]/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#16A34A] mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Sécurité & Confidentialité</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Vos messages sont protégés par un chiffrement de bout en bout. Venteo agit comme un
              assistant IA et ne stocke jamais le contenu de vos conversations. Seules les
              métadonnées nécessaires au bon fonctionnement du service sont collectées, conformément
              à notre politique de confidentialité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
