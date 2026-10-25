// Display-referred sRGB 8-bit grayscale lesson. Not camera exposure, scene-linear
// HDR processing, or a numerical emulation of AE/Resolve grading operators.
function decodeSrgb(byte) {
  const encoded = byte / 255;
  return encoded <= 0.04045
    ? encoded / 12.92
    : ((encoded + 0.055) / 1.055) ** 2.4;
}

function encodeSrgb(linear) {
  const bounded = Math.max(0, Math.min(1, linear));
  const encoded = bounded <= 0.0031308
    ? 12.92 * bounded
    : 1.055 * (bounded ** (1 / 2.4)) - 0.055;
  return Math.round(encoded * 255);
}

export function buildExposureLut(ev = 0) {
  if (!Number.isFinite(ev) || ev < -2 || ev > 2 || !Number.isInteger(ev * 2)) {
    throw new RangeError('露出補正は−2〜+2 EV、0.5 EV刻みで指定してください。');
  }
  const gain = 2 ** ev;
  const lut = new Uint8ClampedArray(256);
  const clippedInput = new Uint8Array(256);
  for (let value = 0; value < 256; value += 1) {
    const boosted = decodeSrgb(value) * gain;
    lut[value] = ev === 0 ? value : encodeSrgb(boosted);
    // Count only newly out-of-display-range input values (not existing white).
    if (value < 255 && boosted > 1) clippedInput[value] = 1;
  }
  return {lut, clippedInput};
}

export function exposureGrayscale(bytes, width, height, ev = 0) {
  if (!(bytes instanceof Uint8ClampedArray) ||
      !Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width < 1 || height < 1 || !Number.isSafeInteger(width * height) ||
      bytes.length !== width * height) {
    throw new RangeError('幅×高さに一致する8-bitグレースケール画素が必要です。');
  }
  const {lut, clippedInput} = buildExposureLut(ev);
  const pixels = new Uint8ClampedArray(bytes.length);
  let clippedCount = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    const input = bytes[i];
    pixels[i] = lut[input];
    clippedCount += clippedInput[input];
  }
  return {pixels, lut, clippedCount};
}
