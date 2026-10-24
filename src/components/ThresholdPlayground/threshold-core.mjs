// Fixed global binary threshold for an 8-bit grayscale teaching pattern.
// The source array is display-encoded bytes, not scene-linear light.
export function thresholdGrayscale(bytes, width, height, threshold = 128) {
  if (!(bytes instanceof Uint8ClampedArray) || !Number.isInteger(width) ||
      !Number.isInteger(height) || width < 1 || height < 1 ||
      bytes.length !== width * height) {
    throw new RangeError('入力は幅×高さに一致する8-bitグレースケール画素列が必要です。');
  }
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 255) {
    throw new RangeError('しきい値は0〜255の整数で指定してください。');
  }

  const output = new Uint8ClampedArray(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    output[i] = bytes[i] > threshold ? 255 : 0;
  }
  return output;
}
