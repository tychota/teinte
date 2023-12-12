import { Color } from "../../colors";

import { matMul } from "../../utils/matrixMultiplication";
import { _LMSg } from "./_lmsg";

import { XYZ_LMS } from "../../constants";

export class _LMS extends Color {
  name = "LMS";
  constructor(public l: number, public m: number, public s: number) {
    super();
  }
  clip(): void {
    throw new Error("Method not implemented.");
  }
  clone(): void {
    throw new Error("Method not implemented.");
  }
}

export class _LMSColorspace {
  visitXYZColor(color: InstanceType<typeof Color.XYZ>): _LMS {
    const LMS = matMul(XYZ_LMS, [color.x, color.y, color.z]);
    return new _LMS(LMS[0], LMS[1], LMS[2]);
  }
  visitLMSgColor(color: _LMSg): _LMS {
    return new _LMS(color.l ** 3, color.m ** 3, color.s ** 3);
  }
}
