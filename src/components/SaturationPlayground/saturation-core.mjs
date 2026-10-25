// Educational sRGB-code-value saturation adjustment, not scene-linear or perceptual color grading.
export const SATURATION_WIDTH = 384;
export const SATURATION_HEIGHT = 160;
export const SATURATION_DEFAULT = 1;
export const SATURATION_SAMPLES = Object.freeze([
  Object.freeze({label: '暖色', rgb: Object.freeze([180, 100, 80])}),
  Object.freeze({label: '寒色', rgb: Object.freeze([80, 160, 210])}),
  Object.freeze({label: '無彩色', rgb: Object.freeze([128, 128, 128])}),
]);
const PATCHES = Object.freeze([
  [210, 65, 60], [70, 173, 96], [78, 117, 211], [218, 179, 72],
  [187, 90, 163], [69, 176, 183], [128, 128, 128], [204, 158, 116],
]);

function checkAmount(amount) {
  if (!Number.isFinite(amount) || amount < 0 || amount > 2 ||
      Math.abs(amount * 4 - Math.round(amount * 4)) > 1e-9) {
    throw new RangeError('Saturation amount must be 0–2 in 0.25 steps.');
  }
}

function checkRgb(rgb) {
  if (!Array.isArray(rgb) || rgb.length !== 3 ||
      rgb.some((v) => !Number.isInteger(v) || v < 0 || v > 255)) {
    throw new RangeError('Expected three 8-bit RGB channel values.');
  }
}

function clip8(value) { return Math.max(0, Math.min(255, Math.round(value))); }

function saturationRaw(r, g, b, amount) {
  // Borrowed Rec.709/sRGB primary weights on *nonlinear code values*.
  // Deliberately a luma-like proxy, not physical linear-light luminance.
  const neutral = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return [neutral + amount * (r - neutral),
    neutral + amount * (g - neutral), neutral + amount * (b - neutral)];
}

export function adjustCodeSaturation(rgb, amount = SATURATION_DEFAULT) {
  checkRgb(rgb);
  checkAmount(amount);
  return saturationRaw(rgb[0], rgb[1], rgb[2], amount).map(clip8);
}

export function createSaturationPattern(width, height, pattern = 'hues') {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 2 || height < 2 ||
      !['hues', 'patches'].includes(pattern)) {
    throw new RangeError('Expected valid dimensions and hues or patches pattern.');
  }
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    // Keep vertical brightness varied to show how code-value processing affects tones.
    const brightness = 0.4 + 0.6 * y / (height - 1);
    for (let x = 0; x < width; x += 1) {
      let rgb;
      if (pattern === 'patches') {
        rgb = PATCHES[Math.min(7, Math.floor(x * 8 / width))];
      } else {
        const h = x / (width - 1) * 6;
        const sector = Math.min(5, Math.floor(h));
        const f = h - sector;
        const unit = [
          [1, f, 0], [1 - f, 1, 0], [0, 1, f],
          [0, 1 - f, 1], [f, 0, 1], [1, 0, 1 - f],
        ][sector];
        // Colorful yet not fully saturated, so boosting has room before clipping.
        rgb = unit.map((v) => 255 * (0.20 + 0.65 * v));
      }
      const p = (y * width + x) * 4;
      pixels[p] = Math.round(rgb[0] * brightness);
      pixels[p + 1] = Math.round(rgb[1] * brightness);
      pixels[p + 2] = Math.round(rgb[2] * brightness);
      pixels[p + 3] = 255;
    }
  }
  return pixels;
}

export function renderSaturation(source, width, height, amount = SATURATION_DEFAULT) {
  checkAmount(amount);
  if (!(source instanceof Uint8ClampedArray) || !Number.isInteger(width) ||
      !Number.isInteger(height) || width < 1 || height < 1 ||
      source.length !== width * height * 4) {
    throw new RangeError('Expected RGBA Uint8ClampedArray matching dimensions.');
  }
  const pixels = new Uint8ClampedArray(source.length);
  let clippedPixels = 0;
  for (let i = 0; i < source.length; i += 4) {
    if (source[i + 3] !== 255) {
      throw new RangeError('This exercise only supports fully opaque RGB input.');
    }
    const raw = saturationRaw(source[i], source[i + 1], source[i + 2], amount);
    const outside = raw.some((v) => v < 0 || v > 255);
    if (outside) clippedPixels += 1;
    for (let channel = 0; channel < 3; channel += 1) pixels[i + channel] = clip8(raw[channel]);
    pixels[i + 3] = 255;
  }
  return {pixels, clippedPixels};
}
