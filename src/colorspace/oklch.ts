import { Color, ColorspaceVisitor } from "../colors";

import { ToOkLabColorspaceVisitor } from "./oklab";

export class ToOkLCHColorspaceVisitor extends ColorspaceVisitor<InstanceType<typeof Color.OkLCH>> {
  public visitRGBColor(color: InstanceType<typeof Color.RGB>) {
    const oklab = new ToOkLabColorspaceVisitor().visitRGBColor(color);
    return this.visitOkLabColor(oklab);
  }
  public visitHSLColor(color: InstanceType<typeof Color.HSL>) {
    const oklab = new ToOkLabColorspaceVisitor().visitHSLColor(color);
    return this.visitOkLabColor(oklab);
  }
  public visitXYZColor(color: InstanceType<typeof Color.XYZ>) {
    const oklab = new ToOkLabColorspaceVisitor().visitXYZColor(color);
    return this.visitOkLabColor(oklab);
  }
  public visitOkLabColor(color: InstanceType<typeof Color.OkLab>) {
    const { l, a, b } = color;
    let c: number, h: number;
    let epsilon = 0.0002;

    if (Math.abs(a) < epsilon && Math.abs(b) < epsilon) {
      c = 0;
      h = NaN;
    } else {
      c = Math.sqrt(a * a + b * b);
      h = (Math.atan2(b, a) * 180) / Math.PI;
      if (h < 0) {
        h += 360;
      }
    }

    const okLch = new Color.OkLCH(l, c, h);
    return this.visitOkLCHColor(okLch);
  }
  public visitOkLCHColor(color: InstanceType<typeof Color.OkLCH>) {
    return color;
  }
}
