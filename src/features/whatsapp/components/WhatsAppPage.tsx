"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  User,
  ArrowRight,
  MessageCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DASHBOARD_PATHS } from "@features/dashboard/constants";
import { useSessionStore } from "@features/auth/store/sessionStore";
import { PageHeader } from "@shared/components/feedback/PageHeader";
import { getPlanWhatsAppSubtitle } from "@shared/services/whatsapp/planLimits";
import { whatsAppSlotsService } from "@features/whatsapp/service";
import type { WhatsAppSlotDto, WhatsAppSlotsResponse } from "@features/whatsapp/types";

function FeatureBadge({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-tint">
        <Icon className="h-3.5 w-3.5 text-brand-dark" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

function formatCountdown(totalSeconds: number): string {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

type ModalStep = "form" | "qr" | "connecting" | "success";

function QRCodeModal({
  slotIndex,
  gatewayConfigured,
  onClose,
  onConnected,
  slotName,
  slotPhone,
}: {
  slotIndex: number;
  gatewayConfigured: boolean;
  onClose: () => void;
  onConnected: () => void;
  slotName: string;
  slotPhone: string | null;
}) {
  const [step, setStep] = useState<ModalStep>("form");
  const [name, setName] = useState(slotName);
  const [phone, setPhone] = useState(slotPhone || "");
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(900);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const startQrCountdown = (expiresInSeconds: number) => {
    setQrSecondsLeft(expiresInSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const result = await whatsAppSlotsService.pollStatus(slotIndex);
      if (!result.success) return;
      if (result.data.status === "connected") {
        clearTimers();
        setStep("success");
        setTimeout(() => onConnected(), 1200);
      }
    }, 2500);
  }, [slotIndex, clearTimers, onConnected]);

  const loadQr = async (refresh = false) => {
    if (!gatewayConfigured) {
      setError(
        "Passerelle WhatsApp non configurée. Définissez WHATSAPP_API_URL et WHATSAPP_API_KEY sur le serveur.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    const result = refresh
      ? await whatsAppSlotsService.refreshQr(slotIndex)
      : await whatsAppSlotsService.connect(slotIndex, name.trim(), phone.trim());

    setLoading(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setQrBase64(result.data.qrBase64);
    startQrCountdown(result.data.expiresInSeconds);
    setStep("qr");
    startPolling();
  };

  const handleShowQR = () => {
    if (!name.trim() || !phone.trim()) return;
    void loadQr(false);
  };

  const handleRefresh = () => {
    void loadQr(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>

        {error && (
          <div className="mx-6 mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "form" && (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{slotName}</h2>
              {slotPhone && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone className="h-3.5 w-3.5" />
                  {slotPhone}
                </p>
              )}
            </div>

            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              Renseignez le nom et le numéro, puis affichez le QR code à scanner
              depuis WhatsApp (Paramètres → Appareils associés).
            </p>

            <div className="mb-4">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom du numéro"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pr-4 pl-10 text-sm text-gray-900 focus:border-[#25D366]/50 focus:ring-2 focus:ring-[#25D366]/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 76 000 00 00"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pr-4 pl-10 text-sm text-gray-900 focus:border-[#25D366]/50 focus:ring-2 focus:ring-[#25D366]/30 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleShowQR}
              disabled={!name.trim() || !phone.trim() || loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Afficher le QR code
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {step === "qr" && (
          <div className="p-6 sm:p-8">
            <button
              type="button"
              onClick={() => {
                clearTimers();
                setStep("form");
              }}
              className="mb-4 flex cursor-pointer items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              ← Retour
            </button>

            <div className="mb-6 flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{name}</h2>
              <span className="text-sm text-gray-500">— {phone}</span>
            </div>

            <div className="mb-6 flex flex-col items-center">
              <div className="relative h-56 w-56">
                <div className="absolute inset-0 rounded-2xl bg-[#25D366]/10 blur-xl" />
                <div className="relative flex h-full w-full items-center justify-center rounded-2xl border-2 border-[#25D366]/20 bg-white p-3">
                  {qrBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrBase64}
                      alt="Code QR WhatsApp"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Loader2 className="h-10 w-10 animate-spin text-[#25D366]" />
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-[#25D366] shadow-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Le code QR expire dans {formatCountdown(qrSecondsLeft)}
              </span>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="flex cursor-pointer items-center gap-1 font-medium text-[#16A34A] hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                Rafraîchir
              </button>
            </div>

            <div className="mb-6 space-y-3">
              {[
                "Ouvrez WhatsApp sur votre téléphone",
                "Allez dans Paramètres → Appareils associés",
                "Scannez ce code QR",
              ].map((text, i) => (
                <div key={text} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {i + 1}
                  </span>
                  <p className="text-gray-600">{text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin text-[#25D366]" />
              En attente du scan sur votre téléphone…
            </div>
          </div>
        )}

        {step === "connecting" && (
          <div className="flex min-h-[320px] flex-col items-center justify-center p-10">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#16A34A]" />
            <p className="text-base font-semibold text-gray-900">
              Connexion en cours…
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex min-h-[320px] flex-col items-center justify-center p-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F8EF]">
              <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
            </div>
            <p className="text-base font-semibold text-gray-900">
              Connecté avec succès !
            </p>
            <p className="mt-1 text-sm text-gray-500">{name} est maintenant actif</p>
          </div>
        )}
      </div>
    </div>
  );
}

type SlotStatus = WhatsAppSlotDto["status"];

function NumberSlotCard({
  slotNumber,
  name,
  phone,
  status,
  onConnect,
  onUpgrade,
  onDisconnect,
  disconnecting,
}: {
  slotNumber: number;
  name: string;
  phone: string | null;
  status: SlotStatus;
  onConnect: () => void;
  onUpgrade: () => void;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const isActive = status === "connected";
  const isLocked = status === "locked";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white transition-shadow duration-200 hover:shadow-lg ${
        isActive
          ? "border-[#25D366]/30 shadow-sm"
          : isLocked
            ? "border-gray-200 opacity-75"
            : "border-gray-200 shadow-sm"
      }`}
    >
      {isLocked && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1">
            <Crown className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[11px] font-semibold text-amber-600">
              Plan Business
            </span>
          </div>
        </div>
      )}

      {isActive && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1.5 rounded-full border border-[#25D366]/20 bg-[#E8F8EF] px-2.5 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#25D366]" />
            <span className="text-[11px] font-semibold text-[#16A34A]">
              Connecté
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        <div
          className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
            isActive
              ? "bg-[#25D366] text-white"
              : isLocked
                ? "bg-gray-200 text-gray-400"
                : "bg-gray-800 text-white"
          }`}
        >
          {slotNumber}
        </div>

        <h3 className="mb-1 text-lg font-bold text-gray-900">{name}</h3>

        {phone && (
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{phone}</span>
            <button
              type="button"
              className="cursor-pointer text-gray-400 transition-colors hover:text-[#16A34A]"
              onClick={() => void navigator.clipboard.writeText(phone)}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          {isActive
            ? "Numéro connecté et actif. Votre agent IA répond automatiquement aux messages."
            : isLocked
              ? "Connectez jusqu'à 3 numéros WhatsApp avec le plan Business."
              : "Aucun numéro connecté. Cliquez sur Connecter pour scanner le QR."}
        </p>

        <div className="mt-auto">
          {isActive ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={disconnecting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              {disconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Déconnecter
            </button>
          ) : isLocked ? (
            <button
              type="button"
              onClick={onUpgrade}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600"
            >
              <Crown className="h-4 w-4" />
              Passer au Business
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <QrCode className="h-4 w-4" />
              Connecter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppPage() {
  const [data, setData] = useState<WhatsAppSlotsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<number | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [disconnectingSlot, setDisconnectingSlot] = useState<number | null>(null);
  const router = useRouter();
  const setPlanIntent = useSessionStore((s) => s.setPlanIntent);

  const reload = useCallback(async () => {
    const result = await whatsAppSlotsService.listSlots();
    if (!result.success) {
      setLoadError(result.error.message);
      return;
    }
    setData(result.data);
    setLoadError(null);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    })();
  }, [reload]);

  const handleConnected = async () => {
    setShowQR(null);
    await reload();
    setShowToast("Numéro WhatsApp connecté avec succès !");
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleDisconnect = async (slotIndex: number) => {
    setDisconnectingSlot(slotIndex);
    const result = await whatsAppSlotsService.disconnect(slotIndex);
    setDisconnectingSlot(null);
    if (!result.success) {
      setShowToast(result.error.message);
      setTimeout(() => setShowToast(null), 4000);
      return;
    }
    await reload();
    const name =
      data?.slots.find((s) => s.slotIndex === slotIndex)?.displayName ??
      "Numéro";
    setShowToast(`${name} déconnecté`);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleUpgrade = () => {
    setPlanIntent("Business");
    router.push(DASHBOARD_PATHS.plan);
  };

  const activeSlot =
    showQR !== null ? data?.slots.find((s) => s.slotIndex === showQR) : null;

  return (
    <div className="space-y-8 text-neutral-900">
      {showToast && (
        <div className="fixed top-6 right-6 z-50">
          <div className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand-tint px-5 py-3 text-sm font-medium text-brand-dark shadow-lg">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {showToast}
          </div>
        </div>
      )}

      {showQR !== null && activeSlot && data && (
        <QRCodeModal
          slotIndex={showQR}
          gatewayConfigured={data.gatewayConfigured}
          slotName={activeSlot.displayName}
          slotPhone={activeSlot.phone}
          onClose={() => setShowQR(null)}
          onConnected={() => void handleConnected()}
        />
      )}

      <PageHeader
        icon={MessageCircle}
        title="Connecter vos numéros WhatsApp"
        subtitle={
          data ? getPlanWhatsAppSubtitle(data.planTier) : "Chargement…"
        }
        iconBgClass="bg-brand"
        iconClass="text-white"
      />

      {data && !data.gatewayConfigured && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Passerelle WhatsApp non configurée</p>
            <p className="mt-1 text-amber-900/90">
              Pour un QR code réel, déployez{" "}
              <a
                href="https://doc.evolution-api.com"
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                Evolution API
              </a>{" "}
              puis ajoutez <code className="text-xs">WHATSAPP_API_URL</code> et{" "}
              <code className="text-xs">WHATSAPP_API_KEY</code> dans{" "}
              <code className="text-xs">.env.local</code> (redémarrer{" "}
              <code className="text-xs">npm run dev</code>).
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <FeatureBadge icon={Shield} label="Connexion sécurisée" />
        <FeatureBadge icon={Zap} label="Activation instantanée" />
        <FeatureBadge icon={Bot} label="Réponses 24/7" />
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      )}

      {loadError && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {data && !loading && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.slots.map((slot) => (
              <NumberSlotCard
                key={slot.slotIndex}
                slotNumber={slot.slotIndex}
                name={slot.displayName}
                phone={slot.phone}
                status={slot.status}
                onConnect={() => setShowQR(slot.slotIndex)}
                onUpgrade={handleUpgrade}
                onDisconnect={() => void handleDisconnect(slot.slotIndex)}
                disconnecting={disconnectingSlot === slot.slotIndex}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand-tint to-brand-soft p-5">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand-dark" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Utilisation de vos slots : {data.connectedCount} / {data.maxSlots}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {getPlanWhatsAppSubtitle(data.planTier)}. Passez au plan
                  supérieur pour connecter plus de numéros. Connexion via scan QR
                  (WhatsApp → Appareils associés).
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
