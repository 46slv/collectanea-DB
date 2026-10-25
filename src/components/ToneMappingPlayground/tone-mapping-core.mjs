// Educational scene-linear grayscale tone mapping, not an HDR/color-managed renderer.
export const TONE_WIDTH = 384;
export const TONE_HEIGHT = 160;
export const TONE_PEAKS = Object.freeze([2, 4, 8]);

export function createHdrPattern(width, height, peak = 4, source = 'ramp') {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 2 || height < 2) {
    throw new RangeError('Width and height must both be integers of at least 2.');
  }
  if (!TONE_PEAKS.includes(peak) || !['ramp', 'radial'].includes(source)) {
    throw new RangeError('Unsupported peak or test pattern.');
  }
  const values = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / (width - 1);
      const v = y / (height - 1);
      const radius = Math.min(1, Math.hypot((u - 0.5) * 2, (v - 0.5) * 2));
      // Ramp reaches the selected peak; radial spot falls to black at the edges.
      values[y * width + x] = peak * (source === 'ramp' ? u * u : (1 - radius) ** 3);
    }
  }
  return values;
}

export function encodeSrgb8(linear) {
  if (!Number.isFinite(linear) || linear < 0 || linear > 1) {
    throw new RangeError('Linear display value must be within [0, 1].');
  }
  const code = linear <= 0.0031308
    ? 12.92 * linear
    : 1.055 * (linear ** (1 / 2.4)) - 0.055;
  return Math.round(255 * code);
}

export function mapToneValue(input, ev = 0, operator = 'reinhard') {
  if (!Number.isFinite(input) || input < 0 ||
      !Number.isFinite(ev) || ev < -2 || ev > 2 || ev * 2 !== Math.round(ev * 2) ||
      !['clip', 'reinhard'].includes(operator)) {
    throw new RangeError('Expected nonnegative finite linear light, half-stop EV, and valid operator.');
  }
  const scaled = input * (2 ** ev);
  // Simplified global Reinhard shoulder: x/(1+x); no local adaptation or white point.
  return operator === 'clip' ? Math.min(1, scaled) : scaled / (1 + scaled);
}

export function renderToneMapping(source, width, height, ev = 0) {
  if (!(source instanceof Float32Array) || !Number.isInteger(width) ||
      !Number.isInteger(height) || width < 1 || height < 1 ||
      source.length !== width * height) {
    throw new RangeError('Expected scene-linear Float32Array matching image dimensions.');
  }
  // Validate EV before any operation (also works on a zero-only frame).
  mapToneValue(0, ev);
  const clipped = new Uint8ClampedArray(source.length);
  const compressed = new Uint8ClampedArray(source.length);
  let overDisplay = 0;
  const multiplier = 2 ** ev;
  for (let i = 0; i < source.length; i += 1) {
    const L = source[i];
    if (!Number.isFinite(L) || L < 0) throw new RangeError('Invalid scene-linear input.');
    if (L * multiplier > 1) overDisplay += 1;
    clipped[i] = encodeSrgb8(mapToneValue(L, ev, 'clip'));
    compressed[i] = encodeSrgb8(mapToneValue(L, ev, 'reinhard'));
  }
  return {clipped, compressed, overDisplay};
}
