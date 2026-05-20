"use client";

import { BlockMath } from "react-katex";
import { motion, useReducedMotion } from "framer-motion";

import { StoryAct } from "../StoryAct";
import { useStory } from "../StoryContext";
import { ACCEPTORS } from "@/lib/data/acceptors";
import { CELL_SYNTHESIS } from "@/lib/data/cellSynthesis";
import { DONORS } from "@/lib/data/donors";

export function Act6Equation() {
  const { donorId, acceptorId, fs, result } = useStory();
  const reduce = useReducedMotion();
  const fe = 1 - fs;

  const lines = [
    {
      label: "电子供体半反应 R_d",
      tex: DONORS[donorId].referenceKatex ?? "",
      tint: "var(--apple-blue)",
    },
    {
      label: `电子受体半反应 R_a  (×${fe.toFixed(2)})`,
      tex: ACCEPTORS[acceptorId].referenceKatex ?? "",
      tint: "var(--apple-orange)",
    },
    {
      label: `细胞合成半反应 R_c  (×${fs.toFixed(2)})`,
      tex: CELL_SYNTHESIS.referenceKatex ?? "",
      tint: "var(--apple-purple)",
    },
  ];

  return (
    <StoryAct
      id="act-6"
      index={6}
      eyebrow="第 6 幕 · 加总"
      accent="teal"
      title={
        <>
          按比例
          <br />
          <span className="text-[var(--apple-teal)]">把三条加起来</span>
        </>
      }
      copy={
        <>
          这就是半反应法的核心算法：
          <br className="hidden md:inline" />
          <code className="font-mono text-[14px]">R = R_d + fe · R_a + fs · R_c</code>
          <br />
          电子项左右相消，剩下的就是你能在烧杯里看到的总反应。
        </>
      }
      visual={
        <div className="surface-card flex flex-col gap-4 p-6 md:p-8">
          {lines.map((l, i) => (
            <motion.div
              key={l.label}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{
                duration: 0.45,
                delay: i * 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col gap-1.5 rounded-xl border border-[var(--hairline)] bg-[rgba(0,0,0,0.02)] p-3.5 dark:bg-[rgba(255,255,255,0.03)]"
            >
              <div
                className="text-[10.5px] font-medium uppercase tracking-[0.12em]"
                style={{ color: l.tint }}
              >
                {l.label}
              </div>
              <div className="overflow-x-auto text-[14px]">
                <BlockMath math={l.tex} />
              </div>
            </motion.div>
          ))}

          {/* Sum sign */}
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.6 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="my-1 text-center font-mono text-[18px] text-[var(--text-tertiary)]"
          >
            =
          </motion.div>

          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border-2 border-[var(--apple-teal)]/30 bg-gradient-to-br from-[rgba(48,176,199,0.06)] to-[rgba(0,122,255,0.04)] p-4 shadow-[0_4px_24px_-8px_rgba(48,176,199,0.4)]"
          >
            <div className="mb-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-[var(--apple-teal)]">
              总反应 · 每 mol 供体
            </div>
            <div className="overflow-x-auto text-center text-[16px] md:text-[18px]">
              <BlockMath math={result.equationKatex} />
            </div>
          </motion.div>
        </div>
      }
    />
  );
}
