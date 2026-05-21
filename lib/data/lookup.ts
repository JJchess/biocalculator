/**
 * 统一的 donor / acceptor 查找入口 — 同时支持 curated 13 条库 + EPA 126 条库。
 *
 * 调用方应总是用这个 helper, 不要直接 DONORS[id] / ACCEPTORS[id],
 * 否则遇到 "epa_NNN" 形式的 id 会失败。
 */

import { ACCEPTORS } from "./acceptors";
import { DONORS } from "./donors";
import { getEpaEntry, isEpaDonorId } from "./epaAdapter";
import type { HalfReactionEntry } from "../types";

export function lookupDonor(id: string): HalfReactionEntry {
  if (isEpaDonorId(id)) {
    const e = getEpaEntry(id);
    if (e) return e;
    throw new Error(`Unknown EPA donor: ${id}`);
  }
  const e = (DONORS as Record<string, HalfReactionEntry>)[id];
  if (e) return e;
  throw new Error(`Unknown donor: ${id}`);
}

export function lookupAcceptor(id: string): HalfReactionEntry {
  if (isEpaDonorId(id)) {
    const e = getEpaEntry(id);
    if (e) return e;
    throw new Error(`Unknown EPA acceptor: ${id}`);
  }
  const e = (ACCEPTORS as Record<string, HalfReactionEntry>)[id];
  if (e) return e;
  throw new Error(`Unknown acceptor: ${id}`);
}
