"use client";

import { FlaskConical, Sparkles, Sliders } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCEPTORS } from "@/lib/data/acceptors";
import { DONORS } from "@/lib/data/donors";
import {
  ACCEPTOR_IDS,
  DONOR_IDS,
  type ControlPanelProps,
} from "@/lib/types";

import { FsSliderV2 } from "./FsSliderV2";

export function ControlPanelV2({
  donorId,
  acceptorId,
  fs,
  onDonorChange,
  onAcceptorChange,
  onFsChange,
}: ControlPanelProps) {
  return (
    <aside className="surface-card flex h-fit flex-col gap-5 p-5">
      <header>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,122,255,0.10)] text-[var(--apple-blue)] dark:bg-[rgba(10,132,255,0.16)] dark:text-[var(--apple-teal)]">
            <Sliders className="h-4 w-4" />
          </div>
          <div className="text-[13px] font-semibold">反应条件</div>
        </div>
        <p className="text-quaternary mt-1 text-[11.5px] leading-relaxed">
          选择电子供体 / 受体，调整细胞合成分数 f<sub>s</sub>。
        </p>
      </header>

      <PickerGroup
        label="电子供体"
        accent="blue"
        icon={<FlaskConical className="h-3.5 w-3.5" />}
      >
        <Select value={donorId} onValueChange={(v) => onDonorChange(v as typeof donorId)}>
          <SelectTrigger className="h-10 w-full rounded-xl border-[var(--hairline)] bg-[var(--surface-solid)] text-[13px] font-medium shadow-[var(--shadow-1)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-[var(--hairline)] bg-[var(--surface-elevated)] backdrop-blur">
            {DONOR_IDS.map((id) => (
              <SelectItem
                key={id}
                value={id}
                className="rounded-lg py-2 px-2.5 text-[13px]"
              >
                {DONORS[id].displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PickerGroup>

      <PickerGroup
        label="电子受体"
        accent="orange"
        icon={<Sparkles className="h-3.5 w-3.5" />}
      >
        <Select value={acceptorId} onValueChange={(v) => onAcceptorChange(v as typeof acceptorId)}>
          <SelectTrigger className="h-10 w-full rounded-xl border-[var(--hairline)] bg-[var(--surface-solid)] text-[13px] font-medium shadow-[var(--shadow-1)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-[var(--hairline)] bg-[var(--surface-elevated)] backdrop-blur">
            {ACCEPTOR_IDS.map((id) => (
              <SelectItem
                key={id}
                value={id}
                className="rounded-lg py-2 px-2.5 text-[13px]"
              >
                {ACCEPTORS[id].displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PickerGroup>

      <FsSliderV2 value={fs} onChange={onFsChange} />
    </aside>
  );
}

function PickerGroup({
  label,
  icon,
  accent,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  accent: "blue" | "orange";
  children: React.ReactNode;
}) {
  const tint =
    accent === "blue"
      ? "text-[var(--apple-blue)] dark:text-[var(--apple-teal)]"
      : "text-[#b35900] dark:text-[var(--apple-orange)]";
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`flex items-center gap-1.5 text-[11px] font-medium tracking-wide ${tint}`}>
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}
