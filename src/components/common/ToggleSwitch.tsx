"use client";

export function ToggleSwitch({
  enabled,
  onToggle,
  size = "md",
}: {
  enabled: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  const s =
    size === "sm"
      ? { track: "h-5 w-9", thumb: "h-3.5 w-3.5", on: "translate-x-4", off: "translate-x-1" }
      : { track: "h-6 w-11", thumb: "h-4 w-4", on: "translate-x-6", off: "translate-x-1" };

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/30 cursor-pointer ${s.track} ${
        enabled ? "bg-[#25D366]" : "bg-gray-300"
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block transform rounded-full bg-white shadow-sm transition-transform duration-200 ${s.thumb} ${
          enabled ? s.on : s.off
        }`}
      />
    </button>
  );
}

