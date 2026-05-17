"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { motion } from "framer-motion";
import {
  Droplets,
  FlaskRound,
  Leaf,
  Wind,
  Beaker,
  Zap,
} from "lucide-react";

import type { CalculatorResult } from "@/lib/types";

type Props = { result: CalculatorResult; className?: string };

type Tint = "orange" | "green" | "blue" | "purple" | "teal" | "indigo";

type KpiCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  format?: Format;
  suffix: string;
  sub: React.ReactNode;
  tint: Tint;
};

export function KpiStrip({ result, className }: Props) {
  const { kpis } = result;

  const cards: KpiCardProps[] = [
    {
      icon: <Wind className="h-4 w-4" />,
      label: `${kpis.acceptorDisplayName} 消耗`,
      value: kpis.acceptorMassPerDonor,
      format: { maximumFractionDigits: 2 },
      suffix: " g",
      sub: (
        <>
          <NumberFlow
            value={kpis.acceptorMolPerDonor}
            format={{ maximumFractionDigits: 3 }}
          />
          <span> mol · per mol 供体</span>
        </>
      ),
      tint: "orange",
    },
    {
      icon: <Leaf className="h-4 w-4" />,
      label: "生物量产率 Y",
      value: kpis.biomassYieldGperG,
      format: { maximumFractionDigits: 3 },
      suffix: " g/g",
      sub: (
        <>
          <NumberFlow
            value={kpis.biomassGramsPerMolDonor}
            format={{ maximumFractionDigits: 2 }}
          />
          <span> g VSS · per mol 供体</span>
        </>
      ),
      tint: "green",
    },
    {
      icon: <FlaskRound className="h-4 w-4" />,
      label: "CO₂ 产量",
      value: kpis.co2GramsPerMolDonor,
      format: { maximumFractionDigits: 2 },
      suffix: " g",
      sub: (
        <>
          <NumberFlow
            value={kpis.co2GramsPerGramDonor}
            format={{ maximumFractionDigits: 3 }}
          />
          <span> g/g 底物</span>
        </>
      ),
      tint: "blue",
    },
    {
      icon: <Droplets className="h-4 w-4" />,
      label: "H⁺ 净",
      value: kpis.protonNetMolPerDonor,
      format: { maximumFractionDigits: 3, signDisplay: "always" },
      suffix: " mol",
      sub: (
        <span>
          {kpis.protonNetMolPerDonor > 0
            ? "酸化趋势"
            : kpis.protonNetMolPerDonor < 0
              ? "需碱度补充"
              : "中性"}
        </span>
      ),
      tint: "purple",
    },
    {
      icon: <Beaker className="h-4 w-4" />,
      label: "H₂O 净",
      value: kpis.waterNetMolPerDonor,
      format: { maximumFractionDigits: 3, signDisplay: "always" },
      suffix: " mol",
      sub: <span>per mol 供体</span>,
      tint: "teal",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: "电子当量",
      value: kpis.electronsPerSubstrateMolecule,
      format: { maximumFractionDigits: 0 },
      suffix: " e⁻",
      sub: (
        <span>
          fe={kpis.fe.toFixed(2)} · fs={kpis.fs.toFixed(2)}
        </span>
      ),
      tint: "indigo",
    },
  ];

  return (
    <div className={className ?? "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"}>
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
        >
          <KpiCard {...c} />
        </motion.div>
      ))}
    </div>
  );
}

const TINT_BG: Record<Tint, string> = {
  orange:
    "bg-[rgba(255,149,0,0.10)] text-[#b35900] dark:bg-[rgba(255,159,10,0.16)] dark:text-[var(--apple-orange)]",
  green:
    "bg-[rgba(52,199,89,0.12)] text-[#1c7a3a] dark:bg-[rgba(48,209,88,0.18)] dark:text-[var(--apple-green)]",
  blue:
    "bg-[rgba(0,122,255,0.10)] text-[var(--apple-blue)] dark:bg-[rgba(10,132,255,0.16)] dark:text-[var(--apple-teal)]",
  purple:
    "bg-[rgba(175,82,222,0.12)] text-[var(--apple-purple)] dark:bg-[rgba(191,90,242,0.18)] dark:text-[var(--apple-purple)]",
  teal:
    "bg-[rgba(48,176,199,0.14)] text-[#0f7283] dark:bg-[rgba(90,200,250,0.18)] dark:text-[var(--apple-teal)]",
  indigo:
    "bg-[rgba(88,86,214,0.12)] text-[var(--apple-indigo)] dark:bg-[rgba(94,92,230,0.20)] dark:text-[var(--apple-indigo)]",
};

function KpiCard({ icon, label, value, format, suffix, sub, tint }: KpiCardProps) {
  return (
    <div className="surface-card group relative overflow-hidden p-4 transition-shadow hover:shadow-[var(--shadow-3)]">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${TINT_BG[tint]}`}>
          {icon}
        </div>
        <div className="text-tertiary text-[11.5px] font-medium">{label}</div>
      </div>
      <div className="tabular mt-2.5 flex items-baseline gap-1 font-mono text-[26px] font-semibold tracking-tight">
        <NumberFlow value={value} format={format} />
        <span className="text-tertiary text-[13px] font-normal">{suffix}</span>
      </div>
      <div className="text-quaternary tabular mt-1 text-[11px]">{sub}</div>
    </div>
  );
}
