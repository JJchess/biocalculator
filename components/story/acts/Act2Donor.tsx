"use client";

import { BlockMath } from "react-katex";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { StoryAct } from "../StoryAct";
import { useStory } from "../StoryContext";
import { DONORS } from "@/lib/data/donors";
import { SPECIES_DISPLAY_TEX } from "@/lib/data/molecularWeights";
import { DONOR_IDS, type DonorId } from "@/lib/types";

const DONOR_BLURBS: Record<DonorId, string> = {
  glucose: "糖类——所有人最熟悉的污染物模型。",
  acetate: "厌氧消化的主角，VFA 的代表。",
  benzene: "苯系物里的硬骨头，地下水污染常客。",
  toluene: "甲苯，BTEX 之一，加油站泄漏典型物。",
  ethanol: "乙醇，发酵产物 / 工业溶剂。",
  hydrogen: "氢气，最简单的电子供体；甲烷菌的主食。",
  ammonium: "氨氮，硝化菌的底物 (氮被氧化，不是碳)。",
};

export function Act2Donor() {
  const { donorId, setDonorId } = useStory();
  const reduce = useReducedMotion();

  return (
    <StoryAct
      id="act-2"
      index={2}
      eyebrow="第 2 幕 · 选一个供体"
      accent="blue"
      title={
        <>
          先选一个
          <br />
          <span className="text-[var(--apple-blue)]">微生物的"饭"</span>
        </>
      }
      copy={
        <>
          把要被处理的污染物叫作 <b>电子供体</b> (donor)——
          它会被微生物"氧化"，让出电子。
          <br className="hidden md:inline" />
          下面挑一个看看：
        </>
      }
      control={
        <div className="flex flex-wrap gap-2">
          {DONOR_IDS.map((id) => {
            const active = id === donorId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setDonorId(id)}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition active:scale-[0.97] ${
                  active
                    ? "bg-[var(--apple-blue)] text-white shadow-[var(--shadow-glow-blue)]"
                    : "border border-[var(--hairline)] bg-[var(--surface-solid)] text-[var(--text-secondary)] hover:border-[var(--apple-blue)] hover:text-[var(--apple-blue)]"
                }`}
              >
                {DONORS[id].displayName}
              </button>
            );
          })}
        </div>
      }
      visualAside={
        <div className="surface-card flex aspect-[5/4] flex-col items-center justify-center p-8">
          <div className="text-quaternary mb-4 text-[10.5px] uppercase tracking-[0.18em]">
            分子式
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={donorId}
              initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <div className="text-[44px] md:text-[56px]">
                <BlockMath math={SPECIES_DISPLAY_TEX[DONORS[donorId].primarySpecies]} />
              </div>
              <div className="mt-2 text-[15px] font-medium">
                {DONORS[donorId].displayName}
              </div>
              <div className="text-tertiary mt-3 max-w-[24ch] text-center text-[12.5px] leading-relaxed">
                {DONOR_BLURBS[donorId]}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      }
    />
  );
}
