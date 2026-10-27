// Independent per-channel, display-code 1D lookup table model.
// It is not a color-managed 3D LUT, display transform, or a host application's LUT engine.
export const LUT_WIDTH = 320;
export const LUT_HEIGHT = 144;
export const LUT_ENTRIES = Object.freeze([4, 8, 32, 256]);
export const LUT_DEFAULTS = Object.freeze({
  curve: 'power', exponent: 2, entries: 4, interpolation: 'nearest',
  pattern: 'gray', zoom: 1,
});
export const LUT_SAMPLE_CODES = Object.freeze([0, 64, 128, 192, 255]);

function requireSettings(entries, curve, exponent, interpolation) {
  if (!LUT_ENTRIES.includes(entries) || !['identity', 'power', 'smoothstep'].includes(curve) ||
      typeof exponent !== 'number' || !Number.isFinite(exponent) ||
      exponent < 0.5 || exponent > 3 ||
      !['nearest', 'linear'].includes(interpolation)) {
    throw new RangeError('Invalid educational 1D LUT settings.');
  }
}
function evaluateCurve(input, curve, exponent) {
  if (curve === 'identity') return input;
  if (curve === 'power') return input ** exponent;
  return input * input * (3 - 2 * input); // smoothstep, not an industry tone curve
}
export function curveAt(input, curve = 'power', exponent = 2) {
  requireSettings(4, curve, exponent, 'linear');
  if (typeof input !== 'number' || !Number.isFinite(input) || input < 0 || input > 1) {
    throw new RangeError('Expected normalized input in 0..1.');
  }
  return evaluateCurve(input, curve, exponent);
}
export function makeLut(entries = 4, curve = 'power', exponent = 2) {
  requireSettings(entries, curve, exponent, 'linear');
  return Float64Array.from({length: entries}, (_, i) =>
    evaluateCurve(i / (entries - 1), curve, exponent));
}
export function lookupAt(input, values, interpolation = 'nearest') {
  if (!(values instanceof Float64Array) || values.length < 2 ||
      !['nearest', 'linear'].includes(interpolation) ||
      typeof input !== 'number' || !Number.isFinite(input) || input < 0 || input > 1) {
    throw new RangeError('Invalid 1D LUT lookup.');
  }
  const location = input * (values.length - 1);
  if (interpolation === 'nearest') return values[Math.round(location)];
  const lo = Math.floor(location);
  const hi = Math.min(values.length - 1, lo + 1);
  const factor = location - lo;
  return values[lo] * (1 - factor) + values[hi] * factor;
}
function validateImage(source, width, height) {
  if (!(source instanceof Uint8ClampedArray) || !Number.isInteger(width) ||
      !Number.isInteger(height) || width < 2 || height < 2 ||
      source.length !== width * height * 4) {
    throw new RangeError('Expected matching opaque Uint8ClampedArray RGBA image.');
  }
  for (let i = 3; i < source.length; i += 4) {
    if (source[i] !== 255) throw new RangeError('Only opaque pixels are supported.');
  }
}
export function createLutPattern(width = LUT_WIDTH, height = LUT_HEIGHT, pattern = 'gray') {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
      width < 2 || height < 2 || !['gray', 'rgb'].includes(pattern)) {
    throw new RangeError('Expected width/height >= 2 and valid pattern.');
  }
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const band = Math.min(5, Math.floor(6 * y / height));
    for (let x = 0; x < width; x++) {
      const code = Math.round(255 * x / (width - 1));
      const i = 4 * (y * width + x);
      let channels;
      if (pattern === 'gray') channels = [code, code, code];
      else {
        const masks = [[1,0,0], [0,1,0], [0,0,1], [1,1,0], [0,1,1], [1,0,1]];
        channels = masks[band].map(m => code * m);
      }
      pixels[i] = channels[0];
      pixels[i + 1] = channels[1];
      pixels[i + 2] = channels[2];
      pixels[i + 3] = 255;
    }
  }
  return pixels;
}
export function renderLut(source, width, height, entries = 4,
  curve = 'power', exponent = 2, interpolation = 'nearest') {
  requireSettings(entries, curve, exponent, interpolation);
  validateImage(source, width, height);
  const values = makeLut(entries, curve, exponent);
  const idealCodes = Uint8Array.from({length: 256}, (_, code) =>
    Math.round(255 * evaluateCurve(code / 255, curve, exponent)));
  const approxCodes = Uint8Array.from({length: 256}, (_, code) =>
    Math.round(255 * lookupAt(code / 255, values, interpolation)));
  let maxErrorCode = 0;
  for (let code = 0; code <= 255; code++) {
    maxErrorCode = Math.max(maxErrorCode, Math.abs(idealCodes[code] - approxCodes[code]));
  }
  const ideal = new Uint8ClampedArray(source.length);
  const approximation = new Uint8ClampedArray(source.length);
  for (let i = 0; i < source.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      const code = source[i + channel];
      ideal[i + channel] = idealCodes[code];
      approximation[i + channel] = approxCodes[code];
    }
    ideal[i + 3] = 255;
    approximation[i + 3] = 255;
  }
  return {ideal, approximation, maxErrorCode};
}
