"use client";

import NumberFlow from "@number-flow/react";

import { Slider } from "@/components/ui/slider";
import { ACCEPTORS } from "@/lib/data/acceptors";
import { DONORS } from "@/lib/data/donors";
import { lookupAcceptor, lookupDonor } from "@/lib/data/lookup";
import {
  ACCEPTOR_IDS,
  DONOR_IDS,
  type ControlPanelProps,
} from "@/lib/types";

import { CompoundPicker } from "./CompoundPicker";

type Preset = { label: string; value: number };

const PRESETS: Preset[] = [
  { label: "纯能量代谢", value: 0 },
  { label: "好氧", value: 0.6 },
  { label: "反硝化", value: 0.5 },
  { label: "产甲烷", value: 0.08 },
  { label: "纯合成", value: 1 },
];

const CURATED_DONORS = DONOR_IDS.map((id) => ({
  id,
  displayName: DONORS[id].displayName,
}));
const CURATED_ACCEPTORS = ACCEPTOR_IDS.map((id) => ({
  id,
  displayName: ACCEPTORS[id].displayName,
}));

/**
 * 论文里的"实验条件"段落 — 不是 dashboard 控件。
 * 纯文字+CompoundPicker+滑条，无任何卡片或图标。
 */
export function ControlPanelV2({
  donorId,
  acceptorId,
  fs,
  onDonorChange,
  onAcceptorChange,
  onFsChange,
}: ControlPanelProps) {
  // 取当前选择的中文名 (curated 或 EPA)
  const donorLabel = (() => {
    try {
      return lookupDonor(donorId).displayName;
    } catch {
      return String(donorId);
    }
  })();
  const acceptorLabel = (() => {
    try {
      return lookupAcceptor(acceptorId).displayName;
    } catch {
      return String(acceptorId);
    }
  })();

  return (
    <section>
      <SectionLabel title="实验条件" />

      <div className="ink-2 mt-4 space-y-3 text-[15.5px] leading-[1.85]">
        <p>
          以{" "}
          <CompoundPicker
            mode="donor"
            value={donorId}
            valueLabel={donorLabel}
            curated={CURATED_DONORS}
            onSelect={onDonorChange}
          />{" "}
          为电子供体，{" "}
          <CompoundPicker
            mode="acceptor"
            value={acceptorId}
            valueLabel={acceptorLabel}
            curated={CURATED_ACCEPTORS}
            onSelect={onAcceptorChange}
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

      {/* 滑块 */}
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

      {/* 预设 */}
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

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="ink text-[18px] font-semibold tracking-tight">{title}</h2>
    </div>
  );
}
