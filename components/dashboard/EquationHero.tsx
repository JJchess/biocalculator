"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { BlockMath } from "react-katex";
import { motion } from "framer-motion";

import type { CalculatorResult } from "@/lib/types";

type Props = { result: CalculatorResult };

/**
 * 论文里的 "Equation (1)" — 居中陈列，编号在右侧脚标。
 * 没有卡片，没有图标，没有 chrome。
 */
export function EquationHero({ result }: Props) {
  const { kpis } = result;

  return (
    <section>
      <SectionLabel title="合并方程" />

      <motion.figure
        key={result.equationKatex}
        initial={{ opacity: 0.4, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 flex items-center gap-4"
      >
        <div className="overflow-x-auto flex-1 text-[18px] sm:text-[20px] md:text-[22px]">
          <BlockMath math={result.equationKatex} />
        </div>
        <div className="ink-4 tabular font-mono text-[12px]">(1)</div>
      </motion.figure>

      {/* 脚注式数据列表 — 不是 KPI 卡片 */}
      <dl className="ink-2 mt-7 grid grid-cols-1 gap-x-8 gap-y-2 text-[14px] sm:grid-cols-[auto_1fr]">
        <Footnote
          symbol={<span>Y</span>}
          label="生物量产率"
          value={kpis.biomassYieldGperG}
          format={{ maximumFractionDigits: 3 }}
          unit="g VSS / g 底物"
        />
        <Footnote
          symbol={<span>n<sub>A</sub></span>}
          label={`${kpis.acceptorDisplayName} 需求`}
          value={kpis.acceptorMassPerDonor}
          format={{ maximumFractionDigits: 2 }}
          unit="g · mol⁻¹ 底物"
        />
        <Footnote
          symbol={<span>n<sub>C</sub></span>}
          label="CO₂ 释放"
          value={kpis.co2GramsPerMolDonor}
          format={{ maximumFractionDigits: 2 }}
          unit="g · mol⁻¹ 底物"
        />
      </dl>
    </section>
  );
}

function Footnote({
  symbol,
  label,
  value,
  format,
  unit,
}: {
  symbol: React.ReactNode;
  label: string;
  value: number;
  format?: Format;
  unit: string;
}) {
  return (
    <>
      <dt className="font-mono italic text-[var(--accent-ink)]">
        {symbol}
      </dt>
      <dd className="flex items-baseline gap-2">
        <span className="ink tabular font-mono font-medium">
          <NumberFlow value={value} format={format} />
        </span>
        <span className="ink-3 text-[12.5px] italic">{unit}</span>
        <span className="ink-4 ml-auto text-[12.5px]">{label}</span>
      </dd>
    </>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="ink text-[18px] font-semibold tracking-tight">
        {title}
      </h2>
    </div>
  );
}
