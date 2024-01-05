import { Color, ColorspaceVisitor } from "../colors";
import { matMul } from "../utils/matrixMultiplication";

import { _LMSColorspace } from "./oklab/_lms";
import { _LMSg, _LMSgColorspace } from "./oklab/_lmsg";
import { ToXYZColorspaceVisitor } from "./xyz";
import { ToRGBColorspaceVisitor } from "./rgb";

import { LMSg_OkLab } from "../constants";

export class ToOkLabColorspaceVisitor extends ColorspaceVisitor<InstanceType<typeof Color.OkLab>> {
  public visitRGBColor(color: InstanceType<typeof Color.RGB>) {
    const xyz = new ToXYZColorspaceVisitor().visitRGBColor(color);
    return this.visitXYZColor(xyz);
  }
  public visitHSLColor(color: InstanceType<typeof Color.HSL>) {
    const rgb = new ToRGBColorspaceVisitor().visitHSLColor(color);
    return this.visitRGBColor(rgb);
  }
  private visiteLMSgColor(color: _LMSg) {
    const lab = matMul(LMSg_OkLab, [color.l, color.m, color.s]);
    const oklab = new Color.OkLab(lab[0], lab[1], lab[2]);
    return this.visitOkLabColor(oklab);
  }
  public visitXYZColor(color: InstanceType<typeof Color.XYZ>) {
    const lms = new _LMSColorspace().visitXYZColor(color);
    const lmsg = new _LMSgColorspace().visitLMSColor(lms);
    return this.visiteLMSgColor(lmsg);
  }
  public visitOkLabColor(color: InstanceType<typeof Color.OkLab>) {
    return color;
  }
  public visitOkLCHColor(color: InstanceType<typeof Color.OkLCH>) {
    const { l, c, h } = color;
    let a: number, b: number;

    if (isNaN(h)) {
      a = 0;
      b = 0;
    } else {
      const angle = (h * Math.PI) / 180;
      a = Math.cos(angle) * c;
      b = Math.sin(angle) * c;
    }

    const oklab = new Color.OkLab(l, a, b);
    return this.visitOkLabColor(oklab);
  }
}
