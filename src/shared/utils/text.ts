export function getInitials(name: string, max = 2): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, max);
}

export function hashIndex(input: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % Math.max(1, modulo);
}

export function pickFromPalette<T>(palette: readonly T[], key: string): T {
  return palette[hashIndex(key, palette.length)]!;
}
