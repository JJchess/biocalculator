"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { BookOpenText } from "lucide-react";

import { AppBar } from "@/components/layout/AppBar";
import { ControlPanelV2 } from "@/components/dashboard/ControlPanelV2";
import { EquationHero } from "@/components/dashboard/EquationHero";
import { KpiStrip } from "@/components/dashboard/KpiStrip";
import { MassBalanceTableV2 } from "@/components/dashboard/MassBalanceTableV2";
import { ProductBarChartV2 } from "@/components/dashboard/ProductBarChartV2";
import { SankeyChart } from "@/components/dashboard/SankeyChart";
import { HalfReactionReference } from "@/components/HalfReactionReference";
import { calculate } from "@/lib/calculator";
import {
  ACCEPTOR_IDS,
  DONOR_IDS,
  type AcceptorId,
  type AcceptorKey,
  type DonorId,
  type DonorKey,
} from "@/lib/types";

function CalcPageInner() {
  const params = useSearchParams();

  const initialDonor =
    (DONOR_IDS as readonly string[]).includes(params.get("donor") ?? "")
      ? (params.get("donor") as DonorId)
      : "glucose";
  const initialAcceptor =
    (ACCEPTOR_IDS as readonly string[]).includes(params.get("acceptor") ?? "")
      ? (params.get("acceptor") as AcceptorId)
      : "oxygen";
  const initialFs = (() => {
    const raw = params.get("fs");
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.6;
  })();

  const [donorId, setDonorId] = useState<DonorKey>(initialDonor);
  const [acceptorId, setAcceptorId] = useState<AcceptorKey>(initialAcceptor);
  const [fs, setFs] = useState(initialFs);

  // Reflect state into URL (shallow update; no re-render storm)
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set("donor", donorId);
    sp.set("acceptor", acceptorId);
    sp.set("fs", fs.toFixed(2));
    const url = `${window.location.pathname}?${sp.toString()}`;
    window.history.replaceState(null, "", url);
  }, [donorId, acceptorId, fs]);

  const result = useMemo(
    () => calculate({ donorId, acceptorId, fs }),
    [donorId, acceptorId, fs],
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1480px] px-4 pt-3 pb-10 md:px-6 lg:px-8">
        <AppBar result={result} />

        <main className="mt-4 grid min-w-0 items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-20">
            <ControlPanelV2
              donorId={donorId}
              acceptorId={acceptorId}
              fs={fs}
              onDonorChange={setDonorId}
              onAcceptorChange={setAcceptorId}
              onFsChange={setFs}
            />
            <Link
              href="/"
              className="surface-card mt-4 flex items-center justify-center gap-2 px-3 py-2 text-[12.5px] font-medium text-[var(--text-secondary)] transition hover:text-[var(--apple-blue)]"
            >
              <BookOpenText className="h-3.5 w-3.5" />
              回到 "学半反应法"
            </Link>
          </div>

          <section className="flex min-w-0 flex-col gap-4">
            <EquationHero result={result} />
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <SankeyChart result={result} />
              <KpiStrip
                result={result}
                className="grid h-full grid-cols-2 gap-3 [&>*]:min-h-[130px]"
              />
            </div>
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <MassBalanceTableV2 rows={result.massBalanceRows} />
              <ProductBarChartV2 data={result.productBarData} />
            </div>
            <HalfReactionReference />
          </section>
        </main>
      </div>
    </div>
  );
}

export default function CalcPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CalcPageInner />
    </Suspense>
  );
}
