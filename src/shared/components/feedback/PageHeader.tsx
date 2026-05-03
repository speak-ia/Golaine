"use client";

import type { ElementType, ReactNode } from "react";
import { cn } from "@shared/utils/cn";

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  iconBgClass = "bg-brand-tint",
  iconClass = "text-brand-dark",
  className,
}: {
  icon: ElementType;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  iconBgClass?: string;
  iconClass?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            iconBgClass
          )}
        >
          <Icon className={cn("w-5 h-5", iconClass)} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle != null && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {actions != null && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
