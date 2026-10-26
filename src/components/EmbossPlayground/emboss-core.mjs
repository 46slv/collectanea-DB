export const EMBOSS_WIDTH = 320;
export const EMBOSS_HEIGHT = 160;
export const EMBOSS_INITIAL = Object.freeze({
  pattern: 'blocks', direction: 'right', radius: 2, strength: 1.5, texture: 0.15,
});
const DIRECTIONS = Object.freeze({
  right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1],
});

function assertSize(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
    width < 1 || height < 1 || width * height > 1000000) {
    throw new RangeError('画像の幅・高さは正の整数、最大100万画素で指定してください。');
  }
}
function assertRgb(source, width, height) {
  assertSize(width, height);
  if (!(source instanceof Uint8ClampedArray) || source.length !== width * height * 3) {
    throw new RangeError('不透明RGB画素配列と画像サイズが一致しません。');
  }
}
function assertValue(value, min, max, name) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(name + 'の指定範囲を確認してください。');
  }
}
function luminance(source, pixelIndex) {
  const i = pixelIndex * 3;
  return 0.2126 * source[i] + 0.7152 * source[i + 1] + 0.0722 * source[i + 2];
}
function clampByte(value) {
  return Math.round(Math.min(255, Math.max(0, value)));
}
function sample(source, width, height, x, y) {
  const sx = Math.max(0, Math.min(width - 1, x));
  const sy = Math.max(0, Math.min(height - 1, y));
  return luminance(source, sy * width + sx);
}

/** Deterministic, self-generated RGB illustrations: no external asset. */
export function makeEmbossPattern(width, height, pattern = 'blocks') {
  assertSize(width, height);
  if (pattern !== 'blocks' && pattern !== 'rings') throw new RangeError('未知のテスト画像です。');
  const result = new Uint8ClampedArray(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let v = 38 + 70 * x / Math.max(1, width - 1);
      if (pattern === 'blocks') {
        if (x > width * 0.13 && x < width * 0.45 &&
            y > height * 0.20 && y < height * 0.82) v = 215;
        if (x > width * 0.54 && x < width * 0.86 &&
            y > height * 0.32 && y < height * 0.70) v = 145;
        if (Math.abs(y - (height * 0.12 + x * height * 0.6 / width)) < 2) v = 240;
      } else {
        const r = Math.hypot(x - width * 0.50, y - height * 0.50);
        if (r < height * 0.34) v = 72;
        if (Math.abs(r - height * 0.31) < height * 0.045) v = 240;
        if (r < height * 0.16) v = 185;
      }
      const i = (y * width + x) * 3;
      result[i] = result[i + 1] = result[i + 2] = clampByte(v);
    }
  }
  return result;
}

/** Signed opposite-neighbor difference. Direction reversal negates the response. */
export function computeEmbossRelief(source, width, height,
    {direction = 'right', radius = 2} = {}) {
  assertRgb(source, width, height);
  if (!Object.hasOwn(DIRECTIONS, direction)) throw new RangeError('差分方向が不正です。');
  if (!Number.isInteger(radius) || radius < 1 || radius > 5) {
    throw new RangeError('差分距離は1〜5 pxの整数です。');
  }
  const [ux, uy] = DIRECTIONS[direction];
  const dx = ux * radius, dy = uy * radius;
  const response = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      response[y * width + x] =
        (sample(source, width, height, x + dx, y + dy) -
         sample(source, width, height, x - dx, y - dy)) / 2;
    }
  }
  return response;
}
function assertRelief(relief, width, height) {
  if (!(relief instanceof Float32Array) || relief.length !== width * height) {
    throw new RangeError('方向差分と画素数が一致しません。');
  }
}

/** Preview: negative differences <128, positive >128, zero exactly 128. */
export function visualizeEmbossRelief(relief) {
  if (!(relief instanceof Float32Array)) throw new TypeError('方向差分にはFloat32Arrayが必要です。');
  const output = new Uint8ClampedArray(relief.length * 3);
  for (let i = 0; i < relief.length; i += 1) {
    if (!Number.isFinite(relief[i])) throw new RangeError('差分に有限でない値があります。');
    const v = clampByte(128 + relief[i]);
    const j = i * 3;
    output[j] = output[j + 1] = output[j + 2] = v;
  }
  return output;
}

/** 8-bit display-space grayscale approximation; never mutates source/relief. */
export function renderEmboss(source, width, height, relief,
    {strength = 1.5, texture = 0.15} = {}) {
  assertRgb(source, width, height);
  assertRelief(relief, width, height);
  assertValue(strength, 0, 3, '陰影強度');
  assertValue(texture, 0, 0.5, '元の階調');
  const output = new Uint8ClampedArray(source.length);
  for (let i = 0; i < relief.length; i += 1) {
    if (!Number.isFinite(relief[i])) throw new RangeError('差分に有限でない値があります。');
    const v = clampByte(128 + strength * relief[i] +
      texture * (luminance(source, i) - 128));
    const j = i * 3;
    output[j] = output[j + 1] = output[j + 2] = v;
  }
  return output;
}
