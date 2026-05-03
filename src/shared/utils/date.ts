/** Jours courts (lun–dim), semaine commence lundi */
export const DAYS_FR_SHORT = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
] as const;

export const DAYS_FR_LONG = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
] as const;

export const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

/** Mois avec majuscule (Janvier, …) — pour rendez-vous / ISO */
export const MONTHS_FR_CAP = MONTHS_FR.map(
  (m) => m.charAt(0).toUpperCase() + m.slice(1)
) as readonly string[];

/** Ex. « lundi 2 mai » */
export function formatDateLong(d: Date): string {
  return `${DAYS_FR_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

/** Ex. « 2 mai » (sans année) */
export function formatDateFR(d: Date): string {
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

/** Chaîne ISO `yyyy-mm-dd` → libellé FR avec année */
export function formatDateFromISO(iso: string, withYear = true): string {
  if (!iso) return "—";
  const [y, m, day] = iso.split("-");
  const mi = parseInt(m, 10) - 1;
  const d = parseInt(day, 10);
  if (Number.isNaN(mi) || mi < 0 || mi > 11) return "—";
  const month = MONTHS_FR_CAP[mi];
  return withYear ? `${d} ${month} ${y}` : `${d} ${month}`;
}

/** Version courte mois (3 premières lettres) */
export function formatDateShortFromISO(iso: string): string {
  if (!iso) return "—";
  const [, m, day] = iso.split("-");
  const mi = parseInt(m, 10) - 1;
  const d = parseInt(day, 10);
  if (Number.isNaN(mi) || mi < 0 || mi > 11) return "—";
  const month = MONTHS_FR_CAP[mi].substring(0, 3);
  return `${d} ${month}`;
}

/** Parse une date string pour `toLocaleDateString` (contacts) */
export function formatDateLocaleShort(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getSunday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() + (7 - day);
  date.setDate(diff);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
