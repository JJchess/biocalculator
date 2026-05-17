import Fraction from "fraction.js";

const ZERO = new Fraction(0);

/**
 * 精确有理数高斯—若尔当消元，求解 M·x = b。
 *
 * 维度：M 为 rows×cols，b 长度为 rows。
 * 返回：
 *   - 唯一解 → Fraction[] (长度 cols)
 *   - 无解或多解 → null
 *
 * 化学计量配平的典型用法：将「每种元素的原子数守恒 + 总电荷守恒 + 一行用于固定缩放」
 * 写成形如 M·x = b 的方程组，rank(M) = cols 时存在唯一解。
 */
export function solveExact(M: Fraction[][], b: Fraction[]): Fraction[] | null {
  const rows = M.length;
  const cols = rows > 0 ? M[0].length : 0;
  if (b.length !== rows) throw new Error("solveExact: dim mismatch");

  const A: Fraction[][] = M.map((r, i) => {
    if (r.length !== cols) throw new Error("solveExact: jagged matrix");
    return [...r, b[i]];
  });

  const pivotCols: number[] = [];
  let pivotRow = 0;
  for (let col = 0; col < cols && pivotRow < rows; col++) {
    let p = -1;
    for (let r = pivotRow; r < rows; r++) {
      if (!A[r][col].equals(ZERO)) {
        p = r;
        break;
      }
    }
    if (p === -1) continue;

    if (p !== pivotRow) [A[pivotRow], A[p]] = [A[p], A[pivotRow]];

    const pv = A[pivotRow][col];
    A[pivotRow] = A[pivotRow].map((v) => v.div(pv));

    for (let r = 0; r < rows; r++) {
      if (r === pivotRow) continue;
      const factor = A[r][col];
      if (factor.equals(ZERO)) continue;
      A[r] = A[r].map((v, j) => v.sub(factor.mul(A[pivotRow][j])));
    }
    pivotCols.push(col);
    pivotRow++;
  }

  // 一致性检查
  for (let r = pivotRow; r < rows; r++) {
    if (!A[r][cols].equals(ZERO)) return null;
  }
  // 唯一性检查
  if (pivotCols.length < cols) return null;

  const x: Fraction[] = Array.from({ length: cols }, () => new Fraction(0));
  for (let i = 0; i < pivotCols.length; i++) {
    x[pivotCols[i]] = A[i][cols];
  }
  return x;
}
