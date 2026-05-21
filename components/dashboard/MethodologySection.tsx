"use client";

import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EPA_META, EPA_POLLUTANTS } from "@/lib/data/epaPollutants";

/**
 * §0 方法学与数据来源 — 学术论文风格的开场白。
 *
 * 目的: 老师/答辩在 30 秒内能看到全部学术诚信信息:
 *   • 数据源（EPA 官方法规 + PubChem 国家级数据库）
 *   • 配平方法（Gauss 消元 + 元素电荷守恒）
 *   • 处理决策（哪些化合物入半反应、哪些显式排除及理由）
 *   • 数值精度（残差 < 10⁻¹⁵）
 */
export function MethodologySection() {
  const [open, setOpen] = useState(false);

  // 分类统计
  const stats = (() => {
    const byCat: Record<string, number> = {};
    let byRole = { donor: 0, acceptor_metal: 0, non_redox: 0, excluded: 0 };
    let withBalance = 0;
    for (const p of EPA_POLLUTANTS) {
      byCat[p.category] = (byCat[p.category] ?? 0) + 1;
      byRole[p.role] = (byRole[p.role] ?? 0) + 1;
      if (p.balance) withBalance++;
    }
    return { byCat, byRole, withBalance };
  })();

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/method"
    >
      <section className="rule-b pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="ink text-[18px] font-semibold tracking-tight">
            数据来源与方法学
          </h2>
          <CollapsibleTrigger className="ink-3 text-[12px] italic underline decoration-[var(--rule)] decoration-1 underline-offset-[3px] transition hover:text-[var(--accent-ink)] hover:decoration-[var(--accent-ink)]">
            {open ? "收起 ▴" : "展开 ▾"}
          </CollapsibleTrigger>
        </div>
        <p className="ink-3 mt-2 text-[13.5px] italic leading-relaxed">
          化合物库整合自 <em className="accent-ink not-italic">EPA 40 CFR Part 423 Appx A</em>（126 种优先污染物）·
          分子式经 <em className="accent-ink not-italic">PubChem (NCBI)</em> 复核 ·
          半反应系数由元素—电荷守恒矩阵自动求解
          <span className="ink-4 not-italic"> (n = {stats.withBalance} 条数值验证残差 &lt; 10⁻¹⁵)</span>.
        </p>

        <CollapsibleContent>
          <div className="mt-6 space-y-7">
            {/* 数据源 */}
            <SubSection title="A. 化合物数据来源">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <Th>来源</Th>
                    <Th>用途</Th>
                    <Th>引用</Th>
                  </tr>
                </thead>
                <tbody>
                  <Tr
                    src="40 CFR Part 423 Appx A"
                    use="优先污染物清单 (n=126)"
                    cite="U.S. EPA. Code of Federal Regulations Title 40, Chapter I, Subchapter N, Part 423"
                    url="https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-423"
                  />
                  <Tr
                    src="PubChem (NCBI/NIH)"
                    use="分子式 / CAS / 分子量复核"
                    cite="Kim S, et al. PubChem 2023 update. Nucleic Acids Res. 2023"
                    url="https://pubchem.ncbi.nlm.nih.gov/"
                  />
                  <Tr
                    src="Rittmann & McCarty (2001)"
                    use="半反应框架与化学计量学方法"
                    cite="Environmental Biotechnology: Principles and Applications. McGraw-Hill"
                  />
                  <Tr
                    src="IUPAC Atomic Weights"
                    use="20 种元素的原子量基准"
                    cite="Meija J, et al. Atomic weights of the elements 2013. Pure Appl Chem 88(3)"
                  />
                </tbody>
              </table>
            </SubSection>

            {/* 配平流程 */}
            <SubSection title="B. 自动配平流程">
              <ol className="ink-2 list-decimal space-y-1.5 pl-5 text-[13.5px] leading-relaxed">
                <li>
                  对每个化合物，按
                  <em className="accent-ink not-italic"> 原子归宿规则 </em>
                  推产物列表：
                  <span className="ink-3 ml-1 italic">
                    C→CO₂, N→NH₄⁺, S→SO₄²⁻, Cl/Br/F/I→卤离子, P→HPO₄²⁻ (H/O 由 H₂O/H⁺ 自动平衡)
                  </span>
                </li>
                <li>
                  构造约束矩阵 M ∈ ℚ<sup>(k+2)×n</sup>：
                  <em className="ink-3 not-italic italic"> k 行元素守恒 + 1 行电荷守恒 + 1 行 e⁻ 归一化 </em>
                </li>
                <li>
                  以 <em className="font-mono not-italic">fraction.js</em> 表示精确有理数，
                  Gauss-Jordan 消元求唯一解 (`lib/chem/linalg.ts`)
                </li>
                <li>
                  逐元素 + 电荷验证残差 = 0；若残差 &gt; 0 标记 fail 并人工审查
                </li>
                <li>
                  全部 126 条结果离线生成至 <em className="font-mono not-italic">lib/data/generated/epa-pollutants.json</em>，
                  运行时无需联网
                </li>
              </ol>
            </SubSection>

            {/* 处理决策 */}
            <SubSection title="C. 化合物分类与处理决策">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <Th>EPA 类别</Th>
                    <Th right>条数</Th>
                    <Th>处理方式</Th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.byCat).map(([cat, n]) => (
                    <tr key={cat} className="border-b border-[var(--rule-soft)]">
                      <td className="ink py-1.5 pr-3 italic">{cat}</td>
                      <td className="ink tabular font-mono py-1.5 pr-3 text-right">{n}</td>
                      <td className="ink-3 py-1.5">{categoryNote(cat)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2.5px solid var(--ink)" }}>
                    <td className="ink py-2 font-semibold italic">合计</td>
                    <td className="ink tabular font-mono py-2 pr-3 text-right font-semibold">
                      {EPA_META.total}
                    </td>
                    <td className="ink-3 py-2 italic">
                      其中 {stats.withBalance} 条进入半反应配平（{stats.byRole.donor} donor + {stats.byRole.acceptor_metal} acceptor）；
                      {stats.byRole.non_redox + stats.byRole.excluded} 条仅登记不参与计算
                    </td>
                  </tr>
                </tfoot>
              </table>
            </SubSection>

            {/* 明确排除 */}
            <SubSection title="D. 边界情况显式说明">
              <ul className="ink-2 space-y-1.5 text-[13.5px] leading-relaxed">
                <li>
                  <em className="accent-ink not-italic">石棉 (#116)</em>：硅酸盐矿物纤维，非分子化合物 ——
                  完全排除于半反应分析框架。
                </li>
                <li>
                  <em className="accent-ink not-italic">四氯化碳 CCl₄ (#006)</em>：C 处于 +Ⅳ 最高氧化态，
                  无法被进一步氧化；生物降解依赖反向反应（还原性脱氯 / halorespiration），
                  不在本工具的"氧化半反应"框架内。
                </li>
                <li>
                  <em className="accent-ink not-italic">9 种非变价重金属</em>（Sb, Be, Cd, Cu, Pb, Ni, Ag, Tl, Zn）：
                  生物毒性，可被微生物吸附 / 矿化但不参与电子转移 —— 登记入库但不参与配平。
                </li>
                <li>
                  <em className="accent-ink not-italic">PCB / 农药 / TCDD</em> 等氯代物：
                  完全矿化作为理论上限处理；实际环境中常呈现部分脱氯。
                  此简化在 product_logic 字段中标注为 <em className="font-mono not-italic">partial_dechlorination</em>。
                </li>
              </ul>
            </SubSection>

            {/* 数据流图 */}
            <SubSection title="E. 数据生成流水线">
              <pre className="ink-2 overflow-x-auto rounded-sm border border-[var(--rule-soft)] bg-[var(--paper-deep)] p-3 text-[11px] leading-[1.6]">{`scripts/data/epa-126.seed.tsv         ← 人工策展 (40 CFR 423 Appx A)
    │
    ▼
scripts/build-epa-pollutants.ts       ← Node 脚本: 原子归宿规则 + 引擎配平
    │
    ▼
lib/data/generated/epa-pollutants.json ← 自动生成 (126 条, 残差 ≈ 0)
    │
    ▼
lib/data/epaPollutants.ts             ← TypeScript 访问层 (类型 / 索引 / 搜索)
    │
    ▼
lib/data/epaRegistry.ts               ← 模块初始化: 注入物种到全局表
    │
    ▼
lib/calculator.ts                     ← 用户选 EPA 化合物 → 走相同 calc 管道`}</pre>
            </SubSection>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

function categoryNote(cat: string): string {
  const m: Record<string, string> = {
    Volatile: "好氧氧化 → 完全矿化",
    "Acid-Extractable": "酚类，好氧矿化",
    "Base-Neutral": "PAHs / 酞酸酯 / 卤代芳烃，好氧矿化",
    Pesticide: "OCP / PCBs，理论完全脱氯",
    Dioxin: "极慢矿化",
    Metal: "变价 4 → 电子受体；非变价 9 → 仅登记",
    Inorganic: "氰化物特殊降解 (C(+II)→+IV)",
    Mineral: "矿物纤维，不适用",
  };
  return m[cat] ?? "—";
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="ink-2 mb-2.5 text-[14px] font-semibold italic">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Th({
  children,
  right = false,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      style={{
        borderTop: "2.5px solid var(--ink)",
        borderBottom: "1px solid var(--ink)",
      }}
      className={`ink-2 py-2 text-[12px] font-normal italic ${
        right ? "text-right pr-3" : "text-left pr-3"
      }`}
    >
      {children}
    </th>
  );
}

function Tr({
  src,
  use,
  cite,
  url,
}: {
  src: string;
  use: string;
  cite: string;
  url?: string;
}) {
  return (
    <tr className="border-b border-[var(--rule-soft)]">
      <td className="ink py-1.5 pr-3 align-top">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer">
            {src}
          </a>
        ) : (
          <span className="ink italic">{src}</span>
        )}
      </td>
      <td className="ink-2 py-1.5 pr-3 align-top">{use}</td>
      <td className="ink-3 py-1.5 italic align-top text-[12.5px]">{cite}</td>
    </tr>
  );
}
