// Teaching implementation: 8-bit display-encoded grayscale, not a scene-linear/HDR denoiser.
export const BILATERAL_WIDTH = 224;
export const BILATERAL_HEIGHT = 96;
export const INITIAL_BILATERAL_SETTINGS = Object.freeze({
  pattern: 'boundary', noise: 15, spatialSigma: 2, rangeSigma: 25,
});

function validateImage(pixels, width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width <= 0 || height <= 0 || width * height > 1_048_576 ||
      !(pixels instanceof Uint8ClampedArray) || pixels.length !== width * height) {
    throw new RangeError('1,048,576画素以下の8-bitグレースケール配列と有効な寸法が必要です。');
  }
}

/** Two intentionally synthetic, asset-free examples with known noise-free reference pixels. */
export function makeBilateralPattern(width, height, pattern = 'boundary') {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width <= 0 || height <= 0 || width * height > 1_048_576) {
    throw new RangeError('無効な画像寸法です。');
  }
  if (!['boundary', 'gradient'].includes(pattern)) throw new RangeError('未知のテスト画像です。');
  const result = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value;
      if (pattern === 'boundary') {
        value = x < width / 2 ? 45 : 205;
        if (x > width * 0.16 && x < width * 0.34 && y > height * 0.27 && y < height * 0.73) value = 135;
      } else {
        value = 35 + 190 * x / Math.max(1, width - 1);
        if (y > height * 0.37 && y < height * 0.43 && x > width * 0.16 && x < width * 0.85) {
          value = 230; // A deliberately fragile fine stripe.
        }
      }
      result[y * width + x] = value;
    }
  }
  return result;
}

/** Reproducible additive Gaussian noise, in nominal 0–255 display-value levels. */
export function makeNoisyBilateralInput(pixels, width, height, sigma = 15, seed = 2026) {
  validateImage(pixels, width, height);
  if (!Number.isInteger(sigma) || sigma < 0 || sigma > 40 || !Number.isSafeInteger(seed)) {
    throw new RangeError('ノイズ強度は0〜40階調の整数、seedは整数にしてください。');
  }
  const result = pixels.slice();
  if (sigma === 0) return result;
  let state = (seed >>> 0) || 0x9e3779b9;
  function uniformOpen() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) + 1) / 4294967297;
  }
  for (let i = 0; i < result.length; i += 2) {
    const magnitude = sigma * Math.sqrt(-2 * Math.log(uniformOpen()));
    const phase = 2 * Math.PI * uniformOpen();
    result[i] = pixels[i] + magnitude * Math.cos(phase);
    if (i + 1 < result.length) result[i + 1] = pixels[i + 1] + magnitude * Math.sin(phase);
  }
  return result;
}

/**
 * Bilateral = normalized spatial Gaussian × intensity-distance Gaussian.
 * The center pixel remains in the denominator so a valid result always exists.
 * Spatial neighborhood is truncated at 2σ and borders are replicated.
 * This is a pedagogical 8-bit luminance-only approximation; no color/HDR/time axis.
 */
export function bilateralFilterGrayscale(pixels, width, height, spatialSigma = 2, rangeSigma = 25) {
  validateImage(pixels, width, height);
  if (!Number.isFinite(spatialSigma) || spatialSigma < 0 || spatialSigma > 4 ||
      !Number.isFinite(rangeSigma) || rangeSigma <= 0 || rangeSigma > 128) {
    throw new RangeError('空間σは0〜4px、輝度差σは0超〜128階調で指定してください。');
  }
  if (spatialSigma === 0) return pixels.slice();
  const radius = Math.ceil(spatialSigma * 2);
  const side = radius * 2 + 1;
  const spatialWeights = new Float64Array(side * side);
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      spatialWeights[(dy + radius) * side + dx + radius] =
        Math.exp(-(dx * dx + dy * dy) / (2 * spatialSigma * spatialSigma));
    }
  }
  // Discrete 8-bit intensity differences allow exact lookup instead of millions of exp() calls.
  const rangeWeights = new Float64Array(256);
  for (let difference = 0; difference < 256; difference += 1) {
    rangeWeights[difference] = Math.exp(-(difference * difference) / (2 * rangeSigma * rangeSigma));
  }
  const result = new Uint8ClampedArray(pixels.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const center = pixels[y * width + x];
      let weightedSum = 0;
      let weightTotal = 0;
      for (let dy = -radius; dy <= radius; dy += 1) {
        const yy = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -radius; dx <= radius; dx += 1) {
          const xx = Math.max(0, Math.min(width - 1, x + dx));
          const neighbor = pixels[yy * width + xx];
          const weight = spatialWeights[(dy + radius) * side + dx + radius] * rangeWeights[Math.abs(center - neighbor)];
          weightedSum += neighbor * weight;
          weightTotal += weight;
        }
      }
      result[y * width + x] = weightedSum / weightTotal;
    }
  }
  return result;
}

/** Mean absolute error against the known *synthetic* clean reference only. */
export function bilateralMeanAbsoluteError(reference, output, width, height) {
  validateImage(reference, width, height);
  validateImage(output, width, height);
  let sum = 0;
  for (let i = 0; i < reference.length; i += 1) sum += Math.abs(reference[i] - output[i]);
  return sum / reference.length;
}
