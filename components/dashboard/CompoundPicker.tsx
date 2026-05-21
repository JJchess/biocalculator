"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BlockMath } from "react-katex";

import {
  EPA_CATEGORY_ORDER,
  EPA_POLLUTANTS,
  type EpaCategory,
  type EpaPollutant,
} from "@/lib/data/epaPollutants";

type CuratedItem = {
  id: string;
  displayName: string;
};

export type CompoundPickerProps = {
  /** 当前选中的 id (curated id 或 "epa_NNN") */
  value: string;
  /** 显示文本 (供按钮使用) */
  valueLabel: string;
  /** "donor" 模式只列 donor-合格的 EPA 化合物;
   *  "acceptor" 模式只列 acceptor_metal */
  mode: "donor" | "acceptor";
  /** Curated 经典库的可选项 (7 donors 或 6 acceptors) */
  curated: CuratedItem[];
  onSelect: (id: string) => void;
};

/**
 * 搜索式化合物选择器:
 *   • 按钮点开模态层
 *   • 顶部搜索框 + 分类筛选
 *   • 结果列表带 EPA 编号 / CAS / 分子式 三联徽章
 */
export function CompoundPicker({
  value,
  valueLabel,
  mode,
  curated,
  onSelect,
}: CompoundPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<EpaCategory | "all" | "curated">("all");

  const epaPool = useMemo(() => {
    if (mode === "donor") {
      return EPA_POLLUTANTS.filter((p) => p.role === "donor" && p.balance);
    }
    return EPA_POLLUTANTS.filter((p) => p.role === "acceptor_metal" && p.balance);
  }, [mode]);

  const categoriesPresent = useMemo(() => {
    const set = new Set(epaPool.map((p) => p.category));
    return EPA_CATEGORY_ORDER.filter((c) => set.has(c.id));
  }, [epaPool]);

  const filtered = useMemo(() => {
    let pool = epaPool;
    if (activeCat !== "all" && activeCat !== "curated") {
      pool = pool.filter((p) => p.category === activeCat);
    }
    if (!query.trim()) return pool;
    const q = query.trim().toLowerCase();
    return pool.filter(
      (p) =>
        p.epa_id.includes(q) ||
        p.cas.toLowerCase().includes(q) ||
        p.name_cn.toLowerCase().includes(q) ||
        p.name_en.toLowerCase().includes(q) ||
        p.formula.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q),
    );
  }, [epaPool, query, activeCat]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // 自动聚焦搜索框
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // SSR-safe: 只在客户端 portal
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* 触发按钮 - 内联引用风格 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ink relative inline-block cursor-pointer appearance-none border-0 border-b border-[var(--rule)] bg-transparent pb-[1px] pr-4 text-left font-semibold italic outline-none transition hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
      >
        {valueLabel}
        <span className="ink-4 absolute right-0 top-1/2 -translate-y-1/2 text-[9px]">▼</span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(0,0,0,0.35)] px-4 pt-[8vh]"
            onClick={() => setOpen(false)}
          >
            <div
              className="ink relative w-full max-w-[680px] overflow-hidden rounded-sm border border-[var(--rule)] bg-[var(--paper)] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 页眉 */}
              <div className="rule-double-b px-5 py-3">
                <div className="ink-3 text-[10px] uppercase tracking-[0.2em]">
                  {mode === "donor"
                    ? "Electron Donor — 化合物库"
                    : "Electron Acceptor — 化合物库"}
                </div>
                <div className="ink mt-1.5 text-[16px] font-semibold">
                  从 {curated.length + epaPool.length} 种化合物中选择
                  <span className="ink-4 ml-2 text-[11.5px] italic font-normal">
                    {curated.length} curated · {epaPool.length} from EPA 40 CFR 423
                  </span>
                </div>
              </div>

              {/* 搜索框 */}
              <div className="rule-b px-5 py-3">
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="按中文名 / 英文名 / CAS / EPA 编号 / 分子式 搜索…"
                  className="ink w-full appearance-none border-0 bg-transparent text-[14px] italic outline-none placeholder:text-[var(--ink-4)]"
                />
              </div>

              {/* 分类筛选 chips */}
              <div className="rule-b flex flex-wrap gap-x-2 gap-y-1 px-5 py-2.5 text-[11px]">
                <CatChip
                  active={activeCat === "all"}
                  onClick={() => setActiveCat("all")}
                  label="全部 EPA"
                  count={epaPool.length}
                />
                <CatChip
                  active={activeCat === "curated"}
                  onClick={() => setActiveCat("curated")}
                  label="经典库"
                  count={curated.length}
                />
                {categoriesPresent.map((c) => {
                  const n = epaPool.filter((p) => p.category === c.id).length;
                  return (
                    <CatChip
                      key={c.id}
                      active={activeCat === c.id}
                      onClick={() => setActiveCat(c.id)}
                      label={c.label}
                      count={n}
                    />
                  );
                })}
              </div>

              {/* 结果列表 */}
              <div className="max-h-[52vh] overflow-y-auto">
                {activeCat === "curated" || (activeCat === "all" && query === "") ? (
                  <CuratedSection
                    items={curated}
                    value={value}
                    onPick={(id) => {
                      onSelect(id);
                      setOpen(false);
                    }}
                  />
                ) : null}
                {activeCat !== "curated" ? (
                  <EpaList
                    items={filtered}
                    value={value}
                    onPick={(id) => {
                      onSelect(id);
                      setOpen(false);
                    }}
                  />
                ) : null}
              </div>

              {/* 页脚 */}
              <div className="rule-t ink-4 px-5 py-2 text-[10.5px] italic">
                数据源 · 40 CFR Part 423 Appx A (126 种) + PubChem 分子式溯源 ·
                半反应系数由 Gauss 消元自动配平 (残差 &lt; 10⁻¹⁵)
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function CatChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-2 py-0.5 italic transition ${
        active
          ? "border-[var(--accent-ink)] bg-[var(--accent)] text-[var(--accent-ink)]"
          : "border-[var(--rule-soft)] text-[var(--ink-3)] hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
      }`}
    >
      {label}{" "}
      <span className="not-italic text-[10px] opacity-70">·{count}</span>
    </button>
  );
}

function CuratedSection({
  items,
  value,
  onPick,
}: {
  items: CuratedItem[];
  value: string;
  onPick: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="ink-3 hairline-b px-5 py-1.5 text-[10px] uppercase tracking-[0.2em]">
        经典库 · 教材精选
      </div>
      <ul>
        {items.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onPick(c.id)}
              className={`flex w-full items-center justify-between gap-3 border-b border-[var(--rule-soft)] px-5 py-2 text-left transition hover:bg-[rgba(139,26,26,0.04)] ${
                value === c.id ? "bg-[rgba(139,26,26,0.06)]" : ""
              }`}
            >
              <span className="ink text-[14px]">{c.displayName}</span>
              <span className="ink-4 text-[10.5px] italic">curated</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EpaList({
  items,
  value,
  onPick,
}: {
  items: EpaPollutant[];
  value: string;
  onPick: (id: string) => void;
}) {
  return (
    <div>
      <div className="ink-3 hairline-b px-5 py-1.5 text-[10px] uppercase tracking-[0.2em]">
        EPA Priority Pollutants · 40 CFR 423 Appx A
      </div>
      {items.length === 0 ? (
        <div className="ink-4 px-5 py-6 text-center text-[12px] italic">
          没有匹配的化合物
        </div>
      ) : (
        <ul>
          {items.map((p) => {
            const itemId = `epa_${p.epa_id}`;
            const active = value === itemId;
            return (
              <li key={p.epa_id}>
                <button
                  type="button"
                  onClick={() => onPick(itemId)}
                  className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-[var(--rule-soft)] px-5 py-2 text-left transition hover:bg-[rgba(139,26,26,0.04)] ${
                    active ? "bg-[rgba(139,26,26,0.06)]" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="ink-4 tabular font-mono text-[10.5px]">
                        #{p.epa_id}
                      </span>
                      <span className="ink truncate text-[14px]">{p.name_cn}</span>
                      <span className="ink-3 truncate text-[11.5px] italic">
                        {p.name_en}
                      </span>
                    </div>
                    <div className="ink-4 mt-0.5 flex flex-wrap items-center gap-x-2 text-[10.5px]">
                      <span className="tabular font-mono">CAS {p.cas}</span>
                      <span>·</span>
                      <span className="italic">{p.subcategory}</span>
                      <span>·</span>
                      <span className="tabular font-mono">
                        <BlockMath math={formulaToKatex(p.formula)} />
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formulaToKatex(formula: string): string {
  let out = formula.replace(/([A-Z][a-z]?)(\d+)/g, (_, el, n) => `${el}_{${n}}`);
  out = out.replace(/\^([0-9]*[+-])/, (_, c) => `^{${c}}`);
  return out;
}
