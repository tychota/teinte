import { Color, ColorspaceVisitor } from "../colors";

import { linear_to_srgb } from "../utils/gamma";
import { _LinearRGB, _LinearRgbColorspace } from "./oklab/rgb/_linearRgb";
import { ToOkLabColorspaceVisitor } from "./oklab";
import { ToXYZColorspaceVisitor } from "./xyz";

export class ToRGBColorspaceVisitor extends ColorspaceVisitor<InstanceType<typeof Color.RGB>> {
  public visitRGBColor(color: InstanceType<typeof Color.RGB>) {
    return color;
  }
  public visitHSLColor(color: InstanceType<typeof Color.HSL>) {
    let { h, s, l } = color;
    h = h % 360;
    if (h < 0) h += 360;
    s /= 100;
    l /= 100;
    function f(n: number) {
      const k = (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    }
    const rgb = new Color.RGB(f(0), f(8), f(4));
    return this.visitRGBColor(rgb);
  }
  public visitXYZColor(color: InstanceType<typeof Color.XYZ>) {
    const linearRGB = new _LinearRgbColorspace().visitXYZColor(color);
    const rgb = new Color.RGB(linear_to_srgb(linearRGB.r), linear_to_srgb(linearRGB.g), linear_to_srgb(linearRGB.b));
    return this.visitRGBColor(rgb);
  }
  public visitOkLabColor(color: InstanceType<typeof Color.OkLab>) {
    const xyz = new ToXYZColorspaceVisitor().visitOkLabColor(color);
    return this.visitXYZColor(xyz);
  }
  public visitOkLCHColor(color: InstanceType<typeof Color.OkLCH>) {
    const oklab = new ToOkLabColorspaceVisitor().visitOkLCHColor(color);
    return this.visitOkLabColor(oklab);
  }
}
