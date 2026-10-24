// An educational 8-bit grayscale, two-segment tone curve in display code values.
// This is not a model of scene-linear light or any specific grading application's Curves.
export function buildToneCurveLut(midOutput = 128) {
  if (!Number.isSafeInteger(midOutput) || midOutput < 32 || midOutput > 224) {
    throw new RangeError('中間点の出力は32〜224の整数で指定してください。');
  }
  const lut = new Uint8ClampedArray(256);
  for (let value = 0; value <= 255; value += 1) {
    const mapped = value <= 128
      ? value * midOutput / 128
      : midOutput + (value - 128) * (255 - midOutput) / 127;
    lut[value] = Math.round(mapped);
  }
  return lut;
}

export function toneCurveGrayscale(bytes, width, height, midOutput = 128) {
  if (!(bytes instanceof Uint8ClampedArray) ||
      !Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width < 1 || height < 1 || bytes.length !== width * height) {
    throw new RangeError('幅×高さに一致する8-bitグレースケール画素が必要です。');
  }
  const lut = buildToneCurveLut(midOutput);
  const pixels = new Uint8ClampedArray(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) pixels[i] = lut[bytes[i]];
  return {pixels, lut};
}
