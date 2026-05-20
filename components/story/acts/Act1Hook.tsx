"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Act 1 — Hook
 * 全屏中心标题。下方一个 "向下滚动" 的暗示。
 * 极简，留白多，让用户先呼吸再进入故事。
 */
export function Act1Hook() {
  const reduce = useReducedMotion();
  return (
    <section
      id="act-1"
      className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-24 text-center"
    >
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1.5 text-[11.5px] font-medium tracking-[0.12em] text-[var(--text-tertiary)] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--apple-blue)]" />
          交互式微生物代谢导览
        </div>

        <h1 className="bg-gradient-to-br from-[var(--text-primary)] via-[var(--apple-blue)] to-[var(--apple-purple)] bg-clip-text text-[44px] font-semibold leading-[1.05] tracking-tight text-transparent md:text-[72px] lg:text-[88px]">
          污染物，
          <br />
          去哪儿了？
        </h1>

        <p className="text-secondary mt-6 max-w-xl text-[16px] leading-relaxed md:text-[18px]">
          一个有机分子掉进废水里，细菌把它吃掉。
          <br className="hidden md:inline" />
          电子、原子、能量到底走了哪条路？
        </p>

        <p className="text-quaternary mt-3 max-w-lg text-[13px] leading-relaxed">
          把它当作一个化学账本，6 幕看完，你就懂半反应法是怎么记账的。
        </p>
      </motion.div>

      {/* 滚动暗示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-[var(--text-quaternary)]"
        >
          <span className="text-[10.5px] tracking-[0.2em]">SCROLL</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
