"use client";

import { Check, X } from "lucide-react";

export function FeedbackBanner({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl mb-4 border ${
        type === "success"
          ? "bg-[#E8F8EF] text-[#16A34A] border-[#25D366]/20"
          : "bg-red-50 text-red-600 border-red-200"
      }`}
    >
      <Check className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="cursor-pointer hover:opacity-70"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

