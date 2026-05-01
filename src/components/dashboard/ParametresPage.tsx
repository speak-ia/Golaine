"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  User,
  Building2,
  Bell,
  Shield,
  Puzzle,
  CreditCard,
  Camera,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Smartphone,
  Globe,
  Clock,
  ChevronDown,
  Check,
  X,
  Key,
  AlertTriangle,
  Wifi,
  FileSpreadsheet,
  SmartphoneNfc,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type TabId = "profil" | "entreprise" | "notifications" | "securite" | "integrations" | "facturation";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: "profil", label: "Profil", icon: User },
  { id: "entreprise", label: "Entreprise", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "securite", label: "Sécurité", icon: Shield },
  { id: "integrations", label: "Intégrations", icon: Puzzle },
  { id: "facturation", label: "Facturation", icon: CreditCard },
];

/* ═══════════════════════════════════════════════════════════════
   TOGGLE SWITCH
   ═══════════════════════════════════════════════════════════════ */

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
        enabled ? "bg-[#25D366]" : "bg-gray-300"
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONFIRM MODAL
   ═══════════════════════════════════════════════════════════════ */

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full z-10">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              confirmVariant === "danger"
                ? "bg-red-50"
                : "bg-amber-50"
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${
                confirmVariant === "danger"
                  ? "text-red-500"
                  : "text-amber-500"
              }`}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors cursor-pointer ${
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUCCESS / ERROR BANNER
   ═══════════════════════════════════════════════════════════════ */

function FeedbackBanner({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl mb-4 ${
        type === "success"
          ? "bg-[#E8F8EF] text-[#16A34A]"
          : "bg-red-50 text-red-600"
      }`}
    >
      <Check className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onDismiss} className="cursor-pointer hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE
   ═══════════════════════════════════════════════════════════════ */

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "danger" | "neutral";
}) {
  const colors = {
    success: "bg-[#E8F8EF] text-[#16A34A]",
    danger: "bg-red-50 text-red-600",
    neutral: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1 — PROFIL
   ═══════════════════════════════════════════════════════════════ */

function ProfilTab() {
  const [name, setName] = useState("Alassane Amadou Diallo");
  const [email, setEmail] = useState("alassane@golaine.sn");
  const [phone, setPhone] = useState("+221 77 123 45 67");
  const [lang, setLang] = useState("Français");
  const [tz, setTz] = useState("UTC+1 Dakar");
  const [langOpen, setLangOpen] = useState(false);
  const [tzOpen, setTzOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const { profilePhoto, setProfilePhoto } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const emailError = email.length > 0 && !isValidEmail(email);

  /* Close dropdowns on outside click */
  useEffect(() => {
    if (!langOpen && !tzOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
        setTzOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen, tzOpen]);

  const handleSaveProfil = () => {
    if (!name.trim()) { setFeedback({ type: "error", msg: "Le nom est requis." }); return; }
    if (!email.trim() || !isValidEmail(email)) { setFeedback({ type: "error", msg: "Veuillez entrer un email valide." }); return; }
    if (!phone.trim()) { setFeedback({ type: "error", msg: "Le téléphone est requis." }); return; }
    setFeedback({ type: "success", msg: "Profil mis à jour avec succès !" });
  };

  const langs = ["Français", "English", "Wolof"];
  const timezones = ["UTC+0 GMT", "UTC+1 Dakar"];

  return (
    <div className="space-y-6">
      {feedback && (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.msg}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Avatar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Photo de profil</h3>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#25D366] to-[#16A34A] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 overflow-hidden relative">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Photo" className="w-full h-full object-cover" />
            ) : (
              "AD"
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith("image/")) return;
                if (file.size > 5 * 1024 * 1024) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setProfilePhoto(ev.target?.result as string);
                  setFeedback({ type: "success", msg: "Photo mise à jour avec succès !" });
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-[#16A34A] bg-[#E8F8EF] hover:bg-[#d0f0de] rounded-xl transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 inline mr-2" />
              {profilePhoto ? "Changer la photo" : "Ajouter une photo"}
            </button>
            {profilePhoto && (
              <button
                onClick={() => setProfilePhoto(null)}
                className="block mt-2 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Supprimer la photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
        <h3 className="text-sm font-bold text-gray-700">Informations personnelles</h3>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Nom complet</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all ${
              emailError
                ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
                : "border-gray-200 focus:ring-[#25D366]/30 focus:border-[#25D366]"
            }`}
          />
          {emailError && (
            <p className="text-xs text-red-500 mt-1">Veuillez entrer un email valide.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
          />
        </div>

        {/* Language + Timezone wrapped for outside-click ref */}
        <div ref={dropdownRef}>
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              <Globe className="w-4 h-4 inline mr-1.5" /> Langue
            </label>
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setTzOpen(false); }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 text-left flex items-center justify-between hover:border-gray-300 transition-colors cursor-pointer"
              >
                {lang}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg py-1">
                  {langs.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                        l === lang ? "text-[#16A34A] font-medium" : "text-gray-700"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1.5" /> Fuseau horaire
            </label>
            <div className="relative">
              <button
                onClick={() => { setTzOpen(!tzOpen); setLangOpen(false); }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 text-left flex items-center justify-between hover:border-gray-300 transition-colors cursor-pointer"
              >
                {tz}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${tzOpen ? "rotate-180" : ""}`} />
              </button>
              {tzOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg py-1">
                  {timezones.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTz(t); setTzOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                        t === tz ? "text-[#16A34A] font-medium" : "text-gray-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveProfil}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#25D366] to-[#16A34A] hover:opacity-90 rounded-xl transition-opacity cursor-pointer"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2 — ENTREPRISE
   ═══════════════════════════════════════════════════════════════ */

function EntrepriseTab() {
  const [nom, setNom] = useState("Boutique Alassane Mode");
  const [desc, setDesc] = useState("Boutique de mode africaine contemporaine, spécialisée dans les vêtements wax et les accessoires artisanaux.");
  const [adresse, setAdresse] = useState("Plateau, Dakar, Sénégal");
  const [secteur, setSecteur] = useState("Mode");
  const [siteWeb, setSiteWeb] = useState("www.alassanemode.sn");
  const [secteurOpen, setSecteurOpen] = useState(false);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const secteurs = ["Mode", "Alimentation", "Beauté", "Électronique", "Autre"];

  return (
    <div className="space-y-6">
      {feedback && (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.msg}
          onDismiss={() => setFeedback(null)}
        />
      )}

      <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
        <h3 className="text-sm font-bold text-gray-700">Informations de l&apos;entreprise</h3>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Nom</label>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Adresse</label>
          <input
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
          />
        </div>

        {/* Secteur */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Secteur d&apos;activité</label>
          <div className="relative">
            <button
              onClick={() => setSecteurOpen(!secteurOpen)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 text-left flex items-center justify-between hover:border-gray-300 transition-colors cursor-pointer"
            >
              {secteur}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${secteurOpen ? "rotate-180" : ""}`} />
            </button>
            {secteurOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg py-1">
                {secteurs.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSecteur(s); setSecteurOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                      s === secteur ? "text-[#16A34A] font-medium" : "text-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Site web</label>
          <input
            value={siteWeb}
            onChange={(e) => setSiteWeb(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
          />
        </div>

        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Logo de l&apos;entreprise</label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="logo-upload-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!file.type.startsWith("image/")) return;
              if (file.size > 2 * 1024 * 1024) return; // 2 Mo max
              setLogoUploaded(true);
              setFeedback({ type: "success", msg: "Logo téléchargé avec succès !" });
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => document.getElementById("logo-upload-input")?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              logoUploaded
                ? "border-[#25D366] bg-[#E8F8EF]"
                : "border-gray-300 hover:border-[#25D366] hover:bg-gray-50"
            }`}
          >
            {logoUploaded ? (
              <>
                <Check className="w-8 h-8 text-[#25D366]" />
                <p className="text-sm font-medium text-[#16A34A]">Logo téléchargé avec succès</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoUploaded(false);
                  }}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer mt-1"
                >
                  Changer le logo
                </button>
              </>
            ) : (
              <>
                <Building2 className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-500">Cliquez pour télécharger votre logo</p>
                <p className="text-xs text-gray-400">PNG, JPG, SVG — Max 2 Mo</p>
              </>
            )}
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setFeedback({ type: "success", msg: "Informations de l'entreprise mises à jour !" })}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#25D366] to-[#16A34A] hover:opacity-90 rounded-xl transition-opacity cursor-pointer"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3 — NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */

function NotificationsTab() {
  const [notifications, setNotifications] = useState([
    { id: "orders", label: "Nouvelles commandes", desc: "Recevez une notification pour chaque nouvelle commande", enabled: true },
    { id: "whatsapp", label: "Messages WhatsApp", desc: "Alertes pour les nouveaux messages WhatsApp", enabled: true },
    { id: "report", label: "Rapport hebdomadaire", desc: "Résumé d'activité chaque lundi", enabled: true },
    { id: "stock", label: "Alertes stock faible", desc: "Notification quand un produit est en stock faible", enabled: true },
    { id: "contacts", label: "Nouveaux contacts", desc: "Alerte lors de l'ajout d'un nouveau contact", enabled: false },
    { id: "products", label: "Mises à jour produit", desc: "Notifications liées aux mises à jour de produits", enabled: false },
  ]);

  const toggle = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h3 className="text-sm font-bold text-gray-700 mb-1">Préférences de notifications</h3>
      <p className="text-sm text-gray-500 mb-6">Gérez les notifications que vous souhaitez recevoir.</p>

      <div className="divide-y divide-gray-100">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium text-gray-900">{n.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
            </div>
            <ToggleSwitch enabled={n.enabled} onToggle={() => toggle(n.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4 — SÉCURITÉ
   ═══════════════════════════════════════════════════════════════ */

function SecuriteTab() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwFeedback, setPwFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState([
    { id: "s1", device: "Chrome sur MacOS", location: "Dakar, Sénégal", lastActive: "Actif maintenant" },
    { id: "s2", device: "WhatsApp Business App", location: "Dakar, Sénégal", lastActive: "Il y a 2 heures" },
    { id: "s3", device: "Safari sur iPhone 15", location: "Thiès, Sénégal", lastActive: "Il y a 3 jours" },
  ]);
  const [deleteModal, setDeleteModal] = useState(false);

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      setPwFeedback({ type: "error", msg: "Veuillez remplir tous les champs." });
      return;
    }
    if (newPw.length < 8) {
      setPwFeedback({ type: "error", msg: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (newPw !== confirmPw) {
      setPwFeedback({ type: "error", msg: "Les mots de passe ne correspondent pas." });
      return;
    }
    setPwFeedback({ type: "success", msg: "Mot de passe modifié avec succès !" });
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  const disconnectSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {pwFeedback && (
        <FeedbackBanner
          type={pwFeedback.type}
          message={pwFeedback.msg}
          onDismiss={() => setPwFeedback(null)}
        />
      )}

      {/* Change password */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Changer le mot de passe</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
              />
              <button
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
              />
              <button
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all"
              />
              <button
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#25D366] to-[#16A34A] hover:opacity-90 rounded-xl transition-opacity cursor-pointer"
          >
            Changer
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-700">Authentification à deux facteurs</h3>
            <p className="text-sm text-gray-500 mt-1">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
          </div>
          <div className="flex items-center gap-3">
            {twoFA ? (
              <StatusBadge label="Activé" variant="success" />
            ) : (
              <StatusBadge label="Désactivé" variant="danger" />
            )}
            <button
              onClick={() => setTwoFA(!twoFA)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                twoFA
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-[#16A34A] bg-[#E8F8EF] hover:bg-[#d0f0de]"
              }`}
            >
              {twoFA ? "Désactiver" : "Activer"}
            </button>
          </div>
        </div>
      </div>

      {/* Active sessions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Sessions actives</h3>
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune session active.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.device}</p>
                    <p className="text-xs text-gray-500">
                      {session.location} · {session.lastActive}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => disconnectSession(session.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 inline mr-1" />
                  Déconnecter
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete account */}
      <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-700">Supprimer le compte</h3>
            <p className="text-sm text-red-600/70 mt-1">
              Cette action est irréversible. Toutes vos données seront supprimées définitivement.
            </p>
            <button
              onClick={() => setDeleteModal(true)}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={deleteModal}
        title="Supprimer le compte"
        message="Êtes-vous sûr ? Cette action est irréversible. Toutes vos données, contacts, commandes et conversations seront supprimées définitivement."
        confirmLabel="Supprimer définitivement"
        confirmVariant="danger"
        onConfirm={() => {
          setDeleteModal(false);
        }}
        onCancel={() => setDeleteModal(false)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5 — INTÉGRATIONS
   ═══════════════════════════════════════════════════════════════ */

function IntegrationsTab() {
  const [whatsappConnected, setWhatsappConnected] = useState(true);
  const [sheetsConnected, setSheetsConnected] = useState(false);
  const [mobileConnected, setMobileConnected] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const MOCK_API_KEY = "sk-golaine-a1b2c3d4e5f6g7h8i9j0";

  const copyApiKey = () => {
    navigator.clipboard.writeText(MOCK_API_KEY).then(() => {
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = MOCK_API_KEY;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* WhatsApp Business */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#E8F8EF] flex items-center justify-center flex-shrink-0">
              <Wifi className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">WhatsApp Business</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Connecté au <span className="text-gray-700 font-medium">+221 77 123 45 67</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge label="Connecté" variant="success" />
            {whatsappConnected && (
              <button
                onClick={() => setWhatsappConnected(false)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
              >
                Déconnecter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google Sheets */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Google Sheets</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Synchronisez vos commandes et contacts avec Google Sheets.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sheetsConnected ? (
              <StatusBadge label="Connecté" variant="success" />
            ) : (
              <StatusBadge label="Non connecté" variant="neutral" />
            )}
            <button
              onClick={() => setSheetsConnected(!sheetsConnected)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                sheetsConnected
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-[#16A34A] bg-[#E8F8EF] hover:bg-[#d0f0de]"
              }`}
            >
              {sheetsConnected ? "Déconnecter" : "Connecter"}
            </button>
          </div>
        </div>
      </div>

      {/* Paiement Mobile */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <SmartphoneNfc className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Paiement Mobile</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Orange Money, Wave, Free Money — Acceptez les paiements directement.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mobileConnected ? (
              <StatusBadge label="Connecté" variant="success" />
            ) : (
              <StatusBadge label="Non connecté" variant="neutral" />
            )}
            <button
              onClick={() => setMobileConnected(!mobileConnected)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                mobileConnected
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-[#16A34A] bg-[#E8F8EF] hover:bg-[#d0f0de]"
              }`}
            >
              {mobileConnected ? "Déconnecter" : "Connecter"}
            </button>
          </div>
        </div>
      </div>

      {/* API */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">API</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Utilisez notre API pour intégrer Golaine dans vos systèmes existants.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <code className="flex-1 text-sm text-gray-700 font-mono select-all">
            sk-golaine-****...****-a1b2
          </code>
          <div className="flex items-center gap-2">
            <button
              onClick={copyApiKey}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                apiKeyCopied
                  ? "text-[#16A34A] bg-[#E8F8EF]"
                  : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Copy className="w-4 h-4" />
              {apiKeyCopied ? "Copié !" : "Copier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 6 — FACTURATION
   ═══════════════════════════════════════════════════════════════ */

function FacturationTab() {
  const [paymentMethodAdded, setPaymentMethodAdded] = useState(false);

  const billingHistory = [
    { id: 1, date: "15 Jan 2025", desc: "Plan Pro — Mensuel", amount: "49 000", status: "Payé" },
    { id: 2, date: "15 Déc 2024", desc: "Plan Pro — Mensuel", amount: "49 000", status: "Payé" },
    { id: 3, date: "15 Nov 2024", desc: "Plan Pro — Mensuel", amount: "49 000", status: "Payé" },
    { id: 4, date: "15 Oct 2024", desc: "Plan Pro — Mensuel", amount: "49 000", status: "Payé" },
  ];

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-wider text-gray-300">PLAN ACTUEL</h3>
          <CreditCard className="w-4 h-4 text-gray-400" />
        </div>
        <p className="text-2xl font-bold">Plan Pro</p>
        <p className="text-3xl font-bold text-[#25D366] mt-1">49 000 FCFA<span className="text-sm font-normal text-gray-400">/mois</span></p>
        <p className="text-sm text-gray-400 mt-3">
          Prochain renouvellement le <span className="text-white font-medium">15 Février 2025</span>
        </p>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          <span className="text-xs text-gray-400">Inclus :</span>
          <span className="text-xs text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-full">2 numéros WhatsApp</span>
          <span className="text-xs text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-full">5 000 crédits IA</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Méthode de paiement</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <SmartphoneNfc className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Orange Money</p>
                <p className="text-xs text-gray-500">****4567</p>
              </div>
            </div>
            <StatusBadge label="Par défaut" variant="success" />
          </div>
          {paymentMethodAdded && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <SmartphoneNfc className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Wave</p>
                  <p className="text-xs text-gray-500">****8901</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setPaymentMethodAdded(true)}
            className="w-full px-4 py-3 text-sm font-medium text-[#16A34A] bg-[#E8F8EF] hover:bg-[#d0f0de] rounded-xl transition-colors cursor-pointer"
          >
            + Ajouter une méthode
          </button>
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700">Historique de facturation</h3>
          <button className="text-xs text-[#16A34A] font-medium hover:underline cursor-pointer">
            Exporter les factures
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{row.date}</td>
                  <td className="py-3 px-2 text-gray-900 font-medium">{row.desc}</td>
                  <td className="py-3 px-2 text-gray-900 font-semibold text-right whitespace-nowrap">{row.amount} FCFA</td>
                  <td className="py-3 px-2 text-center">
                    <StatusBadge label={row.status} variant="success" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export button */}
      <div className="flex justify-end">
        <button className="px-5 py-2.5 text-sm font-medium text-[#16A34A] bg-[#E8F8EF] hover:bg-[#d0f0de] rounded-xl transition-colors cursor-pointer">
          Exporter les factures
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PARAMETRES PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profil");

  const renderTab = () => {
    switch (activeTab) {
      case "profil":
        return <ProfilTab />;
      case "entreprise":
        return <EntrepriseTab />;
      case "notifications":
        return <NotificationsTab />;
      case "securite":
        return <SecuriteTab />;
      case "integrations":
        return <IntegrationsTab />;
      case "facturation":
        return <FacturationTab />;
    }
  };

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
          Paramètres
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Gérez les paramètres de votre compte et de votre entreprise.
        </p>
      </div>

      {/* Desktop: sidebar tabs + content  |  Mobile: horizontal tabs */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Sidebar Tabs (desktop) ── */}
        <aside className="hidden md:block flex-shrink-0">
          <nav
            className="w-[220px] bg-white rounded-xl border border-gray-200 p-2 space-y-0.5 sticky top-6"
            style={{ alignSelf: "flex-start" }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#E8F8EF] text-[#16A34A] font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] flex-shrink-0 ${
                      isActive ? "text-[#16A34A]" : "text-gray-400"
                    }`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Mobile: horizontal tab bar ── */}
        <nav className="md:hidden flex gap-1 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                  isActive
                    ? "bg-[#E8F8EF] text-[#16A34A] font-semibold"
                    : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* ── Tab content ── */}
        <div className="flex-1 min-w-0">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
