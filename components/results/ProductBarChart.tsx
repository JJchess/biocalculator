"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductBarChartProps } from "@/lib/types";

export function ProductBarChart({ data }: ProductBarChartProps) {
  const chartData = data.map((d) => ({
    name: d.displayName,
    mass: d.massGrams,
    fill: d.fill,
  }));

  return (
    <Card className="border-cyan-500/25 bg-slate-950/40 shadow-lg shadow-cyan-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-cyan-200">
          产物质量（正值物种）
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {chartData.length === 0 ? (
          <p className="flex h-64 items-center justify-center text-sm text-slate-500">
            当前无显著产物柱（或均为消耗项）
          </p>
        ) : (
          <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height={256}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="oklch(0.35 0.03 252 / 0.45)"
              />
              <XAxis
                type="number"
                tick={{ fill: "oklch(0.72 0.02 252)", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: "oklch(0.78 0.02 252)", fontSize: 11 }}
              />
              <Tooltip
                formatter={(v) => [`${Number(v).toFixed(3)} g`, "质量"]}
                contentStyle={{
                  background: "oklch(0.22 0.04 252)",
                  border: "1px solid oklch(0.45 0.12 195 / 0.35)",
                  borderRadius: "8px",
                  color: "oklch(0.96 0.02 252)",
                }}
              />
              <Bar dataKey="mass" radius={[0, 6, 6, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
