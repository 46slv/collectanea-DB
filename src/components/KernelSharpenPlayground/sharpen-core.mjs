export const SHARPEN_WIDTH = 320;
export const SHARPEN_HEIGHT = 160;
export const SHARPEN_INITIAL = Object.freeze({
  pattern: 'edges', neighbors: 'cross', amount: 1,
});

const OFFSETS = Object.freeze({
  cross: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  square: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
});

function assertSize(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
      width < 1 || height < 1 || width * height > 1000000) {
    throw new RangeError('画像サイズは1〜100万画素の正の整数で指定してください。');
  }
}
function assertSource(source, width, height) {
  assertSize(width, height);
  if (!(source instanceof Uint8ClampedArray) || source.length !== width * height * 3) {
    throw new RangeError('入力画像は幅×高さ×3の8-bit RGB画素配列です。');
  }
}
function clampByte(value) {
  return Math.round(Math.max(0, Math.min(255, value)));
}

/** Synthetic patterns contain no licensed or remote imagery. */
export function makeSharpenPattern(width, height, pattern = 'edges') {
  assertSize(width, height);
  if (pattern !== 'edges' && pattern !== 'texture') throw new RangeError('未知のテスト画像です。');
  const out = new Uint8ClampedArray(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const t = x / Math.max(1, width - 1);
      let r = 24 + 94 * t, g = 40 + 106 * t, b = 78 + 73 * t;
      if (pattern === 'edges') {
        if (x > width * 0.10 && x < width * 0.42 &&
            y > height * 0.22 && y < height * 0.78) {
          [r, g, b] = [225, 204, 153];
        }
        if (x > width * 0.58 && x < width * 0.88 &&
            y > height * 0.32 && y < height * 0.70) {
          [r, g, b] = [38, 62, 104];
        }
        if (Math.abs(y - (height * 0.12 + x * height * 0.65 / width)) < 1.5) {
          [r, g, b] = [250, 245, 240];
        }
      } else {
        const seed = (Math.imul(x + 11, 73856093) ^ Math.imul(y + 17, 19349663)) >>> 0;
        const noise = ((seed ^ (seed >>> 13)) & 255) - 128;
        r += noise * 0.23; g += noise * 0.30; b += noise * 0.37;
        if (x > width * 0.29 && x < width * 0.70 &&
            y > height * 0.25 && y < height * 0.74) {
          r += 74; g += 60; b += 36;
        }
      }
      const i = (y * width + x) * 3;
      out[i] = clampByte(r);
      out[i + 1] = clampByte(g);
      out[i + 2] = clampByte(b);
    }
  }
  return out;
}

/** Signed detail = center - local 4/8-neighbor mean (clamped/replicated borders). */
export function extractSharpenDetail(source, width, height, neighbors = 'cross') {
  assertSource(source, width, height);
  if (!Object.hasOwn(OFFSETS, neighbors)) throw new RangeError('近傍方式が不正です。');
  const offsets = OFFSETS[neighbors];
  const detail = new Float32Array(source.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 3;
      for (let channel = 0; channel < 3; channel += 1) {
        let sum = 0;
        for (const [dx, dy] of offsets) {
          const sx = Math.max(0, Math.min(width - 1, x + dx));
          const sy = Math.max(0, Math.min(height - 1, y + dy));
          sum += source[(sy * width + sx) * 3 + channel];
        }
        detail[i + channel] = source[i + channel] - sum / offsets.length;
      }
    }
  }
  return detail;
}

function assertDetail(detail, length) {
  if (!(detail instanceof Float32Array) || detail.length !== length) {
    throw new RangeError('差分と入力画像の要素数が一致しません。');
  }
}

/** Signed RGB residual preview: neutral 128 = 0; scaled for visibility. */
export function visualizeSharpenDetail(detail) {
  if (!(detail instanceof Float32Array) || detail.length % 3 !== 0) {
    throw new RangeError('差分はRGBのFloat32Arrayで指定してください。');
  }
  const result = new Uint8ClampedArray(detail.length);
  for (let i = 0; i < detail.length; i += 1) {
    if (!Number.isFinite(detail[i])) throw new RangeError('差分に不正な値があります。');
    result[i] = clampByte(128 + detail[i] * 1.5);
  }
  return result;
}

/** Educational display-code RGB high-boost, not scene-linear or deconvolution. */
export function renderKernelSharpen(source, width, height, detail, amount = 1) {
  assertSource(source, width, height);
  assertDetail(detail, source.length);
  if (!Number.isFinite(amount) || amount < 0 || amount > 3) {
    throw new RangeError('強さは0〜3倍で指定してください。');
  }
  const pixels = new Uint8ClampedArray(source.length);
  let clippedChannels = 0;
  for (let i = 0; i < source.length; i += 1) {
    if (!Number.isFinite(detail[i])) throw new RangeError('差分に不正な値があります。');
    const value = source[i] + amount * detail[i];
    if (value < 0 || value > 255) clippedChannels += 1;
    pixels[i] = clampByte(value);
  }
  return {pixels, clippedChannels};
}
