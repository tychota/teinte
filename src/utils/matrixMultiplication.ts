function isVector(A: number[][] | number[]): A is number[] {
  return typeof A[0] == "number";
}

export function matMul(A: number[][], B: number[][]): number[][];
export function matMul(A: number[], B: number[][]): number[];
export function matMul(A: number[][], B: number[]): number[];
export function matMul(A: number[][] | number[], B: number[][] | number[]): number[][] | number[] {
  if (A.length === 0 || B.length === 0) {
    throw new Error("Empty matrix");
  }
  if (isVector(A)) {
    A = [A];
  }
  if (isVector(B)) {
    B = B.map((x) => [x]);
  }

  const shapeA = [A.length, A[0].length];
  const shapeB = [B.length, B[0].length];

  if (shapeA[1] !== shapeB[0]) {
    throw new Error("Shape mismatch");
  }

  const result: number[][] = [];
  for (let i = 0; i < shapeA[0]; i++) {
    result.push([]);
    for (let j = 0; j < shapeB[1]; j++) {
      result[i].push(0);
      for (let k = 0; k < shapeA[1]; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  if (result.length === 1) {
    return result[0];
  }
  if (result[0].length === 1) {
    return result.map((row) => row[0]);
  }

  return result;
}
