"use client";

import { BlockMath } from "react-katex";
import { motion } from "framer-motion";
import { Copy, Sigma } from "lucide-react";
import { toast } from "sonner";

import type { CalculatorResult } from "@/lib/types";

type Props = { result: CalculatorResult };

export function EquationHero({ result }: Props) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.equationKatex);
      toast.success("LaTeX 已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="surface-card relative overflow-hidden p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,122,255,0.10)] text-[var(--apple-blue)] dark:bg-[rgba(10,132,255,0.16)] dark:text-[var(--apple-teal)]">
            <Sigma className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">总计量方程</div>
            <div className="text-quaternary text-[11px]">
              已归一化至 1 mol 电子供体；元素与电荷自动守恒
            </div>
          </div>
        </div>
        <button
          onClick={copy}
          className="text-tertiary hover:bg-[var(--secondary)] inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] transition active:scale-[0.97]"
          aria-label="复制 LaTeX"
        >
          <Copy className="h-3.5 w-3.5" />
          复制
        </button>
      </div>
      <motion.div
        key={result.equationKatex}
        initial={{ opacity: 0.4, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-x-auto rounded-xl bg-[rgba(0,0,0,0.025)] py-3 px-2 text-center text-[15px] sm:text-[17px] md:text-[18px] dark:bg-[rgba(255,255,255,0.04)]"
      >
        <BlockMath math={result.equationKatex} />
      </motion.div>
    </div>
  );
}
