// Small D65 sRGB ↔ Display P3 teaching model, based on W3C CSS Color 4 sample conversions.
// This is not an ICC/CMS implementation and the preview is restricted to sRGB Canvas output.
export const CST_WIDTH = 320;
export const CST_HEIGHT = 144;
export const CST_DEFAULTS = Object.freeze({source: 'display-p3', target: 'srgb', pattern: 'bands', chroma: 1, zoom: 1});

export const SPACES = Object.freeze(['srgb', 'display-p3']);
const SRGB_TO_XYZ = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559185, 0.11919477979462599, 0.9505321522496607],
];
const XYZ_TO_SRGB = [
  [3.240969941904521, -1.537383177570093, -0.498610760293],
  [-0.96924363628087, 1.875967501507721, 0.041555057407],
  [0.05563007969699, -0.20397695888897, 1.056971514242878],
];
const P3_TO_XYZ = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976],
];
const XYZ_TO_P3 = [
  [2.493496911941425, -0.931383617919124, -0.402710784450717],
  [-0.829488969561575, 1.762664060318346, 0.023624685841943],
  [0.035845830243784, -0.076172389268041, 0.956884524007687],
];
const clamp01 = x => Math.min(1, Math.max(0, x));
function validateSpace(space) {
  if (!SPACES.includes(space)) throw new RangeError('入力または出力色空間が無効です。');
}
function validateRgb(rgb) {
  if (!Array.isArray(rgb) || rgb.length !== 3 || rgb.some(x => !Number.isFinite(x))) {
    throw new RangeError('有限な3成分RGBが必要です。');
  }
}
function matrixMultiply(m, v) {
  return m.map(row => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
}
export function srgbDecode(x) {
  if (!Number.isFinite(x)) throw new RangeError('有限の成分値が必要です。');
  const a = Math.abs(x);
  return Math.sign(x) * (a <= 0.04045 ? a / 12.92 : ((a + 0.055) / 1.055) ** 2.4);
}
export function srgbEncode(x) {
  if (!Number.isFinite(x)) throw new RangeError('有限の成分値が必要です。');
  const a = Math.abs(x);
  return Math.sign(x) * (a <= 0.0031308 ? 12.92 * a : 1.055 * a ** (1 / 2.4) - 0.055);
}
export function toXYZ(encoded, space) {
  validateRgb(encoded); validateSpace(space);
  return matrixMultiply(space === 'srgb' ? SRGB_TO_XYZ : P3_TO_XYZ, encoded.map(srgbDecode));
}
export function fromXYZLinear(xyz, space) {
  validateRgb(xyz); validateSpace(space);
  return matrixMultiply(space === 'srgb' ? XYZ_TO_SRGB : XYZ_TO_P3, xyz);
}
export function convertRgb(encoded, source, target) {
  // Out-of-gamut target values are deliberately *not* clamped here.
  return fromXYZLinear(toXYZ(encoded, source), target).map(srgbEncode);
}
export function targetLinear(encoded, source, target) {
  return fromXYZLinear(toXYZ(encoded, source), target);
}
export function isOutOfGamut(linear) {
  validateRgb(linear);
  return linear.some(v => v < -1e-8 || v > 1 + 1e-8);
}
export function displayBytes(linear) {
  validateRgb(linear);
  return linear.map(x => Math.round(srgbEncode(clamp01(x)) * 255));
}
export function makeCstPattern(width, height, pattern = 'bands', chroma = 1) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 ||
      width > 2048 || height > 2048 || !['bands', 'gradient'].includes(pattern) ||
      !Number.isFinite(chroma) || chroma < 0.2 || chroma > 1) {
    throw new RangeError('画像寸法、パターンまたは彩度強度が無効です。');
  }
  const colors = [[1, 0.02, 0.03], [1, 0.65, 0.02], [0.02, 1, 0.1],
    [0.02, 0.9, 1], [0.07, 0.15, 1], [0.9, 0.03, 1]];
  const result = new Float32Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rgb;
      if (pattern === 'bands') {
        const stripe = Math.min(5, Math.floor(y * 6 / height));
        const t = 0.15 + 0.85 * x / Math.max(1, width - 1);
        rgb = colors[stripe].map(v => 0.5 + t * (v - 0.5));
      } else {
        const t = x / Math.max(1, width - 1);
        rgb = [t, (1 - t) * (0.2 + 0.7 * y / Math.max(1, height - 1)),
          0.95 * y / Math.max(1, height - 1)];
      }
      const offset = (y * width + x) * 3;
      for (let k = 0; k < 3; k++) result[offset + k] = 0.5 + chroma * (rgb[k] - 0.5);
    }
  }
  return result;
}
export function renderCst(input, width, height, source = 'display-p3', target = 'srgb') {
  if (!(input instanceof Float32Array) || !Number.isInteger(width) ||
      !Number.isInteger(height) || width < 1 || height < 1 || width > 2048 ||
      height > 2048 || input.length !== width * height * 3) {
    throw new RangeError('入力画像または寸法が無効です。');
  }
  validateSpace(source); validateSpace(target);
  const raw = new Uint8ClampedArray(width * height * 4);
  const corrected = new Uint8ClampedArray(width * height * 4);
  const mask = new Uint8ClampedArray(width * height * 4);
  let outside = 0;
  for (let i = 0; i < width * height; i++) {
    const a = i * 3, b = i * 4;
    const code = [input[a], input[a + 1], input[a + 2]];
    if (code.some(v => !Number.isFinite(v) || v < 0 || v > 1)) {
      throw new RangeError('ソースの符号化RGBは0〜1の有限値としてください。');
    }
    const linear = targetLinear(code, source, target);
    const isOutside = isOutOfGamut(linear);
    if (isOutside) outside++;
    // Target gamut clipping precedes a separate, sRGB-only preview transform.
    const mappedXYZ = matrixMultiply(target === 'srgb' ? SRGB_TO_XYZ : P3_TO_XYZ, linear.map(clamp01));
    const preview = displayBytes(fromXYZLinear(mappedXYZ, 'srgb'));
    for (let k = 0; k < 3; k++) {
      raw[b + k] = Math.round(code[k] * 255); // the intentionally incorrect unconverted-code reading
      corrected[b + k] = preview[k];
      mask[b + k] = isOutside ? [230, 70, 74][k] : [78, 86, 94][k];
    }
    raw[b + 3] = corrected[b + 3] = mask[b + 3] = 255;
  }
  return {raw, corrected, mask, outside, total: width * height};
}
