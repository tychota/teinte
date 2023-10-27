# Teinte

Teinte is a library to handle color interpolation.

Usage:

```ts
import { interpolateColor } from "@bam.tech/teinte";

const color1 = { r: 255, g: 0, b: 0 };
const color2 = { r: 0, g: 255, b: 0 };
const ratio = 0.5;
const colorspace = "oklab";
const gamutMapping = "adaptativeL05-5";

const color = interpolateColor(color1, color2, ratio, colorspace, gamutMapping);
```

Arguments are:
- color1: first RGB color
- color2: second RGB color
- ratio: interpolation ratio between 0 and 1
- colorspace: colorspace to use for interpolation. Can be "rgb" | "hsl" | "oklab" | "oklch". Is "oklab" by default
- gamutMapping: gamut mapping to use for interpolation. Can be "clamp" | "gray" | "preserveChroma" | "projectTo05" | "projectToLCusp" | "adaptativeL05-005" | "adaptativeL05-05" | "adaptativeL05-5" | "adaptativeLcusp-005" | "adaptativeLcusp-05" | "adaptativeLcusp-5"

See https://bottosson.github.io/posts/gamutclipping/ for more information about gamut mapping.


## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.3. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
