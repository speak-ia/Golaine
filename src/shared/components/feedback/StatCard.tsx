"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@shared/utils/cn";

export type StatCardVariant = "default" | "compact" | "large";

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendUp = true,
  subtitle,
  variant = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  icon: ElementType;
  iconColor: string;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: ReactNode;
  variant?: StatCardVariant;
  className?: string;
}) {
  const pad =
    variant === "compact"
      ? "p-4"
      : variant === "large"
        ? "p-6"
        : "p-5";
  const iconWrap =
    variant === "compact" ? "w-10 h-10 rounded-lg" : "w-11 h-11 rounded-xl";
  const valueCls =
    variant === "compact" ? "text-lg font-bold" : "text-2xl font-bold";

  return (
    <div
      className={cn(
        "bg-white border border-gray-100 hover:shadow-md transition-shadow duration-200",
        variant === "compact" ? "rounded-xl" : "rounded-2xl",
        pad,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
          <p className={cn("text-gray-900 mt-1", valueCls)}>{value}</p>
          {trend != null && (
            <div className="flex items-center gap-1 mt-2">
              {trendUp ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-brand shrink-0" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-red-500 shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs font-medium truncate",
                  trendUp ? "text-brand" : "text-red-500"
                )}
              >
                {trend}
              </span>
            </div>
          )}
          {subtitle != null && (
            <div className="text-xs text-gray-400 mt-2">{subtitle}</div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center shrink-0",
            iconWrap
          )}
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

export function StatProgressCard({
  title,
  current,
  max,
  color,
  unit,
  className,
}: {
  title: string;
  current: number;
  max: number;
  color: string;
  unit: string;
  className?: string;
}) {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border border-gray-100",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <span className="text-xs font-medium text-gray-400">
          {current}/{max} {unit}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {percentage.toFixed(1)}% utilisé
      </p>
    </div>
  );
}
