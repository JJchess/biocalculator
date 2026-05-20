"use client";

import { useMemo, useState } from "react";

import { AppBar } from "@/components/layout/AppBar";
import { ControlPanelV2 } from "@/components/dashboard/ControlPanelV2";
import { EquationHero } from "@/components/dashboard/EquationHero";
import { MassBalanceTableV2 } from "@/components/dashboard/MassBalanceTableV2";
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
      <div className="mx-auto max-w-[1280px] px-4 pt-3 pb-10 md:px-6 lg:px-8">
        <AppBar result={result} />

        <main className="mt-4 grid min-w-0 items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* 左侧粘连控制台 */}
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

          {/* 右侧：方程 (hero+inline KPI) → Sankey → 衡算表 */}
          <section className="flex min-w-0 flex-col gap-4">
            <EquationHero result={result} />
            <SankeyChart result={result} />
            <MassBalanceTableV2 rows={result.massBalanceRows} />
            <HalfReactionReference />
          </section>
        </main>
      </div>
    </div>
  );
}
