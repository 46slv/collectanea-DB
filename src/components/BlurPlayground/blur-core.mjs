// Grayscale display-encoded 8-bit educational experiment, not a color-managed host pipeline.
export const BLUR_PREVIEW_WIDTH = 384;
export const BLUR_PREVIEW_HEIGHT = 160;
export const INITIAL_BLUR_SETTINGS = Object.freeze({source: 'edges', sigma: 3});

function assertSize(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new RangeError('画像の幅と高さは正の整数で指定してください。');
  }
}

/** Produce original, sharp-edged grayscale test patterns without external assets. */
export function makeBlurTestPattern(width, height, source = 'edges') {
  assertSize(width, height);
  if (!['edges', 'lights'].includes(source)) throw new RangeError('未知のテスト画像です。');
  const pixels = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value;
      if (source === 'edges') {
        // A broad vertical contrast boundary and high-frequency details near the bottom.
        value = x < width * 0.5 ? 30 : 224;
        if (y >= height * 0.68 && y < height * 0.86) {
          value = Math.floor(x / 9) % 2 ? 248 : 8;
        }
      } else {
        // A bright dot and a narrow line reveal the spread of the point response.
        value = 12;
        const cx = (width - 1) / 2;
        const cy = (height - 1) / 2;
        if (Math.hypot(x - cx, y - cy) < Math.max(1, Math.min(width, height) * 0.035)) value = 250;
        if (Math.abs(x - width * 0.22) < 1.5 && y > height * 0.2 && y < height * 0.8) value = 235;
      }
      pixels[y * width + x] = value;
    }
  }
  return pixels;
}

/** Normalized, symmetric 1D Gaussian weights, truncated at 3 sigma. */
export function gaussianKernel1D(sigma) {
  if (!Number.isFinite(sigma) || sigma < 0 || sigma > 16) {
    throw new RangeError('σは0〜16の有限な値で指定してください。');
  }
  if (sigma === 0) return Float64Array.of(1);
  const radius = Math.ceil(sigma * 3);
  const kernel = new Float64Array(radius * 2 + 1);
  let total = 0;
  for (let x = -radius; x <= radius; x += 1) {
    const weight = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[x + radius] = weight;
    total += weight;
  }
  for (let x = 0; x < kernel.length; x += 1) kernel[x] /= total;
  return kernel;
}

/**
 * Separable Gaussian convolution: horizontal then vertical, only one 8-bit
 * quantization at the end. Edge coordinates are clamped to avoid dark borders.
 * Input and output are display-encoded grayscale bytes (0–255).
 */
export function gaussianBlurGrayscale(pixels, width, height, sigma = 3) {
  assertSize(width, height);
  if (!(pixels instanceof Uint8ClampedArray) || pixels.length !== width * height) {
    throw new RangeError('8-bitグレースケール画素と画像サイズが一致しません。');
  }
  const kernel = gaussianKernel1D(sigma);
  if (kernel.length === 1) return pixels.slice();

  const radius = Math.floor(kernel.length / 2);
  const horizontal = new Float32Array(pixels.length);
  const result = new Uint8ClampedArray(pixels.length);
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let k = -radius; k <= radius; k += 1) {
        const sampleX = Math.max(0, Math.min(width - 1, x + k));
        sum += pixels[row + sampleX] * kernel[k + radius];
      }
      horizontal[row + x] = sum;
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let k = -radius; k <= radius; k += 1) {
        const sampleY = Math.max(0, Math.min(height - 1, y + k));
        sum += horizontal[sampleY * width + x] * kernel[k + radius];
      }
      result[y * width + x] = sum;
    }
  }
  return result;
}
