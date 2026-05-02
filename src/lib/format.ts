export function formatMoney(amount: number, locale: string = "fr-FR") {
  return amount.toLocaleString(locale, { maximumFractionDigits: 0 });
}

