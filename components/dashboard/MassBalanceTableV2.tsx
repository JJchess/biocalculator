"use client";

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownUp, ArrowDown, ArrowUp, Table2 } from "lucide-react";
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
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  isReactant
                    ? "bg-[var(--apple-orange)]"
                    : "bg-[var(--apple-green)]"
                }`}
              />
              <span className="font-medium">{r.displayName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "moles",
        header: "n (mol)",
        cell: ({ row }) => (
          <span
            className={`tabular font-mono ${
              row.original.moles < 0
                ? "text-[var(--apple-orange)] dark:text-[var(--apple-orange)]"
                : "text-[var(--apple-green)] dark:text-[var(--apple-green)]"
            }`}
          >
            {row.original.moles >= 0 ? "+" : ""}
            {numFmt(row.original.moles)}
          </span>
        ),
        sortingFn: (a, b) => a.original.moles - b.original.moles,
      },
      {
        accessorKey: "massGrams",
        header: "质量 (g)",
        cell: ({ row }) => (
          <span
            className={`tabular font-mono ${
              row.original.massGrams < 0
                ? "text-[var(--apple-orange)]"
                : "text-[var(--apple-green)]"
            }`}
          >
            {row.original.massGrams >= 0 ? "+" : ""}
            {numFmt(row.original.massGrams, 3)}
          </span>
        ),
        sortingFn: (a, b) => a.original.massGrams - b.original.massGrams,
      },
      {
        accessorKey: "pct",
        header: "占比",
        cell: ({ row }) => {
          const pct = row.original.pct;
          const isReactant = row.original.moles < 0;
          return (
            <div className="flex items-center gap-2">
              <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.10)]">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out ${
                    isReactant
                      ? "bg-[var(--apple-orange)]"
                      : "bg-[var(--apple-green)]"
                  }`}
                  style={{ width: `${(pct * 100).toFixed(1)}%` }}
                />
              </div>
              <span className="tabular text-quaternary w-10 text-right text-[11px]">
                {(pct * 100).toFixed(1)}%
              </span>
            </div>
          );
        },
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
    <div className="surface-card flex flex-col overflow-hidden">
      <div className="hairline-b flex items-center gap-2 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,122,255,0.10)] text-[var(--apple-blue)] dark:bg-[rgba(10,132,255,0.16)] dark:text-[var(--apple-teal)]">
          <Table2 className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[13px] font-semibold">质量衡算</div>
          <div className="text-quaternary text-[11px]">
            橙=反应物，绿=产物；点击列头排序
          </div>
        </div>
      </div>
      <div className="max-h-[360px] min-w-0 overflow-auto px-1">
        <table className="w-full text-[12.5px]">
          <thead className="sticky top-0 bg-[var(--surface-elevated)] backdrop-blur">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="hairline-b">
                {hg.headers.map((h) => {
                  const sorted = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className="text-tertiary cursor-pointer select-none px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide first:pl-4 last:pr-4 hover:text-[var(--text-primary)]"
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sorted === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : sorted === "desc" ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowDownUp className="text-quaternary h-3 w-3" />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--hairline)] transition-colors hover:bg-[rgba(0,0,0,0.03)] last:border-b-0 dark:hover:bg-[rgba(255,255,255,0.04)]"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 first:pl-4 last:pr-4"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
