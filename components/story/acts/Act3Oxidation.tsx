"use client";

import NumberFlow from "@number-flow/react";
import { motion, useReducedMotion } from "framer-motion";
import { Zap } from "lucide-react";

import { StoryAct } from "../StoryAct";
import { useStory } from "../StoryContext";
import { DONORS } from "@/lib/data/donors";

export function Act3Oxidation() {
  const { donorId, result } = useStory();
  const reduce = useReducedMotion();
  const ne = result.kpis.electronsPerSubstrateMolecule;

  // Build a particle list seeded by ne (cap 24 to keep performant)
  const dots = Array.from({ length: Math.min(ne, 24) });

  return (
    <StoryAct
      id="act-3"
      index={3}
      eyebrow="第 3 幕 · 氧化释放电子"
      accent="purple"
      title={
        <>
          <span className="text-[var(--apple-purple)]">氧化</span>
          ，就是
          <br />
          让出电子
        </>
      }
      copy={
        <>
          化学上"被氧化"意思就是失去电子。
          <br className="hidden md:inline" />
          一个分子的 <b>{DONORS[donorId].displayName}</b> 完全氧化能放出
          <b className="text-[var(--apple-purple)]"> {ne} 个</b> 电子——
          这就是你之后要分配的全部"电子预算"。
        </>
      }
      visualAside={
        <div className="surface-card relative flex aspect-[5/4] flex-col items-center justify-center overflow-hidden p-8">
          <div className="text-quaternary mb-2 text-[10.5px] uppercase tracking-[0.18em]">
            n<sub>e</sub> · 每分子转移的电子
          </div>
          <div className="tabular flex items-baseline gap-2 font-mono text-[88px] font-semibold leading-none text-[var(--apple-purple)] md:text-[120px]">
            <NumberFlow value={ne} />
          </div>
          <div className="text-tertiary mt-1 text-[12.5px]">
            mol e⁻ · per mol {DONORS[donorId].displayName}
          </div>

          {/* electron dots */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {dots.map((_, i) => {
              const dur = 2.6 + (i % 5) * 0.18;
              const delay = (i * 0.07) % 2;
              const top = 30 + ((i * 13) % 40);
              const startX = 38 + ((i * 7) % 24);
              return (
                <motion.span
                  key={`${donorId}-${i}`}
                  initial={{ opacity: 0, x: `${startX}%`, y: `${top}%`, scale: 0.6 }}
                  animate={
                    reduce
                      ? { opacity: 0.5 }
                      : {
                          opacity: [0, 1, 1, 0],
                          x: [`${startX}%`, `${startX + 50}%`],
                          y: [`${top}%`, `${top + (i % 2 === 0 ? -18 : 18)}%`],
                          scale: [0.6, 1, 1, 0.4],
                        }
                  }
                  transition={{
                    duration: dur,
                    delay,
                    repeat: Infinity,
                    repeatDelay: 0.6,
                    ease: "easeInOut",
                  }}
                  className="absolute inline-flex h-2 w-2 items-center justify-center rounded-full bg-[var(--apple-purple)] shadow-[0_0_12px_rgba(175,82,222,0.7)]"
                />
              );
            })}
          </div>

          <div className="text-quaternary mt-6 inline-flex items-center gap-1 text-[11px]">
            <Zap className="h-3 w-3" />
            完全氧化 → CO₂ (碳全部变 +4)
          </div>
        </div>
      }
    />
  );
}
