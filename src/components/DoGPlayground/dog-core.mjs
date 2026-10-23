import {gaussianBlurGrayscale} from '../BlurPlayground/blur-core.mjs';

// Difference-of-Gaussians demonstration on display-encoded 8-bit grayscale.
// This is neither a linear-light band-pass filter nor a Canny/LoG detector.
export const DOG_PREVIEW_WIDTH = 384;
export const DOG_PREVIEW_HEIGHT = 160;
export const INITIAL_DOG_SETTINGS = Object.freeze({
  source: 'spots', sigma: 1.5, ratio: 2, gain: 3, threshold: 25, view: 'signed',
});

function assertDimensions(width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 ||
      width * height > 4_194_304) {
    throw new RangeError('画像の幅・高さは正の整数、画素数は4194304以下で指定してください。');
  }
}

/** Three deterministic test images, with no downloaded photographs or random noise. */
export function makeDoGTestPattern(width, height, source = 'spots') {
  assertDimensions(width, height);
  if (!['spots', 'stripes', 'texture'].includes(source)) throw new RangeError('未知のテスト画像です。');
  const pixels = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let v = 30;
      if (source === 'spots') {
        const d1 = Math.hypot(x - width * 0.32, y - height * 0.52);
        const d2 = Math.hypot(x - width * 0.70, y - height * 0.36);
        v = d1 < Math.max(1, height * 0.055) || d2 < Math.max(2, height * 0.15) ? 245 : 35;
      } else if (source === 'stripes') {
        const period = Math.max(4, Math.round(width / 24));
        v = (Math.floor(x / period) % 2) ? 210 : 50;
        if (y > height * 0.68 && y < height * 0.86) v = (Math.floor(x / 3) % 2) ? 170 : 90;
      } else {
        v = ((Math.floor(x / 4) + Math.floor(y / 4)) % 2) ? 119 : 137;
        if (x > width * 0.32 && x < width * 0.69 && y > height * 0.23 && y < height * 0.79) v = 226;
      }
      pixels[y * width + x] = v;
    }
  }
  return pixels;
}

/**
 * Expensive spatial stages. Cache by source, sigma and ratio in an interactive UI:
 * adjusting the presentation threshold or gain must not convolve again.
 */
export function makeDoGBlurPair(pixels, width, height, {sigma = 1.5, ratio = 2} = {}) {
  assertDimensions(width, height);
  if (!(pixels instanceof Uint8ClampedArray) || pixels.length !== width * height) {
    throw new RangeError('入力は指定サイズの8-bitグレースケール配列で指定してください。');
  }
  if (!Number.isFinite(sigma) || sigma < 0.5 || sigma > 5 ||
      !Number.isFinite(ratio) || ratio < 1.5 || ratio > 3 || sigma * ratio > 16) {
    throw new RangeError('σ=0.5〜5、倍率=1.5〜3、σ大は16以下にしてください。');
  }
  return {
    narrow: gaussianBlurGrayscale(pixels, width, height, sigma),
    wide: gaussianBlurGrayscale(pixels, width, height, sigma * ratio),
  };
}

/**
 * Lightweight presentation stages for an already computed pair of 8-bit blurs.
 * signed: 128 = no difference, lighter = positive, darker = negative.
 * absolute: magnitude of both polarities; edges: threshold applied to magnitude.
 * These bytes describe display-encoded pixels, not physical contrast units.
 */
export function renderDoGFromBlurs(narrow, wide, {gain = 3, threshold = 25} = {}) {
  if (!(narrow instanceof Uint8ClampedArray) || !(wide instanceof Uint8ClampedArray) ||
      narrow.length === 0 || narrow.length !== wide.length) {
    throw new RangeError('比較する2枚のぼかし画像は同じ長さの8-bit配列にしてください。');
  }
  if (!Number.isFinite(gain) || gain < 0.5 || gain > 8 ||
      !Number.isInteger(threshold) || threshold < 0 || threshold > 255) {
    throw new RangeError('強調=0.5〜8、閾値=0〜255にしてください。');
  }
  const signed = new Uint8ClampedArray(narrow.length);
  const absolute = new Uint8ClampedArray(narrow.length);
  const edges = new Uint8ClampedArray(narrow.length);
  let edgeCount = 0;
  for (let i = 0; i < narrow.length; i += 1) {
    const difference = (narrow[i] - wide[i]) * gain;
    signed[i] = 128 + difference;
    absolute[i] = Math.abs(difference);
    // Quantize preview magnitude once; use the same bytes for thresholding.
    edges[i] = absolute[i] >= threshold ? absolute[i] : 0;
    if (edges[i] !== 0) edgeCount += 1;
  }
  return {signed, absolute, edges, edgeCount};
}

/** Compatibility API: compute both stages when no UI-level cache is available. */
export function differenceOfGaussiansGrayscale(pixels, width, height,
    {sigma = 1.5, ratio = 2, gain = 3, threshold = 25} = {}) {
  const {narrow, wide} = makeDoGBlurPair(pixels, width, height, {sigma, ratio});
  return {narrow, wide, ...renderDoGFromBlurs(narrow, wide, {gain, threshold})};
}
