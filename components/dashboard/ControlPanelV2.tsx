"use client";

import NumberFlow from "@number-flow/react";

import { Slider } from "@/components/ui/slider";
import { ACCEPTORS } from "@/lib/data/acceptors";
import { DONORS } from "@/lib/data/donors";
import {
  ACCEPTOR_IDS,
  DONOR_IDS,
  type ControlPanelProps,
} from "@/lib/types";

type Preset = { label: string; value: number };

const PRESETS: Preset[] = [
  { label: "纯能量代谢", value: 0 },
  { label: "好氧", value: 0.6 },
  { label: "反硝化", value: 0.5 },
  { label: "产甲烷", value: 0.08 },
  { label: "纯合成", value: 1 },
];

/**
 * 论文里的"实验条件"段落 — 不是 dashboard 控件。
 * 纯文字+原生 select+滑条，无任何卡片或图标。
 */
export function ControlPanelV2({
  donorId,
  acceptorId,
  fs,
  onDonorChange,
  onAcceptorChange,
  onFsChange,
}: ControlPanelProps) {
  return (
    <section>
      <SectionLabel title="实验条件" />

      <div className="ink-2 mt-4 space-y-3 text-[15.5px] leading-[1.85]">
        <p>
          以{" "}
          <InlineSelect
            value={donorId}
            onChange={(v) => onDonorChange(v as typeof donorId)}
            options={DONOR_IDS.map((id) => ({
              value: id,
              label: DONORS[id].displayName,
            }))}
          />{" "}
          为电子供体，{" "}
          <InlineSelect
            value={acceptorId}
            onChange={(v) => onAcceptorChange(v as typeof acceptorId)}
            options={ACCEPTOR_IDS.map((id) => ({
              value: id,
              label: ACCEPTORS[id].displayName,
            }))}
          />{" "}
          为电子受体，
        </p>
        <p>
          令细胞合成分数{" "}
          <span className="ink font-mono italic">
            f<sub>s</sub>
          </span>{" "}
          ={" "}
          <span className="accent-ink tabular font-mono font-medium">
            <NumberFlow value={fs} format={{ maximumFractionDigits: 2 }} />
          </span>
          ，则{" "}
          <span className="ink font-mono italic">
            f<sub>e</sub>
          </span>{" "}
          ={" "}
          <span className="tabular font-mono">
            <NumberFlow value={1 - fs} format={{ maximumFractionDigits: 2 }} />
          </span>
          。
        </p>
      </div>

      {/* 滑块 — 极简，纸面横线感 */}
      <div className="mt-5 flex items-center gap-4">
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[fs]}
          onValueChange={(v) => {
            const next = typeof v === "number" ? v : v[0];
            if (next === undefined) return;
            onFsChange(next);
          }}
          className="flex-1"
        />
        <div className="ink-4 tabular font-mono text-[11px]">
          0 ── {fs.toFixed(2)} ── 1
        </div>
      </div>

      {/* 预设：脚注式小字链接，不像按钮 */}
      <div className="ink-4 mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] italic">
        <span>典型值:</span>
        {PRESETS.map((p, i) => {
          const active = Math.abs(p.value - fs) < 0.005;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onFsChange(p.value)}
              className={`underline decoration-[0.5px] underline-offset-[3px] transition ${
                active
                  ? "accent-ink decoration-[var(--accent-ink)]"
                  : "ink-3 decoration-[var(--rule)] hover:text-[var(--accent-ink)] hover:decoration-[var(--accent-ink)]"
              }`}
            >
              {p.label}
              <span className="ink-4 tabular ml-0.5 font-mono not-italic">
                {p.value === 0 || p.value === 1 ? p.value : p.value.toFixed(2)}
              </span>
              {i < PRESETS.length - 1 ? "," : ""}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SectionLabel({title }: { title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="ink text-[18px] font-semibold tracking-tight">
        {title}
      </h2>
    </div>
  );
}

function InlineSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <span className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ink accent-ink-hover cursor-pointer appearance-none border-0 border-b border-[var(--rule)] bg-transparent pb-[1px] pr-4 font-semibold italic outline-none transition hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)] focus:border-[var(--accent-ink)] focus:text-[var(--accent-ink)]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--paper)] not-italic">
            {opt.label}
          </option>
        ))}
      </select>
      <span className="ink-4 pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[9px]">
        ▼
      </span>
    </span>
  );
}
