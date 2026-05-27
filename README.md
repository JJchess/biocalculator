<div align="center">

# 复杂污染物生物处理 · 半反应法合并方程计算器

### 将 EPA 126 种优先污染物接入 Rittmann–McCarty 半反应框架，自动配平、实时计算、学术级呈现

**126 种 EPA 优先污染物 · 半反应残差 < 10⁻¹⁵ · 配平成功率 100%**

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/) [![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/) [![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)

[![EPA](https://img.shields.io/badge/数据源-EPA_40_CFR_423-brightgreen.svg)](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-423) [![PubChem](https://img.shields.io/badge/分子式-PubChem_复核-brightgreen.svg)](https://pubchem.ncbi.nlm.nih.gov/) [![R&M](https://img.shields.io/badge/方法-Rittmann_%26_McCarty_2001-orange.svg)](https://www.mhprofessional.com/)

<br/>

### 快速启动

```bash
git clone https://github.com/JJchess/biocalculator.git && cd biocalculator && git checkout main
npm install && npm run dev
```

<sub>启动后访问 http://localhost:3000 · 无需联网，配平结果已预生成</sub>

</div>

---

## 演示

**基本使用 · 选择供体/受体，拖动 fs 滑块，实时输出合并方程**

<video src="doc/使用.mp4" controls width="100%"></video>

**数据验证 · EPA 化合物溯源（EPA 编号 / CAS / PubChem）**

<video src="doc/反应物验证.mp4" controls width="100%"></video>

<video src="doc/数据验证.mp4" controls width="100%"></video>

---

## 简介

教材中的半反应法通常只覆盖葡萄糖、乙酸等 13 种经典底物。本工具将化合物库扩展至 **EPA 40 CFR Part 423 附录 A** 所列 126 种优先污染物（苯系物、多环芳烃、含氯农药、重金属等），分子式经 PubChem 国家级数据库逐条复核，半反应系数由元素–电荷守恒矩阵与 **Gauss-Jordan 消元**（`fraction.js` 精确有理数）自动求解，全部残差严格为 0。

用户选定供体、受体与细胞合成分数 *f*ₛ 后，系统实时输出：
- **合并化学计量方程**（KaTeX 渲染）
- **关键参数**：生物量产率 *Y*、受体需求量 *n*ₐ、CO₂ 释放量 *n*꜀
- **质量衡算三线表**（可按列排序）
- **电子流向 Sankey 图**

---

## 系统架构

<image src="doc/image.png">

| 层次 | 关键文件 | 功能 |
|------|---------|------|
| 数据层 | `scripts/build-epa-pollutants.ts` | 原子归宿规则推导产物 → Gauss-Jordan 配平 → JSON |
| 配平引擎 | `lib/chem/balance.ts` | 精确有理数 Gauss-Jordan 消元，残差验证 |
| 计算层 | `lib/core/combineReactions.ts` | 三条半反应线性合并，`Map<SpeciesId, Fraction>` |
| 参数层 | `lib/core/kpis.ts` | *Y*、*n*ₐ、*n*꜀、*f*ₑ、*f*ₛ |
| 注册层 | `lib/data/epaRegistry.ts` | 运行时注入 MW / KaTeX / 显示名 |

---

## 环境要求

| 工具 | 版本 |
|------|------|
| Node.js | ≥ 20.0（推荐 v23） |
| npm | ≥ 10.0 |

```bash
node --version   # 验证 Node.js
npm --version    # 验证 npm
```

---

## 本地启动

```bash
# 1. 克隆
git clone https://github.com/JJchess/biocalculator.git
cd biocalculator
git checkout main

# 2. 安装依赖（首次约 1–2 分钟）
npm install

# 3. 启动开发服务器
npm run dev
```

访问 **http://localhost:3000**

> `lib/data/generated/epa-pollutants.json` 已预先生成并提交至仓库，无需重新运行数据脚本。

---

## 核心算法

### 半反应合并（Rittmann & McCarty, 2001）

$$R = R_d + f_e \cdot R_a + f_s \cdot R_c$$

| 符号 | 含义 |
|------|------|
| $R_d$ | 电子供体半反应（氧化方向，per mol e⁻） |
| $R_a$ | 电子受体半反应（还原方向，per mol e⁻） |
| $R_c$ | 细胞合成半反应（C₅H₇O₂N 为生物量代表分子） |
| $f_s$ | 细胞合成分数，$f_e = 1 - f_s$ |

### 自动配平（Gauss-Jordan 消元）

对每个化合物，按**原子归宿规则**推导产物列表：

| 元素 | 产物 |
|------|------|
| C | CO₂ |
| N | NH₄⁺ |
| S | SO₄²⁻ |
| Cl / Br / F / I | 对应卤离子 |
| P | HPO₄²⁻ |
| H / O | H₂O、H⁺ 自动平衡 |

构造约束矩阵 $M \in \mathbb{Q}^{(k+2)\times n}$（*k* 行元素守恒 + 1 行电荷守恒 + 1 行 e⁻ 归一化），以 `fraction.js` 精确有理数执行 Gauss-Jordan 消元，**全部 115 条有效半反应残差 < 10⁻¹⁵**。

变价金属受体（As、Cr、Hg、Se）直接采用 R&M (2001) Table A.1 标准形：

| 受体 | 半反应（per e⁻） |
|------|----------------|
| As(V)→As(III) | ½ H₂AsO₄⁻ + 3/2 H⁺ + e⁻ → ½ H₃AsO₃ + ½ H₂O |
| Cr(VI)→Cr(III) | ⅓ CrO₄²⁻ + 8/3 H⁺ + e⁻ → ⅓ Cr³⁺ + 4/3 H₂O |
| Hg(II)→Hg(0) | ½ Hg²⁺ + e⁻ → ½ Hg⁰ |
| Se(VI)→Se(0) | ⅙ SeO₄²⁻ + 4/3 H⁺ + e⁻ → ⅙ Se⁰ + 2/3 H₂O |

---

## 数据来源

| 来源 | 用途 | 引用 |
|------|------|------|
| [EPA 40 CFR Part 423, Appx A](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-423) | 126 种优先污染物清单 | U.S. EPA Code of Federal Regulations |
| [PubChem (NCBI/NIH)](https://pubchem.ncbi.nlm.nih.gov/) | 分子式、CAS 号、分子量复核 | Kim S, et al. *Nucleic Acids Res.* 2023 |
| Rittmann & McCarty (2001) | 半反应框架与金属受体标准形 | *Environmental Biotechnology*. McGraw-Hill |
| IUPAC Atomic Weights | 原子量基准 | Meija J, et al. *Pure Appl Chem* 2016 |

化合物分类处理策略：

| EPA 类别 | 条数 | 处理方式 |
|---------|------|---------|
| Volatile | 27 | 好氧完全矿化 |
| Acid-Extractable | 11 | 酚类，好氧矿化 |
| Base-Neutral | 46 | PAHs / 酞酸酯 / 卤代芳烃，好氧矿化 |
| Pesticide | 25 | OCP / PCBs，理论完全脱氯 |
| Dioxin | 1 | 极慢矿化，理论上限 |
| Metal | 13 | 变价 4 种 → 电子受体；非变价 9 种 → 仅登记 |
| Inorganic | 2 | 氰化物特殊降解（C: +II → +IV） |
| Mineral | 1 | 石棉，排除 |

---

## 数据重新生成（可选）

仅在修改 `epa-126.seed.tsv` 后需要重新运行：

```bash
npx tsx scripts/build-epa-pollutants.ts
```

```
▶ 读取 126 条 EPA 优先污染物记录
  donor 配平成功:           111
  acceptor_metal 配平成功:  4
  non_redox 仅记录:         9
  excluded:                2
  配平失败:                0
```

---

## 项目结构

```
frontend/
├── app/
│   ├── page.tsx                      # 主计算页（/）
│   └── globals.css                   # CSS 变量 · 学术论文风格
├── components/
│   ├── layout/AppBar.tsx             # 页眉 + LaTeX 复制
│   └── dashboard/
│       ├── ControlPanelV2.tsx        # 实验条件面板（供体 / 受体 / fs）
│       ├── CompoundPicker.tsx        # 化合物搜索选择器（126 种）
│       ├── EquationHero.tsx          # KaTeX 合并方程 + Y / nA / nC
│       ├── SankeyChart.tsx           # 电子流向 Sankey 图
│       ├── MassBalanceTableV2.tsx    # 质量衡算三线表（可排序）
│       ├── MethodologySection.tsx    # 数据来源与方法学（可折叠）
│       └── EpaProvenanceBadge.tsx    # EPA 溯源徽章
├── lib/
│   ├── calculator.ts                 # 主计算入口
│   ├── chem/
│   │   ├── formula.ts                # 分子式解析 + 分子量计算
│   │   └── balance.ts                # Gauss-Jordan 配平引擎
│   ├── core/
│   │   ├── combineReactions.ts       # R = Rd + fe·Ra + fs·Rc
│   │   ├── normalize.ts              # 归一化至每 mol 供体
│   │   ├── formatEquation.ts         # 系数 → KaTeX
│   │   ├── kpis.ts                   # Y · nA · nC 计算
│   │   ├── massBalance.ts            # 质量衡算行生成
│   │   └── sankey.ts                 # Sankey 节点与流量构造
│   └── data/
│       ├── donors.ts                 # 7 种经典电子供体（教材精选）
│       ├── acceptors.ts              # 6 种经典电子受体
│       ├── epaPollutants.ts          # EPA 数据访问层
│       ├── epaAdapter.ts             # EpaPollutant → HalfReactionEntry
│       ├── epaRegistry.ts            # 运行时注入 MW / KaTeX / 显示名
│       ├── lookup.ts                 # 统一供体/受体查找
│       └── generated/
│           └── epa-pollutants.json   # 预生成配平结果（126 条）★ 勿手动修改
├── scripts/
│   ├── data/epa-126.seed.tsv         # 种子数据（40 CFR 423 Appx A）
│   └── build-epa-pollutants.ts       # 数据生成脚本
└── doc/
    ├── 使用.mp4                       # 演示：基本使用
    ├── 反应物验证.mp4                  # 演示：反应物验证
    └── 数据验证.mp4                   # 演示：EPA 数据溯源
```

---

## 技术栈

| 用途 | 库 |
|------|-----|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS v4 |
| 数学渲染 | KaTeX（`react-katex`） |
| 图表 | @nivo/sankey |
| 精确有理数 | fraction.js |
| 数据表格 | @tanstack/react-table |
| 动画 | framer-motion · @number-flow/react |

---

## 参考文献

1. Rittmann, B. E., & McCarty, P. L. (2001). *Environmental Biotechnology: Principles and Applications*. McGraw-Hill.
2. U.S. Environmental Protection Agency. *40 CFR Part 423, Appendix A — 126 Priority Pollutants*. https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-423
3. Kim, S., et al. (2023). PubChem 2023 update. *Nucleic Acids Research*, 51(D1), D1373–D1380. https://doi.org/10.1093/nar/gkac956
4. Meija, J., et al. (2016). Atomic weights of the elements 2013. *Pure and Applied Chemistry*, 88(3), 265–291. https://doi.org/10.1515/pac-2015-0305
