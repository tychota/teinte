// import { Benchmark } from "../benchmark/utils/benchmark";

import { Color, ColorspaceVisitor } from "./colors";
import { ToHSLColorspaceVisitor } from "./colorspace/hsl";
import { ToOkLabColorspaceVisitor } from "./colorspace/oklab";
import { ClampToRGBColorVisitor } from "./gamut/rgb/clamp";
import {
  GreyOutOfRange,
  OkLabGamutClipAdaptativeL05,
  OkLabGamutClipAdaptativeLcusp,
  OkLabGamutClipPreserveChroma,
  OkLabGamutClipProjectTo05,
  OkLabGamutClipProjectToLCusp,
} from "./gamut/rgb/oklab";

// const benchmark = Benchmark.getInstance();

interface RGB {
  r: number;
  g: number;
  b: number;
}

function interpolateValue<C extends Color, V extends keyof C>(color1: C, color2: C, value: V, t: number) {
  return (color1[value] as number) * (1 - t) + (color2[value] as number) * t;
}

export function interpolateColor(
  c1: RGB,
  c2: RGB,
  t: number,
  space: "rgb" | "hsl" | "oklab" | "oklch" = "oklab",
  gamutMappingStretegy:
    | "clamp"
    | "gray"
    | "preserveChroma"
    | "projectTo05"
    | "projectToLCusp"
    | "adaptativeL05-005"
    | "adaptativeL05-05"
    | "adaptativeL05-5"
    | "adaptativeLcusp-005"
    | "adaptativeLcusp-05"
    | "adaptativeLcusp-5" = "gray"
): RGB {
  const c1Rgb = new Color.RGB(c1.r / 255, c1.g / 255, c1.b / 255);
  const c2Rgb = new Color.RGB(c2.r / 255, c2.g / 255, c2.b / 255);

  // benchmark.recordMark("Calibration (start)");
  // benchmark.recordMark("Calibration (end)");

  // benchmark.recordMark("Start");

  let interpolatedColor: Color;
  let interpolationVisitor: ColorspaceVisitor<any>;

  switch (space) {
    case "rgb":
      // benchmark.recordMark("[Naive Interpolation] Interpolation (start)");
      interpolatedColor = new Color.RGB(
        interpolateValue(c1Rgb, c2Rgb, "r", t),
        interpolateValue(c1Rgb, c2Rgb, "g", t),
        interpolateValue(c1Rgb, c2Rgb, "b", t)
      );
      break;
    case "hsl":
      interpolationVisitor = new ToHSLColorspaceVisitor();
      // benchmark.recordMark("[Naive Interpolation] RGB -> TargetSpace (start)");
      const c1Hcl = interpolationVisitor.visitRGBColor(c1Rgb);
      const c2Hcl = interpolationVisitor.visitRGBColor(c2Rgb);
      // benchmark.recordMark("[Naive Interpolation] RGB -> TargetSpace (end)");
      // benchmark.recordMark("[Naive Interpolation] Interpolation (start)");
      interpolatedColor = new Color.HSL(
        interpolateValue(c1Hcl, c2Hcl, "h", t),
        interpolateValue(c1Hcl, c2Hcl, "s", t),
        interpolateValue(c1Hcl, c2Hcl, "l", t)
      );
      // benchmark.recordMark("[Naive Interpolation] Interpolation (end)");
      break;
    case "oklab":
      interpolationVisitor = new ToOkLabColorspaceVisitor();
      // benchmark.recordMark("[Naive Interpolation] RGB -> TargetSpace (start)");
      const c1OkLab = interpolationVisitor.visitRGBColor(c1Rgb);
      const c2OkLab = interpolationVisitor.visitRGBColor(c2Rgb);
      // benchmark.recordMark("[Naive Interpolation] RGB -> TargetSpace (end)");
      // benchmark.recordMark("[Naive Interpolation] Interpolation (start)");
      interpolatedColor = new Color.OkLab(
        interpolateValue(c1OkLab, c2OkLab, "l", t),
        interpolateValue(c1OkLab, c2OkLab, "a", t),
        interpolateValue(c1OkLab, c2OkLab, "b", t)
      );
      // benchmark.recordMark("[Naive Interpolation] Interpolation (end)");
      break;
    case "oklch":
      // benchmark.recordMark("[Naive Interpolation] RGB -> TargetSpace (start)");
      interpolationVisitor = new ToOkLabColorspaceVisitor();
      const c1OkLCH = interpolationVisitor.visitRGBColor(c1Rgb);
      const c2OkLCH = interpolationVisitor.visitRGBColor(c2Rgb);
      // benchmark.recordMark("[Naive Interpolation] RGB -> TargetSpace (end)");
      // benchmark.recordMark("[Naive Interpolation] Interpolation (start)");
      interpolatedColor = new Color.OkLCH(
        interpolateValue(c1OkLCH, c2OkLCH, "l", t),
        interpolateValue(c1OkLCH, c2OkLCH, "c", t),
        interpolateValue(c1OkLCH, c2OkLCH, "h", t)
      );
      // benchmark.recordMark("[Naive Interpolation] Interpolation (end)");
      break;
  }
  // benchmark.recordMark("[Naive Interpolation] TargetSpace -> RGB (start)");

  let mappedColor: InstanceType<typeof Color.RGB>;
  let gamutMappingVisitor: ColorspaceVisitor<InstanceType<typeof Color.RGB>>;
  switch (gamutMappingStretegy) {
    case "clamp":
      gamutMappingVisitor = new ClampToRGBColorVisitor();
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "gray":
      gamutMappingVisitor = new GreyOutOfRange();
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "preserveChroma":
      gamutMappingVisitor = new OkLabGamutClipPreserveChroma();
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "projectTo05":
      gamutMappingVisitor = new OkLabGamutClipProjectTo05();
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "projectToLCusp":
      gamutMappingVisitor = new OkLabGamutClipProjectToLCusp();
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "adaptativeL05-005":
      gamutMappingVisitor = new OkLabGamutClipAdaptativeL05(0.05);
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "adaptativeL05-05":
      gamutMappingVisitor = new OkLabGamutClipAdaptativeL05(0.5);
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "adaptativeL05-5":
      gamutMappingVisitor = new OkLabGamutClipAdaptativeL05(5);
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "adaptativeLcusp-005":
      gamutMappingVisitor = new OkLabGamutClipAdaptativeLcusp(0.05);
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "adaptativeLcusp-05":
      gamutMappingVisitor = new OkLabGamutClipAdaptativeLcusp(0.5);
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
    case "adaptativeLcusp-5":
      gamutMappingVisitor = new OkLabGamutClipAdaptativeLcusp(5);
      mappedColor = interpolatedColor.accept(gamutMappingVisitor) as InstanceType<typeof Color.RGB>;
      break;
  }

  // benchmark.recordMark("End");

  return { r: Math.round(mappedColor.r * 255), g: Math.round(mappedColor.g * 255), b: Math.round(mappedColor.b * 255) };
}
