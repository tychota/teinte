import { describe, it, expect } from "bun:test";
import { Color } from "../src/colors";
import { ToRGBColorspaceVisitor } from "../src/colorspace/rgb";
import { ToOkLabColorspaceVisitor } from "../src/colorspace/oklab";

describe("colors", () => {
  it("should be able to convert from OkLab to RGB", () => {
    // Given
    const lab = new Color.OkLab(0.5, 0.1, 0);
    // When
    const rgbColorspace = new ToRGBColorspaceVisitor();
    // Then
    const rgb = rgbColorspace.visitOkLabColor(lab);
    const expectedRgb = new Color.RGB(
      0.5658744623277556,
      0.28546849365275634,
      0.37966673439558823
    );
    expect(rgb).toEqual(expectedRgb);
  });
  it("should be able to convert from RGB to OkLab", () => {
    // Given
    const rgb = new Color.RGB(0.5, 0.3, 0.7);
    // When
    const okLabColorspace = new ToOkLabColorspaceVisitor();
    // Then
    const lab = okLabColorspace.visitRGBColor(rgb);
    const expectedLab = new Color.OkLab(
      0.5244890538202618,
      0.09009675437758097,
      -0.1307119570889005
    );
    expect(lab).toEqual(expectedLab);
  });
});
