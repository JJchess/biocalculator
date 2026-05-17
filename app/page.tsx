"use client";

import { useMemo, useState } from "react";

import { AppBar } from "@/components/layout/AppBar";
import { ControlPanelV2 } from "@/components/dashboard/ControlPanelV2";
import { EquationHero } from "@/components/dashboard/EquationHero";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { MassBalanceTableV2 } from "@/components/dashboard/MassBalanceTableV2";
import { ProductBarChartV2 } from "@/components/dashboard/ProductBarChartV2";
import { SankeyChart } from "@/components/dashboard/SankeyChart";
import { HalfReactionReference } from "@/components/HalfReactionReference";
import { calculate } from "@/lib/calculator";
import type { AcceptorId, DonorId } from "@/lib/types";

export default function Home() {
  const [donorId, setDonorId] = useState<DonorId>("glucose");
  const [acceptorId, setAcceptorId] = useState<AcceptorId>("oxygen");
  const [fs, setFs] = useState(0.6);

  const result = useMemo(
    () => calculate({ donorId, acceptorId, fs }),
    [donorId, acceptorId, fs],
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-4 pb-12 md:px-6 lg:px-8">
        <AppBar result={result} />

        {/* 大标题区 */}
        <section className="mt-4 flex flex-col gap-1.5">
          <h1 className="text-[28px] font-semibold tracking-tight md:text-[34px]">
            复杂污染物生物处理 · 质量衡算
          </h1>
          <p className="text-tertiary max-w-2xl text-[13.5px] leading-relaxed">
            基于 Rittmann–McCarty 半反应法。元素与电荷自动配平、电子分配可视化、
            归一化至 1 mol 电子供体。
          </p>
        </section>

        {/* KPI strip */}
        <KpiStrip result={result} />

        {/* 主区：左控制台 / 右内容 */}
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
          <ControlPanelV2
            donorId={donorId}
            acceptorId={acceptorId}
            fs={fs}
            onDonorChange={setDonorId}
            onAcceptorChange={setAcceptorId}
            onFsChange={setFs}
          />

          <div className="flex min-w-0 flex-col gap-5">
            <EquationHero result={result} />
            <SankeyChart result={result} />
            <div className="grid min-w-0 gap-5 xl:grid-cols-2">
              <MassBalanceTableV2 rows={result.massBalanceRows} />
              <ProductBarChartV2 data={result.productBarData} />
            </div>
          </div>
        </div>

        <HalfReactionReference />
      </div>
    </div>
  );
}
