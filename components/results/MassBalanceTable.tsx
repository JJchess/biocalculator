"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MassBalanceTableProps } from "@/lib/types";

export function MassBalanceTable({ rows }: MassBalanceTableProps) {
  return (
    <Card className="border-cyan-500/25 bg-slate-950/40 shadow-lg shadow-cyan-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-cyan-200">
          质量衡算
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto rounded-md border border-slate-800/80">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">物种</TableHead>
                <TableHead className="text-right text-slate-400">𝑛 (mol)</TableHead>
                <TableHead className="text-right text-slate-400">质量 (g)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.speciesId}
                  className="border-slate-800/90 hover:bg-slate-900/60"
                >
                  <TableCell className="font-medium text-slate-200">
                    {r.displayName}
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-300">
                    {r.moles.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-300">
                    {r.massGrams.toFixed(3)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
