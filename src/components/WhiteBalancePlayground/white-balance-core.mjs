// Educational linear-light sRGB channel-gain model; not raw-camera white balance.
export const WHITE_BALANCE_WIDTH = 384;
export const WHITE_BALANCE_HEIGHT = 160;
export const WHITE_BALANCE_DEFAULTS = Object.freeze({temperature: 0, tint: 0, pattern: 'warm', zoom: 1});
export const WHITE_BALANCE_CAST = Object.freeze({temperature: 40, tint: -20});
export const WHITE_BALANCE_SAMPLES = Object.freeze({
  warm: Object.freeze([
    Object.freeze({label: '基準の灰色', rgb: Object.freeze([128, 128, 128])}),
    Object.freeze({label: '暖色のパッチ', rgb: Object.freeze([190, 105, 78])}),
    Object.freeze({label: '青のパッチ', rgb: Object.freeze([75, 122, 190])}),
  ]),
  neutral: Object.freeze([
    Object.freeze({label: '暗い灰色', rgb: Object.freeze([64, 64, 64])}),
    Object.freeze({label: '中間の灰色', rgb: Object.freeze([128, 128, 128])}),
    Object.freeze({label: '明るい灰色', rgb: Object.freeze([200, 200, 200])}),
  ]),
});
const PATCHES = Object.freeze([
  [128, 128, 128], [205, 205, 205], [190, 105, 78], [75, 122, 190],
  [194, 160, 62], [77, 157, 105], [161, 91, 153], [34, 34, 34],
]);

function validateSettings(temperature, tint) {
  for (const value of [temperature, tint]) {
    if (typeof value !== 'number' || !Number.isInteger(value) ||
        value < -100 || value > 100 || value % 10 !== 0) {
      throw new RangeError('Temperature and tint must be integers -100..100 in steps of 10.');
    }
  }
}
function validateRgb(rgb) {
  if (!Array.isArray(rgb) || rgb.length !== 3 ||
      rgb.some(value => !Number.isInteger(value) || value < 0 || value > 255)) {
    throw new RangeError('Expected three 8-bit RGB channel values.');
  }
}
function decodeSrgb(value) {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function encodeSrgb(value) {
  const clamped = Math.max(0, Math.min(1, value));
  const encoded = clamped <= 0.0031308 ? 12.92 * clamped :
    1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(encoded * 255)));
}
export function whiteBalanceGains(temperature = 0, tint = 0) {
  validateSettings(temperature, tint);
  // Positive temperature adds red and subtracts blue.
  // Positive tint moves away from green (towards magenta).
  return [2 ** (temperature / 100), 2 ** (-tint / 100), 2 ** (-temperature / 100)];
}
function adjusted(rgb, gains) {
  const linear = [decodeSrgb(rgb[0]) * gains[0],
    decodeSrgb(rgb[1]) * gains[1], decodeSrgb(rgb[2]) * gains[2]];
  return {rgb: linear.map(encodeSrgb), clipped: linear.some(v => v > 1)};
}
export function adjustWhiteBalanceRgb(rgb, temperature = 0, tint = 0) {
  validateRgb(rgb);
  return adjusted(rgb, whiteBalanceGains(temperature, tint)).rgb;
}
export function createWhiteBalancePattern(width, height, pattern = 'warm') {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
      width < 2 || height < 2 || !['warm', 'neutral'].includes(pattern)) {
    throw new RangeError('Expected dimensions >= 2 and warm or neutral pattern.');
  }
  const pixels = new Uint8ClampedArray(width * height * 4);
  const castGains = whiteBalanceGains(WHITE_BALANCE_CAST.temperature, WHITE_BALANCE_CAST.tint);
  for (let y = 0; y < height; y += 1) {
    const scale = 0.55 + 0.45 * y / (height - 1);
    for (let x = 0; x < width; x += 1) {
      const base = pattern === 'warm' ?
        PATCHES[Math.min(7, Math.floor(x * 8 / width))] :
        Array(3).fill(Math.round(24 + x / (width - 1) * 176));
      const rgb = base.map(v => Math.round(v * scale));
      const output = pattern === 'warm' ? adjusted(rgb, castGains).rgb : rgb;
      const index = (y * width + x) * 4;
      pixels.set(output, index);
      pixels[index + 3] = 255;
    }
  }
  return pixels;
}
export function renderWhiteBalance(source, width, height, temperature = 0, tint = 0) {
  const gains = whiteBalanceGains(temperature, tint);
  if (!(source instanceof Uint8ClampedArray) ||
      !Number.isInteger(width) || !Number.isInteger(height) ||
      width < 1 || height < 1 || source.length !== width * height * 4) {
    throw new RangeError('Expected opaque RGBA Uint8ClampedArray with matching dimensions.');
  }
  const pixels = new Uint8ClampedArray(source.length);
  let clippedPixels = 0;
  for (let i = 0; i < source.length; i += 4) {
    if (source[i + 3] !== 255) {
      throw new RangeError('Only fully opaque RGB samples are supported.');
    }
    const result = adjusted([source[i], source[i + 1], source[i + 2]], gains);
    if (result.clipped) clippedPixels += 1;
    pixels.set(result.rgb, i);
    pixels[i + 3] = 255;
  }
  return {pixels, clippedPixels};
}
