const randomBetween = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min) + min);
};

const RGB_MIN = 0;
const RGB_MAX = 255;

export function randomColor() {
  return {
    r: randomBetween(RGB_MIN, RGB_MAX),
    g: randomBetween(RGB_MIN, RGB_MAX),
    b: randomBetween(RGB_MIN, RGB_MAX),
  };
}

export function randomRatio() {
  return Math.random();
}
