// import { Benchmark } from "../../../benchmark/utils/benchmark";

import { Color } from "../../colors";
import { ToOkLabColorspaceVisitor } from "../../colorspace/oklab";
import { ToOkLCHColorspaceVisitor } from "../../colorspace/oklch";
import { ToRGBColorspaceVisitor } from "../../colorspace/rgb";
import { ClampToRGBColorVisitor } from "./clamp";

const HALLEY_STEPS_NB = 3;
const EPSILON = 0.1;

const clamp = (x: number, min: number, max: number) => Math.min(Math.max(x, min), max);

const repeat = (fn: Function, times: number) => {
  for (let i = 0; i < times; i++) {
    fn();
  }
};

// const benchmark = Benchmark.getInstance();

abstract class OkLabGamutMapping extends ToRGBColorspaceVisitor {
  abstract gamutMap(color: InstanceType<typeof Color.OkLab>): InstanceType<typeof Color.OkLab>;

  rgbVisitor = new ToRGBColorspaceVisitor();

  public visitRGBColor(color: InstanceType<typeof Color.RGB>) {
    // benchmark.recordMark("[Naive Interpolation] TargetSpace -> RGB (end)");    
    if (color.r < 0 - EPSILON || color.r > 1 + EPSILON || color.g < 0 - EPSILON || color.g > 1 + EPSILON || color.b < 0 - EPSILON || color.b > 1 + EPSILON) {
      const okLabColorspace = new ToOkLabColorspaceVisitor();
      // benchmark.recordMark("[Gamut oklab] RGB -> TargetSpace (start)");
      const oklab = okLabColorspace.visitRGBColor(color);
      // benchmark.recordMark("[Gamut oklab] RGB -> TargetSpace (end)");
      // benchmark.recordMark("[Gamut oklab] Projection (start)");
      const mappedOklab = this.gamutMap(oklab);
      // benchmark.recordMark("[Gamut oklab] Projection (end)");
      // benchmark.recordMark("[Gamut oklab] TargetSpace -> RGB (start)");
      const rgb = this.rgbVisitor.visitOkLabColor(mappedOklab);
      // benchmark.recordMark("[Gamut oklab] TargetSpace -> RGB (end)");
      // benchmark.recordMark("[Gamut oklab] TargetSpace -> RGB (end)");
      const clampVisitor = new ClampToRGBColorVisitor();
      return clampVisitor.visitRGBColor(rgb);
    } else {
      // benchmark.recordMark("[Gamut oklab] RGB -> TargetSpace (start)");
      // benchmark.recordMark("[Gamut oklab] RGB -> TargetSpace (end)");
      // benchmark.recordMark("[Gamut oklab] Projection (start)");
      // benchmark.recordMark("[Gamut oklab] Projection (end)");
      // benchmark.recordMark("[Gamut oklab] TargetSpace -> RGB (start)");
      // benchmark.recordMark("[Gamut oklab] TargetSpace -> RGB (end)");
      // benchmark.recordMark("[Gamut oklab] Find cusp (start)");
      // benchmark.recordMark("[Gamut oklab] Find cusp (end)");
      // benchmark.recordMark("[Gamut oklab] Find intersection (start)");
      // benchmark.recordMark("[Gamut oklab] Find intersection - Upper Gamut (start)");
      // benchmark.recordMark("[Gamut oklab] Find intersection - Lower Gamut (start)");
      // benchmark.recordMark("[Gamut oklab] Find intersection (end)");
      // benchmark.recordMark("[Clamp] Mapping (start)");
      // benchmark.recordMark("[Clamp] Mapping (end)");
      const clampVisitor = new ClampToRGBColorVisitor();
      return clampVisitor.visitRGBColor(color);
    }
  }
  public visitHSLColor(color: InstanceType<typeof Color.HSL>) {
    const rgb = this.rgbVisitor.visitHSLColor(color);
    return this.visitRGBColor(rgb);
  }
  public visitXYZColor(color: InstanceType<typeof Color.XYZ>) {
    const rgb = this.rgbVisitor.visitXYZColor(color);
    return this.visitRGBColor(rgb);
  }
  public visitOkLabColor(color: InstanceType<typeof Color.OkLab>) {
    const rgb = this.rgbVisitor.visitOkLabColor(color);
    return this.visitRGBColor(rgb);
  }
  public visitOkLCHColor(color: InstanceType<typeof Color.OkLCH>) {
    const rgb = this.rgbVisitor.visitOkLCHColor(color);
    return this.visitRGBColor(rgb);
  }
}

