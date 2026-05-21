"use client";

import { BlockMath } from "react-katex";

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
    <section className="rule-t pt-6">
      <Collapsible className="group/ref">
        <div className="flex items-baseline justify-between">
          <h2 className="ink-3 text-[11px] uppercase tracking-[0.2em]">
            附录 · 半反应参考
          </h2>
          <CollapsibleTrigger className="ink-3 text-[12px] italic underline decoration-[var(--rule)] decoration-1 underline-offset-[3px] transition hover:text-[var(--accent-ink)] hover:decoration-[var(--accent-ink)]">
            <span className="group-data-[panel-open]/ref:hidden">展开 ▾</span>
            <span className="hidden group-data-[panel-open]/ref:inline">收起 ▴</span>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-5 space-y-7">
          <RefBlock title="A. 电子供体（氧化）">
            {DONOR_IDS.map((id) => (
              <RefItem
                key={id}
                name={DONORS[id].displayName}
                tex={DONORS[id].referenceKatex}
              />
            ))}
          </RefBlock>
          <RefBlock title="B. 电子受体（还原）">
            {ACCEPTOR_IDS.map((id) => (
              <RefItem
                key={id}
                name={ACCEPTORS[id].displayName}
                tex={ACCEPTORS[id].referenceKatex}
              />
            ))}
          </RefBlock>
          <RefBlock title="C. 细胞合成">
            <RefItem
              name={CELL_SYNTHESIS.displayName}
              tex={CELL_SYNTHESIS.referenceKatex}
            />
          </RefBlock>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}

function RefBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="ink-2 mb-2 text-[13.5px] font-semibold italic">
        {title}
      </h3>
      <ul className="divide-y divide-[var(--rule-soft)]">{children}</ul>
    </div>
  );
}

function RefItem({ name, tex }: { name: string; tex?: string }) {
  return (
    <li className="grid grid-cols-[110px_1fr] items-center gap-3 py-1.5">
      <span className="ink-3 truncate text-[12.5px] italic">{name}</span>
      {tex ? (
        <span className="overflow-x-auto text-[13px] [&_.katex-display]:my-0">
          <BlockMath math={tex} />
        </span>
      ) : null}
    </li>
  );
}
