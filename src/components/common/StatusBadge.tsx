"use client";

export function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "danger" | "neutral";
}) {
  const colors: Record<typeof variant, string> = {
    success: "bg-[#E8F8EF] text-[#16A34A] border border-[#25D366]/20",
    danger: "bg-red-50 text-red-600 border border-red-200",
    neutral: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

