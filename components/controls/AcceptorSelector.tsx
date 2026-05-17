"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCEPTORS } from "@/lib/data/acceptors";
import { ACCEPTOR_IDS, type AcceptorSelectorProps } from "@/lib/types";

export function AcceptorSelector({ value, onChange }: AcceptorSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium tracking-wide text-cyan-300/90">
        电子受体
      </span>
      <Select value={value} onValueChange={(v) => onChange(v as typeof value)}>
        <SelectTrigger className="h-10 w-full min-w-0 border-cyan-500/25 bg-slate-950/60 text-slate-100 shadow-inner shadow-cyan-500/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-cyan-500/20 bg-slate-900 text-slate-100">
          {ACCEPTOR_IDS.map((id) => (
            <SelectItem key={id} value={id}>
              {ACCEPTORS[id].displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
