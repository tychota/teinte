export function srgb_to_linear(srgb: number) {
  let srgb_sign = srgb < 0 ? -1 : 1;
  let srgb_abs = srgb * srgb_sign;

  if (srgb_abs <= 0.04045) {
    return srgb / 12.92;
  } else {
    return srgb_sign * Math.pow((srgb_abs + 0.055) / 1.055, 2.4);
  }
}

export function linear_to_srgb(linear: number) {
  let linear_sign = linear < 0 ? -1 : 1;
  let linear_abs = linear * linear_sign;

  if (linear_abs <= 0.0031308) {
    return linear * 12.92;
  } else {
    return linear_sign * (1.055 * Math.pow(linear_abs, 1 / 2.4) - 0.055);
  }
}
