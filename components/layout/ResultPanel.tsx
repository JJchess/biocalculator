"use client";

import { ElectronPieChart } from "@/components/results/ElectronPieChart";
import { EquationDisplay } from "@/components/results/EquationDisplay";
import { MassBalanceTable } from "@/components/results/MassBalanceTable";
import { ProductBarChart } from "@/components/results/ProductBarChart";
import type { ResultPanelProps } from "@/lib/types";

export function ResultPanel({ result }: ResultPanelProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <EquationDisplay katex={result.equationKatex} />
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <MassBalanceTable rows={result.massBalanceRows} />
        </div>
        <div className="min-w-0">
          <ElectronPieChart data={result.electronSlices} />
        </div>
      </div>
      <div className="min-w-0">
        <ProductBarChart data={result.productBarData} />
      </div>
    </div>
  );
}
