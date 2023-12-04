export { interpolateColor } from "./src/interpolate";
export { deltaOK } from "./src/distance";

import { Color } from "./src/colors";
import { CSS4GamutMapping } from "./src/gamut/rgb/cssInterpolation";

const origin = new Color.RGB(0.5, 1.2, 1.4);
const gammutAlgorithm = new CSS4GamutMapping()
const gammutMappedColor = gammutAlgorithm.visitRGBColor(origin)
console.log("gammutMappedColor", gammutMappedColor)