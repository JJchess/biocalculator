"use client";

import { BlockMath } from "react-katex";
import { BookOpen, ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ACCEPTORS } from "@/lib/data/acceptors";
import { CELL_SYNTHESIS } from "@/lib/data/cellSynthesis";
import { DONORS } from "@/lib/data/donors";
import { ACCEPTOR_IDS, DONOR_IDS } from "@/lib/types";

export function HalfReactionReference() {
  return (
    <Collapsible className="surface-card overflow-hidden">
      <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-3.5 text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,122,255,0.10)] text-[var(--apple-blue)] dark:bg-[rgba(10,132,255,0.16)] dark:text-[var(--apple-teal)]">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-semibold">半反应参考表</div>
            <div className="text-quaternary text-[11px]">
              每 mol e⁻ · 引擎自动配平
            </div>
          </div>
        </div>
        <ChevronDown className="text-tertiary h-4 w-4 shrink-0 transition-transform group-data-[panel-open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="hairline-t px-5 pb-5 pt-4">
        <div className="grid gap-5 lg:grid-cols-3">
          <Section title="电子供体（氧化）" accent="blue">
            <ul className="space-y-2.5">
              {DONOR_IDS.map((id) => (
                <RefItem
                  key={id}
                  name={DONORS[id].displayName}
                  tex={DONORS[id].referenceKatex}
                />
              ))}
            </ul>
          </Section>
          <Section title="电子受体（还原）" accent="orange">
            <ul className="space-y-2.5">
              {ACCEPTOR_IDS.map((id) => (
                <RefItem
                  key={id}
                  name={ACCEPTORS[id].displayName}
                  tex={ACCEPTORS[id].referenceKatex}
                />
              ))}
            </ul>
          </Section>
          <Section title="细胞合成" accent="green">
            <RefItem
              name={CELL_SYNTHESIS.displayName}
              tex={CELL_SYNTHESIS.referenceKatex}
            />
          </Section>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "blue" | "orange" | "green";
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-[var(--apple-blue)] dark:text-[var(--apple-teal)]",
    orange: "text-[#b35900] dark:text-[var(--apple-orange)]",
    green: "text-[#1c7a3a] dark:text-[var(--apple-green)]",
  };
  return (
    <section>
      <h3
        className={`mb-2 text-[10.5px] font-semibold uppercase tracking-wider ${colorMap[accent]}`}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function RefItem({ name, tex }: { name: string; tex?: string }) {
  return (
    <li className="rounded-lg border border-[var(--hairline)] bg-[rgba(0,0,0,0.02)] p-2.5 dark:bg-[rgba(255,255,255,0.03)]">
      <div className="text-tertiary mb-1 text-[11px]">{name}</div>
      {tex ? (
        <div className="overflow-x-auto text-[12.5px] [&_.katex-display]:my-1">
          <BlockMath math={tex} />
        </div>
      ) : null}
    </li>
  );
}
