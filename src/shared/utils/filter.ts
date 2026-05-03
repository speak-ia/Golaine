/** Recherche texte insensible à la casse sur plusieurs champs d'un objet. */
export function matchesQuery<T>(item: T, query: string, fields: (keyof T)[]): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;
  const q = trimmed.toLowerCase();
  return fields.some((f) => String(item[f] ?? "").toLowerCase().includes(q));
}
