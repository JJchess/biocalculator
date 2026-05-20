"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Gauge } from "lucide-react";

import { useStory } from "../StoryContext";
import { DONORS } from "@/lib/data/donors";
import { ACCEPTORS } from "@/lib/data/acceptors";

export function Act8Handoff() {
  const { donorId, acceptorId, fs, handoffHref, result } = useStory();
  const reduce = useReducedMotion();

  return (
    <section
      id="act-8"
      className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-24 text-center"
    >
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex max-w-2xl flex-col items-center"
      >
        <div className="text-quaternary mb-3 inline-flex items-center gap-2 text-[11.5px] uppercase tracking-[0.18em]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--apple-green)]" />
          故事结束 · 工具开始
        </div>

        <h2 className="text-[40px] font-semibold leading-[1.1] tracking-tight md:text-[60px]">
          现在你知道
          <br />
          <span className="bg-gradient-to-br from-[var(--apple-blue)] to-[var(--apple-purple)] bg-clip-text text-transparent">
            每个数字代表什么
          </span>
        </h2>

        <p className="text-secondary mt-5 max-w-lg text-[15.5px] leading-relaxed">
          下一步进入完整工作台——质量衡算、产物质量、KPI、Sankey、可排序表格全在一页，
          你刚才挑的选择会带过去。
        </p>

        <div className="mt-7 grid w-full max-w-md grid-cols-3 gap-2 text-[11.5px]">
          <Pill label="供体" value={DONORS[donorId].displayName} tint="blue" />
          <Pill
            label="受体"
            value={ACCEPTORS[acceptorId].displayName}
            tint="orange"
          />
          <Pill label="fs" value={fs.toFixed(2)} tint="purple" />
        </div>

        <Link
          href={handoffHref}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--apple-blue)] to-[var(--apple-purple)] px-6 py-3 text-[14px] font-semibold text-white shadow-[var(--shadow-glow-blue)] transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Gauge className="h-4 w-4" />
          进入完整工作台
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <div className="text-quaternary mt-6 font-mono text-[11px]">
          {result.equationKatex.length > 0
            ? "你看到的等式正在那里等你"
            : ""}
        </div>
      </motion.div>
    </section>
  );
}

function Pill({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: "blue" | "orange" | "purple";
}) {
  const styles: Record<string, string> = {
    blue: "border-[rgba(0,122,255,0.25)] text-[var(--apple-blue)] bg-[rgba(0,122,255,0.06)]",
    orange:
      "border-[rgba(255,149,0,0.3)] text-[#b35900] bg-[rgba(255,149,0,0.06)] dark:text-[var(--apple-orange)]",
    purple:
      "border-[rgba(175,82,222,0.28)] text-[var(--apple-purple)] bg-[rgba(175,82,222,0.06)]",
  };
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-left ${styles[tint]}`}
    >
      <div className="text-quaternary text-[10px] uppercase tracking-[0.14em]">
        {label}
      </div>
      <div className="mt-0.5 truncate text-[12.5px] font-semibold">
        {value}
      </div>
    </div>
  );
}
