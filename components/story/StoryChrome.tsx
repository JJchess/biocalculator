"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { Atom, ArrowRight } from "lucide-react";

import { useStory } from "./StoryContext";

/**
 * 故事页固定外壳：
 *   - 顶部精简品牌条 + 跳过按钮 (定位为浮动按钮，不抢戏)
 *   - 顶部细线进度条 (随滚动填充)
 */
export function StoryChrome() {
  const { handoffHref } = useStory();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.4,
  });

  return (
    <>
      {/* 滚动进度条 */}
      <motion.div
        style={{ scaleX, transformOrigin: "0% 50%" }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-gradient-to-r from-[var(--apple-blue)] via-[var(--apple-purple)] to-[var(--apple-pink)]"
      />

      {/* 浮动品牌 (左上) */}
      <div className="pointer-events-none fixed left-5 top-5 z-40 md:left-8 md:top-6">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1.5 text-[12px] font-medium backdrop-blur">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[var(--apple-blue)] to-[var(--apple-purple)] text-white">
            <Atom className="h-3 w-3" strokeWidth={2.6} />
          </div>
          <span className="tracking-tight">BioCalc</span>
        </div>
      </div>

      {/* 浮动跳过 (右上) */}
      <Link
        href={handoffHref}
        className="fixed right-5 top-5 z-40 inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] backdrop-blur transition hover:text-[var(--apple-blue)] active:scale-[0.97] md:right-8 md:top-6"
      >
        跳过 · 直接计算
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </>
  );
}
