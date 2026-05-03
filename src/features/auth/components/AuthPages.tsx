"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Building2, Loader2 } from "lucide-react";
import { BrandLogo } from "@shared/components/feedback/BrandLogo";
import { isSupabaseConfigured } from "@/config/env";
import { createBrowserSupabaseClient } from "@shared/services/supabase/client";
import { logger } from "@shared/utils/logger";
import { toast } from "sonner";

/* ──────────────────── Google Button ──────────────────── */
function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-[rgb(38,38,38)] border border-white/[0.08] hover:bg-[rgb(48,48,48)] transition-all duration-200 cursor-pointer group"
    >
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
      </svg>
      <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
        {label}
      </span>
    </button>
  );
}

/* ──────────────────── Divider ──────────────────── */
function Divider() {
  return (
    <div className="relative flex items-center my-6">
      <div className="flex-1 h-px bg-white/[0.08]" />
      <span className="px-4 text-xs text-[rgb(100,116,139)] font-medium">
        ou
      </span>
      <div className="flex-1 h-px bg-white/[0.08]" />
    </div>
  );
}

/* ──────────────────── Input Field ──────────────────── */
function FormInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ElementType;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[rgb(203,213,225)]"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(100,116,139)]">
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full ${
            Icon ? "pl-11" : "pl-4"
          } pr-4 py-3 rounded-xl bg-[rgb(38,38,38)] border border-white/[0.08] text-white text-sm placeholder:text-[rgb(71,85,105)] focus:outline-none focus:border-[rgb(37,211,102)]/50 focus:ring-1 focus:ring-[rgb(37,211,102)]/20 transition-all duration-200`}
        />
      </div>
    </div>
  );
}

/* ──────────────────── Password Field ──────────────────── */
function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (_e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[rgb(203,213,225)]"
        >
          {label}
        </label>
      </div>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(100,116,139)]">
          <Lock className="w-4.5 h-4.5" />
        </div>
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full pl-11 pr-11 py-3 rounded-xl bg-[rgb(38,38,38)] border border-white/[0.08] text-white text-sm placeholder:text-[rgb(71,85,105)] focus:outline-none focus:border-[rgb(37,211,102)]/50 focus:ring-1 focus:ring-[rgb(37,211,102)]/20 transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(100,116,139)] hover:text-[rgb(203,213,225)] transition-colors"
        >
          {show ? (
            <EyeOff className="w-4.5 h-4.5" />
          ) : (
            <Eye className="w-4.5 h-4.5" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────── SIGN UP PAGE ──────────────────── */
function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.email.trim() || !form.password.trim()) return;
    if (form.password.length < 6) return;
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { business_name: form.businessName.trim() },
          },
        });
        if (error) {
          toast.error("Inscription impossible", {
            description:
              error.message || "Vérifiez vos informations ou réessayez plus tard.",
          });
          return;
        }
        router.push("/dashboard");
      } else {
        await new Promise((r) => setTimeout(r, 1500));
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      logger.error("Échec inscription", {
        error:
          error instanceof Error
            ? { name: error.name, message: error.message }
            : { raw: String(error) },
      });
      toast.error("Inscription impossible", {
        description: "Une erreur est survenue. Réessayez.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
    >
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-[rgb(37,211,102)]/[0.06] blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-[350px] h-[350px] rounded-full bg-[rgb(37,211,102)]/[0.04] blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-sm text-[rgb(148,163,184)] transition-colors hover:text-white group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Retour
        </button>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-[rgb(22,22,22)] p-8 shadow-2xl shadow-black/40 sm:p-10">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <BrandLogo variant="auth" size="md" />
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white sm:text-[28px]">
              Créer votre compte
            </h1>
            <p className="text-sm text-[rgb(148,163,184)] leading-relaxed">
              Déployez votre agent WhatsApp IA en quelques minutes
            </p>
          </div>

          {/* Google Button */}
          <GoogleButton label="Continuer avec Google" />

          {/* Divider */}
          <Divider />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              id="businessName"
              label="Nom de votre entreprise"
              placeholder="Mon Entreprise"
              value={form.businessName}
              onChange={handleChange}
              icon={Building2}
            />
            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              icon={Mail}
            />
            <PasswordInput
              id="password"
              label="Mot de passe"
              placeholder="6 caractères minimum"
              value={form.password}
              onChange={handleChange}
            />

            {/* Terms */}
            <p className="text-xs text-[rgb(100,116,139)] text-center leading-relaxed">
              En créant un compte, vous acceptez nos{" "}
              <a
                href="#"
                className="text-[rgb(37,211,102)] hover:underline"
              >
                Conditions d&apos;utilisation
              </a>{" "}
              et notre{" "}
              <a href="#" className="text-[rgb(37,211,102)] hover:underline">
                Politique de confidentialité
              </a>
              .
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-lg shadow-[rgb(37,211,102)]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-[rgb(148,163,184)]">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-[rgb(37,211,102)] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

/* ──────────────────── LOGIN PAGE ──────────────────── */
function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) return;
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) {
          toast.error("Connexion impossible", {
            description:
              error.message || "Identifiants incorrects ou compte indisponible.",
          });
          return;
        }
        router.push("/dashboard");
      } else {
        await new Promise((r) => setTimeout(r, 1500));
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      logger.error("Échec connexion", {
        error:
          error instanceof Error
            ? { name: error.name, message: error.message }
            : { raw: String(error) },
      });
      toast.error("Connexion impossible", {
        description: "Une erreur est survenue. Réessayez.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
    >
      {/* Background gradient orbs */}
      <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-[rgb(37,211,102)]/[0.06] blur-[120px]" />
      <div className="absolute bottom-1/3 -right-32 w-[350px] h-[350px] rounded-full bg-[rgb(37,211,102)]/[0.04] blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-sm text-[rgb(148,163,184)] transition-colors hover:text-white group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Retour
        </button>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-[rgb(22,22,22)] p-8 shadow-2xl shadow-black/40 sm:p-10">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <BrandLogo variant="auth" size="md" />
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white sm:text-[28px]">
              Connexion
            </h1>
            <p className="text-sm text-[rgb(148,163,184)] leading-relaxed">
              Accédez à votre tableau de bord
            </p>
          </div>

          {/* Google Button */}
          <GoogleButton label="Continuer avec Google" />

          {/* Divider */}
          <Divider />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              icon={Mail}
            />
            <PasswordInput
              id="password"
              label="Mot de passe"
              placeholder="Votre mot de passe"
              value={form.password}
              onChange={handleChange}
            />

            {/* Forgot password */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-[rgb(37,211,102)] hover:underline"
              >
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-lg shadow-[rgb(37,211,102)]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-[rgb(148,163,184)]">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-medium text-[rgb(37,211,102)] hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export type AuthInitialView = "login" | "signup";

/* ──────────────────── AUTH ROUTER ──────────────────── */
export default function AuthPages({ initialView = "login" }: { initialView?: AuthInitialView }) {
  return (
    <AnimatePresence mode="wait">
      {initialView === "signup" ? <SignUpPage key="signup" /> : <LoginPage key="login" />}
    </AnimatePresence>
  );
}
