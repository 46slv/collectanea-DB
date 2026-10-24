// Directional line average for an educational display-encoded 8-bit grayscale image.
// This is a spatial filter, not a physically calibrated shutter integration.
export const DIRECTIONAL_WIDTH = 384;
export const DIRECTIONAL_HEIGHT = 160;
export const DIRECTIONAL_INITIAL = Object.freeze({pattern: 'lights', radius: 7, angle: 0});

export function makeDirectionalPattern(width, height, pattern = 'lights') {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 ||
      !['lights', 'edges'].includes(pattern)) throw new RangeError('画像条件が不正です。');
  const result = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let value = 28;
    if (pattern === 'lights') {
      for (const [cx, cy, strength] of [[0.25, 0.36, 227], [0.7, 0.64, 197]]) {
        const dx = x - width * cx, dy = y - height * cy;
        if (dx * dx + dy * dy < 4 * 4) value = Math.max(value, strength);
      }
      if (Math.abs(x - width * 0.52) <= 1 && y > height * 0.12 && y < height * 0.85)
        value = 245;
    } else {
      if (x > width * 0.12 && x < width * 0.48 && y > height * 0.2 && y < height * 0.76)
        value = 212;
      if (Math.abs(y - (0.43 * x - height * 0.45)) < 1.1) value = 250;
      if (x > width * 0.67 && x < width * 0.72 && y > height * 0.15 && y < height * 0.9)
        value = 166;
    }
    result[y * width + x] = value;
  }
  return result;
}

function linearSample(input, width, height, x, y) {
  const sx = Math.max(0, Math.min(width - 1, x));
  const sy = Math.max(0, Math.min(height - 1, y));
  const x0 = Math.floor(sx), y0 = Math.floor(sy);
  const x1 = Math.min(width - 1, x0 + 1), y1 = Math.min(height - 1, y0 + 1);
  const tx = sx - x0, ty = sy - y0;
  const upper = input[y0 * width + x0] * (1 - tx) + input[y0 * width + x1] * tx;
  const lower = input[y1 * width + x0] * (1 - tx) + input[y1 * width + x1] * tx;
  return upper * (1 - ty) + lower * ty;
}

/** Symmetric (2r+1)-tap uniform line average at theta degrees, with bilinear samples. */
export function directionalBlurGrayscale(input, width, height, radius = 7, angle = 0) {
  if (!(input instanceof Uint8ClampedArray) ||
      !Number.isInteger(width) || !Number.isInteger(height) ||
      width < 1 || height < 1 || input.length !== width * height)
    throw new RangeError('画像サイズと8-bitグレースケール画素が一致しません。');
  if (!Number.isInteger(radius) || radius < 0 || radius > 16 ||
      !Number.isFinite(angle) || angle < 0 || angle > 180)
    throw new RangeError('半径は0〜16整数、方向は0〜180度で指定してください。');
  if (radius === 0) return input.slice();
  const radians = (angle === 180 ? 0 : angle) * Math.PI / 180;
  const cosine = Math.cos(radians), sine = Math.sin(radians);
  const dx = Math.abs(cosine) < 1e-12 ? 0 : cosine;
  const dy = Math.abs(sine) < 1e-12 ? 0 : sine;
  const count = 2 * radius + 1;
  const output = new Uint8ClampedArray(input.length);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let tap = -radius; tap <= radius; tap++)
      sum += linearSample(input, width, height, x + tap * dx, y + tap * dy);
    output[y * width + x] = sum / count;
  }
  return output;
}
