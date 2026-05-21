"use client";

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
    <header className="rule-double-b pb-5">
      <div className="flex items-baseline justify-between gap-4">
        <div className="ink-3 text-[10.5px] uppercase tracking-[0.22em]">
          Mass Balance · Rittmann–McCarty Method
        </div>
        <button
          type="button"
          onClick={copyLatex}
          className="ink-3 text-[11px] italic underline decoration-[var(--rule)] decoration-1 underline-offset-[3px] transition hover:text-[var(--accent-ink)] hover:decoration-[var(--accent-ink)]"
        >
          cite as LaTeX →
        </button>
      </div>
      <h1 className="ink mt-4 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em]">
        复杂污染物生物处理的{" "}
        <em className="accent-ink font-normal italic">半反应法</em>{" "}
        合并方程
      </h1>
    </header>
  );
}
