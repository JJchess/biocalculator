"use client";

import Fraction from "fraction.js";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

import { StoryAct } from "../StoryAct";
import { useStory } from "../StoryContext";
import { parseFormula } from "@/lib/chem/formula";
import { SPECIES_FORMULA } from "@/lib/data/species";
import type { SpeciesId } from "@/lib/types";

type Check = { label: string; tint: string; residual: string };

function computeChecks(normalized: Map<SpeciesId, Fraction>): Check[] {
  // For each species in normalized, parse its formula and sum atoms / charge weighted by coefficient.
  const atomSums = new Map<string, Fraction>();
  let chargeSum = new Fraction(0);
  let electronSum = new Fraction(0);

  for (const [sp, coef] of normalized) {
    if (sp === "e_minus") {
      electronSum = electronSum.add(coef);
      continue;
    }
    const formula = SPECIES_FORMULA[sp];
    if (!formula) continue;
    const parsed = parseFormula(formula);
    for (const [el, count] of parsed.elements) {
      const prev = atomSums.get(el) ?? new Fraction(0);
      atomSums.set(el, prev.add(count.mul(coef)));
    }
    chargeSum = chargeSum.add(parsed.charge.mul(coef));
  }

  return [
    {
      label: "原子守恒",
      tint: "var(--apple-blue)",
      residual: formatAtomResiduals(atomSums),
    },
    {
      label: "电荷守恒",
      tint: "var(--apple-orange)",
      residual: chargeSum.equals(0) ? "Σq = 0" : `Σq = ${chargeSum.toFraction()}`,
    },
    {
      label: "电子守恒",
      tint: "var(--apple-purple)",
      residual: electronSum.equals(0)
        ? "Σe⁻ = 0 (左右相消)"
        : `残差 ${electronSum.toFraction()}`,
    },
  ];
}

function formatAtomResiduals(sums: Map<string, Fraction>): string {
  const nonzero: string[] = [];
  for (const [el, v] of sums) {
    if (!v.equals(0)) nonzero.push(`${el}=${v.toFraction()}`);
  }
  if (nonzero.length === 0) {
    const elems = [...sums.keys()].join(", ");
    return `${elems} 全部 = 0`;
  }
  return `残差: ${nonzero.join(", ")}`;
}

export function Act7Conservation() {
  const { result } = useStory();
  const reduce = useReducedMotion();
  const checks = computeChecks(result.normalized);

  return (
    <StoryAct
      id="act-7"
      index={7}
      eyebrow="第 7 幕 · 验算"
      accent="green"
      title={
        <>
          一个合法的反应，
          <br />
          必须<span className="text-[var(--apple-green)]"> 三样都守恒</span>
        </>
      }
      copy={
        <>
          原子不会凭空出现，电荷不会凭空增加，电子不会凭空消失。
          <br className="hidden md:inline" />
          下面这三个验算就是 BioCalc 引擎"绝对不会算错"的保证——
          它不是查表，是从守恒律解出来的。
        </>
      }
      visual={
        <div className="grid gap-4 md:grid-cols-3">
          {checks.map((c, i) => (
            <motion.div
              key={c.label}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{
                duration: 0.5,
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="surface-card flex flex-col items-start gap-3 p-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[var(--shadow-1)]"
                  style={{ background: c.tint }}
                >
                  <Check className="h-5 w-5" strokeWidth={3} />
                </div>
                <div className="text-[16px] font-semibold">{c.label}</div>
              </div>
              <div
                className="tabular w-full rounded-lg border border-[var(--hairline)] bg-[rgba(0,0,0,0.025)] px-3 py-2 font-mono text-[12px] text-[var(--text-secondary)] dark:bg-[rgba(255,255,255,0.04)]"
              >
                {c.residual}
              </div>
            </motion.div>
          ))}
        </div>
      }
    />
  );
}
