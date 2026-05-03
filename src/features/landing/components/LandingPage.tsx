"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useClickOutside } from "@shared/hooks/useClickOutside";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  MessageCircle,
  FileText,
  Play,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Check,
  Mic,
  Wifi,
  Battery,
  Signal,
  Clock,
  Star,
  TrendingUp,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@shared/components/feedback/BrandLogo";

/* ──────────────────── Animation wrapper ──────────────────── */
function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const dirs = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirs[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────── NAVBAR ──────────────────── */
const Navbar = React.memo(function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currency, setCurrency] = useState("F CFA");
  const currencies = ["$ USD", "€ EUR", "F CFA", "UM"];
  const currencyRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  const closeCurrencyDropdown = useCallback(() => setCurrencyOpen(false), []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useClickOutside(currencyRef, closeCurrencyDropdown, currencyOpen);

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Académie", href: "#academy" },
    { label: "Démonstration", href: "#demo" },
  ];

  return (
    <nav
      suppressHydrationWarning
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgb(10,10,10)]/90 backdrop-blur-xl border-b border-white/[0.07]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <a href="#" className="inline-flex">
            <BrandLogo variant="marketing" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[rgb(148,163,184)] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4">
            {/* Currency Selector */}
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 text-sm text-[rgb(148,163,184)] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                {currency}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {currencyOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-[rgb(22,22,22)] border border-white/[0.07] shadow-xl py-1 z-50">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${
                        c === currency
                          ? "text-[rgb(37,211,102)]"
                          : "text-[rgb(148,163,184)]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/login"
              className="cursor-pointer text-sm text-[rgb(148,163,184)] transition-colors hover:text-white"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="cursor-pointer rounded-xl bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Inscription
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[rgb(10,10,10)]/95 backdrop-blur-xl border-b border-white/[0.07] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-[rgb(148,163,184)] hover:text-white transition-colors py-2"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-white/[0.07]" />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full cursor-pointer py-2 text-left text-[rgb(148,163,184)] transition-colors hover:text-white"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="block w-full cursor-pointer rounded-xl bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Inscription
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});

