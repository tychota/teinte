import fs from "fs";

import { interpolateColor } from "..";

import { Benchmark } from "./utils/benchmark";
import { randomColor, randomRatio } from "./utils/random";

const benchmark = Benchmark.getInstance();

benchmark.addMark("Calibration (start)");
benchmark.addMark("Calibration (end)");

benchmark.addMark("Start");
benchmark.addMark("[Naive Interpolation] RGB -> TargetSpace (start)");
benchmark.addMark("[Naive Interpolation] RGB -> TargetSpace (end)");
benchmark.addMark("[Naive Interpolation] Interpolation (start)");
benchmark.addMark("[Naive Interpolation] Interpolation (end)");
benchmark.addMark("[Naive Interpolation] TargetSpace -> RGB (start)");
benchmark.addMark("[Naive Interpolation] TargetSpace -> RGB (end)");
benchmark.addMark("[Gamut oklab] RGB -> TargetSpace (start)");
benchmark.addMark("[Gamut oklab] RGB -> TargetSpace (end)");
benchmark.addMark("[Gamut oklab] Projection (start)");
benchmark.addMark("[Gamut oklab] Projection (end)");
benchmark.addMark("[Gamut oklab] TargetSpace -> RGB (start)");
benchmark.addMark("[Gamut oklab] TargetSpace -> RGB (end)");
benchmark.addMark("[Gamut oklab] Find cusp (start)");
benchmark.addMark("[Gamut oklab] Find cusp (end)");
benchmark.addMark("[Gamut oklab] Find intersection (start)");
benchmark.addMark("[Gamut oklab] Find intersection - Upper Gamut (start)");
benchmark.addMark("[Gamut oklab] Find intersection - Lower Gamut (start)");
benchmark.addMark("[Gamut oklab] Find intersection (end)");
benchmark.addMark("[Clamp] Mapping (start)");
benchmark.addMark("[Clamp] Mapping (end)");
benchmark.addMark("End");

benchmark.addFlow("Calibration", "Calibration (start)", "Calibration (end)");
benchmark.addFlow("Full interpolation", "Start", "End");
benchmark.addFlow(
  "010 [Naive Interpolation] - To target space",
  "[Naive Interpolation] RGB -> TargetSpace (start)",
  "[Naive Interpolation] RGB -> TargetSpace (end)"
);
benchmark.addFlow(
  "020 [Naive Interpolation] - Interpolation",
  "[Naive Interpolation] Interpolation (start)",
  "[Naive Interpolation] Interpolation (end)"
);
benchmark.addFlow(
  "030 [Naive Interpolation] - To RGB",
  "[Naive Interpolation] TargetSpace -> RGB (start)",
  "[Naive Interpolation] TargetSpace -> RGB (end)"
);

benchmark.addFlow(
  "100 [Gamut oklab] - To target space",
  "[Gamut oklab] RGB -> TargetSpace (start)",
  "[Gamut oklab] RGB -> TargetSpace (end)"
);
benchmark.addFlow(
  "110 [Gamut oklab] - Projection",
  "[Gamut oklab] Projection (start)",
  "[Gamut oklab] Projection (end)"
);
benchmark.addFlow("111 [Gamut oklab] - Find cusp", "[Gamut oklab] Find cusp (start)", "[Gamut oklab] Find cusp (end)");
benchmark.addFlow(
  "112 [Gamut oklab] - Find intersection",
  "[Gamut oklab] Find intersection (start)",
  "[Gamut oklab] Find intersection (end)"
);
benchmark.addFlow(
  "112 [Gamut oklab] - Find intersection - Upper Gamut",
  "[Gamut oklab] Find intersection - Upper Gamut (start)",
  "[Gamut oklab] Find intersection (end)"
);
benchmark.addFlow(
  "112 [Gamut oklab] - Find intersection - Lower Gamut",
  "[Gamut oklab] Find intersection - Lower Gamut (start)",
  "[Gamut oklab] Find intersection (end)"
);
benchmark.addFlow(
  "120 [Gamut oklab] - To RGB",
  "[Gamut oklab] TargetSpace -> RGB (start)",
  "[Gamut oklab] TargetSpace -> RGB (end)"
);

benchmark.addFlow("200 [Clamp] - Mapping", "[Clamp] Mapping (start)", "[Clamp] Mapping (end)");

const WARMUP_EXAMPLES = 10000;
const RECORDING_EXAMPLES = 1000000;

const space: Parameters<typeof interpolateColor>[3] = "oklab";
const gamutMappingStrategy: Parameters<typeof interpolateColor>[4] = "adaptativeL05-5";
const getColor1 = () => {
  // return { r: 120, g: 140, b: 160 }; // no gamut
  return { r: 11, g: 217, b: 194 }; // gamut lower
  // return { r: 250, g: 252, b: 253 }; // gamut upper
  // return randomColor();
};
const getColor2 = () => {
  // return { r: 70, g: 50, b: 100 }; // no gamut
  return { r: 3, g: 8, b: 194 }; // gamut lower
  // return { r: 252, g: 77, b: 174 }; // gamut upper
  // return randomColor();
};

benchmark.benchmark(
  () => {
    const color1 = getColor1();
    const color2 = getColor2();

    // const ratio = randomRatio();
    const ratio = 0.5 + 0.05 * (Math.random() - 0.5);

    interpolateColor(color1, color2, ratio, space, gamutMappingStrategy);
  },
  WARMUP_EXAMPLES,
  RECORDING_EXAMPLES
);

//console.log(benchmark.getResults());

const directory = `benchmark/data/interpolation/${space}/${gamutMappingStrategy}/lowerGamut`;

fs.mkdirSync(directory, { recursive: true });

benchmark.saveResults(directory);
