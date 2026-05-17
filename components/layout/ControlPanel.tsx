"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AcceptorSelector } from "@/components/controls/AcceptorSelector";
import { DonorSelector } from "@/components/controls/DonorSelector";
import { FsSlider } from "@/components/controls/FsSlider";
import type { ControlPanelProps } from "@/lib/types";

export function ControlPanel({
  donorId,
  acceptorId,
  fs,
  onDonorChange,
  onAcceptorChange,
  onFsChange,
}: ControlPanelProps) {
  return (
    <Card className="h-fit border-cyan-500/30 bg-slate-950/55 shadow-xl shadow-cyan-500/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold tracking-tight text-cyan-100">
          反应条件
        </CardTitle>
        <p className="text-xs leading-relaxed text-slate-400">
          基于半反应法合并供体氧化、受体还原与细胞合成（每 mol e⁻ 数据，归一化至 1
          mol 供体）。
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <DonorSelector value={donorId} onChange={onDonorChange} />
        <AcceptorSelector value={acceptorId} onChange={onAcceptorChange} />
        <FsSlider value={fs} onChange={onFsChange} />
      </CardContent>
    </Card>
  );
}
