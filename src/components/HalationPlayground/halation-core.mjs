import {gaussianBlurGrayscale} from '../BlurPlayground/blur-core.mjs';

export const HALATION_WIDTH = 320;
export const HALATION_HEIGHT = 160;
export const HALATION_INITIAL = Object.freeze({
  pattern: 'lamps', threshold: 185, sigma: 5, gain: 1.5, redness: 1,
});

function assertSize(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new RangeError('画像の幅・高さには正の整数を指定してください。');
  }
}

function assertRgb(source, width, height) {
  assertSize(width, height);
  if (!(source instanceof Uint8ClampedArray) || source.length !== width * height * 3) {
    throw new RangeError('RGB画素配列と画像サイズが一致しません。');
  }
}

/** Self-generated RGB test patterns: no external asset or font is required. */
export function makeHalationPattern(width, height, pattern = 'lamps') {
  assertSize(width, height);
  if (!['lamps', 'sign'].includes(pattern)) throw new RangeError('未知のテスト画像です。');
  const rgb = new Uint8ClampedArray(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 14, g = 21, b = 34;
      if (pattern === 'lamps') {
        const a = Math.hypot(x - width * 0.3, y - height * 0.43);
        const c = Math.hypot(x - width * 0.7, y - height * 0.58);
        if (a < height * 0.065) { r = 254; g = 248; b = 228; }
        if (c < height * 0.045) { r = 245; g = 247; b = 255; }
        if (Math.abs(x - width * 0.3) < 2 && y > height * 0.5 && y < height * 0.9) {
          r = 110; g = 113; b = 122;
        }
      } else {
        const left = width * 0.18, right = width * 0.82;
        const top = height * 0.26, bottom = height * 0.74;
        const band = Math.max(2, height * 0.035);
        if (x > left && x < right && y > top && y < bottom &&
          (x - left < band || right - x < band || y - top < band || bottom - y < band)) {
          r = 247; g = 242; b = 225;
        }
        if (Math.abs(x - width * 0.5) < band && y > top + band && y < bottom - band) {
          r = 251; g = 252; b = 255;
        }
      }
      const i = (y * width + x) * 3;
      rgb[i] = r; rgb[i + 1] = g; rgb[i + 2] = b;
    }
  }
  return rgb;
}

/** Luminance-weighted bright pass in 8-bit display-encoded RGB values. */
export function extractHalationHighlights(source, width, height, threshold = 185) {
  assertRgb(source, width, height);
  if (!Number.isInteger(threshold) || threshold < 140 || threshold > 245) {
    throw new RangeError('閾値は140〜245の整数で指定してください。');
  }
  const mask = new Uint8ClampedArray(width * height);
  for (let i = 0; i < mask.length; i += 1) {
    const j = i * 3;
    const luminance = 0.2126 * source[j] + 0.7152 * source[j + 1] + 0.0722 * source[j + 2];
    mask[i] = 255 * Math.max(0, (luminance - threshold) / (255 - threshold));
  }
  return mask;
}

export function makeHalationSpread(source, width, height, {threshold = 185, sigma = 5} = {}) {
  if (!Number.isFinite(sigma) || sigma < 0 || sigma > 12) {
    throw new RangeError('ぼかし幅σは0〜12 pxの有限な値で指定してください。');
  }
  const highlights = extractHalationHighlights(source, width, height, threshold);
  return {highlights, spread: gaussianBlurGrayscale(highlights, width, height, sigma)};
}

/** RGB visualization of one Gaussian spread, tinted but not composited. */
export function tintHalationSpread(spread, redness = 1) {
  if (!(spread instanceof Uint8ClampedArray)) throw new TypeError('中間画像は8-bitグレースケールです。');
  if (!Number.isFinite(redness) || redness < 0 || redness > 1) {
    throw new RangeError('赤みは0〜1の有限な値で指定してください。');
  }
  const rgb = new Uint8ClampedArray(spread.length * 3);
  for (let i = 0; i < spread.length; i += 1) {
    const j = i * 3;
    rgb[j] = spread[i];
    rgb[j + 1] = spread[i] * (1 - 0.82 * redness);
    rgb[j + 2] = spread[i] * (1 - 0.95 * redness);
  }
  return rgb;
}

/** Display-code additive composite. Not a physical film or scene-linear model. */
export function compositeHalation(source, spread, gain = 1.5, redness = 1) {
  if (!(source instanceof Uint8ClampedArray) || !(spread instanceof Uint8ClampedArray) ||
      source.length !== spread.length * 3) {
    throw new RangeError('RGB画像と中間画像の画素数が一致しません。');
  }
  if (!Number.isFinite(gain) || gain < 0 || gain > 2.5) {
    throw new RangeError('合成強度は0〜2.5の有限な値で指定してください。');
  }
  if (!Number.isFinite(redness) || redness < 0 || redness > 1) {
    throw new RangeError('赤みは0〜1の有限な値で指定してください。');
  }
  const rgb = new Uint8ClampedArray(source.length);
  const gFactor = 1 - 0.82 * redness;
  const bFactor = 1 - 0.95 * redness;
  for (let i = 0; i < spread.length; i += 1) {
    const j = i * 3, delta = gain * spread[i];
    rgb[j] = source[j] + delta;
    rgb[j + 1] = source[j + 1] + delta * gFactor;
    rgb[j + 2] = source[j + 2] + delta * bFactor;
  }
  return rgb;
}
