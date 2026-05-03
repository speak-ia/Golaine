"use client";

import { cn } from "@shared/utils/cn";

const checkGlyph = (
  <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
);

export type BrandLogoVariant = "marketing" | "compact" | "auth";

type BrandLogoProps = {
  variant: BrandLogoVariant;
  /** `auth` uniquement : `sm` | `md` */
  size?: "sm" | "md";
  /** `marketing` : taille fixe (footer) sans breakpoint `sm:`. */
  tight?: boolean;
  /** Afficher le libellé « Golaine » (désactiver pour favicon-only). */
  showText?: boolean;
  className?: string;
};

export function BrandLogo({
  variant,
  size = "md",
  tight = false,
  showText = true,
  className,
}: BrandLogoProps) {
  if (variant === "auth") {
    const iconSize = size === "sm" ? "h-8 w-8" : "h-12 w-12";
    const textSize = size === "sm" ? "text-base" : "text-xl";
    const svgDim = size === "sm" ? 18 : 24;
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div
          className={cn(
            "flex items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(37,211,102)] to-[rgb(22,163,74)] shadow-lg shadow-[rgb(37,211,102)]/20",
            iconSize
          )}
        >
          <svg
            width={svgDim}
            height={svgDim}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {checkGlyph}
          </svg>
        </div>
        {showText ? <span className={cn("font-bold text-white", textSize)}>Golaine</span> : null}
      </div>
    );
  }

  if (variant === "marketing") {
    if (tight) {
      return (
        <div className={cn("flex items-center gap-2.5", className)}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(37,211,102)] to-[rgb(22,163,74)]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {checkGlyph}
            </svg>
          </div>
          {showText ? <span className="text-lg font-bold text-white">Golaine</span> : null}
        </div>
      );
    }
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(37,211,102)] to-[rgb(22,163,74)] sm:h-10 sm:w-10">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {checkGlyph}
          </svg>
        </div>
        {showText ? (
          <span className="text-lg font-bold text-white sm:text-xl">Golaine</span>
        ) : null}
      </div>
    );
  }

  /* compact — dashboard sidebar */
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#25D366] to-[#16A34A]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {checkGlyph}
        </svg>
      </div>
      {showText ? <span className="truncate text-lg font-bold text-gray-900">Golaine</span> : null}
    </div>
  );
}
