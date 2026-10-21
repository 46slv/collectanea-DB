import {gaussianBlurGrayscale} from '../BlurPlayground/blur-core.mjs';

// Deliberately display-encoded grayscale, not linear-light/HDR or a lens PSF.
export const BLOOM_PREVIEW_WIDTH = 384;
export const BLOOM_PREVIEW_HEIGHT = 160;
export const INITIAL_BLOOM_SETTINGS = Object.freeze({
  source: 'lights', threshold: 190, sigma: 7, strength: 1.5,
});

function assertDimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new RangeError('画像サイズは正の整数で指定してください。');
  }
}

/** Deterministic test scenes. Does not rely on fonts, photographs or assets. */
export function makeBloomTestPattern(width, height, source = 'lights') {
  assertDimensions(width, height);
  if (!['lights', 'frame'].includes(source)) throw new RangeError('未知のテスト画像です。');
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

/** Hard-threshold bright pass; both input and output are 8-bit gray bytes. */
export function extractBloomHighlights(pixels, threshold = 190) {
  if (!(pixels instanceof Uint8ClampedArray)) throw new TypeError('入力は8-bitグレースケール画像です。');
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 255) {
    throw new RangeError('閾値は0〜255の整数で指定してください。');
  }
  return Uint8ClampedArray.from(pixels, (value) => value >= threshold ? value : 0);
}

/** Bright-pass -> Gaussian spread -> additive composite, with final 8-bit clipping. */
export function bloomGrayscale(pixels, width, height, {threshold = 190, sigma = 7, strength = 1.5} = {}) {
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
  const highlights = extractBloomHighlights(pixels, threshold);
  const spread = gaussianBlurGrayscale(highlights, width, height, sigma);
  const output = Uint8ClampedArray.from(pixels, (value, i) => value + spread[i] * strength);
  return {highlights, spread, output};
}
