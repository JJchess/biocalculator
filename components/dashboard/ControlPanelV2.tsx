"use client";

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
    <aside className="surface-card flex h-fit flex-col gap-4 p-4">
      <PickerGroup label="电子供体" accent="blue">
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

      <PickerGroup label="电子受体" accent="orange">
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
  accent,
  children,
}: {
  label: string;
  accent: "blue" | "orange";
  children: React.ReactNode;
}) {
  const tint =
    accent === "blue"
      ? "text-[var(--apple-blue)] dark:text-[var(--apple-teal)]"
      : "text-[#b35900] dark:text-[var(--apple-orange)]";
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`text-[11px] font-semibold tracking-wide ${tint}`}>{label}</span>
      {children}
    </div>
  );
}
