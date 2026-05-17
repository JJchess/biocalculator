"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

import type { ProductBarDatum } from "@/lib/types";

type Props = { data: ProductBarDatum[] };

const CHART_COLORS = [
  "var(--apple-blue)",
  "var(--apple-purple)",
  "var(--apple-teal)",
  "var(--apple-orange)",
  "var(--apple-pink)",
  "var(--apple-green)",
  "var(--apple-indigo)",
];

/**
 * 自绘水平条形图：相比 recharts 更轻、更可控、和苹果设计语言一致。
 * 用 framer-motion 做条目动画与值过渡。
 */
export function ProductBarChartV2({ data }: Props) {
  const max = data.reduce((m, d) => Math.max(m, d.massGrams), 0) || 1;

  return (
    <div className="surface-card flex flex-col overflow-hidden">
      <div className="hairline-b flex items-center gap-2 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(175,82,222,0.12)] text-[var(--apple-purple)] dark:bg-[rgba(191,90,242,0.18)]">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[13px] font-semibold">主要产物 (质量)</div>
          <div className="text-quaternary text-[11px]">每 mol 供体折算的克数</div>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        {data.length === 0 ? (
          <div className="text-quaternary py-10 text-center text-[12px]">
            当前无显著正产物（fs=1 时仅生物量；或受体不产可见物种）
          </div>
        ) : (
          data.map((d, i) => {
            const pct = (d.massGrams / max) * 100;
            const color = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <div key={d.speciesId} className="flex items-center gap-3">
                <div className="w-20 shrink-0 truncate text-[12.5px] font-medium">
                  {d.displayName}
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.06)]">
                  <motion.div
                    key={`${d.speciesId}-${d.massGrams.toFixed(3)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                      delay: i * 0.04,
                    }}
                    className="absolute inset-y-0 left-0 rounded-md"
                    style={{
                      background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color}, white 15%))`,
                    }}
                  />
                </div>
                <div className="tabular text-secondary w-20 text-right font-mono text-[12px]">
                  {d.massGrams.toFixed(3)} <span className="text-quaternary">g</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
