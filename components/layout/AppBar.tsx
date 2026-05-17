"use client";

import { ArrowRight, Atom, Copy, FlaskConical, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ACCEPTORS } from "@/lib/data/acceptors";
import { DONORS } from "@/lib/data/donors";
import type { CalculatorResult } from "@/lib/types";

type Props = {
  result: CalculatorResult;
};

export function AppBar({ result }: Props) {
  const { kpis, equationKatex } = result;
  const donorName = DONORS[result.donorId].displayName;
  const acceptorName = ACCEPTORS[result.acceptorId].displayName;

  const copyLatex = async () => {
    try {
      await navigator.clipboard.writeText(equationKatex);
      toast.success("LaTeX 已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <header className="sticky top-3 z-30">
      <div className="surface-card flex h-12 items-center gap-2.5 px-3.5">
        {/* Brand */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--apple-blue)] to-[var(--apple-purple)] text-white shadow-[var(--shadow-glow-blue)]">
            <Atom className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <span className="text-[14px] font-semibold tracking-tight">BioCalc</span>
          <span className="text-quaternary hidden text-[11.5px] md:inline">
            · 生物处理质量衡算
          </span>
        </div>

        <span className="mx-1 hidden h-5 w-px bg-[var(--hairline)] md:block" />

        {/* Reaction chain */}
        <div className="hidden min-w-0 flex-1 items-center gap-1.5 overflow-x-auto md:flex">
          <Chip icon={<FlaskConical className="h-3 w-3" />} tint="blue">
            {donorName}
          </Chip>
          <ArrowRight className="text-quaternary h-3 w-3 shrink-0" />
          <Chip icon={<Sparkles className="h-3 w-3" />} tint="orange">
            {acceptorName}
          </Chip>
          <ArrowRight className="text-quaternary h-3 w-3 shrink-0" />
          <Chip tint="purple">
            f<sub>s</sub>={kpis.fs.toFixed(2)}
          </Chip>
          <Chip tint="neutral">
            n<sub>e</sub>={kpis.electronsPerSubstrateMolecule}
          </Chip>
        </div>

        <button
          type="button"
          onClick={copyLatex}
          className="text-secondary ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition hover:bg-[var(--secondary)] active:scale-[0.97]"
        >
          <Copy className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">复制 LaTeX</span>
        </button>
      </div>
    </header>
  );
}

function Chip({
  children,
  icon,
  tint = "neutral",
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  tint?: "blue" | "orange" | "purple" | "neutral";
}) {
  const styles: Record<string, string> = {
    blue: "bg-[rgba(0,122,255,0.10)] text-[var(--apple-blue)] dark:bg-[rgba(10,132,255,0.16)] dark:text-[var(--apple-teal)]",
    orange:
      "bg-[rgba(255,149,0,0.14)] text-[#b35900] dark:bg-[rgba(255,159,10,0.20)] dark:text-[var(--apple-orange)]",
    purple:
      "bg-[rgba(175,82,222,0.12)] text-[var(--apple-purple)] dark:bg-[rgba(191,90,242,0.18)] dark:text-[var(--apple-purple)]",
    neutral:
      "bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] dark:bg-[rgba(255,255,255,0.08)]",
  };
  return (
    <span
      className={`tabular inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tint]}`}
    >
      {icon}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}
