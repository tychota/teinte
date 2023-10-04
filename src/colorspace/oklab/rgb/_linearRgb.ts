import { Color } from "../../../colors";

import { matMul } from "../../../utils/matrixMultiplication";
import { srgb_to_linear } from "../../../utils/gamma";

import { XYZ_to_RGB } from "../../../constants";

export class _LinearRGB extends Color {
  name = "LinearRGB";
  constructor(public r: number, public g: number, public b: number) {
    super();
  }
}

export class _LinearRgbColorspace {
  public visitRGBColor(color: InstanceType<typeof Color.RGB>) {
    return new _LinearRGB(srgb_to_linear(color.r), srgb_to_linear(color.g), srgb_to_linear(color.b));
  }
  public visitXYZColor(color: InstanceType<typeof Color.XYZ>) {
    const linearRGB = matMul(XYZ_to_RGB, [color.x, color.y, color.z]);
    return new _LinearRGB(linearRGB[0], linearRGB[1], linearRGB[2]);
  }
}
