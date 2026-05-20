"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  id: string;
  /** 区域顺序号 (Act 1, 2, …) — 用于左侧 chapter chip */
  index: number;
  /** Eyebrow 上方副标题（例如 "第 1 幕"） */
  eyebrow: string;
  /** 该幕大标题 */
  title: ReactNode;
  /** 副标题/讲解段落 */
  copy?: ReactNode;
  /** 互动控件 (滑块、选择器…)，位于讲解下方 */
  control?: ReactNode;
  /** 全宽下方的可视化（图）；优先于 visualAside */
  visual?: ReactNode;
  /** 右侧粘连可视化（桌面端用） */
  visualAside?: ReactNode;
  /** 主题色 */
  accent?: "blue" | "purple" | "orange" | "green" | "teal" | "neutral";
  /** 最小高度（默认全屏） */
  minHFull?: boolean;
};

const ACCENT_LABEL: Record<string, string> = {
  blue: "text-[var(--apple-blue)] dark:text-[var(--apple-teal)]",
  purple: "text-[var(--apple-purple)]",
  orange: "text-[#b35900] dark:text-[var(--apple-orange)]",
  green: "text-[#1c7a3a] dark:text-[var(--apple-green)]",
  teal: "text-[#0f7283] dark:text-[var(--apple-teal)]",
  neutral: "text-[var(--text-tertiary)]",
};

export function StoryAct({
  id,
  index,
  eyebrow,
  title,
  copy,
  control,
  visual,
  visualAside,
  accent = "blue",
  minHFull = true,
}: Props) {
  const reduce = useReducedMotion();
  const fade = reduce
    ? { initial: { opacity: 1 }, whileInView: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 } };

  const hasAside = !!visualAside;

  return (
    <section
      id={id}
      className={`relative ${minHFull ? "min-h-screen" : ""} w-full snap-start py-16 md:py-24`}
    >
      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        <div
          className={`grid items-center gap-10 ${
            hasAside ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]" : ""
          }`}
        >
          {/* 文字主区 */}
          <motion.div
            {...fade}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <div
              className={`mb-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em] ${ACCENT_LABEL[accent]}`}
            >
              <span className="font-mono text-[10.5px] opacity-70">
                {String(index).padStart(2, "0")}
              </span>
              <span>·</span>
              <span>{eyebrow}</span>
            </div>
            <h2 className="text-[32px] font-semibold leading-[1.15] tracking-tight md:text-[44px] lg:text-[52px]">
              {title}
            </h2>
            {copy && (
              <div className="text-secondary mt-5 max-w-xl text-[15.5px] leading-relaxed md:text-[16.5px]">
                {copy}
              </div>
            )}
            {control && <div className="mt-7">{control}</div>}
          </motion.div>

          {/* 右侧粘连可视化 */}
          {hasAside && (
            <motion.div
              initial={reduce ? { opacity: 1 } : { opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="min-w-0"
            >
              {visualAside}
            </motion.div>
          )}
        </div>

        {/* 全宽可视化 */}
        {visual && (
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 min-w-0"
          >
            {visual}
          </motion.div>
        )}
      </div>
    </section>
  );
}
