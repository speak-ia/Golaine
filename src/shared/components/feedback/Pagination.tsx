"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageNumbers } from "@shared/hooks/usePagination";
import { cn } from "@shared/utils/cn";

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (_p: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const nums = getPageNumbers(totalPages, page);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 pt-2",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>
      {nums.map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`e-${i}`}
            className="w-9 h-9 flex items-center justify-center text-gray-400"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors cursor-pointer",
              page === p
                ? "bg-brand text-white"
                : "border border-gray-200 hover:bg-gray-50 text-gray-700"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
