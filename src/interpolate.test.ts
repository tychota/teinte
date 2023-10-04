import { describe, it, expect } from "bun:test";
import { interpolateColor } from "./interpolate";

describe("interpolate colors", () => {
  it("should be able to interpolate in RGB", () => {
    // Given
    const c1 = { r: 128, g: 77, b: 204 };
    const c2 = { r: 26, g: 230, b: 51 };
    // When
    const c = interpolateColor(c1, c2, 0.5, "rgb");
    // Then
    expect(c).toEqual({ r: 77, g: 154, b: 128 });
  });

  it("should be able to interpolate in oklab", () => {
    // Given
    const c1 = { r: 128, g: 77, b: 204 };
    const c2 = { r: 26, g: 230, b: 51 };
    // When
    const c = interpolateColor(c1, c2, 0.5, "oklab");
    // Then
    expect(c).toEqual({ r: 107, g: 163, b: 156 });
  });

  it("should be able to interpolate in oklab by clamping in rgb", () => {
    // Given
    const c1 = { r: 52, g: 254, b: 28 };
    const c2 = { r: 22, g: 15, b: 254 };
    // When
    const c = interpolateColor(c1, c2, 0.5, "oklab", "clamp");
    // Then
    expect(c).toEqual({ r: 0, g: 170, b: 191 });
  });

  it("should be able to interpolate in oklab by graying out color", () => {
    // Given
    const c1 = { r: 52, g: 254, b: 28 };
    const c2 = { r: 22, g: 15, b: 254 };
    // When
    const c = interpolateColor(c1, c2, 0.5, "oklab", "gray");
    // Then
    expect(c).toEqual({ r: 147, g: 147, b: 147 });
  });

  it("should be able to interpolate in oklab by preserving chroma - upper part", () => {
    // Given
    const c1 = { r: 52, g: 254, b: 28 };
    const c2 = { r: 22, g: 15, b: 254 };
    // When
    const c = interpolateColor(c1, c2, 0.5, "oklab", "projectTo05");
    // Then
    expect(c).toEqual({ r: 0, g: 154, b: 170 });
  });

  it("should be able to interpolate in oklab by preserving chroma - lower part", () => {
    // Given
    const c1 = { r: 75, g: 75, b: 252 };
    const c2 = { r: 250, g: 216, b: 254 };
    // When
    const c = interpolateColor(c1, c2, 0.5, "oklab", "adaptativeL05-005");
    // Then
    expect(c).toEqual({ r: 155, g: 154, b: 255 });
  });

  it("should be able to interpolate in oklab by graying out color", () => {
    // Given
    const c1 = { r: 52, g: 254, b: 28 };
    const c2 = { r: 22, g: 15, b: 254 };
    // When
    const c = interpolateColor(c1, c2, 0.5, "oklab", "gray");
    // Then
    expect(c).toEqual({ r: 147, g: 147, b: 147 });
  });
});
