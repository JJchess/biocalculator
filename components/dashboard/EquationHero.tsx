"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { BlockMath } from "react-katex";
import { motion } from "framer-motion";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import type { CalculatorResult } from "@/lib/types";

type Props = { result: CalculatorResult };

/**
 * 顶级视觉焦点：公式 + 公式正下方 3 个关键 KPI（合并到同一张卡，避免冗余）。
 * 卡片本身无标题、无图标，让等式自己当 hero。
 */
export function EquationHero({ result }: Props) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.equationKatex);
      toast.success("LaTeX 已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  const { kpis } = result;

  return (
    <div className="surface-card relative overflow-hidden">
      {/* 静默复制按钮 — 悬浮在右上 */}
      <button
        onClick={copy}
        className="text-tertiary absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] opacity-0 transition group-hover:opacity-100 hover:bg-[var(--secondary)] active:scale-[0.97]"
        aria-label="复制 LaTeX"
      >
        <Copy className="h-3 w-3" />
      </button>

      {/* 等式主区 */}
      <motion.div
        key={result.equationKatex}
        initial={{ opacity: 0.5, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-x-auto px-5 pb-2 pt-7 text-center text-[16px] sm:text-[18px] md:text-[20px]"
      >
        <BlockMath math={result.equationKatex} />
      </motion.div>

      <div className="text-quaternary mb-3 text-center text-[10.5px] tracking-[0.14em]">
        每 1 mol 电子供体 · 元素与电荷自动守恒
      </div>

      {/* 内嵌 KPI 三联 — 通过 hairline 与等式分隔 */}
      <div className="grid grid-cols-3 border-t border-[var(--hairline)] divide-x divide-[var(--hairline)]">
        <Kpi
          label="生物量产率"
          symbol="Y"
          value={kpis.biomassYieldGperG}
          unit="g/g 底物"
          format={{ maximumFractionDigits: 3 }}
          tint="green"
        />
        <Kpi
          label={`${kpis.acceptorDisplayName} 消耗`}
          value={kpis.acceptorMassPerDonor}
          unit="g · per mol 供体"
          format={{ maximumFractionDigits: 2 }}
          tint="orange"
        />
        <Kpi
          label="CO₂ 产生"
          value={kpis.co2GramsPerMolDonor}
          unit="g · per mol 供体"
          format={{ maximumFractionDigits: 2 }}
          tint="blue"
        />
      </div>
    </div>
  );
}

type Tint = "green" | "orange" | "blue";

const TINT: Record<Tint, string> = {
  green: "text-[#1c7a3a] dark:text-[var(--apple-green)]",
  orange: "text-[#b35900] dark:text-[var(--apple-orange)]",
  blue: "text-[var(--apple-blue)] dark:text-[var(--apple-teal)]",
};

function Kpi({
  label,
  symbol,
  value,
  unit,
  format,
  tint,
}: {
  label: string;
  symbol?: string;
  value: number;
  unit: string;
  format?: Format;
  tint: Tint;
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <div className="text-tertiary flex items-center gap-1.5 text-[11px] font-medium">
        <span>{label}</span>
        {symbol && (
          <span className={`font-mono text-[11px] ${TINT[tint]}`}>{symbol}</span>
        )}
      </div>
      <div className={`tabular font-mono text-[22px] font-semibold leading-none ${TINT[tint]}`}>
        <NumberFlow value={value} format={format} />
      </div>
      <div className="text-quaternary text-[10.5px]">{unit}</div>
    </div>
  );
}
