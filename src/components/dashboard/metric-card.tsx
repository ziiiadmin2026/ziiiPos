import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  delta: string;
  tone: "warm" | "forest";
};

export function MetricCard({ label, value, delta, tone }: MetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-[28px] border p-5 shadow-sm",
        tone === "warm" ? "border-orange-200 bg-orange-50/80" : "border-emerald-200 bg-emerald-50/80"
      )}
    >
      <p className="text-sm text-ink/55">{label}</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-2 flex items-center gap-1 text-sm font-medium text-ink/62">
            <ArrowUpRight className="h-4 w-4" />
            {delta}
          </p>
        </div>
      </div>
    </article>
  );
}