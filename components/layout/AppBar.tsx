"use client";

import { Atom, Copy } from "lucide-react";
import { toast } from "sonner";

import type { CalculatorResult } from "@/lib/types";

type Props = {
  result: CalculatorResult;
};

export function AppBar({ result }: Props) {
  const copyLatex = async () => {
    try {
      await navigator.clipboard.writeText(result.equationKatex);
      toast.success("LaTeX 已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <header className="sticky top-3 z-30">
      <div className="surface-card flex h-12 items-center px-3.5">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--apple-blue)] to-[var(--apple-purple)] text-white shadow-[var(--shadow-glow-blue)]">
            <Atom className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <span className="text-[14px] font-semibold tracking-tight">BioCalc</span>
          <span className="text-quaternary hidden text-[11.5px] md:inline">
            · 生物处理质量衡算
          </span>
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
