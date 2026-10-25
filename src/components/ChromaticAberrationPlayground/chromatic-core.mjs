// Educational lateral channel registration in display-encoded 8-bit pixels.
// This is not a measured lens profile, optical dispersion model or RAW correction.
export const CHROMA_WIDTH = 384;
export const CHROMA_HEIGHT = 160;
export const CHROMA_INITIAL = Object.freeze({pattern: 'grid', shift: 7, centerX: 50});

function validSize(width, height) {
  return Number.isInteger(width) && Number.isInteger(height) &&
    width >= 2 && height >= 2 && width * height <= 1048576;
}

export function makeChromaticPattern(width, height, pattern = 'grid') {
  if (!validSize(width, height) || !['grid', 'bars'].includes(pattern))
    throw new RangeError('画像サイズまたはパターンが不正です。');
  const out = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let value;
    if (pattern === 'grid') {
      value = x % 32 < 2 || y % 32 < 2 ? 238 : 36;
      const dx = x - (width - 1) / 2, dy = y - (height - 1) / 2;
      if (dx * dx + dy * dy < 13 * 13) value = 252;
    } else {
      value = x < width / 3 ? 30 : x < 2 * width / 3 ? 240 : 75;
      if (Math.abs(y - (height - 1) / 2) < 2) value = 180;
    }
    out[y * width + x] = value;
  }
  return out;
}

function bilinear(input, width, height, px, py) {
  const x = Math.max(0, Math.min(width - 1, px));
  const y = Math.max(0, Math.min(height - 1, py));
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(width - 1, x0 + 1), y1 = Math.min(height - 1, y0 + 1);
  const fx = x - x0, fy = y - y0;
  const a = input[y0 * width + x0] * (1 - fx) + input[y0 * width + x1] * fx;
  const b = input[y1 * width + x0] * (1 - fx) + input[y1 * width + x1] * fx;
  return a * (1 - fy) + b * fy;
}

/**
 * Returns opaque RGBA from grayscale. R and B are sampled on opposite sides
 * of the original G coordinate. Radial displacement increases linearly from
 * the chosen center toward the farthest corner.
 */
export function shiftChromaticChannels(input, width, height, {
  shift = 7, centerX = 50, mode = 'radial',
} = {}) {
  if (!validSize(width, height) || !(input instanceof Uint8ClampedArray) ||
      input.length !== width * height)
    throw new RangeError('画素配列と画像サイズが一致しません。');
  if (!Number.isInteger(shift) || shift < 0 || shift > 12 ||
      !Number.isInteger(centerX) || centerX < 20 || centerX > 80 ||
      !['radial', 'horizontal'].includes(mode))
    throw new RangeError('色ずれのパラメータが範囲外です。');
  const result = new Uint8ClampedArray(width * height * 4);
  const cx = (width - 1) * centerX / 100;
  const cy = (height - 1) / 2;
  const farX = Math.max(cx, width - 1 - cx);
  const farY = Math.max(cy, height - 1 - cy);
  const maxDistance = Math.hypot(farX, farY);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const offsetX = mode === 'radial' ? shift * (x - cx) / maxDistance : shift;
    const offsetY = mode === 'radial' ? shift * (y - cy) / maxDistance : 0;
    const i = y * width + x, j = i * 4;
    result[j] = shift === 0 ? input[i] : bilinear(input, width, height, x - offsetX, y - offsetY);
    result[j + 1] = input[i];
    result[j + 2] = shift === 0 ? input[i] : bilinear(input, width, height, x + offsetX, y + offsetY);
    result[j + 3] = 255;
  }
  return result;
}
