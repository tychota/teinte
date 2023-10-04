export function srgb_to_linear(srgb: number) {
  if (srgb <= 0.04045) {
    return srgb / 12.92;
  } else {
    return Math.pow((srgb + 0.055) / 1.055, 2.4);
  }
}

export function linear_to_srgb(linear: number) {
  if (linear <= 0.0031308) {
    return linear * 12.92;
  } else {
    return 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  }
}
