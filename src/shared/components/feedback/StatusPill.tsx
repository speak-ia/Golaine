"use client";

import { cn } from "@shared/utils/cn";
import type { PillTone } from "@shared/constants/status";
import { CONTACT_SEGMENT, type ContactSegment } from "@shared/constants/status";

const VARIANT_PRESET: Record<"success" | "danger" | "neutral", string> = {
  success: "bg-brand-tint text-brand-dark border border-brand/20",
  danger: "bg-red-50 text-red-600 border border-red-200",
  neutral: "bg-gray-100 text-gray-600 border border-gray-200",
};

type StatusPillBase = {
  label: string;
  size?: "sm" | "md";
  className?: string;
};

type StatusPillProps =
  | (StatusPillBase & { variant: "success" | "danger" | "neutral" })
  | (StatusPillBase & { tone: PillTone & { border?: string } })
  | (StatusPillBase & { segment: ContactSegment });

export function StatusPill(props: StatusPillProps) {
  const size = props.size ?? "md";
  const padding =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs";

  let combined: string;
  if ("variant" in props) {
    combined = VARIANT_PRESET[props.variant];
  } else if ("segment" in props) {
    combined = cn("border", CONTACT_SEGMENT[props.segment]);
  } else {
    const { tone } = props;
    combined = cn(
      tone.bg,
      tone.text,
      tone.border && `border ${tone.border}`
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        padding,
        combined,
        props.className
      )}
    >
      {props.label}
    </span>
  );
}
