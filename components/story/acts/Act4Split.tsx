"use client";

import NumberFlow from "@number-flow/react";
import { motion, useReducedMotion } from "framer-motion";

import { StoryAct } from "../StoryAct";
import { useStory } from "../StoryContext";
import { Slider } from "@/components/ui/slider";

const PRESETS = [
  { label: "纯能量", value: 0, hint: "全部用来产能" },
  { label: "厌氧产甲烷", value: 0.08, hint: "fs≈0.08" },
  { label: "反硝化", value: 0.5, hint: "fs≈0.5" },
  { label: "好氧典型", value: 0.6, hint: "fs≈0.6" },
  { label: "纯合成", value: 1, hint: "全部用来长身体" },
];

export function Act4Split() {
  const { fs, setFs, result } = useStory();
  const fe = 1 - fs;
  const ne = result.kpis.electronsPerSubstrateMolecule;
  const reduce = useReducedMotion();

  return (
    <StoryAct
      id="act-4"
      index={4}
      eyebrow="第 4 幕 · 电子兵分两路"
      accent="purple"
      title={
        <>
          这些电子，
          <br />
          分给<span className="text-[var(--apple-teal)]">能量</span>，还是
          <br />
          分给<span className="text-[var(--apple-purple)]">细胞</span>？
        </>
      }
      copy={
        <>
          细菌不会把所有电子都用来产能——它还得长身体。
          <br className="hidden md:inline" />
          <b className="text-[var(--apple-purple)]">f<sub>s</sub></b> 就是
          "分给细胞合成"的比例；剩下的
          <b className="text-[var(--apple-teal)]"> f<sub>e</sub> = 1 − f<sub>s</sub></b>
          才进入能量代谢。<br />
          滑一下试试，左边的电子流会跟着分配。
        </>
      }
      control={
        <div className="flex max-w-md flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-medium text-[var(--apple-purple)]">
              f<sub>s</sub> · 细胞合成分数
            </span>
            <span className="tabular font-mono text-[14px]">
              <span className="text-[var(--apple-teal)]">
                f<sub>e</sub>=<NumberFlow value={fe} format={{ maximumFractionDigits: 2 }} />
              </span>
              <span className="text-quaternary mx-2">·</span>
              <span className="text-[var(--apple-purple)]">
                f<sub>s</sub>=<NumberFlow value={fs} format={{ maximumFractionDigits: 2 }} />
              </span>
            </span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[fs]}
            onValueChange={(v) => {
              const next = typeof v === "number" ? v : v[0];
              if (next === undefined) return;
              setFs(next);
            }}
          />
          <div className="flex h-2 overflow-hidden rounded-full">
            <motion.div
              className="bg-[var(--apple-teal)]"
              animate={{ width: `${fe * 100}%` }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="bg-[var(--apple-purple)]"
              animate={{ width: `${fs * 100}%` }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => {
              const active = Math.abs(p.value - fs) < 0.005;
              return (
                <button
                  key={p.label}
                  type="button"
                  title={p.hint}
                  onClick={() => setFs(p.value)}
                  className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium transition active:scale-[0.96] ${
                    active
                      ? "bg-[var(--apple-purple)] text-white shadow-[var(--shadow-1)]"
                      : "border border-[var(--hairline)] bg-[var(--surface-solid)] text-[var(--text-secondary)] hover:border-[var(--apple-purple)] hover:text-[var(--apple-purple)]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      }
      visualAside={
        <div className="surface-card flex aspect-[5/4] flex-col p-6">
          <div className="text-quaternary mb-3 text-[10.5px] uppercase tracking-[0.18em]">
            电子流分配 · ne = {ne}
          </div>
          {/* Mini-Sankey via two rectangles + bezier connectors */}
          <MiniSplit fe={fe} fs={fs} ne={ne} reduce={!!reduce} />
        </div>
      }
    />
  );
}

function MiniSplit({
  fe,
  fs,
  ne,
  reduce,
}: {
  fe: number;
  fs: number;
  ne: number;
  reduce: boolean;
}) {
  // SVG layout
  const W = 460;
  const H = 280;
  const sourceX = 40;
  const targetX = W - 40;
  const sourceY = H / 2;
  const energyY = 90;
  const synthY = H - 90;
  const sourceH = 160;
  const maxBranchH = 140;
  const energyH = Math.max(2, fe * maxBranchH);
  const synthH = Math.max(2, fs * maxBranchH);

  const eEnergy = (ne * fe).toFixed(1);
  const eSynth = (ne * fs).toFixed(1);

  const t = { duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
        <defs>
          <linearGradient id="grad-energy" x1="0" x2="1">
            <stop offset="0" stopColor="var(--apple-blue)" stopOpacity="0.85" />
            <stop offset="1" stopColor="var(--apple-teal)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="grad-synth" x1="0" x2="1">
            <stop offset="0" stopColor="var(--apple-blue)" stopOpacity="0.85" />
            <stop offset="1" stopColor="var(--apple-purple)" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* source node */}
        <rect
          x={sourceX - 10}
          y={sourceY - sourceH / 2}
          width="10"
          height={sourceH}
          rx="3"
          fill="var(--apple-blue)"
        />
        <text
          x={sourceX - 16}
          y={sourceY + 4}
          textAnchor="end"
          fontSize="12"
          fill="var(--text-secondary)"
          fontWeight={600}
        >
          供体
        </text>

        {/* energy branch */}
        <motion.path
          initial={false}
          animate={{
            d: bandPath(
              sourceX,
              sourceY - sourceH / 2,
              sourceH * fe,
              targetX,
              energyY - energyH / 2,
              energyH,
            ),
          }}
          transition={t}
          fill="url(#grad-energy)"
          opacity={0.85}
        />
        <motion.rect
          initial={false}
          animate={{ y: energyY - energyH / 2, height: energyH }}
          transition={t}
          x={targetX}
          width="10"
          rx="3"
          fill="var(--apple-teal)"
        />
        <text
          x={targetX + 16}
          y={energyY - 6}
          fontSize="12"
          fill="var(--apple-teal)"
          fontWeight={600}
        >
          能量代谢
        </text>
        <text
          x={targetX + 16}
          y={energyY + 10}
          fontSize="11"
          fill="var(--text-tertiary)"
          fontFamily="var(--font-mono)"
        >
          {eEnergy} mol e⁻
        </text>

        {/* synthesis branch */}
        <motion.path
          initial={false}
          animate={{
            d: bandPath(
              sourceX,
              sourceY - sourceH / 2 + sourceH * fe,
              sourceH * fs,
              targetX,
              synthY - synthH / 2,
              synthH,
            ),
          }}
          transition={t}
          fill="url(#grad-synth)"
          opacity={0.85}
        />
        <motion.rect
          initial={false}
          animate={{ y: synthY - synthH / 2, height: synthH }}
          transition={t}
          x={targetX}
          width="10"
          rx="3"
          fill="var(--apple-purple)"
        />
        <text
          x={targetX + 16}
          y={synthY - 6}
          fontSize="12"
          fill="var(--apple-purple)"
          fontWeight={600}
        >
          细胞合成
        </text>
        <text
          x={targetX + 16}
          y={synthY + 10}
          fontSize="11"
          fill="var(--text-tertiary)"
          fontFamily="var(--font-mono)"
        >
          {eSynth} mol e⁻
        </text>
      </svg>
    </div>
  );
}

/** 生成一条平滑 ribbon path：源 [x1, y1, h1] → 终 [x2, y2, h2] */
function bandPath(
  x1: number,
  y1: number,
  h1: number,
  x2: number,
  y2: number,
  h2: number,
): string {
  const cx = (x1 + x2) / 2;
  const top = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  const bot = `L ${x2} ${y2 + h2} C ${cx} ${y2 + h2}, ${cx} ${y1 + h1}, ${x1} ${y1 + h1} Z`;
  return `${top} ${bot}`;
}
