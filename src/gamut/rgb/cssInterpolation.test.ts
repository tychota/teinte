import { describe, it, expect } from "bun:test";

import { CSS4GamutMapping } from "./cssInterpolation";
import { Color } from "../../colors";

const gammutAlgorithm = new CSS4GamutMapping();

describe("gamut algorithm", () => {
  it("should return the same color if passed an RGB color", () => {
    // Given
    const origin = new Color.RGB(0.5, 0.5, 0.5);
    // When
    const gammutMappedColor = gammutAlgorithm.visitRGBColor(origin);
    // Then
    expect(gammutMappedColor.r).toBeCloseTo(0.5);
    expect(gammutMappedColor.g).toBeCloseTo(0.5);
    expect(gammutMappedColor.b).toBeCloseTo(0.5);
  });
  it("should return RGB(1,1,1) if oklch lightness is more than 1", () => {
    // Given
    const origin = new Color.RGB(0.5, 1.2, 1.4);
    // When
    const gammutMappedColor = gammutAlgorithm.visitRGBColor(origin);
    // Then
    expect(gammutMappedColor.r).toBeCloseTo(1);
    expect(gammutMappedColor.g).toBeCloseTo(1);
    expect(gammutMappedColor.b).toBeCloseTo(1);
  });
  it("should return RGB(0,0,0) if oklch lightness is less than 0", () => {
    // Given
    const origin = new Color.RGB(-0.5, 0.1, -0.4);
    // When
    const gammutMappedColor = gammutAlgorithm.visitRGBColor(origin);
    // Then
    expect(gammutMappedColor.r).toBeCloseTo(0);
    expect(gammutMappedColor.g).toBeCloseTo(0);
    expect(gammutMappedColor.b).toBeCloseTo(0);
  });

  it("should return RGB(0.5, 0.5, 0.5) if in gammut (testing Step 6)", () => {
    // Given
    const origin = new Color.RGB(0.5, 0.5, 0.5);
    // When
    const gammutMappedColor = gammutAlgorithm.visitRGBColor(origin);
    // Then
    expect(gammutMappedColor.r).toBeCloseTo(0.5);
    expect(gammutMappedColor.g).toBeCloseTo(0.5);
    expect(gammutMappedColor.b).toBeCloseTo(0.5);
  });
});

describe("clip", () => {
  it("clip color", () => {
    const rgb = new Color.RGB(-0.5, 0.2, 1.4);

    const cliped = rgb;
    cliped.clip();

    expect(cliped.r).toBeCloseTo(0);
    expect(cliped.g).toBeCloseTo(0.2);
    expect(cliped.b).toBeCloseTo(1);
  });
});
