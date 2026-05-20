"use client";

import { BlockMath } from "react-katex";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { StoryAct } from "../StoryAct";
import { useStory } from "../StoryContext";
import { ACCEPTORS } from "@/lib/data/acceptors";
import { SPECIES_DISPLAY_TEX } from "@/lib/data/molecularWeights";
import {
  ACCEPTOR_IDS,
  type AcceptorId,
  type SpeciesId,
} from "@/lib/types";

const ACCEPTOR_TEX: Record<AcceptorId, { in: SpeciesId; out: SpeciesId; env: string }> = {
  oxygen: { in: "oxygen", out: "h2o", env: "好氧 · 城市污水厂活性污泥" },
  nitrate: { in: "nitrate", out: "n2", env: "缺氧 · 反硝化脱氮" },
  sulfate: { in: "sulfate", out: "hs", env: "厌氧 · 海水/含硫废水 (注意 H₂S 毒)" },
  methanogenesis: { in: "co2", out: "methane", env: "严格厌氧 · UASB / 沼气池" },
  iron3: { in: "ferric", out: "ferrous", env: "缺氧 · 地下水含铁层" },
  manganese_dioxide: { in: "manganite", out: "manganous", env: "缺氧 · 海底沉积物" },
};

export function Act5Acceptor() {
  const { acceptorId, setAcceptorId } = useStory();
  const reduce = useReducedMotion();
  const { in: inSp, out: outSp, env } = ACCEPTOR_TEX[acceptorId];

  return (
    <StoryAct
      id="act-5"
      index={5}
      eyebrow="第 5 幕 · 谁来收电子"
      accent="orange"
      title={
        <>
          能量代谢的电子，
          <br />
          得有
          <span className="text-[var(--apple-orange)]"> 受体 </span>
          接收
        </>
      }
      copy={
        <>
          电子不能凭空消失——必须有 <b>电子受体</b> 把它收下。
          <br className="hidden md:inline" />
          受体的种类，几乎决定了你处在哪种工艺：好氧、缺氧、厌氧产甲烷……
        </>
      }
      control={
        <div className="flex flex-wrap gap-2">
          {ACCEPTOR_IDS.map((id) => {
            const active = id === acceptorId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setAcceptorId(id)}
                className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition active:scale-[0.97] ${
                  active
                    ? "bg-[var(--apple-orange)] text-white shadow-[var(--shadow-1)]"
                    : "border border-[var(--hairline)] bg-[var(--surface-solid)] text-[var(--text-secondary)] hover:border-[var(--apple-orange)] hover:text-[var(--apple-orange)]"
                }`}
              >
                {ACCEPTORS[id].displayName}
              </button>
            );
          })}
        </div>
      }
      visualAside={
        <div className="surface-card flex aspect-[5/4] flex-col items-center justify-center p-8">
          <div className="text-quaternary mb-4 text-[10.5px] uppercase tracking-[0.18em]">
            还原半反应（每 mol e⁻）
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={acceptorId}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-3 text-[40px] md:text-[52px]">
                <BlockMath math={SPECIES_DISPLAY_TEX[inSp]} />
                <ArrowRight className="h-6 w-6 text-[var(--apple-orange)]" />
                <BlockMath math={SPECIES_DISPLAY_TEX[outSp]} />
              </div>
              <div className="mt-4 text-[14px] font-medium">
                {ACCEPTORS[acceptorId].displayName}
              </div>
              <div className="text-tertiary mt-2 max-w-[28ch] text-center text-[12px] leading-relaxed">
                {env}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      }
    />
  );
}