/* ──────────────────── HERO ──────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Gradient Orbs */}
      <div className="absolute top-20 -left-32 w-[500px] h-[500px] rounded-full bg-[rgb(37,211,102)]/[0.08] blur-[120px] float-orb" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[rgb(37,211,102)]/[0.05] blur-[100px] float-orb-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <FadeIn>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
                Automatisez vos
                <br />
                ventes en 5 minutes
                <br />
                <span className="bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] bg-clip-text text-transparent">
                  grâce à l&apos;IA.
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="text-lg sm:text-xl text-[rgb(148,163,184)] max-w-lg leading-relaxed">
                Golaine est votre assistant commercial IA sur WhatsApp. Il répond
                à vos clients, enregistre les commandes et booste vos ventes —
                24h/24, 7j/7.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] text-white font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-[rgb(37,211,102)]/20"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/[0.15] text-white font-semibold text-base hover:bg-white/5 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Voir la démo
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex items-center gap-3 pt-2">
                {/* Avatar circles */}
                <div className="flex -space-x-2.5">
                  {[
                    "bg-[rgb(37,211,102)]",
                    "bg-[rgb(124,58,237)]",
                    "bg-[rgb(14,165,233)]",
                    "bg-[rgb(249,115,22)]",
                    "bg-[rgb(245,158,11)]",
                  ].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${bg} border-2 border-[rgb(10,10,10)] flex items-center justify-center text-[10px] font-bold text-white`}
                    >
                      {["FD", "MT", "AS", "KN", "OB"][i]}
                    </div>
                  ))}
                </div>
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]"
                    />
                  ))}
                </div>
                <span className="text-sm text-[rgb(148,163,184)]">
                  500+ commerçants africains
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Right - WhatsApp Mockup */}
          <FadeIn delay={0.3} direction="right">
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-[300px] sm:w-[320px]">
                {/* Phone Frame */}
                <div className="rounded-[2.5rem] bg-[rgb(22,22,22)] p-3 border border-white/[0.1] shadow-2xl shadow-black/50">
                  <div className="rounded-[2rem] bg-[rgb(11,20,14)] overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between px-6 pt-3 pb-1">
                      <span className="text-[11px] text-white/70 font-medium">
                        9:41
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Signal className="w-3.5 h-3.5 text-white/70" />
                        <Wifi className="w-3.5 h-3.5 text-white/70" />
                        <Battery className="w-4 h-4 text-white/70" />
                      </div>
                    </div>

                    {/* Chat Header */}
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-[rgb(20,30,24)] border-b border-white/[0.05]">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[rgb(37,211,102)] to-[rgb(22,163,74)] flex items-center justify-center">
                        <span className="text-xs font-bold text-white">S</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white">
                          Sophia
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[rgb(37,211,102)] pulse-dot" />
                          <span className="text-[11px] text-[rgb(37,211,102)]">
                            En ligne · Agent IA
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex flex-col gap-2.5 px-3 py-4 min-h-[380px] max-h-[420px]">
                      {/* Customer message */}
                      <div className="flex justify-end">
                        <div className="max-w-[75%] bg-[rgb(37,90,50)] rounded-2xl rounded-br-md px-3.5 py-2.5">
                          <p className="text-[13px] text-white leading-relaxed">
                            Bonjour ! Je voudrais commander 3 robes wax S-400 et
                            2 pagnes tissés.
                          </p>
                          <span className="block text-[10px] text-white/40 mt-1 text-right">
                            9:38
                          </span>
                        </div>
                      </div>

                      {/* Agent response */}
                      <div className="flex justify-start">
                        <div className="max-w-[80%] bg-[rgb(32,44,38)] rounded-2xl rounded-bl-md px-3.5 py-2.5">
                          <p className="text-[13px] text-white leading-relaxed">
                            Bonjour Fatou ! 😊 Parfait, voici votre commande :
                          </p>
                          <div className="mt-2 bg-[rgb(37,211,102)]/10 rounded-lg px-3 py-2 border border-[rgb(37,211,102)]/20">
                            <p className="text-[11px] text-[rgb(37,211,102)] font-medium">
                              🧾 Commande #1247
                            </p>
                            <p className="text-[12px] text-white/80 mt-0.5">
                              3× Robes Wax S-400
                              <br />
                              2× Pagne Tissé
                            </p>
                            <p className="text-[12px] text-white font-semibold mt-1">
                              Total : 25 000 FCFA
                            </p>
                          </div>
                          <p className="text-[13px] text-white/80 mt-2">
                            Voulez-vous confirmer ? 🛒
                          </p>
                          <span className="block text-[10px] text-white/40 mt-1">
                            9:38 ✓✓
                          </span>
                        </div>
                      </div>

                      {/* Typing indicator */}
                      <div className="flex justify-start mt-1">
                        <div className="bg-[rgb(32,44,38)] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-white/50 typing-dot-1" />
                          <div className="w-2 h-2 rounded-full bg-white/50 typing-dot-2" />
                          <div className="w-2 h-2 rounded-full bg-white/50 typing-dot-3" />
                        </div>
                      </div>
                    </div>

                    {/* Input Bar */}
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-[rgb(20,30,24)] border-t border-white/[0.05]">
                      <div className="flex-1 bg-white/5 rounded-full px-4 py-2">
                        <span className="text-[13px] text-white/30">
                          Écrire un message...
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[rgb(37,211,102)] flex items-center justify-center">
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow effect */}
                <div className="absolute -inset-4 bg-[rgb(37,211,102)]/[0.05] rounded-[3rem] blur-2xl -z-10" />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── TRUSTED BY ──────────────────── */
function TrustedBySection() {
  const companies = [
    "TechAfrik",
    "Boutique Dakar",
    "MediConsult",
    "AgroSmart",
    "EduPlus",
    "CommerceHub",
  ];

  return (
    <section className="py-12 border-y border-white/[0.05] bg-[rgb(15,15,15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-center text-sm text-[rgb(100,116,139)] mb-8 tracking-wide uppercase">
            Ils font confiance à Golaine
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {companies.map((company) => (
              <span
                key={company}
                className="text-lg sm:text-xl font-semibold text-white/20 hover:text-white/40 transition-colors"
              >
                {company}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ──────────────────── WHAT IF SECTION ──────────────────── */
function WhatIfSection() {
  const cards = [
    {
      emoji: "⚡",
      title: "Répond à vos clients en 10 secondes",
      color: "rgb(37,211,102)",
      bgColor: "rgba(37,211,102,0.08)",
      borderColor: "rgba(37,211,102,0.15)",
    },
    {
      emoji: "🛒",
      title: "Enregistre chaque commande automatiquement",
      color: "rgb(124,58,237)",
      bgColor: "rgba(124,58,237,0.08)",
      borderColor: "rgba(124,58,237,0.15)",
    },
    {
      emoji: "🔄",
      title: "Gère des milliers de conversations",
      color: "rgb(14,165,233)",
      bgColor: "rgba(14,165,233,0.08)",
      borderColor: "rgba(14,165,233,0.15)",
    },
    {
      emoji: "📈",
      title: "Augmente vos commandes",
      color: "rgb(249,115,22)",
      bgColor: "rgba(249,115,22,0.08)",
      borderColor: "rgba(249,115,22,0.15)",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[rgb(10,10,10)]" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
            Et si vous pouviez avoir un
            <br />
            assistant virtuel qui…
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-center text-[rgb(148,163,184)] text-lg max-w-2xl mx-auto mb-14">
            Golaine transforme votre WhatsApp en machine de vente automatisée.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          {cards.map((card, i) => (
            <FadeIn key={card.title} delay={0.15 + i * 0.1}>
              <div
                className="p-6 sm:p-8 rounded-[20px] border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default"
                style={{
                  backgroundColor: card.bgColor,
                  borderColor: card.borderColor,
                }}
              >
                <span className="text-3xl mb-4 block">{card.emoji}</span>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: card.color }}
                >
                  {card.title}
                </h3>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5}>
          <div className="relative p-6 sm:p-8 rounded-[20px] bg-gradient-to-r from-[rgba(37,211,102,0.05)] to-transparent border border-[rgb(37,211,102)]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[rgb(37,211,102)]/20 to-transparent rounded-[20px] -z-10" />
            <p className="text-lg sm:text-xl font-medium text-white">
              …tout cela pendant que vous vous concentrez{" "}
              <span className="bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] bg-clip-text text-transparent">
                sur l&apos;essentiel.
              </span>
            </p>
            <a
              href="#pricing"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] text-white font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Essayer maintenant
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ──────────────────── HOW IT WORKS ──────────────────── */
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Créez votre compte",
      desc: "Inscrivez-vous en 30 secondes.",
      check: "✓ Sans carte bancaire pour tester",
    },
    {
      num: "02",
      title: "Configurez votre agent",
      desc: "Ajoutez vos produits et personnalisez vos réponses.",
      check: "✓ Interface simple, résultat professionnel",
    },
    {
      num: "03",
      title: "Déployez sur WhatsApp",
      desc: "Votre agent est prêt à vendre pour vous.",
      check: "✓ Activation en moins de 2 minutes",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[rgb(15,15,15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
            Comment ça marche
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-center text-[rgb(148,163,184)] text-lg max-w-2xl mx-auto mb-16">
            Trois étapes simples pour automatiser vos ventes sur WhatsApp.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={0.2 + i * 0.15}>
              <div className="relative p-8 rounded-[20px] bg-[rgb(22,22,22)] border border-white/[0.07] h-full overflow-hidden group">
                {/* Big faded number */}
                <span className="absolute -top-4 -right-2 text-[120px] font-black text-white/[0.03] leading-none select-none">
                  {step.num}
                </span>

                {/* Number badge */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(37,211,102)] to-[rgb(22,163,74)] text-white font-bold text-lg mb-5">
                  {step.num}
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-[rgb(148,163,184)] mb-4">{step.desc}</p>
                <p className="text-sm text-[rgb(37,211,102)]">{step.check}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── FEATURES ──────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: ShoppingCart,
      title: "Conversations qui convertissent",
      desc: "L'IA comprend les besoins de vos clients et guide chaque conversation vers une vente. Fini les opportunités manquées.",
      color: "rgb(37,211,102)",
      bgColor: "rgba(37,211,102,0.1)",
    },
    {
      icon: MessageCircle,
      title: "Reconnaît vos produits en photo",
      desc: "Envoyez simplement une photo de votre produit, l'IA l'identifie et l'ajoute automatiquement à votre catalogue.",
      color: "rgb(124,58,237)",
      bgColor: "rgba(124,58,237,0.1)",
    },
    {
      icon: FileText,
      title: "Donne la bonne information au bon moment",
      desc: "Prix, disponibilité, délais de livraison — votre agent a toujours la bonne réponse, sans erreur.",
      color: "rgb(249,115,22)",
      bgColor: "rgba(249,115,22,0.1)",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[rgb(10,10,10)]" id="academy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
            Fonctionnalités
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-center text-[rgb(148,163,184)] text-lg max-w-2xl mx-auto mb-16">
            Des outils puissants conçus spécialement pour les commerçants
            africains.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <FadeIn key={feat.title} delay={0.2 + i * 0.15}>
              <div className="p-8 rounded-[20px] bg-[rgb(22,22,22)] border border-white/[0.07] h-full hover:border-white/[0.12] transition-colors">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: feat.bgColor }}
                >
                  <feat.icon
                    className="w-7 h-7"
                    style={{ color: feat.color }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feat.title}
                </h3>
                <p className="text-[rgb(148,163,184)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── DEMO VIDEO ──────────────────── */
function DemoVideoSection() {
  return (
    <section className="py-20 sm:py-28 bg-[rgb(15,15,15)]" id="demo">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-center text-sm text-[rgb(37,211,102)] font-semibold tracking-wide uppercase mb-4">
            Démonstration
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
            Voyez{" "}
            <span className="bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] bg-clip-text text-transparent">
              Golaine
            </span>{" "}
            en action
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-center text-[rgb(148,163,184)] text-lg max-w-2xl mx-auto mb-12">
            Découvrez comment Golaine transforme chaque conversation en vente.
          </p>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl shadow-black/50">
            {/* Video glow */}
            <div className="absolute -inset-1 bg-[rgb(37,211,102)]/[0.06] rounded-2xl blur-xl -z-10" />
            <div className="relative w-full aspect-video bg-[rgb(22,22,22)] flex flex-col items-center justify-center">
              {/* Play button */}
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/15 transition-colors cursor-pointer group mb-6">
                <Play className="w-8 h-8 text-white group-hover:scale-110 transition-transform ml-1" />
              </div>
              <p className="text-xl font-bold text-white mb-2">Vidéo de démonstration</p>
              <p className="text-sm text-[rgb(148,163,184)] max-w-md text-center">
                Découvrez comment Golaine transforme chaque conversation en vente en 2 minutes.
              </p>
              <p className="text-xs text-[rgb(100,116,139)] mt-4">
                Vidéo bientôt disponible
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ──────────────────── ROI SECTION ──────────────────── */
function ROISection() {
  const stats = [
    {
      value: "24/7",
      label: "Disponibilité totale",
      desc: "Votre agent ne dort jamais et répond instantanément à chaque client.",
      icon: Clock,
      color: "rgb(37,211,102)",
    },
    {
      value: "+40%",
      label: "De commandes",
      desc: "Augmentation moyenne constatée par nos utilisateurs.",
      icon: TrendingUp,
      color: "rgb(14,165,233)",
    },
    {
      value: "0 FC",
      label: "De coût humain",
      desc: "Éliminez les coûts de recrutement et de formation.",
      icon: Headphones,
      color: "rgb(249,115,22)",
    },
  ];

  const without = [
    "Clients perdus car vous ne répondez pas à temps",
    "Commandes mal notées ou oubliées",
    "Heures passées à répéter les mêmes informations",
    "Ventes manquées la nuit et le week-end",
    "Ressources gaspillées sur des tâches répétitives",
  ];
  const withGolaine = [
    "Réponse instantanée à chaque message client",
    "Enregistrement automatique de chaque commande",
    "Informations produit toujours exactes et à jour",
    "Ventes automatisées 24h/24, 7j/7",
    "Concentrez-vous sur ce qui compte vraiment",
  ];

  return (
    <section className="py-20 sm:py-28 bg-[rgb(10,10,10)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
            Retour sur investissement
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-center text-[rgb(148,163,184)] text-lg max-w-2xl mx-auto mb-16">
            Des résultats concrets dès le premier mois.
          </p>
        </FadeIn>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={0.15 + i * 0.1}>
              <div className="text-center p-8 rounded-[20px] bg-[rgb(22,22,22)] border border-white/[0.07]">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                  }}
                >
                  <stat.icon
                    className="w-7 h-7"
                    style={{ color: stat.color }}
                  />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white mb-2">
                  {stat.label}
                </div>
                <p className="text-sm text-[rgb(148,163,184)]">{stat.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Without */}
          <FadeIn delay={0.3} direction="left">
            <div className="p-8 rounded-[20px] bg-[rgb(22,22,22)] border border-[rgb(239,68,68)]/20 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[rgb(239,68,68)]/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-[rgb(239,68,68)]" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(248,113,113)]">
                  Sans Golaine
                </h3>
              </div>
              <ul className="space-y-4">
                {without.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[rgb(239,68,68)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[rgb(239,68,68)]" />
                    </div>
                    <span className="text-[rgb(148,163,184)] text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* With */}
          <FadeIn delay={0.4} direction="right">
            <div className="p-8 rounded-[20px] bg-[rgb(22,22,22)] border border-[rgb(37,211,102)]/20 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[rgb(37,211,102)]/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-[rgb(37,211,102)]" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(37,211,102)]">
                  Avec Golaine
                </h3>
              </div>
              <ul className="space-y-4">
                {withGolaine.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[rgb(37,211,102)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[rgb(37,211,102)]" />
                    </div>
                    <span className="text-[rgb(148,163,184)] text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── TESTIMONIALS ──────────────────── */
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Golaine a transformé ma boutique. Je ne rate plus aucune commande, même la nuit. Mon chiffre d'affaires a augmenté de 45% en 3 mois.",
      name: "Fatou Diallo",
      business: "Boutique mode en ligne — Dakar",
      initials: "FD",
      color: "bg-[rgb(37,211,102)]",
    },
    {
      quote:
        "L'IA comprend parfaitement mes produits et mes clients sont impressionnés. C'est comme avoir un vendeur qui ne dort jamais.",
      name: "Moussa Traoré",
      business: "Agro-alimentaire — Abidjan",
      initials: "MT",
      color: "bg-[rgb(124,58,237)]",
    },
    {
      quote:
        "L'installation a pris moins de 5 minutes et les résultats sont immédiats. Je recommande Golaine à tous les commerçants.",
      name: "Aminata Sow",
      business: "Cosmétiques naturels — Lomé",
      initials: "AS",
      color: "bg-[rgb(14,165,233)]",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[rgb(15,15,15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
            Ce qu&apos;ils en disent
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-center text-[rgb(148,163,184)] text-lg max-w-2xl mx-auto mb-16">
            Des commerçants africains qui font confiance à Golaine.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <FadeIn key={t?.name ?? i} delay={0.2 + i * 0.15}>
              <div className="p-8 rounded-[20px] bg-[rgb(22,22,22)] border border-white/[0.07] h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-5 h-5 fill-[#f59e0b] text-[#f59e0b]"
                    />
                  ))}
                </div>
                <p className="text-[rgb(241,245,249)] leading-relaxed flex-1 mb-6">
                  &ldquo;{t?.quote ?? ""}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">
                  <div
                    className={`w-11 h-11 rounded-full ${t?.color ?? ""} flex items-center justify-center text-sm font-bold text-white`}
                  >
                    {t?.initials ?? ""}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {t?.name ?? ""}
                    </div>
                    <div className="text-xs text-[rgb(100,116,139)]">
                      {t?.business ?? ""}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── PRICING ──────────────────── */
function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: annual ? "23 000" : "29 000",
      period: "mois",
      desc: "Idéal pour démarrer votre automatisation.",
      features: [
        "1 numéro WhatsApp",
        "1 500 crédits IA",
        "CRM commandes",
        "25 analyses d'images",
      ],
      cta: "Commencer",
      popular: false,
    },
    {
      name: "Pro",
      price: annual ? "39 000" : "49 000",
      period: "mois",
      desc: "Pour les commerçants qui veulent grandir.",
      features: [
        "2 numéros WhatsApp",
        "5 000 crédits IA",
        "CRM commandes & rendez-vous",
        "50 analyses d'images",
      ],
      cta: "Choisir Pro",
      popular: true,
    },
    {
      name: "Business",
      price: annual ? "159 000" : "199 000",
      period: "mois",
      desc: "Solution complète pour les entreprises.",
      features: [
        "3 numéros WhatsApp",
        "25 000 crédits IA",
        "CRM complet",
        "250 analyses d'images",
        "Support dédié",
      ],
      cta: "Contacter l'équipe",
      popular: false,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[rgb(10,10,10)]" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-4">
            Tarifs simples, résultats concrets
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-center text-[rgb(148,163,184)] text-lg max-w-2xl mx-auto mb-10">
            Choisissez le plan adapté à votre activité. Changez à tout moment.
          </p>
        </FadeIn>

        {/* Toggle */}
        <FadeIn delay={0.15}>
          <div className="flex items-center justify-center gap-4 mb-14">
            <span
              className={`text-sm font-medium ${
                !annual ? "text-white" : "text-[rgb(100,116,139)]"
              }`}
            >
              Mensuel
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                annual
                  ? "bg-[rgb(37,211,102)]"
                  : "bg-[rgb(50,50,50)]"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  annual ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                annual ? "text-white" : "text-[rgb(100,116,139)]"
              }`}
            >
              Annuel{" "}
              <span className="text-[rgb(37,211,102)] text-xs font-semibold">
                -20%
              </span>
            </span>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={0.2 + i * 0.1}>
              <div
                className={`relative p-8 rounded-[20px] h-full flex flex-col ${
                  plan.popular
                    ? "bg-[rgb(22,22,22)] border-2 border-[rgb(37,211,102)] shadow-lg shadow-[rgb(37,211,102)]/5"
                    : "bg-[rgb(22,22,22)] border border-white/[0.07]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] text-xs font-bold text-white">
                    Le plus populaire
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[rgb(148,163,184)]">
                    {plan.desc}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {plan.price} <span className="text-xl font-medium text-[rgb(148,163,184)]">FCFA</span>
                  </span>
                  <span className="text-[rgb(148,163,184)]">
                    /{plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {(plan.features ?? []).map((feat) => (
                    <li key={feat} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-[rgb(37,211,102)] flex-shrink-0" />
                      <span className="text-sm text-[rgb(148,163,184)]">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] text-white hover:opacity-90 shadow-lg shadow-[rgb(37,211,102)]/20"
                      : "border border-white/[0.15] text-white hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── FINAL CTA ──────────────────── */
function FinalCTASection() {
  return (
    <section className="py-20 sm:py-28 bg-[rgb(15,15,15)] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[300px] bg-[rgb(37,211,102)]/[0.06] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Prêt à automatiser
            <br />
            <span className="bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] bg-clip-text text-transparent">
              vos ventes sur WhatsApp ?
            </span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="text-lg text-[rgb(148,163,184)] mb-10 max-w-xl mx-auto">
            Rejoignez plus de 500 commerçants africains qui boostent leurs
            ventes avec Golaine. Essai gratuit, sans carte bancaire.
          </p>
        </FadeIn>
        <FadeIn delay={0.25}>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[rgb(37,211,102)] to-[rgb(22,163,74)] text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[rgb(37,211,102)]/20"
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5" />
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

/* ──────────────────── FOOTER ──────────────────── */
function Footer() {
  const footerLinks = {
    Produit: [
      "Fonctionnalités",
      "Tarifs",
      "Intégrations",
      "FAQ",
      "Mises à jour",
    ],
    Entreprise: [
      "À propos",
      "Blog",
      "Carrières",
      "Contact",
      "Partenaires",
    ],
    Légal: [
      "Confidentialité",
      "Conditions d'utilisation",
      "Politique de cookies",
      "Mentions légales",
    ],
  };

  const socialLinks = [
    {
      label: "Twitter",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-[rgb(10,10,10)] border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="mb-5 inline-flex">
              <BrandLogo variant="marketing" tight />
            </a>
            <p className="text-sm text-[rgb(100,116,139)] max-w-sm mb-6 leading-relaxed">
              Votre assistant commercial IA sur WhatsApp. Automatisez vos ventes
              et boostez votre chiffre d&apos;affaires en Afrique.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[rgb(148,163,184)] hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[rgb(100,116,139)] hover:text-[rgb(148,163,184)] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[rgb(100,116,139)]">
            © {new Date().getFullYear()} Golaine. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.07]">
            <div className="w-1.5 h-1.5 rounded-full bg-[rgb(37,211,102)] pulse-dot" />
            <span className="text-xs text-[rgb(148,163,184)] font-medium">
              Propulsé par l&apos;IA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────── MAIN PAGE ──────────────────── */
const LandingPageContent = React.memo(function LandingPageContent() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex flex-col bg-[rgb(10,10,10)]"
    >
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustedBySection />
        <WhatIfSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DemoVideoSection />
        <ROISection />
        <TestimonialsSection />
        <PricingSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
});

export default function LandingPage() {
  return <LandingPageContent />;
}
