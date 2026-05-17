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
      toast.success("LaTeX 已复制", {
        description: "可直接粘贴到 Markdown / LaTeX 文档",
      });
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <header className="sticky top-0 z-30 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 pt-3">
      <div className="surface-card flex items-center gap-3 px-4 py-2.5 md:px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--apple-blue)] to-[var(--apple-purple)] text-white shadow-[var(--shadow-glow-blue)]">
            <Atom className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">BioCalc</div>
            <div className="text-quaternary text-[11px]">
              生物处理质量衡算
            </div>
          </div>
        </div>

        <div className="mx-1 hidden h-7 w-px bg-[var(--hairline)] md:block" />

        <div className="hidden min-w-0 flex-1 items-center gap-1.5 overflow-x-auto md:flex">
          <Chip icon={<FlaskConical className="h-3.5 w-3.5" />} tint="blue">
            {donorName}
          </Chip>
          <ArrowRight className="text-quaternary h-3.5 w-3.5 shrink-0" />
          <Chip icon={<Sparkles className="h-3.5 w-3.5" />} tint="orange">
            {acceptorName}
          </Chip>
          <ArrowRight className="text-quaternary h-3.5 w-3.5 shrink-0" />
          <Chip tint="purple">
            <span>
              f<sub>s</sub> = {kpis.fs.toFixed(2)}
            </span>
          </Chip>
          <Chip tint="neutral">
            <span>
              n<sub>e</sub> = {kpis.electronsPerSubstrateMolecule}
            </span>
          </Chip>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={copyLatex}
            className="text-secondary hover:bg-[var(--secondary)] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition active:scale-[0.97]"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">复制 LaTeX</span>
          </button>
        </div>
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
      className={`tabular inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${styles[tint]}`}
    >
      {icon}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}
