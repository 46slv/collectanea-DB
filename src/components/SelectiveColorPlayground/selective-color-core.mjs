// Educational HSL hue-range saturation adjustment of encoded 8-bit sRGB.
export const SELECTIVE_WIDTH = 384;
export const SELECTIVE_HEIGHT = 160;
export const SELECTIVE_DEFAULTS = Object.freeze({
  center: 0, width: 45, softness: 50, amount: 1.5, pattern: 'patches', zoom: 1,
});
export const SELECTIVE_SAMPLES = Object.freeze([
  Object.freeze({label: '赤', rgb: Object.freeze([255, 0, 0])}),
  Object.freeze({label: '青', rgb: Object.freeze([0, 0, 255])}),
  Object.freeze({label: 'グレー', rgb: Object.freeze([128, 128, 128])}),
]);
const PATCHES = Object.freeze([
  [230, 61, 57], [233, 137, 56], [214, 194, 66], [75, 171, 87],
  [69, 151, 213], [96, 91, 206], [198, 81, 166], [128, 128, 128],
]);
const clamp = value => Math.max(0, Math.min(1, value));
function checkRgb(rgb) {
  if (!Array.isArray(rgb) || rgb.length !== 3 ||
    rgb.some(value => !Number.isInteger(value) || value < 0 || value > 255)) {
    throw new RangeError('Expected integer RGB components in 0..255.');
  }
}
function checkSettings(settings) {
  if (!settings || !Number.isInteger(settings.center) ||
    settings.center < 0 || settings.center > 330 || settings.center % 30 !== 0 ||
    !Number.isInteger(settings.width) || settings.width < 30 ||
    settings.width > 90 || settings.width % 15 !== 0 ||
    !Number.isInteger(settings.softness) || settings.softness < 0 ||
    settings.softness > 100 || settings.softness % 25 !== 0 ||
    !Number.isFinite(settings.amount) || settings.amount < 0 ||
    settings.amount > 2 || !Number.isInteger(settings.amount * 4)) {
    throw new RangeError('Expected valid hue center, half-width, softness and saturation factor.');
  }
}
function wrapHue(degrees) { return ((degrees % 360) + 360) % 360; }
function rgbToHsl(rgb) {
  const [r, g, b] = rgb.map(channel => channel / 255);
  const hi = Math.max(r, g, b), lo = Math.min(r, g, b);
  const delta = hi - lo, light = (hi + lo) / 2;
  if (delta === 0) return [0, 0, light];
  const sat = delta / (1 - Math.abs(2 * light - 1));
  let hue;
  if (hi === r) hue = 60 * (((g - b) / delta) % 6);
  else if (hi === g) hue = 60 * ((b - r) / delta + 2);
  else hue = 60 * ((r - g) / delta + 4);
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
  const channels = [
    [chroma, x, 0], [x, chroma, 0], [0, chroma, x],
    [0, x, chroma], [x, 0, chroma], [chroma, 0, x],
  ][sector];
  return channels.map(value => Math.round(clamp(value + m) * 255));
}
function weightFromHue(hue, settings) {
  const delta = Math.abs(wrapHue(hue) - settings.center);
  const distance = Math.min(delta, 360 - delta);
  if (distance > settings.width) return 0;
  const inner = settings.width * (1 - settings.softness / 100);
  if (settings.softness === 0 || distance <= inner) return 1;
  const t = (distance - inner) / (settings.width - inner);
  return 1 - t * t * (3 - 2 * t);
}
export function selectiveColorWeight(rgb, settings = SELECTIVE_DEFAULTS) {
  checkRgb(rgb);
  checkSettings(settings);
  const [hue, saturation] = rgbToHsl(rgb);
  return saturation === 0 ? 0 : weightFromHue(hue, settings);
}
export function selectiveColorRgb(rgb, settings = SELECTIVE_DEFAULTS) {
  checkRgb(rgb);
  checkSettings(settings);
  if (settings.amount === 1) return [...rgb];
  const [hue, saturation, lightness] = rgbToHsl(rgb);
  const weight = saturation === 0 ? 0 : weightFromHue(hue, settings);
  if (weight === 0) return [...rgb];
  return hslToRgb(hue, clamp(saturation * (1 + weight * (settings.amount - 1))), lightness);
}
export function createSelectiveColorPattern(width, height, pattern = 'patches') {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
    width < 2 || height < 2 || width > 1024 || height > 512 ||
    !['patches', 'spectrum'].includes(pattern)) {
    throw new RangeError('Expected dimensions 2..1024/512 and patches or spectrum.');
  }
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const saturation = 0.2 + 0.8 * y / (height - 1);
    for (let x = 0; x < width; x += 1) {
      const rgb = pattern === 'patches'
        ? PATCHES[Math.min(7, Math.floor(8 * x / width))]
        : hslToRgb(x * 360 / (width - 1), saturation, 0.5);
      const i = (y * width + x) * 4;
      pixels.set(rgb, i);
      pixels[i + 3] = 255;
    }
  }
  return pixels;
}
export function renderSelectiveColor(source, width, height, settings = SELECTIVE_DEFAULTS) {
  checkSettings(settings);
  if (!(source instanceof Uint8ClampedArray) ||
    !Number.isInteger(width) || !Number.isInteger(height) ||
    width < 1 || height < 1 || source.length !== width * height * 4) {
    throw new RangeError('Expected RGBA Uint8ClampedArray matching dimensions.');
  }
  const output = new Uint8ClampedArray(source.length);
  const mask = new Uint8ClampedArray(source.length);
  let selectedPixels = 0;
  for (let i = 0; i < source.length; i += 4) {
    if (source[i + 3] !== 255) throw new RangeError('Opaque test images only.');
    const rgb = [source[i], source[i + 1], source[i + 2]];
    const [hue, sat, light] = rgbToHsl(rgb);
    const weight = sat === 0 ? 0 : weightFromHue(hue, settings);
    if (weight > 0) selectedPixels += 1;
    const modified = weight === 0 || settings.amount === 1
      ? rgb : hslToRgb(hue, clamp(sat * (1 + weight * (settings.amount - 1))), light);
    output.set(modified, i);
    output[i + 3] = 255;
    const shade = Math.round(weight * 255);
    mask[i] = shade; mask[i + 1] = shade; mask[i + 2] = shade; mask[i + 3] = 255;
  }
  return {output, mask, selectedPixels};
}
