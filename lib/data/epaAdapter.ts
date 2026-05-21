/**
 * EPA Pollutant → HalfReactionEntry 适配器。
 *
 * EPA 化合物的配平系数已离线生成 (lib/data/generated/epa-pollutants.json),
 * 此处仅把它们包装成 calculator 期望的 HalfReactionEntry 形状。
 *
 * 副作用: import 本模块即触发 epaRegistry 注册全部 126 条物种 + 辅助物种。
 */

import "./epaRegistry"; // 保证物种表已注入

import type { HalfReactionCoefficients, HalfReactionEntry, SpeciesId } from "../types";
import { EPA_POLLUTANTS, getEpaPollutant, type EpaPollutant } from "./epaPollutants";

const EPA_PREFIX = "epa_";

/** 形如 "epa_004" 的 id → 是否为 EPA 池 */
export function isEpaDonorId(id: string): boolean {
  return id.startsWith(EPA_PREFIX);
}

/** 取出 epa_id (3 位编号) */
function epaIdFromKey(id: string): string {
  return id.startsWith(EPA_PREFIX) ? id.slice(EPA_PREFIX.length) : id;
}

function buildEntry(p: EpaPollutant): HalfReactionEntry {
  if (!p.balance) {
    throw new Error(`EPA #${p.epa_id} (${p.name_en}) 没有配平结果, 无法转 HalfReactionEntry`);
  }
  const coeffObj: HalfReactionCoefficients = {};
  for (const [k, v] of Object.entries(p.balance.coefficients)) {
    coeffObj[k as SpeciesId] = v;
  }
  return {
    id: `epa_${p.epa_id}`,
    displayName: p.name_cn,
    primarySpecies: `epa_${p.epa_id}` as SpeciesId,
    coefficients: coeffObj,
    referenceKatex: p.balance.equationKatex,
  };
}

const ENTRY_CACHE = new Map<string, HalfReactionEntry>();

/** 统一入口: 给一个 "epa_NNN" 返回 HalfReactionEntry, 否则返回 undefined */
export function getEpaEntry(id: string): HalfReactionEntry | undefined {
  if (!isEpaDonorId(id)) return undefined;
  const cached = ENTRY_CACHE.get(id);
  if (cached) return cached;
  const epaId = epaIdFromKey(id);
  const p = getEpaPollutant(epaId);
  if (!p) return undefined;
  if (!p.balance) return undefined;
  const entry = buildEntry(p);
  ENTRY_CACHE.set(id, entry);
  return entry;
}

/** UI 用: 列出所有可作 donor 的 EPA 化合物 (含配平结果, 排除金属受体) */
export function listEpaDonors(): EpaPollutant[] {
  return EPA_POLLUTANTS.filter((p) => p.role === "donor" && p.balance);
}

/** UI 用: 列出所有可作 acceptor 的 EPA 变价金属 */
export function listEpaAcceptors(): EpaPollutant[] {
  return EPA_POLLUTANTS.filter((p) => p.role === "acceptor_metal" && p.balance);
}
