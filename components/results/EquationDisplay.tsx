"use client";

import { BlockMath } from "react-katex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EquationDisplayProps } from "@/lib/types";

export function EquationDisplay({ katex }: EquationDisplayProps) {
  return (
    <Card className="border-cyan-500/25 bg-slate-950/40 shadow-lg shadow-cyan-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-cyan-200">
          计量反应式（1 mol 供体基准）
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto pt-0">
        <div className="min-w-0 text-center text-[hsl(186_88%_78%)] [&_.katex-display]:my-2 [&_.katex-display]:overflow-x-auto">
          <BlockMath math={katex} />
        </div>
      </CardContent>
    </Card>
  );
}