export class GreyOutOfRange extends OkLabGamutMapping {
  public gamutMap(color: InstanceType<typeof Color.OkLab>): InstanceType<typeof Color.OkLab> {
    const oklch = new ToOkLCHColorspaceVisitor().visitOkLabColor(color);
    const l = oklch.l;
    const c = 0;
    const h = oklch.h;
    const greyOkLch = new Color.OkLCH(l, c, h);
    const greyOkLab = new ToOkLabColorspaceVisitor().visitOkLCHColor(greyOkLch);
    return greyOkLab;
  }
}

export abstract class OkLabInterpolateGamutMapping extends OkLabGamutMapping {
  /**
   * Compute the maximum saturation for a given hue that fits in sRGB
   * Saturation here is defined as S = C/L
   * Note: a and b must be normalized so that a^2 + b^2 = 1
   * @param a
   * @param b
   * @returns
   */
  protected computeMaxSaturation(a: number, b: number) {
    // Max saturation will be when one of r, g or b goes below zero.

    // Select different coefficients depending on which component goes below zero first
    let k0: number, k1: number, k2: number, k3: number, k4: number, wl: number, wm: number, ws: number;

    if (-1.88170328 * a - 0.80936493 * b > 1) {
      // Red component goes under zero first
      k0 = +1.19086277;
      k1 = +1.76576728;
      k2 = +0.59662641;
      k3 = +0.75515197;
      k4 = +0.56771245;
      wl = +4.0767416621;
      wm = -3.3077115913;
      ws = +0.2309699292;
    } else if (1.81444104 * a - 1.19445276 * b > 1) {
      // Green component goes under zero first
      k0 = +0.73956515;
      k1 = -0.45954404;
      k2 = +0.08285427;
      k3 = +0.1254107;
      k4 = +0.14503204;
      wl = -1.2684380046;
      wm = +2.6097574011;
      ws = -0.3413193965;
    } else {
      // Blue component goes under zero first
      k0 = +1.35733652;
      k1 = -0.00915799;
      k2 = -1.1513021;
      k3 = -0.50559606;
      k4 = +0.00692167;
      wl = -0.0041960863;
      wm = -0.7034186147;
      ws = +1.707614701;
    }

    // Approximate max saturation using a polynomial
    let maxSaturation = k0 + k1 * a + k2 * b + k3 * a * a + k4 * a * b;

    // Do one step Halley's method to get closer
    // this gives an error less than 10e6, except for some blue hues where the dS/dh is close to infinite
    // this should be sufficient for most applications, otherwise do two/three steps

    let k_l = +0.3963377774 * a + 0.2158037573 * b;
    let k_m = -0.1055613458 * a - 0.0638541728 * b;
    let k_s = -0.0894841775 * a - 1.291485548 * b;

    const halleyStep = () => {
      let l_ = 1 + maxSaturation * k_l;
      let m_ = 1 + maxSaturation * k_m;
      let s_ = 1 + maxSaturation * k_s;

      let l = l_ ** 3;
      let m = m_ ** 3;
      let s = s_ ** 3;

      let l_dS = 3 * k_l * l_ * l_;
      let m_dS = 3 * k_m * m_ * m_;
      let s_dS = 3 * k_s * s_ * s_;

      let l_dS2 = 6 * k_l * k_l * l_;
      let m_dS2 = 6 * k_m * k_m * m_;
      let s_dS2 = 6 * k_s * k_s * s_;

      let f = wl * l + wm * m + ws * s;
      let f_dS = wl * l_dS + wm * m_dS + ws * s_dS;
      let f_dS2 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;

      maxSaturation = maxSaturation - (f * f_dS) / (f_dS * f_dS - 0.5 * f * f_dS2);
    };

    repeat(halleyStep, HALLEY_STEPS_NB);

    return maxSaturation;
  }

  /**
   * Finds the L and C values of the cusp of the gamut boundary for a given hue
   * Note: a and b must be normalized so that a^2 + b^2 = 1
   *
   * @param a
   * @param b
   * @returns
   */
  protected findCusp(a: number, b: number): { l: number; c: number } {
    // benchmark.recordMark("[Gamut oklab] Find cusp (start)");
    let S_cusp = this.computeMaxSaturation(a, b);

    let oklab_at_max = new Color.OkLab(1, S_cusp * a, S_cusp * b);
    let rgb_at_max = new ToRGBColorspaceVisitor().visitOkLabColor(oklab_at_max);

    let l_cusp = Math.cbrt(1 / Math.max(rgb_at_max.r, rgb_at_max.g, rgb_at_max.b));
    let c_cusp = S_cusp * l_cusp;

    // benchmark.recordMark("[Gamut oklab] Find cusp (end)");

    return { l: l_cusp, c: c_cusp };
  }

