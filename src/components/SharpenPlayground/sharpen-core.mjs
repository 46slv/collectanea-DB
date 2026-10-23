import {gaussianBlurGrayscale} from '../BlurPlayground/blur-core.mjs';

// Display-encoded 8-bit grayscale demonstration: not a color-managed sharpening implementation.
export const SHARPEN_PREVIEW_WIDTH = 384;
export const SHARPEN_PREVIEW_HEIGHT = 160;
export const INITIAL_SHARPEN_SETTINGS = Object.freeze({source: 'edges', sigma: 2, amount: 1.5});

function assertSize(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new RangeError('画像の幅と高さは正の整数で指定してください。');
  }
}

/** A soft edge and stripe/noise region make overshoot and amplification visible. */
export function makeSharpenTestPattern(width, height, source = 'edges') {
  assertSize(width, height);
  if (!['edges', 'texture'].includes(source)) throw new RangeError('未知のテスト画像です。');
  const pixels = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value;
      if (source === 'edges') {
        const distance = x - width * 0.52;
        value = 36 + 180 * (0.5 + 0.5 * Math.max(-1, Math.min(1, distance / Math.max(2, width * 0.045))));
        if (y > height * 0.72) value = Math.floor(x / 6) % 2 ? 190 : 70;
      } else {
        const lowFrequency = 125 + 48 * Math.sin(x * 2 * Math.PI / Math.max(8, width * 0.6));
        // Deterministic pseudo-texture, no randomness or external photo.
        const texture = ((x * 29 + y * 17 + (x * y) % 31) % 13) - 6;
        value = lowFrequency + texture * 2.2;
        if (y > height * 0.3 && y < height * 0.7 && x > width * 0.4 && x < width * 0.65) value += 30;
      }
      pixels[y * width + x] = value;
    }
  }
  return pixels;
}

/**
 * Display signed high-pass detail around neutral middle gray (128).
 * Above 128 = positive source-minus-blur residual; below = negative.
 * This is a visualization, not a linear-light mask or the actual composite.
 */
export function visualizeUnsharpResidualGrayscale(pixels, blurred) {
  if (!(pixels instanceof Uint8ClampedArray) || !(blurred instanceof Uint8ClampedArray) ||
      pixels.length !== blurred.length) {
    throw new RangeError('同じ長さの8-bit画像が必要です。');
  }
  const preview = new Uint8ClampedArray(pixels.length);
  for (let i = 0; i < preview.length; i += 1) {
    preview[i] = 128 + pixels[i] - blurred[i];
  }
  return preview;
}

/** Reuse a cached Gaussian reference when only the sharpening amount changes. */
export function compositeUnsharpGrayscale(pixels, blurred, amount = 1.5) {
  if (!(pixels instanceof Uint8ClampedArray) || !(blurred instanceof Uint8ClampedArray) ||
      pixels.length !== blurred.length) {
    throw new RangeError('同じ長さの8-bit画像が必要です。');
  }
  if (!Number.isFinite(amount) || amount < 0 || amount > 3) {
    throw new RangeError('強さは0〜3の有限な値で指定してください。');
  }
  const output = new Uint8ClampedArray(pixels.length);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = pixels[i] + amount * (pixels[i] - blurred[i]);
  }
  return output;
}

/** Count newly reached black/white display endpoints, excluding preexisting endpoints. */
export function countNewSharpenEndpoints(original, output) {
  if (!(original instanceof Uint8ClampedArray) || !(output instanceof Uint8ClampedArray) ||
      original.length !== output.length) {
    throw new RangeError('比較対象は同じ画素数の8-bit画像が必要です。');
  }
  let black = 0;
  let white = 0;
  for (let i = 0; i < original.length; i += 1) {
    if (original[i] > 0 && output[i] === 0) black += 1;
    if (original[i] < 255 && output[i] === 255) white += 1;
  }
  return {black, white};
}

/** Unsharp mask: source + amount * (source - Gaussian blur). */
export function unsharpMaskGrayscale(pixels, width, height, {sigma = 2, amount = 1.5} = {}) {
  assertSize(width, height);
  if (!(pixels instanceof Uint8ClampedArray) || pixels.length !== width * height) {
    throw new RangeError('8-bitグレースケール画素と画像サイズが一致しません。');
  }
  if (!Number.isFinite(sigma) || sigma < 0 || sigma > 12) {
    throw new RangeError('σは0〜12 pxの有限な値で指定してください。');
  }
  if (!Number.isFinite(amount) || amount < 0 || amount > 3) {
    throw new RangeError('強さは0〜3の有限な値で指定してください。');
  }
  const blurred = gaussianBlurGrayscale(pixels, width, height, sigma);
  const output = compositeUnsharpGrayscale(pixels, blurred, amount);
  return {blurred, output};
}
