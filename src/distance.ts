import { Color } from "./colors";
import { ToOkLabColorspaceVisitor } from "./colorspace/oklab";

interface RGB {
  r: number;
  g: number;
  b: number;
}

// TODO: this is not deltaEOK ? Invest why and the difference in color distance
export function deltaOK(c1: RGB, c2: RGB): number {
  const c1Rgb = new Color.RGB(c1.r / 255, c1.g / 255, c1.b / 255);
  const c2Rgb = new Color.RGB(c2.r / 255, c2.g / 255, c2.b / 255);

  const OkLabVisitor = new ToOkLabColorspaceVisitor();

  const c1OkLab = OkLabVisitor.visitRGBColor(c1Rgb);
  const c2OkLab = OkLabVisitor.visitRGBColor(c2Rgb);

  const delta_L = c1OkLab.l - c2OkLab.l;

  const chroma1 = Math.sqrt(c1OkLab.a * c1OkLab.a + c1OkLab.b * c1OkLab.b);
  const chroma2 = Math.sqrt(c2OkLab.a * c2OkLab.a + c2OkLab.b * c2OkLab.b);
  const delta_C = chroma1 - chroma2;

  const delta_a = c1OkLab.a - c2OkLab.a;
  const delta_b = c1OkLab.b - c2OkLab.b;
  
  const delta_H = Math.sqrt(delta_a * delta_a + delta_b * delta_b - delta_C * delta_C);

  return Math.sqrt(delta_L * delta_L + delta_C * delta_C + delta_H * delta_H);
}
