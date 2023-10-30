import { describe, it, expect } from "bun:test";
import { deltaOK } from "./distance";

describe("distance colors", () => {
  it("should be able to calculate the distance deltaOk - 1", () => {
    // Given
    const c1 = { r: 128, g: 77, b: 204 };
    const c2 = { r: 26, g: 230, b: 51 };
    // When
    const d = deltaOK(c1, c2);
    // Then
    expect(d).toBeCloseTo(0.5, 1);
  });
  it("should be able to calculate the distance deltaOk - 2", () => {
    // Given
    const c1 = { r: 255, g: 255, b: 255 };
    const c2 = { r: 0, g: 0, b: 0 };
    // When
    const d = deltaOK(c1, c2);
    // Then
    expect(d).toBeCloseTo(1, 1);
  });

  it("should be able to calculate the distance deltaOk - 3", () => {
    // Given
    const c1 = { r: 10, g: 80, b: 150 };
    const c2 = { r: 9, g: 81, b: 152 };
    // When
    const d = deltaOK(c1, c2);
    // Then
    expect(d).toBeCloseTo(0, 1);
  });
});
