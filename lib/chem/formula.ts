import Fraction from "fraction.js";

export type ElementMap = Map<string, Fraction>;

export type ParsedFormula = {
  elements: ElementMap;
  charge: Fraction;
};

const ELEMENT_TOKEN = /^([A-Z][a-z]?)(\d+(?:\.\d+)?)?/;
const CHARGE_TOKEN = /\^(\d*)([+-])$/;

function addElement(map: ElementMap, el: string, count: Fraction): void {
  const prev = map.get(el);
  map.set(el, prev ? prev.add(count) : count);
}

function parseGroup(input: string, start: number): { elements: ElementMap; next: number } {
  const elements: ElementMap = new Map();
  let i = start;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "(") {
      const inner = parseGroup(input, i + 1);
      i = inner.next;
      if (input[i] !== ")") throw new Error(`Missing ')' in formula near index ${i}`);
      i++;
      const mult = readNumber(input, i);
      i = mult.next;
      for (const [el, c] of inner.elements) {
        addElement(elements, el, c.mul(mult.value));
      }
    } else if (ch === ")") {
      return { elements, next: i };
    } else if (/[A-Z]/.test(ch)) {
      const m = input.slice(i).match(ELEMENT_TOKEN);
      if (!m) throw new Error(`Bad element at ${i}: ${input.slice(i)}`);
      const el = m[1];
      const count = m[2] ? new Fraction(m[2]) : new Fraction(1);
      addElement(elements, el, count);
      i += m[0].length;
    } else {
      throw new Error(`Unexpected character '${ch}' at ${i} in '${input}'`);
    }
  }
  return { elements, next: i };
}

function readNumber(input: string, start: number): { value: Fraction; next: number } {
  const m = input.slice(start).match(/^(\d+(?:\.\d+)?)/);
  if (!m) return { value: new Fraction(1), next: start };
  return { value: new Fraction(m[1]), next: start + m[0].length };
}

/**
 * 解析分子式字符串，例如：
 *   "C6H12O6"      → {C:6, H:12, O:6, charge:0}
 *   "NH4^+"        → {N:1, H:4, charge:+1}
 *   "SO4^2-"       → {S:1, O:4, charge:-2}
 *   "CH3COO^-"     → {C:2, H:3, O:2, charge:-1}
 *   "Ca(OH)2"      → {Ca:1, O:2, H:2, charge:0}
 *   "Fe^3+"        → {Fe:1, charge:+3}
 *
 * 电子使用特殊语法："e-"。
 */
export function parseFormula(raw: string): ParsedFormula {
  const s = raw.trim();
  if (s === "e-" || s === "e^-") {
    return { elements: new Map(), charge: new Fraction(-1) };
  }

  let body = s;
  let charge = new Fraction(0);
  const chargeMatch = s.match(CHARGE_TOKEN);
  if (chargeMatch) {
    const num = chargeMatch[1] === "" ? 1 : Number.parseInt(chargeMatch[1], 10);
    charge = new Fraction(chargeMatch[2] === "+" ? num : -num);
    body = s.slice(0, s.length - chargeMatch[0].length);
  }

  const parsed = parseGroup(body, 0);
  if (parsed.next !== body.length) {
    throw new Error(`Trailing content in formula '${raw}' at index ${parsed.next}`);
  }
  return { elements: parsed.elements, charge };
}

/** 元素摩尔质量 (g/mol) — IUPAC 2021 standard atomic weights, rounded. */
export const ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  S: 32.06,
  P: 30.974,
  Na: 22.99,
  K: 39.098,
  Ca: 40.078,
  Mg: 24.305,
  Cl: 35.45,
  Br: 79.904,
  F: 18.998,
  I: 126.904,
  Fe: 55.845,
  Mn: 54.938,
  Cu: 63.546,
  Zn: 65.38,
  Al: 26.982,
  Si: 28.085,
};

export function molecularWeight(parsed: ParsedFormula): number {
  let mw = 0;
  for (const [el, count] of parsed.elements) {
    const aw = ATOMIC_WEIGHTS[el];
    if (aw === undefined) throw new Error(`Unknown element '${el}'`);
    mw += aw * count.valueOf();
  }
  return mw;
}
