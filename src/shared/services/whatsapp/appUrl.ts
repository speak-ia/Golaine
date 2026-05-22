/** URL publique de l'app (webhook Evolution, liens absolus). */
export function getPublicAppUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return null;
}

export function getWhatsAppWebhookUrl(): string | null {
  const base = getPublicAppUrl();
  if (!base) return null;
  return `${base}/api/webhooks/whatsapp`;
}
