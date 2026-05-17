"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { FsSliderProps } from "@/lib/types";

export function FsSlider({ value, onChange }: FsSliderProps) {
  const fe = 1 - value;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-cyan-500/20 bg-slate-950/50 px-3 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-xs font-medium tracking-wide text-cyan-300/90">
          细胞合成电子分数 (𝑓ₛ)
        </Label>
        <span className="font-mono text-xs text-slate-300">
          𝑓ₛ = {value.toFixed(2)} · 𝑓ₑ = {fe.toFixed(2)}
        </span>
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
      <p className="text-[11px] leading-relaxed text-slate-400">
        𝑓ₛ 越大，流向细胞合成的电子越多；能量代谢分数 𝑓ₑ = 1 − 𝑓ₛ。
      </p>
    </div>
  );
}
