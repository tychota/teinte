import { Color, ColorspaceVisitor } from "../colors";
import { matMul } from "../utils/matrixMultiplication";

import { _LinearRgbColorspace } from "./rgb/_linearRgb";
import { _LMSColorspace } from "./oklab/_lms";
import { _LMSg, _LMSgColorspace } from "./oklab/_lmsg";

import { LRGB_XYZ, LMS_XYZ } from "../constants";
import { ToRGBColorspaceVisitor } from "./rgb";
import { ToOkLabColorspaceVisitor } from "./oklab";

export class ToXYZColorspaceVisitor extends ColorspaceVisitor<InstanceType<typeof Color.XYZ>> {
  public visitRGBColor(color: InstanceType<typeof Color.RGB>) {
    const linearRGB = new _LinearRgbColorspace().visitRGBColor(color);
    const xyzData = matMul(LRGB_XYZ, [linearRGB.r, linearRGB.g, linearRGB.b]);
    const XYZ = new Color.XYZ(xyzData[0], xyzData[1], xyzData[2]);
    return this.visitXYZColor(XYZ);
  }
  public visitHSLColor(color: InstanceType<typeof Color.HSL>) {
    const rgb = new ToRGBColorspaceVisitor().visitHSLColor(color);
    return this.visitRGBColor(rgb);
  }
  public visitXYZColor(color: InstanceType<typeof Color.XYZ>) {
    return color;
  }
  public visitOkLabColor(color: InstanceType<typeof Color.OkLab>) {
    const lmsg = new _LMSgColorspace().visitOkLabColor(color);
    const lms = new _LMSColorspace().visitLMSgColor(lmsg);
    const xyzData = matMul(LMS_XYZ, [lms.l, lms.m, lms.s]);
    const XYZ = new Color.XYZ(xyzData[0], xyzData[1], xyzData[2]);
    return this.visitXYZColor(XYZ);
  }
  public visitOkLCHColor(color: InstanceType<typeof Color.OkLCH>) {
    const oklab = new ToOkLabColorspaceVisitor().visitOkLCHColor(color);
    return this.visitOkLabColor(oklab);
  }
}
