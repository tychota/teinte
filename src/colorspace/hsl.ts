import { Color, ColorspaceVisitor } from "../colors";

import { _LinearRGB, _LinearRgbColorspace } from "./rgb/_linearRgb";
import { ToRGBColorspaceVisitor } from "./rgb";

export class ToHSLColorspaceVisitor extends ColorspaceVisitor<InstanceType<typeof Color.HSL>> {
  public visitRGBColor(color: InstanceType<typeof Color.RGB>) {
    let max = Math.max(color.r, color.g, color.b);
    let min = Math.min(color.r, color.g, color.b);
    let [r, g, b] = [color.r, color.g, color.b];
    let [h, s, l] = [NaN, 0, (max + min) / 2];
    let d = max - min;
    if (d !== 0) {
      s = l === 0 || l === 1 ? 0 : (max - l) / Math.min(l, 1 - l);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h = h * 60;
    }
    const hsl = new Color.HSL(h, s * 100, l * 100);
    return this.visitHSLColor(hsl);
  }
  public visitHSLColor(color: InstanceType<typeof Color.HSL>) {
    return color;
  }
  public visitXYZColor(color: InstanceType<typeof Color.XYZ>) {
    const rgb = new ToRGBColorspaceVisitor().visitXYZColor(color);
    return this.visitRGBColor(rgb);
  }
  public visitOkLabColor(color: InstanceType<typeof Color.OkLab>) {
    const rgb = new ToRGBColorspaceVisitor().visitOkLabColor(color);
    return this.visitRGBColor(rgb);
  }
  public visitOkLCHColor(color: InstanceType<typeof Color.OkLCH>) {
    const rgb = new ToRGBColorspaceVisitor().visitOkLCHColor(color);
    return this.visitRGBColor(rgb);
  }
}