  /**
   * Finds intersection of the line deined by
   * L = L0 * (1 - t) + L1 * t
   * C = t * C1
   * Note: a and b must be normalized so that a^2 + b^2 = 1
   * @param a
   * @param b
   */
  protected findGamutIntersection(a: number, b: number, L1: number, C1: number, L0: number): number {
    // benchmark.recordMark("[Gamut oklab] Find intersection (start)");
    const { l: l_cusp, c: c_cusp } = this.findCusp(a, b);

    let t: number;

    const willIntersectWithLowerHalf = (L1 - L0) * c_cusp - (l_cusp - L0) * C1 <= 0;

    if (willIntersectWithLowerHalf) {
      // benchmark.recordMark("[Gamut oklab] Find intersection - Lower Gamut (start)");
      t = (c_cusp * L0) / (C1 * l_cusp + c_cusp * (L0 - L1));
    } else {
      // benchmark.recordMark("[Gamut oklab] Find intersection - Upper Gamut (start)");
      t = (c_cusp * (L0 - 1)) / (C1 * (l_cusp - 1) + c_cusp * (L0 - L1));

      const halleyStep = () => {
        let dL = L1 - L0;
        let dC = C1 - 0;

        let k_l = +0.3963377774 * a + 0.2158037573 * b;
        let k_m = -0.1055613458 * a - 0.0638541728 * b;
        let k_s = -0.0894841775 * a - 1.291485548 * b;

        let l_dt = dL + dC * k_l;
        let m_dt = dL + dC * k_m;
        let s_dt = dL + dC * k_s;

        let L = L0 * (1 - t) + L1 * t;
        let C = t * C1;

        let l_ = L + C * k_l;
        let m_ = L + C * k_m;
        let s_ = L + C * k_s;

        let l = l_ ** 3;
        let m = m_ ** 3;
        let s = s_ ** 3;

        let ldt = 3 * l_dt * l_ * l_;
        let mdt = 3 * m_dt * m_ * m_;
        let sdt = 3 * s_dt * s_ * s_;

        let ldt2 = 6 * l_dt * l_dt * l_;
        let mdt2 = 6 * m_dt * m_dt * m_;
        let sdt2 = 6 * s_dt * s_dt * s_;

        let cr = l * 4.0767416621 + m * -3.3077115913 + s * 0.2309699292 - 1;
        let cr_dt = ldt * 4.0767416621 + mdt * -3.3077115913 + sdt * 0.2309699292;
        let cr_dt2 = ldt2 * 4.0767416621 + mdt2 * -3.3077115913 + sdt2 * 0.2309699292;

        let u_cr = cr_dt / (cr_dt * cr_dt - 0.5 * cr * cr_dt2);
        let t_cr = -cr * u_cr;

        let cg = l * -1.2684380046 + m * 2.6097574011 + s * -0.3413193965 - 1;
        let cg_dt = ldt * -1.2684380046 + mdt * 2.6097574011 + sdt * -0.3413193965;
        let cg_dt2 = ldt2 * -1.2684380046 + mdt2 * 2.6097574011 + sdt2 * -0.3413193965;

        let u_cg = cg_dt / (cg_dt * cg_dt - 0.5 * cg * cg_dt2);
        let t_cg = -cg * u_cg;

        let cb = l * -0.0041960863 + m * -0.7034186147 + s * 1.707614701 - 1;
        let cb_dt = ldt * -0.0041960863 + mdt * -0.7034186147 + sdt * 1.707614701;
        let cb_dt2 = ldt2 * -0.0041960863 + mdt2 * -0.7034186147 + sdt2 * 1.707614701;

        let u_cb = cb_dt / (cb_dt * cb_dt - 0.5 * cb * cb_dt2);
        let t_cb = -cb * u_cb;

        t_cr = u_cr >= 0 ? t_cr : Number.MAX_SAFE_INTEGER;
        t_cg = u_cg >= 0 ? t_cg : Number.MAX_SAFE_INTEGER;
        t_cb = u_cb >= 0 ? t_cb : Number.MAX_SAFE_INTEGER;

        //console.log("t_cr", t_cr, "t_cg", t_cg, "t_cb", t_cb);

        t += Math.min(t_cr, t_cg, t_cb);
      };

      repeat(halleyStep, HALLEY_STEPS_NB);
    }

    // benchmark.recordMark("[Gamut oklab] Find intersection (end)");

    return t;
  }
}

export class OkLabGamutClipPreserveChroma extends OkLabInterpolateGamutMapping {
  gamutMap(color: InstanceType<typeof Color.OkLab>): InstanceType<typeof Color.OkLab> {
    const oklab = color;
    const oklch = new ToOkLCHColorspaceVisitor().visitOkLabColor(oklab);
    const l = oklch.l;
    const c = oklch.c;
    const h = oklch.h;

    const a = oklab.a / c;
    const b = oklab.b / c;

    const L0 = clamp(l, 0, 1);
    const t = this.findGamutIntersection(a, b, l, c, L0);
    const l_clip = L0 * (1 - t) + l * t;
    const c_clip = t * c;

    const oklch_clip = new Color.OkLCH(l_clip, c_clip, h);
    const oklab_clip = new ToOkLabColorspaceVisitor().visitOkLCHColor(oklch_clip);

    return oklab_clip;
  }
}

