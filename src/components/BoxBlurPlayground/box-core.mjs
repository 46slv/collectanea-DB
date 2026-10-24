// Educational display-encoded 8-bit grayscale box blur; no host/HDR equivalence.
import {makeBlurTestPattern} from '../BlurPlayground/blur-core.mjs';

export const BOX_WIDTH = 384;
export const BOX_HEIGHT = 160;
export const BOX_INITIAL = Object.freeze({pattern: 'edges', radius: 3});
export {makeBlurTestPattern};

/**
 * Separable normalized square box kernel with edge-value extension.
 * Horizontal intermediates retain floating precision; quantize only at output.
 */
export function boxBlurGrayscale(input, width, height, radius = 3) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 ||
      !(input instanceof Uint8ClampedArray) || input.length !== width * height) {
    throw new RangeError('画像サイズと8-bitグレースケール画素が一致しません。');
  }
  if (!Number.isInteger(radius) || radius < 0 || radius > 16) {
    throw new RangeError('半径は0〜16の整数で指定してください。');
  }
  if (radius === 0) return input.slice();
  const size = 2 * radius + 1;
  const temp = new Float64Array(input.length);
  const result = new Uint8ClampedArray(input.length);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        sum += input[row + Math.max(0, Math.min(width - 1, x + dx))];
      }
      temp[row + x] = sum / size;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        sum += temp[Math.max(0, Math.min(height - 1, y + dy)) * width + x];
      }
      result[y * width + x] = sum / size;
    }
  }
  return result;
}

/** Discrete uniform kernel variance, for a Gaussian comparison at similar spread. */
export function equivalentGaussianSigma(radius) {
  if (!Number.isInteger(radius) || radius < 0 || radius > 16) {
    throw new RangeError('半径は0〜16の整数で指定してください。');
  }
  return Math.sqrt(radius * (radius + 1) / 3);
}
