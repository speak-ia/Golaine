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
        "flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconBgClass
          )}
        >
          <Icon className={cn("h-5 w-5", iconClass)} />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h1>
          {subtitle != null && (
            <p className="break-words text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {actions != null && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
