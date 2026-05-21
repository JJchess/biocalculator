"use client";

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import type { MassBalanceRow } from "@/lib/types";

type Row = MassBalanceRow & { absMass: number; pct: number };

type Props = { rows: MassBalanceRow[] };

const numFmt = (x: number, digits = 4) =>
  x.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export function MassBalanceTableV2({ rows }: Props) {
  const enriched: Row[] = useMemo(() => {
    const totalAbs = rows.reduce((s, r) => s + Math.abs(r.massGrams), 0) || 1;
    return rows.map((r) => ({
      ...r,
      absMass: Math.abs(r.massGrams),
      pct: Math.abs(r.massGrams) / totalAbs,
    }));
  }, [rows]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "物种",
        cell: ({ row }) => {
          const r = row.original;
          const isReactant = r.moles < 0;
          return (
            <span className="flex items-baseline gap-2">
              <span className="ink-4 tabular font-mono text-[10px]">
                {isReactant ? "−" : "+"}
              </span>
              <span className="ink">{r.displayName}</span>
            </span>
          );
        },
      },
      {
        accessorKey: "moles",
        header: "n",
        cell: ({ row }) => (
          <span className="ink-2 tabular font-mono italic">
            {numFmt(row.original.moles)}
          </span>
        ),
        sortingFn: (a, b) => a.original.moles - b.original.moles,
      },
      {
        accessorKey: "massGrams",
        header: "m",
        cell: ({ row }) => (
          <span
            className={`tabular font-mono ${
              row.original.moles < 0
                ? "ink-2"
                : "accent-ink font-medium"
            }`}
          >
            {numFmt(row.original.massGrams, 3)}
          </span>
        ),
        sortingFn: (a, b) => a.original.massGrams - b.original.massGrams,
      },
      {
        accessorKey: "pct",
        header: "份额",
        cell: ({ row }) => (
          <span className="ink-3 tabular font-mono text-[12.5px]">
            {(row.original.pct * 100).toFixed(1)}%
          </span>
        ),
        sortingFn: (a, b) => a.original.pct - b.original.pct,
      },
    ],
    [],
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: "massGrams", desc: true },
  ]);

  const table = useReactTable({
    data: enriched,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section>
      <SectionLabel title="质量衡算" />

      <figure className="mt-5">
        {/* 三线表: top double rule, header rule, bottom rule */}
        <table className="w-full border-collapse text-[14px]">
          <thead>
            <tr>
              {table.getHeaderGroups()[0]?.headers.map((h, i) => {
                const sorted = h.column.getIsSorted();
                const isFirst = i === 0;
                const isNumeric = i > 0 && i < 3;
                return (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    style={{
                      borderTop: "2.5px solid var(--ink)",
                      borderBottom: "1px solid var(--ink)",
                    }}
                    className={`ink-2 cursor-pointer select-none py-2.5 text-[12.5px] font-normal italic transition hover:text-[var(--accent-ink)] ${
                      isFirst ? "pl-1 text-left" : isNumeric ? "text-right pr-1" : "text-right pr-1"
                    }`}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {sorted ? (
                      <span className="ink-4 ml-1 text-[10px]">
                        {sorted === "asc" ? "↑" : "↓"}
                      </span>
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx, arr) => (
              <tr
                key={row.id}
                style={
                  idx === arr.length - 1
                    ? { borderBottom: "2.5px solid var(--ink)" }
                    : undefined
                }
                className="transition-colors hover:bg-[rgba(139,26,26,0.03)]"
              >
                {row.getVisibleCells().map((cell, i) => {
                  const isFirst = i === 0;
                  return (
                    <td
                      key={cell.id}
                      className={`py-1.5 ${
                        isFirst ? "pl-1 text-left" : "text-right pr-1"
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <figcaption className="ink-3 mt-2.5 text-[12.5px] italic leading-relaxed">
          <span className="ink-4 not-italic">Tab. 1 ·</span>{" "}
          n 单位 mol、m 单位 g，均以每 mol 电子供体为基准；
          <span className="not-italic"> −</span> 为反应物，
          <span className="not-italic"> +</span> 为产物。
        </figcaption>
      </figure>
    </section>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="ink text-[18px] font-semibold tracking-tight">
        {title}
      </h2>
    </div>
  );
}
