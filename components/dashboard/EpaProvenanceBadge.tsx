"use client";

import { getEpaPollutant } from "@/lib/data/epaPollutants";

type Props = {
  donorId: string;
  acceptorId: string;
};

/**
 * 当 donor 或 acceptor 之一来自 EPA 库时, 在方程下方显示溯源徽章:
 *   • EPA 编号 + 法规链接
 *   • CAS 注册号
 *   • PubChem CID 链接
 *
 * 不来自 EPA 库时不显示, 不打扰经典 13 物种用户。
 */
export function EpaProvenanceBadge({ donorId, acceptorId }: Props) {
  const donor = epaInfoFor(donorId);
  const acceptor = epaInfoFor(acceptorId);
  if (!donor && !acceptor) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
      {donor && <Info label="供体" p={donor} />}
      {acceptor && <Info label="受体" p={acceptor} />}
    </div>
  );
}

function epaInfoFor(id: string) {
  if (!id.startsWith("epa_")) return undefined;
  return getEpaPollutant(id.slice(4));
}

function Info({
  label,
  p,
}: {
  label: string;
  p: ReturnType<typeof getEpaPollutant>;
}) {
  if (!p) return null;
  return (
    <div className="ink-3 flex flex-wrap items-baseline gap-x-1.5 italic">
      <span className="ink-4 not-italic text-[10px] uppercase tracking-[0.2em]">
        {label}
      </span>
      <span className="ink not-italic">{p.name_cn}</span>
      <a
        href="https://www.ecfr.gov/current/title-40/chapter-I/subchapter-N/part-423/appendix-Appendix%20A%20to%20Part%20423"
        target="_blank"
        rel="noreferrer"
        className="ink-3 hover:text-[var(--accent-ink)] not-italic tabular font-mono text-[10.5px]"
        title="40 CFR 423 Appendix A"
      >
        EPA #{p.epa_id}
      </a>
      <span className="ink-4 not-italic">·</span>
      <a
        href={`https://commonchemistry.cas.org/results?q=${p.cas}`}
        target="_blank"
        rel="noreferrer"
        className="ink-3 hover:text-[var(--accent-ink)] not-italic tabular font-mono text-[10.5px]"
        title="CAS Common Chemistry"
      >
        CAS {p.cas}
      </a>
      <span className="ink-4 not-italic">·</span>
      <a
        href={p.pubchem_url}
        target="_blank"
        rel="noreferrer"
        className="ink-3 hover:text-[var(--accent-ink)] not-italic"
        title="PubChem (NCBI)"
      >
        PubChem ↗
      </a>
    </div>
  );
}