export class OkLabGamutClipProjectTo05 extends OkLabInterpolateGamutMapping {
  gamutMap(color: InstanceType<typeof Color.OkLab>): InstanceType<typeof Color.OkLab> {
    const oklab = color;
    const oklch = new ToOkLCHColorspaceVisitor().visitOkLabColor(oklab);
    const l = oklch.l;
    const c = oklch.c;
    const h = oklch.h;

    const a = oklab.a / c;
    const b = oklab.b / c;

    const L0 = 0.5;

    const t = this.findGamutIntersection(a, b, l, c, L0);
    const l_clip = L0 * (1 - t) + l * t;
    const c_clip = t * c;

    const oklch_clip = new Color.OkLCH(l_clip, c_clip, h);
    const oklab_clip = new ToOkLabColorspaceVisitor().visitOkLCHColor(oklch_clip);

    return oklab_clip;
  }
}

export class OkLabGamutClipProjectToLCusp extends OkLabInterpolateGamutMapping {
  gamutMap(color: InstanceType<typeof Color.OkLab>): InstanceType<typeof Color.OkLab> {
    const oklab = color;
    const oklch = new ToOkLCHColorspaceVisitor().visitOkLabColor(oklab);
    const l = oklch.l;
    const c = oklch.c;
    const h = oklch.h;

    const a = oklab.a / c;
    const b = oklab.b / c;

    const cusp = this.findCusp(a, b);

    const L0 = cusp.l;

    const t = this.findGamutIntersection(a, b, l, c, L0);
    const l_clip = L0 * (1 - t) + l * t;
    const c_clip = t * c;

    const oklch_clip = new Color.OkLCH(l_clip, c_clip, h);
    const oklab_clip = new ToOkLabColorspaceVisitor().visitOkLCHColor(oklch_clip);

    return oklab_clip;
  }
}

export class OkLabGamutClipAdaptativeL05 extends OkLabInterpolateGamutMapping {
  constructor(private aplha: number) {
    super();
  }
  gamutMap(color: InstanceType<typeof Color.OkLab>): InstanceType<typeof Color.OkLab> {
    const oklab = color;
    const oklch = new ToOkLCHColorspaceVisitor().visitOkLabColor(oklab);
    const l = oklch.l;
    const c = oklch.c;
    const h = oklch.h;

    const a = oklab.a / c;
    const b = oklab.b / c;

    const ld = l - 0.5;
    const e1 = 0.5 + Math.abs(ld) + this.aplha * c;
    const l0 = 0.5 * (1 + Math.sign(ld) * (e1 - Math.sqrt(e1 * e1 - 2 * Math.abs(ld))));

    const t = this.findGamutIntersection(a, b, l, c, l0);
    const l_clip = l0 * (1 - t) + l * t;
    const c_clip = t * c;

    const oklch_clip = new Color.OkLCH(l_clip, c_clip, h);
    const oklab_clip = new ToOkLabColorspaceVisitor().visitOkLCHColor(oklch_clip);

    return oklab_clip;
  }
}

export class OkLabGamutClipAdaptativeLcusp extends OkLabInterpolateGamutMapping {
  constructor(private aplha: number) {
    super();
  }
  gamutMap(color: InstanceType<typeof Color.OkLab>): InstanceType<typeof Color.OkLab> {
    const oklab = color;
    const oklch = new ToOkLCHColorspaceVisitor().visitOkLabColor(oklab);
    const l = oklch.l;
    const c = oklch.c;
    const h = oklch.h;

    const a = oklab.a / c;
    const b = oklab.b / c;

    const cusp = this.findCusp(a, b);

    const ld = l - cusp.l;
    const k = 2 * (ld > 0 ? 1 - cusp.l : cusp.l);
    const e1 = 0.5 * k + Math.abs(ld) + (this.aplha * c) / k;
    const l0 = cusp.l + 0.5 * (Math.sign(ld) * (e1 - Math.sqrt(e1 * e1 - 2 * k * Math.abs(ld))));

    const t = this.findGamutIntersection(a, b, l, c, l0);
    const l_clip = l0 * (1 - t) + l * t;
    const c_clip = t * c;

    const oklch_clip = new Color.OkLCH(l_clip, c_clip, h);
    const oklab_clip = new ToOkLabColorspaceVisitor().visitOkLCHColor(oklch_clip);

    return oklab_clip;
  }
}
