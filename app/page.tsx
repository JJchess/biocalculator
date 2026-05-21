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
      <div className="mx-auto max-w-[760px] px-6 pt-10 pb-24 md:px-8">
        <AppBar result={result} />

        <main className="mt-10 flex flex-col gap-12">
          <ControlPanelV2
            donorId={donorId}
            acceptorId={acceptorId}
            fs={fs}
            onDonorChange={setDonorId}
            onAcceptorChange={setAcceptorId}
            onFsChange={setFs}
          />

          <EquationHero result={result} />
          <SankeyChart result={result} />
          <MassBalanceTableV2 rows={result.massBalanceRows} />
          <HalfReactionReference />
        </main>
      </div>
    </div>
  );
}
