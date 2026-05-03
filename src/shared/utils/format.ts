export function formatMoney(amount: number, locale: string = "fr-FR") {
  return amount.toLocaleString(locale, { maximumFractionDigits: 0 });
}

/** Montant en FCFA avec suffixe cohérent (défaut : "FCFA"). */
export function formatFCFA(
  amount: number,
  suffix: "F" | "FCFA" = "FCFA",
  locale: string = "fr-FR"
): string {
  return `${formatMoney(amount, locale)} ${suffix}`;
}

/** Libellé pagination « Affichage X–Y sur Z » (suffixe ex. « contacts » à ajouter côté UI). */
export function formatPageRange(start: number, end: number, total: number): string {
  return `Affichage ${start}–${end} sur ${total}`;
}

