import { Color } from "../../colors";
import { matMul } from "../../utils/matrixMultiplication";

import { _LMS } from "./_lms";

import { OkLab_LMSg } from "../../constants";

export class _LMSg extends Color {
  name = "LMSg";
  constructor(public l: number, public m: number, public s: number) {
    super();
  }
}

export class _LMSgColorspace {
  visitLMSColor(color: _LMS): _LMSg {
    return new _LMSg(color.l ** (1 / 3), color.m ** (1 / 3), color.s ** (1 / 3));
  }
  visitOkLabColor(color: InstanceType<typeof Color.OkLab>) {
    const LMSg = matMul(OkLab_LMSg, [color.l, color.a, color.b]);
    return new _LMSg(LMSg[0], LMSg[1], LMSg[2]);
  }
}
