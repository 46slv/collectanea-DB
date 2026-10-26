// Educational unsigned-normalized grayscale quantization. No HDR, floating-point
// format emulation, video legal-range mapping, or AE/Resolve color pipeline.
export const BIT_DEPTHS = Object.freeze([4, 8, 10, 12]);
export const PREVIEW_WIDTH = 384;
export const PREVIEW_HEIGHT = 160;

function checkBits(bits) {
  if (!BIT_DEPTHS.includes(bits)) throw new RangeError('対応する整数ビット深度は4、8、10、12です。');
}
function checkUnit(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError('正規化した標本値は0〜1の有限数で指定してください。');
  }
}
export function encodeSample(value, bits = 8) {
  checkBits(bits);
  checkUnit(value);
  const maxCode = 2 ** bits - 1;
  const code = Math.round(value * maxCode);
  const reconstructed = code / maxCode;
  return {bits, codeCount: maxCode + 1, maxCode, code, reconstructed, error: reconstructed - value};
}
export function makeIdealPattern(width, height, kind = 'ramp') {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width < 2 || height < 2 || width * height > 1_000_000 ||
      !['ramp', 'radial'].includes(kind)) throw new RangeError('有効な画像寸法と種類が必要です。');
  const samples = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const v = kind === 'ramp'
        ? x / (width - 1)
        : Math.max(0, 1 - Math.hypot((2 * x / (width - 1) - 1), (2 * y / (height - 1) - 1)));
      samples[y * width + x] = v;
    }
  }
  return samples;
}
export function toDisplayBytes(samples, bits = 8) {
  checkBits(bits);
  if (!(samples instanceof Float32Array || samples instanceof Float64Array)) {
    throw new TypeError('正規化Float32/64Arrayが必要です。');
  }
  const out = new Uint8ClampedArray(samples.length);
  const maxCode = 2 ** bits - 1;
  for (let i = 0; i < samples.length; i += 1) {
    const value = samples[i];
    checkUnit(value);
    const quantized = Math.round(value * maxCode) / maxCode;
    // Display-only conversion to standard rgba-unorm8; not an n-bit canvas.
    out[i] = Math.round(quantized * 255);
  }
  return out;
}
