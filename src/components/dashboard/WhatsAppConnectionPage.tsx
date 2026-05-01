"use client";

import { useState } from "react";
import {
  Phone,
  Shield,
  Zap,
  Bot,
  Crown,
  QrCode,
  X,
  CheckCircle2,
  Copy,
  RefreshCw,
  Clock,
} from "lucide-react";

/* ──────────────────── Feature Badge ──────────────────── */
function FeatureBadge({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2">
      <div className="w-6 h-6 rounded-full bg-[#E8F8EF] flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-[#16A34A]" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

/* ──────────────────── QR Code Modal ──────────────────── */
function QRCodeModal({
  onClose,
  onConnected,
  slotName,
}: {
  onClose: () => void;
  onConnected: () => void;
  slotName: string;
}) {
  const [connecting, setConnecting] = useState(false);
  const [qrTimer, setQrTimer] = useState("14:59");

  const handleScan = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      onConnected();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#16A34A]" />
            <h2 className="text-base font-bold text-gray-900">Scanner le code QR — {slotName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center">
          {connecting ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-[#E8F8EF] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Connexion en cours...</p>
              <p className="text-xs text-gray-500">Vérification du code QR</p>
            </div>
          ) : (
            <>
              {/* QR Code */}
              <div className="relative w-56 h-56 mb-4">
                <div className="absolute inset-0 bg-[#25D366]/10 rounded-2xl blur-xl" />
                <div className="relative w-full h-full bg-white rounded-2xl border-2 border-[#25D366]/20 p-3 flex items-center justify-center">
                  <div className="grid grid-cols-11 gap-0.5 w-full h-full">
                    {Array.from({ length: 121 }).map((_, i) => {
                      const row = Math.floor(i / 11);
                      const col = i % 11;
                      const isCorner =
                        (row < 3 && col < 3) ||
                        (row < 3 && col > 7) ||
                        (row > 7 && col < 3);
                      const isFilled = isCorner || Math.random() > 0.5;
                      return (
                        <div
                          key={i}
                          className={`rounded-[1px] ${isFilled ? "bg-gray-800" : "bg-gray-100"}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <Clock className="w-3.5 h-3.5" />
                <span>Le code QR expire dans {qrTimer}</span>
                <button className="flex items-center gap-1 text-[#16A34A] font-medium hover:underline cursor-pointer">
                  <RefreshCw className="w-3 h-3" />
                  Rafraîchir
                </button>
              </div>

              {/* Steps */}
              <div className="w-full space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-gray-600">Ouvrez WhatsApp sur votre téléphone</p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-gray-600">
                    Allez dans <span className="font-semibold">Paramètres</span> →{" "}
                    <span className="font-semibold">Appareils associés</span>
                  </p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-gray-600">Scannez ce code QR</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!connecting && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleScan}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#16A34A] transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Simuler la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────── Number Slot Card ──────────────────── */
type SlotStatus = "empty" | "connected" | "locked";

function NumberSlotCard({
  slotNumber,
  name,
  phone,
  status,
  onConnect,
  onUpgrade,
  onDisconnect,
}: {
  slotNumber: number;
  name: string;
  phone: string | null;
  status: SlotStatus;
  onConnect: () => void;
  onUpgrade: () => void;
  onDisconnect: () => void;
}) {
  const isActive = status === "connected";
  const isLocked = status === "locked";

  return (
    <div
      className={`relative bg-white rounded-2xl border overflow-hidden transition-shadow duration-200 hover:shadow-lg ${
        isActive ? "border-[#25D366]/30 shadow-sm" : isLocked ? "border-gray-200 opacity-75" : "border-gray-200 shadow-sm"
      }`}
    >
      {/* Locked badge */}
      {isLocked && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-semibold text-amber-600">Plan Business</span>
          </div>
        </div>
      )}

      {/* Connected badge */}
      {isActive && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1.5 bg-[#E8F8EF] border border-[#25D366]/20 rounded-full px-2.5 py-1">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#16A34A]">Connecté</span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Slot number */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4 ${
            isActive
              ? "bg-[#25D366] text-white"
              : isLocked
                ? "bg-gray-200 text-gray-400"
                : "bg-gray-800 text-white"
          }`}
        >
          {slotNumber}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>

        {/* Phone number */}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{phone}</span>
            <button className="text-gray-400 hover:text-[#16A34A] transition-colors cursor-pointer">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {isActive
            ? "Numéro connecté et actif. Votre agent IA répond automatiquement aux messages."
            : isLocked
              ? "Connectez jusqu'à 3 numéros WhatsApp avec le plan Business."
              : "Aucun numéro connecté. Cliquez sur Connecter pour scanner le QR."}
        </p>

        {/* Action button */}
        <div className="mt-auto">
          {isActive ? (
            <button
              onClick={onDisconnect}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer border border-red-200"
            >
              <X className="w-4 h-4" />
              Déconnecter
            </button>
          ) : isLocked ? (
            <button
              onClick={onUpgrade}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              Passer au Business
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#16A34A] transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Connecter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Main Component ──────────────────── */
export default function WhatsAppConnectionPage() {
  const [showQR, setShowQR] = useState<string | null>(null);
  const [slots, setSlots] = useState<
    Array<{ name: string; phone: string | null; status: SlotStatus }>
  >([
    { name: "Alou Shop", phone: "+221 76 028 96 07", status: "connected" },
    { name: "Numéro 2", phone: null, status: "empty" },
    { name: "Numéro 3", phone: null, status: "locked" },
  ]);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleConnect = (index: number) => {
    setShowQR(slots[index].name);
  };

  const handleConnected = () => {
    if (showQR) {
      const index = slots.findIndex((s) => s.name === showQR);
      if (index >= 0) {
        setSlots((prev) => {
          const next = [...prev];
          next[index] = {
            ...next[index],
            status: "connected",
            phone: index === 1 ? "+221 77 123 45 67" : next[index].phone,
          };
          return next;
        });
        setShowToast(`${showQR} connecté avec succès !`);
      }
    }
    setShowQR(null);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleDisconnect = (index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], status: "empty", phone: null };
      return next;
    });
    setShowToast(`${slots[index].name} déconnecté`);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleUpgrade = () => {
    setShowToast("Redirection vers le plan Business...");
    setTimeout(() => setShowToast(null), 3000);
  };

  const connectedCount = slots.filter((s) => s.status === "connected").length;

  return (
    <div className="space-y-8">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border bg-[#E8F8EF] border-[#25D366]/30 text-[#16A34A] text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {showToast}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <QRCodeModal
          slotName={showQR}
          onClose={() => setShowQR(null)}
          onConnected={handleConnected}
        />
      )}

      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="white"
              className="w-5 h-5"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Connecter vos numéros WhatsApp
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Plan Pro — jusqu'à 2 numéros simultanés
            </p>
          </div>
        </div>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap gap-3">
        <FeatureBadge icon={Shield} label="Connexion sécurisée" />
        <FeatureBadge icon={Zap} label="Activation instantanée" />
        <FeatureBadge icon={Bot} label="Réponses 24/7" />
      </div>

      {/* Number slot cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot, i) => (
          <NumberSlotCard
            key={i}
            slotNumber={i + 1}
            name={slot.name}
            phone={slot.phone}
            status={slot.status}
            onConnect={() => handleConnect(i)}
            onUpgrade={handleUpgrade}
            onDisconnect={() => handleDisconnect(i)}
          />
        ))}
      </div>

      {/* Usage info */}
      <div className="bg-gradient-to-r from-[#E8F8EF] to-[#D1FAE5] rounded-2xl p-5 border border-[#25D366]/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#16A34A] mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Utilisation de vos slots : {connectedCount} / 2
            </h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Avec le Plan Pro, vous pouvez connecter jusqu'à 2 numéros WhatsApp simultanément.
              Passez au Plan Business pour connecter jusqu'à 3 numéros et profiter de fonctionnalités avancées.
              Vos messages sont protégés par un chiffrement de bout en bout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
