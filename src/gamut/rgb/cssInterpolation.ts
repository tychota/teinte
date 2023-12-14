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

    // Step 11: set min to zero
    let min = 0;

    // Step 12 : set max to the Oklch chroma of origin_Oklch
    let max = origin_Oklch.c;

    // Step 13: let min_inGamut be a boolean that represents when min is still in gamut, and set it to true
    let min_inGamut = true;

    let current = new Color.OkLCH(origin_Oklch.l, origin_Oklch.c, origin_Oklch.h);

    // Step 14: while (max - min is greater than epsilon) repeat the following steps
    while (max - min > epsilon) {
      // Step 14.1: set chroma to (min + max) /2
      let chroma = (min + max) / 2;

      // Step 14.2: set current to origin_Oklch and then set the chroma component to chroma
      current.c = chroma;

      // Step 14.3 if min_inGamut is true and also if inGamut(current) is true,
      // set min to chroma and continue to repeat these steps
      if (min_inGamut && inGamut(current)) {
        console.log("min_inGamut && inGamut(current)", color);
        min = chroma;
        continue;
      }

      // Step 14.4: otherwise, if inGamut(current) is false carry out these steps
      if (inGamut(current) === false) {
        // Step 14.4.1 : set clipped to clip(current)
        const clipped = clip(current);

        // Step 14.4.2 : set E to delta(clipped, current)
        const E = delta(clipped, current);

        // Step 14.4.3: if E < JND
        if (E < JND) {
          // Step 14.4.3.1: if (JND - E < epsilon) return clipped as the gamut mapped color
          if (JND - E < epsilon) {
            return clipped;
          }
          // Step 14.4.3.2 : otherwise,
          else {
            // console.log('JND - E >= epsilon', color);
            // Step 14.4.3.2.1 : set min_inGamut to false,
            min_inGamut = false;
            // Step 14.4.3.2.2 : set min to chroma
            min = chroma;
          }
        } else {
          // console.log('E >= JND', color);
          // Step 14.4.4: otherwise, set max to chroma and continue to repeat these steps
          max = chroma;
          continue;
        }
      }
    }

    // Step 15: return current as the gamut mapped color
    return current.accept(this.rgbVisitor) as InstanceType<typeof Color.RGB>;
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
