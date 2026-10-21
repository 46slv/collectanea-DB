// Display-encoded grayscale experiment, not a host application's color pipeline.
export const PREVIEW_WIDTH = 384;
export const PREVIEW_HEIGHT = 160;
export const INITIAL_DITHER_SETTINGS = Object.freeze({
  source: 'ramp',
  levels: 4,
  method: 'ordered',
  matrixSize: 4,
  zoom: 1,
});

const bayerMatrices = new Map([[1, [0]]]);
const clamp01 = (value) => Math.max(0, Math.min(1, value));
const toByte = (value) => Math.round(clamp01(value) * 255);

function assertDimensions(values, width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 ||
      !values || values.length !== width * height) {
    throw new RangeError('画像のサイズと画素数が一致しません。');
  }
}

function assertLevels(levels) {
  if (!Number.isInteger(levels) || levels < 2 || levels > 16) {
    throw new RangeError('階調数は2〜16の整数で指定してください。');
  }
}

export function makeTestPattern(width, height, source = 'ramp') {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new RangeError('画像の幅と高さは正の整数で指定してください。');
  }
  if (source !== 'ramp' && source !== 'radial') throw new RangeError('未知の元画像です。');
  const pixels = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value = x / Math.max(1, width - 1);
      if (source === 'radial') {
        const dx = (x - (width - 1) / 2) / Math.max(1, (width - 1) / 2);
        const dy = (y - (height - 1) / 2) / Math.max(1, (height - 1) / 2);
        value = 1 - Math.min(1, Math.hypot(dx, dy));
      }
      pixels[y * width + x] = clamp01(value);
    }
  }
  return pixels;
}

export function toPreviewBytes(values) {
  return Uint8ClampedArray.from(values, toByte);
}

function bayerMatrix(size) {
  if (![2, 4, 8].includes(size)) throw new RangeError('行列サイズは2、4、8だけです。');
  if (bayerMatrices.has(size)) return bayerMatrices.get(size);
  const half = bayerMatrix(size / 2);
  const pixels = new Array(size * size);
  for (let y = 0; y < size / 2; y += 1) {
    for (let x = 0; x < size / 2; x += 1) {
      const value = half[y * (size / 2) + x] * 4;
      pixels[y * size + x] = value;
      pixels[y * size + x + size / 2] = value + 2;
      pixels[(y + size / 2) * size + x] = value + 3;
      pixels[(y + size / 2) * size + x + size / 2] = value + 1;
    }
  }
  bayerMatrices.set(size, pixels);
  return pixels;
}

// All three methods deliberately use the same number of possible gray values.
export function processGrayscale(values, width, height, {levels = 4, method = 'none', matrixSize = 4} = {}) {
  assertDimensions(values, width, height);
  assertLevels(levels);
  if (!['none', 'ordered', 'error-diffusion'].includes(method)) throw new RangeError('未知のディザ方式です。');
  const output = new Uint8ClampedArray(values.length);
  const steps = levels - 1;

  if (method === 'error-diffusion') {
    // Floyd–Steinberg, scanning left-to-right, top-to-bottom.
    const working = Float32Array.from(values);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = y * width + x;
        const original = working[i];
        const rounded = Math.round(clamp01(original) * steps) / steps;
        output[i] = toByte(rounded);
        const error = original - rounded;
        if (x + 1 < width) working[i + 1] += error * 7 / 16;
        if (y + 1 < height) {
          if (x > 0) working[i + width - 1] += error * 3 / 16;
          working[i + width] += error * 5 / 16;
          if (x + 1 < width) working[i + width + 1] += error / 16;
        }
      }
    }
    return output;
  }

  const matrix = method === 'ordered' ? bayerMatrix(matrixSize) : null;
  const cells = matrixSize * matrixSize;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const threshold = matrix ? (matrix[(y % matrixSize) * matrixSize + (x % matrixSize)] + 0.5) / cells - 0.5 : 0;
      const index = Math.max(0, Math.min(steps, Math.round(clamp01(values[i]) * steps + threshold)));
      output[i] = toByte(index / steps);
    }
  }
  return output;
}
