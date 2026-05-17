import Fraction from "fraction.js";

import { calculate } from "../lib/calculator";
import type { SpeciesId } from "../lib/types";

const r = calculate({
  donorId: "glucose",
  acceptorId: "oxygen",
  fs: 0,
});

const expected: Record<string, string> = {
  glucose: "-1",
  oxygen: "-6",
  co2: "6",
  h2o: "6",
};

let ok = true;
for (const [sp, exp] of Object.entries(expected)) {
  const got = r.normalized.get(sp as SpeciesId);
  const want = new Fraction(exp);
  if (!got || !got.equals(want)) {
    console.error(`Mismatch ${sp}: got ${got?.toString() ?? "∅"}, want ${exp}`);
    ok = false;
  }
}

if (r.normalized.size !== Object.keys(expected).length) {
  console.error("Unexpected species set:", [...r.normalized.keys()]);
  ok = false;
}

console.log("KaTeX:", r.equationKatex);
if (!ok) process.exit(1);
console.log("VERIFY OK: glucose + O2 + fs=0");
