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
      <div className="mx-auto max-w-[1480px] px-4 pt-3 pb-10 md:px-6 lg:px-8">
        <AppBar result={result} />

        {/* Workspace: 左侧粘连控制台 + 右侧 bento 内容 */}
        <main className="mt-4 grid min-w-0 items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* 左侧：粘连的控制台 */}
          <div className="lg:sticky lg:top-20">
            <ControlPanelV2
              donorId={donorId}
              acceptorId={acceptorId}
              fs={fs}
              onDonorChange={setDonorId}
              onAcceptorChange={setAcceptorId}
              onFsChange={setFs}
            />
          </div>

          {/* 右侧：bento 分块 */}
          <section className="flex min-w-0 flex-col gap-4">
            {/* 第一区：方程总览（全宽 hero） */}
            <EquationHero result={result} />

            {/* 第二区：电子流 Sankey + KPI 网格并列 */}
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <SankeyChart result={result} />
              <KpiStrip
                result={result}
                className="grid h-full grid-cols-2 gap-3 [&>*]:min-h-[130px]"
              />
            </div>

            {/* 第三区：质量衡算 + 产物条 (60/40) */}
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <MassBalanceTableV2 rows={result.massBalanceRows} />
              <ProductBarChartV2 data={result.productBarData} />
            </div>

            {/* 第四区：折叠参考表 */}
            <HalfReactionReference />
          </section>
        </main>
      </div>
    </div>
  );
}
