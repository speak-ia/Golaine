/** Nom d'instance Evolution API stable par utilisateur + slot (1–3). */
export function buildWhatsAppInstanceName(userId: string, slotIndex: number): string {
  const safeUser = userId.replace(/-/g, "").slice(0, 16);
  return `luumo_${safeUser}_s${slotIndex}`;
}

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function maskPhone(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 6) return phone.trim() || "—";
  const prefix = digits.length > 10 ? `+${digits.slice(0, 3)}` : "+";
  return `${prefix} *** ${digits.slice(-4)}`;
}
