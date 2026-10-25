// Educational HSL hue rotation of 8-bit encoded sRGB, not scene-linear or perceptually uniform color grading.
export const HUE_SHIFT_WIDTH = 384;
export const HUE_SHIFT_HEIGHT = 160;
export const HUE_SHIFT_DEFAULT = 0;
export const HUE_SHIFT_SWATCHES = Object.freeze([
  Object.freeze({label: '赤', rgb: Object.freeze([255, 0, 0])}),
  Object.freeze({label: '青', rgb: Object.freeze([0, 0, 255])}),
  Object.freeze({label: 'グレー', rgb: Object.freeze([128, 128, 128])}),
]);
const PATCHES = Object.freeze([
  [221, 59, 61], [224, 147, 58], [208, 193, 61], [66, 171, 88],
  [70, 156, 201], [94, 92, 197], [190, 76, 163], [128, 128, 128],
]);
function checkAngle(degrees) {
  if (!Number.isInteger(degrees) || degrees < -180 || degrees > 180 || degrees % 30 !== 0) {
    throw new RangeError('Hue offset must be an integer multiple of 30 degrees within -180..180.');
  }
}
function checkRgb(rgb) {
  if (!Array.isArray(rgb) || rgb.length !== 3 ||
      rgb.some((v) => !Number.isInteger(v) || v < 0 || v > 255)) {
    throw new RangeError('Expected an RGB tuple of three integer channels (0..255).');
  }
}
function wrapHue(degrees) { return ((degrees % 360) + 360) % 360; }
function rgbToHsl(r, g, b) {
  const red = r / 255, green = g / 255, blue = b / 255;
  const hi = Math.max(red, green, blue), lo = Math.min(red, green, blue);
  const delta = hi - lo, light = (hi + lo) / 2;
  if (delta === 0) return [0, 0, light];
  const sat = delta / (1 - Math.abs(2 * light - 1));
  let hue;
  if (hi === red) hue = 60 * (((green - blue) / delta) % 6);
  else if (hi === green) hue = 60 * ((blue - red) / delta + 2);
  else hue = 60 * ((red - green) / delta + 4);
  return [wrapHue(hue), sat, light];
}
function hslToRgb(hue, sat, light) {
  if (sat === 0) {
    const gray = Math.round(light * 255);
    return [gray, gray, gray];
  }
  const h = wrapHue(hue);
  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const x = chroma * (1 - Math.abs((h / 60) % 2 - 1));
  const m = light - chroma / 2;
  const sector = Math.floor(h / 60);
  const parts = [
    [chroma, x, 0], [x, chroma, 0], [0, chroma, x],
    [0, x, chroma], [x, 0, chroma], [chroma, 0, x],
  ][sector];
  return parts.map(v => Math.round(Math.max(0, Math.min(1, v + m)) * 255));
}
export function shiftHueRgb(rgb, degrees = HUE_SHIFT_DEFAULT) {
  checkRgb(rgb);
  checkAngle(degrees);
  if (degrees === 0 || (rgb[0] === rgb[1] && rgb[1] === rgb[2])) return [...rgb];
  const [hue, sat, light] = rgbToHsl(...rgb);
  return hslToRgb(hue + degrees, sat, light);
}
export function createHueShiftPattern(width, height, pattern = 'hues') {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 2 || height < 2 ||
      !['hues', 'patches'].includes(pattern)) {
    throw new RangeError('Expected dimensions >= 2 and pattern hues or patches.');
  }
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const light = 0.25 + 0.45 * y / (height - 1);
    for (let x = 0; x < width; x += 1) {
      const rgb = pattern === 'hues'
        ? hslToRgb(x * 360 / (width - 1), 0.8, light)
        : PATCHES[Math.min(7, Math.floor(8 * x / width))];
      const idx = (y * width + x) * 4;
      pixels.set(rgb, idx);
      pixels[idx + 3] = 255;
    }
  }
  return pixels;
}
export function renderHueShift(source, width, height, degrees = HUE_SHIFT_DEFAULT) {
  checkAngle(degrees);
  if (!(source instanceof Uint8ClampedArray) || !Number.isInteger(width) ||
      !Number.isInteger(height) || width < 1 || height < 1 ||
      source.length !== 4 * width * height) {
    throw new RangeError('Expected opaque RGBA Uint8ClampedArray matching dimensions.');
  }
  const pixels = new Uint8ClampedArray(source.length);
  for (let i = 0; i < source.length; i += 4) {
    if (source[i + 3] !== 255) throw new RangeError('This exercise requires opaque pixels.');
    pixels.set(shiftHueRgb([source[i], source[i + 1], source[i + 2]], degrees), i);
    pixels[i + 3] = 255;
  }
  return pixels;
}
