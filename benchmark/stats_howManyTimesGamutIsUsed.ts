import { OkLabInterpolateGamutMapping } from "../src/gamut/rgb/oklab.ts";
import { interpolateColor } from "../src/interpolate.ts";

export class IsLowerPart extends Error {
  name: string = "IsLowerPart";
}
export class IsUpperPart extends Error {
  name: string = "IsUpperPart";
}

OkLabInterpolateGamutMapping.prototype["findGamutIntersection"] = function (
  a: number,
  b: number,
  L1: number,
  C1: number,
  L0: number
): number {
  // @ts-ignore
  const { l: l_cusp, c: c_cusp } = this.findCusp(a, b);
  const willIntersectWithLowerHalf = (L1 - L0) * c_cusp - (l_cusp - L0) * C1 <= 0;

  if (willIntersectWithLowerHalf) {
    throw new IsLowerPart();
  } else {
    throw new IsUpperPart();
  }
};

const upperPart: { c1: {}; c2: {}; ratio: number }[] = [];
const lowerPart: { c1: {}; c2: {}; ratio: number }[] = [];

const randomBetween = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min) + min);
};

const RGB_MIN = 0;
const RGB_MAX = 255;

const tryInterpolate = () => {
  const r1 = randomBetween(RGB_MIN, RGB_MAX);
  const g1 = randomBetween(RGB_MIN, RGB_MAX);
  const b1 = randomBetween(RGB_MIN, RGB_MAX);

  const r2 = randomBetween(RGB_MIN, RGB_MAX);
  const g2 = randomBetween(RGB_MIN, RGB_MAX);
  const b2 = randomBetween(RGB_MIN, RGB_MAX);

  const c1 = { r: r1, g: g1, b: b1 };
  const c2 = { r: r2, g: g2, b: b2 };

  const ratio = Math.random();

  const interpolate = () => interpolateColor(c1, c2, ratio, "oklab", "adaptativeLcusp-5");

  try {
    interpolate();
  } catch (e) {
    if (e instanceof Error) {
      const name = e.name;

      if (name === "IsLowerPart") {
        lowerPart.push({ c1, c2, ratio });
      }
      if (name === "IsUpperPart") {
        upperPart.push({ c1, c2, ratio });
      }
    }
  }
};

const repeat = (n: number, f: () => void) => {
  for (let i = 0; i < n; i++) {
    f();
  }
};

const nb_test = 1000000;

repeat(nb_test, tryInterpolate);

const noGamutOccurences = nb_test - upperPart.length - lowerPart.length;
const gamutLowerOccurences = lowerPart.length;
const gamutUpperOccurences = upperPart.length;

// prettier-ignore
console.log(`No gamut maping, only RGB -> Oklab -> RGB: \t ${noGamutOccurences} times, \t so ${(noGamutOccurences / nb_test) * 100}%`);
// prettier-ignore
console.log(`Gamut maping, lower part (simplex):   \t\t ${gamutLowerOccurences} times, \t so ${(gamutLowerOccurences / nb_test) * 100}%`);
// prettier-ignore
console.log(`Gamut maping, upper part (complexe):   \t\t ${gamutUpperOccurences} times, \t so ${(gamutUpperOccurences / nb_test) * 100}%`);

console.log(
  JSON.stringify(
    lowerPart.find(({ ratio }) => ratio < 0.505 && ratio > 0.495),
    null,
    2
  )
);
console.log(
  JSON.stringify(
    upperPart.find(({ ratio }) => ratio < 0.55 && ratio > 0.45),
    null,
    2
  )
);
