"use client";

import NumberFlow from "@number-flow/react";

import { Slider } from "@/components/ui/slider";
import type { FsSliderProps } from "@/lib/types";

type Preset = { label: string; value: number; hint: string };

const PRESETS: Preset[] = [
  { label: "纯能量", value: 0, hint: "fs = 0" },
  { label: "好氧典型", value: 0.6, hint: "fs ≈ 0.6 (Y≈0.4 g VSS/g)" },
  { label: "反硝化", value: 0.5, hint: "fs ≈ 0.5" },
  { label: "厌氧产甲烷", value: 0.08, hint: "fs ≈ 0.08" },
  { label: "纯合成", value: 1, hint: "fs = 1" },
];

export function FsSliderV2({ value, onChange }: FsSliderProps) {
  const fe = 1 - value;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-solid)] p-3.5 shadow-[var(--shadow-1)]">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[11px] font-medium tracking-wide text-[var(--apple-purple)]">
          细胞合成电子分数 f<sub>s</sub>
        </div>
        <div className="tabular flex items-baseline gap-2 font-mono text-[12.5px]">
          <span className="text-[var(--apple-purple)]">
            f<sub>s</sub>=<NumberFlow value={value} format={{ maximumFractionDigits: 2 }} />
          </span>
          <span className="text-quaternary">·</span>
          <span className="text-tertiary">
            f<sub>e</sub>=<NumberFlow value={fe} format={{ maximumFractionDigits: 2 }} />
          </span>
        </div>
      </div>

      <Slider
        min={0}
        max={1}
        step={0.01}
        value={[value]}
        onValueChange={(v) => {
          const next = typeof v === "number" ? v : v[0];
          if (next === undefined) return;
          onChange(next);
        }}
        className="py-1"
      />

      {/* Dual-color bar for fe/fs visual */}
      <div className="flex h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-[var(--apple-teal)] transition-[width] duration-300 ease-out"
          style={{ width: `${fe * 100}%` }}
        />
        <div
          className="bg-[var(--apple-purple)] transition-[width] duration-300 ease-out"
          style={{ width: `${value * 100}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => {
          const active = Math.abs(p.value - value) < 0.005;
          return (
            <button
              key={p.label}
              type="button"
              title={p.hint}
              onClick={() => onChange(p.value)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition active:scale-[0.96] ${
                active
                  ? "bg-[var(--apple-purple)] text-white shadow-[var(--shadow-1)]"
                  : "bg-[rgba(0,0,0,0.05)] text-[var(--text-secondary)] hover:bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.06)] dark:hover:bg-[rgba(255,255,255,0.10)]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <p className="text-quaternary text-[10.5px] leading-relaxed">
        f<sub>s</sub> 越大→电子流向细胞合成；f<sub>e</sub>=1−f<sub>s</sub> 流向能量代谢与电子受体。
      </p>
    </div>
  );
}
