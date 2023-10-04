import { Benchmark } from "../../../benchmark/utils/benchmark";
import { Color } from "../../colors";
import { ToRGBColorspaceVisitor } from "../../colorspace/rgb";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const benchmark = Benchmark.getInstance();

export class ClampToRGBColorVisitor extends ToRGBColorspaceVisitor {
  public visitRGBColor(color: InstanceType<typeof Color.RGB>) {
    benchmark.recordMark("[Naive Interpolation] TargetSpace -> RGB (end)");
    benchmark.recordMark("[Clamp] Mapping (start)");
    const mappedColor = new Color.RGB(clamp(color.r, 0, 1), clamp(color.g, 0, 1), clamp(color.b, 0, 1));
    benchmark.recordMark("[Clamp] Mapping (end)");
    return mappedColor;
  }
}
