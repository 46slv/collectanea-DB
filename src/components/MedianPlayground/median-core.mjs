// Educational 8-bit display-encoded grayscale median filter, not an HDR/color-managed model.
export const MEDIAN_PREVIEW_WIDTH = 384;
export const MEDIAN_PREVIEW_HEIGHT = 160;
export const INITIAL_MEDIAN_SETTINGS = Object.freeze({source: 'edges', noise: 20, radius: 1, seed: 2026});

function validatePixels(pixels, width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 ||
      width * height > 4_194_304 || !(pixels instanceof Uint8ClampedArray) ||
      pixels.length !== width * height) {
    throw new RangeError('画像は4,194,304画素以下の8-bitグレースケール配列を指定してください。');
  }
}

export function makeMedianTestPattern(width, height, source = 'edges') {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 ||
      width * height > 4_194_304) throw new RangeError('無効な画像寸法です。');
  if (!['edges', 'thin-lines'].includes(source)) throw new RangeError('未知のテスト画像です。');
  const pixels = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value;
      if (source === 'edges') {
        value = x < width * 0.52 ? 45 : 210;
        if (x > width * 0.15 && x < width * 0.39 && y > height * 0.2 && y < height * 0.79) value = 172;
      } else {
        value = 54;
        if (x % 30 < 2 || (y > height * 0.28 && y < height * 0.69 && x > width * 0.27 && x < width * 0.7)) value = 218;
      }
      pixels[y * width + x] = value;
    }
  }
  return pixels;
}

/** Deterministic impulse noise; `percent` is per-pixel replacement probability (0–40%). */
export function addImpulseNoise(pixels, width, height, percent = 20, seed = 2026) {
  validatePixels(pixels, width, height);
  if (!Number.isInteger(percent) || percent < 0 || percent > 40 || !Number.isSafeInteger(seed)) {
    throw new RangeError('ノイズ量は0〜40%の整数、seedは整数にしてください。');
  }
  const output = pixels.slice();
  let state = (seed >>> 0) || 0x9e3779b9;
  for (let i = 0; i < output.length; i += 1) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    if ((state >>> 0) / 4294967296 < percent / 100) {
      // A second deterministic draw keeps impulse polarity independent of location probability.
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      output[i] = (state & 1) ? 255 : 0;
    }
  }
  return output;
}

/**
 * Additive, seeded Gaussian noise in 8-bit *display* values, not camera shot noise.
 * sigma is in levels on the 0..255 scale; output clamps/rounds to that range.
 */
export function addGaussianNoise(pixels, width, height, sigma = 20, seed = 2026) {
  validatePixels(pixels, width, height);
  if (!Number.isInteger(sigma) || sigma < 0 || sigma > 40 || !Number.isSafeInteger(seed)) {
    throw new RangeError('ガウスノイズのσは0〜40階調の整数、seedは整数にしてください。');
  }
  const result = pixels.slice();
  if (sigma === 0) return result;
  let state = (seed >>> 0) || 0x9e3779b9;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    // Strictly between 0 and 1 to keep log(u) finite in Box–Muller.
    return ((state >>> 0) + 1) / 4294967297;
  };
  for (let i = 0; i < result.length; i += 2) {
    const magnitude = sigma * Math.sqrt(-2 * Math.log(random()));
    const phase = 2 * Math.PI * random();
    result[i] = pixels[i] + magnitude * Math.cos(phase);
    if (i + 1 < result.length) {
      result[i + 1] = pixels[i + 1] + magnitude * Math.sin(phase);
    }
  }
  return result;
}

/**
 * Nonlinear median of a (2r+1)^2 neighborhood; radius = 1/2/3.
 * Replicates border coordinates, matching the companion Gaussian example's boundary policy.
 */
export function medianFilterGrayscale(pixels, width, height, radius = 1) {
  validatePixels(pixels, width, height);
  if (!Number.isInteger(radius) || radius < 1 || radius > 3) throw new RangeError('半径は1〜3の整数です。');
  const result = new Uint8ClampedArray(pixels.length);
  const histogram = new Uint16Array(256);
  const target = (((radius * 2 + 1) ** 2) + 1) >> 1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      histogram.fill(0);
      for (let dy = -radius; dy <= radius; dy += 1) {
        const row = Math.max(0, Math.min(height - 1, y + dy)) * width;
        for (let dx = -radius; dx <= radius; dx += 1) {
          const sampleX = Math.max(0, Math.min(width - 1, x + dx));
          histogram[pixels[row + sampleX]] += 1;
        }
      }
      let seen = 0;
      for (let value = 0; value < 256; value += 1) {
        seen += histogram[value];
        if (seen >= target) {
          result[y * width + x] = value;
          break;
        }
      }
    }
  }
  return result;
}

/**
 * Mean absolute 8-bit difference from the known synthetic reference (not a perceptual quality score).
 * Zero means pixel-identical; the maximum value is 255.
 */
export function meanAbsoluteError(reference, candidate, width, height) {
  validatePixels(reference, width, height);
  validatePixels(candidate, width, height);
  let total = 0;
  for (let i = 0; i < reference.length; i += 1) {
    total += Math.abs(reference[i] - candidate[i]);
  }
  return total / reference.length;
}

/** 8-bit absolute error map against a *known* reference: 0=match, 255=maximal mismatch. */
export function absoluteDifferenceGrayscale(reference, candidate, width, height) {
  validatePixels(reference, width, height);
  validatePixels(candidate, width, height);
  const difference = new Uint8ClampedArray(reference.length);
  for (let i = 0; i < reference.length; i += 1) {
    difference[i] = Math.abs(reference[i] - candidate[i]);
  }
  return difference;
}

/**
 * Compare per-pixel absolute errors with the noisy input, not with another filter.
 * Counts use exact 8-bit display-value differences. They are not perceptual scores.
 */
export function countErrorChanges(reference, noisy, processed, width, height) {
  validatePixels(reference, width, height);
  validatePixels(noisy, width, height);
  validatePixels(processed, width, height);
  let improved = 0;
  let unchanged = 0;
  let worsened = 0;
  for (let i = 0; i < reference.length; i += 1) {
    const before = Math.abs(reference[i] - noisy[i]);
    const after = Math.abs(reference[i] - processed[i]);
    if (after < before) improved += 1;
    else if (after > before) worsened += 1;
    else unchanged += 1;
  }
  return {improved, unchanged, worsened, total: reference.length};
}