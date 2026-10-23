import {gaussianBlurGrayscale} from '../BlurPlayground/blur-core.mjs';

// Deliberately display-encoded grayscale, not linear-light/HDR or a lens PSF.
export const BLOOM_PREVIEW_WIDTH = 384;
export const BLOOM_PREVIEW_HEIGHT = 160;
export const INITIAL_BLOOM_SETTINGS = Object.freeze({
  source: 'lights', threshold: 190, softKnee: 0, sigma: 7, strength: 1.5,
});

function assertDimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new RangeError('画像サイズは正の整数で指定してください。');
  }
}

/** Deterministic test scenes. Does not rely on fonts, photographs or assets. */
export function makeBloomTestPattern(width, height, source = 'lights') {
  assertDimensions(width, height);
  if (!['lights', 'frame', 'gradient'].includes(source)) throw new RangeError('未知のテスト画像です。');
  const result = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value = 12;
      if (source === 'lights') {
        const cx = width * 0.53, cy = height * 0.48;
        if (Math.hypot(x - cx, y - cy) < Math.max(2, height * 0.063)) value = 248;
        if (Math.abs(x - width * 0.22) < Math.max(2, width * 0.008) &&
            y > height * 0.18 && y < height * 0.82) value = 238;
        if (y > height * 0.70 && y < height * 0.74 &&
            x > width * 0.60 && x < width * 0.90) value = 216;
      } else if (source === 'gradient') {
        // Smooth falloff deliberately exercises many threshold values; the other
        // two scenes have only a handful of discrete grayscale levels.
        const dx = ((x + 0.5) / width - 0.5) / 0.45;
        const dy = ((y + 0.5) / height - 0.5) / 0.65;
        const radius = Math.hypot(dx, dy);
        value = 12 + Math.round(240 * Math.max(0, 1 - radius));
      } else {
        const left = width * 0.21, right = width * 0.79;
        const top = height * 0.22, bottom = height * 0.78;
        const border = Math.max(2, Math.min(width, height) * 0.028);
        const inside = x >= left && x <= right && y >= top && y <= bottom;
        if (inside && (x - left < border || right - x < border ||
            y - top < border || bottom - y < border)) value = 234;
        if (Math.abs(x - width / 2) < border && y > top + border && y < bottom - border) {
          value = 250;
        }
      }
      result[y * width + x] = value;
    }
  }
  return result;
}

/**
 * Bright-pass with an optional linear knee around the threshold.
 * A zero-width knee is the original hard step; a wider knee gradually
 * admits values in [threshold - softKnee/2, threshold + softKnee/2].
 * Values are display-encoded 8-bit bytes, not scene-linear radiance.
 */
export function extractBloomHighlights(pixels, threshold = 190, softKnee = 0) {
  if (!(pixels instanceof Uint8ClampedArray)) throw new TypeError('入力は8-bitグレースケール画像です。');
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 255) {
    throw new RangeError('閾値は0〜255の整数で指定してください。');
  }
  if (!Number.isInteger(softKnee) || softKnee < 0 || softKnee > 96) {
    throw new RangeError('閾値の境界幅は0〜96の整数で指定してください。');
  }
  return Uint8ClampedArray.from(pixels, (value) => {
    if (softKnee === 0) return value >= threshold ? value : 0;
    const weight = Math.max(0, Math.min(1, (value - threshold) / softKnee + 0.5));
    return value * weight;
  });
}

/** Composite an already blurred bright-pass without running Gaussian again. */
export function compositeBloomGrayscale(pixels, spread, strength = 1.5) {
  if (!(pixels instanceof Uint8ClampedArray) || !(spread instanceof Uint8ClampedArray) ||
      pixels.length !== spread.length) {
    throw new RangeError('合成する画像は同じ長さの8-bitグレースケール画素が必要です。');
  }
  if (!Number.isFinite(strength) || strength < 0 || strength > 3) {
    throw new RangeError('合成強度は0〜3の有限な値で指定してください。');
  }
  const output = new Uint8ClampedArray(pixels.length);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = pixels[i] + spread[i] * strength;
  }
  return output;
}

/** Count pixels that newly reach the display upper endpoint (255). */
export function countNewBloomEndpoints(original, output) {
  if (!(original instanceof Uint8ClampedArray) || !(output instanceof Uint8ClampedArray) ||
      original.length !== output.length) {
    throw new RangeError('比較対象は同じ画素数の8-bit画像が必要です。');
  }
  let count = 0;
  for (let i = 0; i < original.length; i += 1) {
    if (original[i] < 255 && output[i] === 255) count += 1;
  }
  return count;
}

/** Bright-pass -> Gaussian spread -> additive composite, with final 8-bit clipping. */
export function bloomGrayscale(pixels, width, height, {threshold = 190, softKnee = 0, sigma = 7, strength = 1.5} = {}) {
  assertDimensions(width, height);
  if (!(pixels instanceof Uint8ClampedArray) || pixels.length !== width * height) {
    throw new RangeError('画像サイズと8-bit画素数が一致しません。');
  }
  if (!Number.isFinite(sigma) || sigma < 0 || sigma > 12) {
    throw new RangeError('ぼかし幅は0〜12 pxの有限な値で指定してください。');
  }
  if (!Number.isFinite(strength) || strength < 0 || strength > 3) {
    throw new RangeError('合成強度は0〜3の有限な値で指定してください。');
  }
  const highlights = extractBloomHighlights(pixels, threshold, softKnee);
  const spread = gaussianBlurGrayscale(highlights, width, height, sigma);
  const output = compositeBloomGrayscale(pixels, spread, strength);
  return {highlights, spread, output};
}
