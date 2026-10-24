// Power-law transform of display-encoded 8-bit grayscale sample values.
// This intentionally does not implement sRGB EOTF/OETF or scene-linear grading.
export function gammaGrayscale(bytes, width, height, exponent = 1) {
  if (!(bytes instanceof Uint8ClampedArray) || !Number.isInteger(width) ||
      !Number.isInteger(height) || width < 1 || height < 1 ||
      bytes.length !== width * height) {
    throw new RangeError('幅×高さと一致する8-bitグレースケール画素が必要です。');
  }
  if (!Number.isFinite(exponent) || exponent < 0.25 || exponent > 3) {
    throw new RangeError('指数は0.25〜3.00の有限の値で指定してください。');
  }
  const result = new Uint8ClampedArray(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    result[i] = Math.round(255 * (bytes[i] / 255) ** exponent);
  }
  return result;
}
