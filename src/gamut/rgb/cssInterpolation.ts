import { Color } from "../../colors";
import { ToOkLabColorspaceVisitor } from "../../colorspace/oklab";
import { ToOkLCHColorspaceVisitor } from "../../colorspace/oklch";
import { ToRGBColorspaceVisitor } from "../../colorspace/rgb";

export const deltaEOK = (oneOklab: InstanceType<typeof Color.OkLab>, twoOklab: InstanceType<typeof Color.OkLab>) => {
  const ΔL = oneOklab.l - twoOklab.l;

  const Δa = oneOklab.a - twoOklab.a;
  const Δb = oneOklab.b - twoOklab.b;

  return Math.sqrt(ΔL ** 2 + Δa ** 2 + Δb ** 2);
};

export class CSS4GamutMapping extends ToRGBColorspaceVisitor {
  rgbVisitor = new ToRGBColorspaceVisitor();
  oklabVisitor = new ToOkLabColorspaceVisitor();
  oklchVisitor = new ToOkLCHColorspaceVisitor();

  public visitRGBColor(color: InstanceType<typeof Color.RGB>) {
    // We follow algorithm https://www.w3.org/TR/css-color-4/#binsearch

    const origin = color;

    // Step 1 : if destination has no gamut limits (XYZ-D65, XYZ-D50, Lab, LCH, Oklab, Oklch) return origin
    // does not apply as RGB has gamut limit
    // const nogammutLimitColorspaces = [Color.XYZ, Color.OkLCH, Color.OkLab] as const
    // const colorspaceHasGamutLimit = nogammutLimitColorspaces.includes(destination)
    const colorspaceHasGamutLimit = false;
    if (colorspaceHasGamutLimit) {
      return color;
    }

    // Step 2 : create the color in the OKLch color space
    const origin_Oklch = this.oklchVisitor.visitRGBColor(origin);

    // Step 3 : if the Lightness of origin_Oklch is greater than or equal to 100%, return { 1 1 1 } in destination
    // Note the algorithm speak about alpha but we don't support alpha
    if (origin_Oklch.l >= 1) {
      return new Color.RGB(1, 1, 1);
    }

    // Step 4 : if the Lightness of origin_Oklch is less than than or equal to 0%, return { 0 0 0 } in destination
    // Note the algorithm speak about alpha but we don't support alpha
    if (origin_Oklch.l <= 0) {
      return new Color.RGB(0, 0, 0);
    }

    // Step 5 : let inGamut(color) be a function which returns true if, when passed a color, that color is inside the gamut of destination. For HSL and HWB, it returns true if the color is inside the gamut of sRGB.
    const inGamut = (color: Color) => {
      const rgbColor = color.accept(this.rgbVisitor) as InstanceType<typeof Color.RGB>;
      return (
        rgbColor.r >= 0 && rgbColor.r <= 1 && rgbColor.g >= 0 && rgbColor.g <= 1 && rgbColor.b >= 0 && rgbColor.b <= 1
      );
    };

    // Step 6 : if inGamut(origin_Oklch) is true, convert origin_Oklch to destination and return it as the gamut mapped color
    if (inGamut(origin_Oklch)) {
      return origin_Oklch.accept(this.rgbVisitor) as InstanceType<typeof Color.RGB>;
    }

    // Step 7 : otherwise, let delta(one, two) be a function which returns the deltaEOK of color one compared to color two
    const delta = (one: Color, two: Color) => {
      const oneOklab = one.accept(this.oklabVisitor) as InstanceType<typeof Color.OkLab>;
      const twoOklab = two.accept(this.oklabVisitor) as InstanceType<typeof Color.OkLab>;
      return deltaEOK(oneOklab, twoOklab);
    };

    // Step 8: let JND be 0.02
    let JND = 0.02;

    // Step 9: let epsilon be 0.0001
    let epsilon = 0.0001;

    // Step 10: let clip(color)| be a function which converts color to destination,
    // converts all negative components to zero, converts all components greater that
    // one to one, and returns the result
    const clip = (color: Color) => {
      const destinationColor = color.accept(this.rgbVisitor) as InstanceType<typeof Color.RGB>;

      const clippedColor = new Color.RGB(destinationColor.r, destinationColor.g, destinationColor.b);
      clippedColor.clip();

      return clippedColor;
    };
    return color;
  }
  public visitHSLColor(color: InstanceType<typeof Color.HSL>) {
    const rgb = this.rgbVisitor.visitHSLColor(color);
    return this.visitRGBColor(rgb);
  }
  public visitXYZColor(color: InstanceType<typeof Color.XYZ>) {
    const rgb = this.rgbVisitor.visitXYZColor(color);
    return this.visitRGBColor(rgb);
  }
  public visitOkLabColor(color: InstanceType<typeof Color.OkLab>) {
    const rgb = this.rgbVisitor.visitOkLabColor(color);
    return this.visitRGBColor(rgb);
  }
  public visitOkLCHColor(color: InstanceType<typeof Color.OkLCH>) {
    const rgb = this.rgbVisitor.visitOkLCHColor(color);
    return this.visitRGBColor(rgb);
  }
}
