import { describe, it, expect } from "bun:test";

import { matMul } from "./matrixMultiplication";

describe("matrixMultiplication", () => {
  it("should multiply two matrices", () => {
    const a = [
      [1, 2],
      [3, 4],
    ];
    const b = [
      [5, 6],
      [7, 8],
    ];
    const result = [
      [19, 22],
      [43, 50],
    ];
    expect(matMul(a, b)).toEqual(result);
  });
  it("should throw an error if the matrices are not compatible", () => {
    const a = [
      [1, 2],
      [3, 4],
    ];
    const b = [[5, 6, 7]];
    expect(() => matMul(a, b)).toThrow("Shape mismatch");
  });
  it("handles vectors (1/2)", () => {
    const a = [1, 2];
    const b = [
      [5, 6],
      [7, 8],
    ];
    const result = [19, 22];
    expect(matMul(a, b)).toEqual(result);
  });
  it("handles vectors (2/2)", () => {
    const a = [
      [1, 2],
      [3, 4],
    ];
    const b = [5, 6];
    const result = [17, 39];
    expect(matMul(a, b)).toEqual(result);
  });
});
