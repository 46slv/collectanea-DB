export const GRAIN_WIDTH = 320;
export const GRAIN_HEIGHT = 180;
export const GRAIN_INITIAL = Object.freeze({
  scene: 'gradient', amount: 24, size: 2, chroma: 0.2, shadow: 0.4, frame: 0,
});

function byte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hash(x, y, frame, channel) {
  let n = Math.imul(x + 1, 0x9e3779b1) ^
    Math.imul(y + 1, 0x85ebca6b) ^
    Math.imul(frame + 1, 0xc2b2ae35) ^
    Math.imul(channel + 1, 0x27d4eb2d);
  n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
  n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967295 * 2 - 1;
}

function smooth(value) {
  return value * value * (3 - 2 * value);
}

function grainNoise(x, y, scale, frame, channel) {
  const gx = Math.floor(x / scale);
  const gy = Math.floor(y / scale);
  const tx = smooth(x / scale - gx);
  const ty = smooth(y / scale - gy);
  const a = hash(gx, gy, frame, channel);
  const b = hash(gx + 1, gy, frame, channel);
  const c = hash(gx, gy + 1, frame, channel);
  const d = hash(gx + 1, gy + 1, frame, channel);
  return (a + (b - a) * tx) * (1 - ty) +
    (c + (d - c) * tx) * ty;
}

function dimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
      width < 1 || height < 1 || width * height > 1000000) {
    throw new RangeError('width and height must be positive bounded integers');
  }
}

export function makeGrainScene(width, height, scene = 'gradient') {
  dimensions(width, height);
  if (!['gradient', 'night'].includes(scene)) throw new RangeError('unknown scene');
  const result = new Uint8ClampedArray(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = (x + 0.5) / width;
      const v = (y + 0.5) / height;
      const i = (y * width + x) * 3;
      let r, g, b;
      if (scene === 'gradient') {
        const tone = 0.06 + u * 0.88;
        const band = v < 1 / 3 ? [1, 0.83, 0.7] :
          v < 2 / 3 ? [0.72, 1, 0.82] : [0.76, 0.84, 1];
        r = 255 * tone * band[0];
        g = 255 * tone * band[1];
        b = 255 * tone * band[2];
      } else {
        const lamp = Math.hypot((u - 0.72) / 0.16, (v - 0.44) / 0.27);
        const glow = Math.max(0, 1 - lamp);
        const window = u > 0.16 && u < 0.42 && v > 0.27 && v < 0.72;
        r = 15 + 18 * v + glow * 206 + (window ? 56 : 0);
        g = 22 + 21 * v + glow * 172 + (window ? 35 : 0);
        b = 38 + 28 * v + glow * 111 + (window ? 21 : 0);
      }
      result[i] = byte(r);
      result[i + 1] = byte(g);
      result[i + 2] = byte(b);
    }
  }
  return result;
}

export function renderFilmGrain(source, width, height, options = {}) {
  dimensions(width, height);
  if (!source || source.length !== width * height * 3) {
    throw new RangeError('source must contain RGB bytes for every pixel');
  }
  const amount = options.amount ?? GRAIN_INITIAL.amount;
  const size = options.size ?? GRAIN_INITIAL.size;
  const chroma = options.chroma ?? GRAIN_INITIAL.chroma;
  const shadow = options.shadow ?? GRAIN_INITIAL.shadow;
  const frame = options.frame ?? GRAIN_INITIAL.frame;
  if (!Number.isFinite(amount) || amount < 0 || amount > 60 ||
      !Number.isInteger(size) || size < 1 || size > 6 ||
      !Number.isFinite(chroma) || chroma < 0 || chroma > 1 ||
      !Number.isFinite(shadow) || shadow < 0 || shadow > 1 ||
      !Number.isInteger(frame) || frame < 0 || frame > 4095) {
    throw new RangeError('grain parameter out of range');
  }

  const layer = new Uint8ClampedArray(source.length);
  const result = new Uint8ClampedArray(source.length);
  let sumAbsDelta = 0;
  let clippedSamples = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 3;
      const luminance = (0.2126 * source[i] + 0.7152 * source[i + 1] +
        0.0722 * source[i + 2]) / 255;
      // An artistic, user-controlled shadow weighting, not a film measurement.
      const weight = 1 - shadow * luminance;
      const mono = grainNoise(x, y, size, frame, 0);
      for (let channel = 0; channel < 3; channel += 1) {
        const colored = grainNoise(x, y, size, frame, channel + 1);
        const n = mono * (1 - chroma) + colored * chroma;
        const delta = amount * weight * n;
        layer[i + channel] = byte(128 + delta);
        const raw = source[i + channel] + delta;
        if (raw < 0 || raw > 255) clippedSamples += 1;
        result[i + channel] = byte(raw);
        sumAbsDelta += Math.abs(result[i + channel] - source[i + channel]);
      }
    }
  }
  return {
    layer, result, meanAbsDelta: sumAbsDelta / source.length, clippedSamples,
  };
}
