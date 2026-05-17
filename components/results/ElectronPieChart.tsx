"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ElectronPieChartProps } from "@/lib/types";

export function ElectronPieChart({ data }: ElectronPieChartProps) {
  return (
    <Card className="border-cyan-500/25 bg-slate-950/40 shadow-lg shadow-cyan-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-cyan-200">
          电子分配
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height={224}>
          <PieChart>
            <Pie
              data={data.map((d) => ({
                name: d.label,
                value: Math.max(0, d.value),
                fill: d.fill,
              }))}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              stroke="oklch(0.22 0.04 252)"
              strokeWidth={2}
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [
                `${(Number(v) * 100).toFixed(1)}%`,
                "占比",
              ]}
              contentStyle={{
                background: "oklch(0.22 0.04 252)",
                border: "1px solid oklch(0.45 0.12 195 / 0.35)",
                borderRadius: "8px",
                color: "oklch(0.96 0.02 252)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
