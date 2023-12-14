import { describe, it, expect } from "bun:test";
import { Color } from "../src/colors";
import { ToRGBColorspaceVisitor } from "../src/colorspace/rgb";
import { ToOkLabColorspaceVisitor } from "../src/colorspace/oklab";
import { _LinearRGB, _LinearRgbColorspace } from "../src/colorspace/rgb/_linearRgb";

describe("colors", () => {
  it("should be able to convert from OkLab to RGB", () => {
    // Given
    const lab = new Color.OkLab(0.5, 0.1, 0);
    // When
    const rgbColorspace = new ToRGBColorspaceVisitor();
    // Then
    const rgb = rgbColorspace.visitOkLabColor(lab);
    const expectedRgb = new Color.RGB(0.5658744654539968, 0.2854684929162757, 0.3796666882061938);
    expect(rgb).toEqual(expectedRgb);
  });
  it("should be able to convert from RGB to OkLab", () => {
    // Given
    const rgb = new Color.RGB(0.5, 0.3, 0.7);
    // When
    const okLabColorspace = new ToOkLabColorspaceVisitor();
    const lab = okLabColorspace.visitRGBColor(rgb);
    // Then
    const expectedLab = new Color.OkLab(0.5244890538202618, 0.09009675437758097, -0.1307119570889005);
    expect(lab.l).toBeCloseTo(expectedLab.l);
    expect(lab.a).toBeCloseTo(expectedLab.a);
    expect(lab.b).toBeCloseTo(expectedLab.b);
  });
});

describe("sRGB", () => {
  it("Should handle negative value with symetrie - A1", () => {
    // Given
    const rgb = new Color.RGB(0.1, 0, 0);
    // When
    const lrgbColorspace = new _LinearRgbColorspace();
    const lrgb = lrgbColorspace.visitRGBColor(rgb);
    // Then
    const expectedLrgb = new _LinearRGB(0.010022825574869039, 0, 0);
    expect(lrgb).toEqual(expectedLrgb);
  });

  it("Should handle negative value with symetrie - A2", () => {
    // Given
    const rgb = new Color.RGB(-0.1, 0, 0);
    // When
    const lrgbColorspace = new _LinearRgbColorspace();
    const lrgb = lrgbColorspace.visitRGBColor(rgb);
    // Then
    const expectedLrgb = new _LinearRGB(-0.010022825574869039, 0, 0);
    expect(lrgb).toEqual(expectedLrgb);
  });

  it("Should handle negative value with symetrie - B1", () => {
    // Given
    const rgb = new Color.RGB(0.01, 0, 0);
    // When
    const lrgbColorspace = new _LinearRgbColorspace();
    const lrgb = lrgbColorspace.visitRGBColor(rgb);
    // Then
    const expectedLrgb = new _LinearRGB(0.0007739938080495357, 0, 0);
    expect(lrgb).toEqual(expectedLrgb);
  });

  it("Should handle negative value with symetrie -B2", () => {
    // Given
    const rgb = new Color.RGB(-0.01, 0, 0);
    // When
    const lrgbColorspace = new _LinearRgbColorspace();
    const lrgb = lrgbColorspace.visitRGBColor(rgb);
    // Then
    const expectedLrgb = new _LinearRGB(-0.0007739938080495357, 0, 0);
    expect(lrgb).toEqual(expectedLrgb);
  });
});
