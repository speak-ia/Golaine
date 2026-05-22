import type { PlanTier } from "@shared/types/domainTypes";

export function getMaxWhatsAppSlots(plan: PlanTier): number {
  switch (plan) {
    case "Business":
      return 3;
    case "Pro":
      return 2;
    default:
      return 1;
  }
}

export function getPlanWhatsAppSubtitle(plan: PlanTier): string {
  const max = getMaxWhatsAppSlots(plan);
  if (max === 1) return "Plan Starter — 1 numéro WhatsApp";
  if (max === 2) return "Plan Pro — jusqu'à 2 numéros simultanés";
  return "Plan Business — jusqu'à 3 numéros simultanés";
}
