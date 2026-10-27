// Educational linear-sRGB cube demonstration. Not CSS/ACES perceptual gamut mapping.
export const GAMUT_WIDTH = 320;
export const GAMUT_HEIGHT = 144;
export const GAMUT_DEFAULTS = Object.freeze({"pattern":"bands","drive":1.5,"anchor":0.5,"zoom":1});
export function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

export function isOutOfRange(rgb) {
  return rgb.some(channel => channel < 0 || channel > 1);
}

export function clipRgb(rgb) {
  if (!Array.isArray(rgb) || rgb.length !== 3 || rgb.some(v => !Number.isFinite(v))) {
    throw new RangeError('有限な3成分のRGBが必要です。');
  }
  return rgb.map(clamp01);
}

export function radialRgb(rgb, anchor = 0.5) {
  clipRgb(rgb);
  if (!Number.isFinite(anchor) || anchor < 0.2 || anchor > 0.8) {
    throw new RangeError('灰色の基準値は0.2〜0.8です。');
  }
  if (!isOutOfRange(rgb)) return [...rgb];
  let t = 1;
  for (const value of rgb) {
    const delta = value - anchor;
    if (delta > 0) t = Math.min(t, (1 - anchor) / delta);
    if (delta < 0) t = Math.min(t, -anchor / delta);
  }
  return rgb.map(value => clamp01(anchor + t * (value - anchor)));
}

export function linearToByte(value) {
  const x = clamp01(value);
  const encoded = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  return Math.round(encoded * 255);
}

export function createGamutPattern(width, height, pattern = 'bands', drive = 1.5) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 ||
      height < 1 || width > 2048 || height > 2048 ||
      !['bands', 'blocks'].includes(pattern) || !Number.isFinite(drive) ||
      drive < 0.5 || drive > 2) {
    throw new RangeError('画像寸法、パターンまたは色差倍率が無効です。');
  }
  const vectors = [[1, -0.5, -0.4], [1, 1, -0.8], [-0.2, 1, -0.6],
    [-0.7, 0.7, 1], [-0.8, -0.2, 1], [0.8, -0.5, 1]];
  const result = new Float32Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const stripe = pattern === 'bands'
        ? Math.min(5, Math.floor(y * 6 / height))
        : Math.min(5, Math.floor(x * 6 / width));
      const amount = pattern === 'bands'
        ? x / Math.max(1, width - 1)
        : (Math.floor(y * 4 / height) + 1) / 4;
      const offset = (y * width + x) * 3;
      for (let channel = 0; channel < 3; channel++) {
        result[offset + channel] = 0.5 + 0.75 * amount * drive * vectors[stripe][channel];
      }
    }
  }
  return result;
}

export function renderGamut(source, width, height, anchor = 0.5) {
  if (!(source instanceof Float32Array) || !Number.isInteger(width) ||
      !Number.isInteger(height) || width < 1 || height < 1 ||
      source.length !== width * height * 3 ||
      !Number.isFinite(anchor) || anchor < 0.2 || anchor > 0.8) {
    throw new RangeError('入力画像または灰色の基準値が無効です。');
  }
  const count = width * height;
  const mask = new Uint8ClampedArray(count * 4);
  const clipped = new Uint8ClampedArray(count * 4);
  const radial = new Uint8ClampedArray(count * 4);
  let outOfGamutPixels = 0;
  for (let pixel = 0; pixel < count; pixel++) {
    const a = pixel * 3, b = pixel * 4;
    const rgb = [source[a], source[a + 1], source[a + 2]];
    if (rgb.some(v => !Number.isFinite(v))) {
      throw new RangeError('入力RGBに無限大またはNaNが含まれます。');
    }
    const outside = isOutOfRange(rgb);
    if (outside) outOfGamutPixels++;
    const c = clipRgb(rgb), r = radialRgb(rgb, anchor);
    const maskColor = outside ? [232, 66, 66] : [76, 82, 92];
    for (let k = 0; k < 3; k++) {
      mask[b + k] = maskColor[k];
      clipped[b + k] = linearToByte(c[k]);
      radial[b + k] = linearToByte(r[k]);
    }
    mask[b + 3] = clipped[b + 3] = radial[b + 3] = 255;
  }
  return {mask, clipped, radial, outOfGamutPixels, totalPixels: count};
}
