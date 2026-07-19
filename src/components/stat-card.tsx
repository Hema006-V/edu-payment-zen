import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type Props = {
  label: string;
  value: string;
  hint?: string;
  delta?: number; // percent
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info" | "accent";
  className?: string;
};

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  primary: "from-primary/20 to-primary/5 text-primary",
  success: "from-[color:var(--success)]/25 to-[color:var(--success)]/5 text-[color:var(--success)]",
  warning: "from-[color:var(--warning)]/25 to-[color:var(--warning)]/5 text-[color:var(--warning-foreground)]",
  info: "from-[color:var(--info)]/25 to-[color:var(--info)]/5 text-[color:var(--info-foreground)]",
  accent: "from-accent/60 to-accent/10 text-accent-foreground",
};

export function StatCard({ label, value, hint, delta, icon: Icon, tone = "primary", className }: Props) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={cn("glass group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5", className)}>
      <div className={cn("pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl opacity-70", toneMap[tone])} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {typeof delta === "number" && (
              <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                positive ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-destructive/15 text-destructive")}>
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(delta)}%
              </span>
            )}
            {hint && <span>{hint}</span>}
          </div>
        </div>
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br shadow-inner", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
