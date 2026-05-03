"use client";

import { Search } from "lucide-react";
import { Input } from "@shared/components/ui/input";
import { cn } from "@shared/utils/cn";

export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
  className,
  inputClassName,
}: {
  value: string;
  onChange: (_value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-10 h-10", inputClassName)}
      />
    </div>
  );
}
