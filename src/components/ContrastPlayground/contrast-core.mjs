// Linear pivot-centered contrast on display-encoded 8-bit grayscale samples.
// No scene-linear, HDR, gamut or host-application equivalence is implied.
export function contrastGrayscale(bytes, width, height, gain = 1, pivot = 128) {
  if (!(bytes instanceof Uint8ClampedArray) || !Number.isSafeInteger(width) ||
      !Number.isSafeInteger(height) || width < 1 || height < 1 ||
      bytes.length !== width * height) {
    throw new RangeError('幅×高さに一致する8-bitグレースケール画素が必要です。');
  }
  if (!Number.isFinite(gain) || gain < 0.5 || gain > 2 ||
      !Number.isFinite(pivot) || pivot < 64 || pivot > 192) {
    throw new RangeError('倍率は0.5〜2、ピボットは64〜192に指定してください。');
  }
  const pixels = new Uint8ClampedArray(bytes.length);
  let outsideCount = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    const raw = pivot + gain * (bytes[i] - pivot);
    if (raw < 0 || raw > 255) outsideCount += 1;
    pixels[i] = Math.max(0, Math.min(255, Math.round(raw)));
  }
  return {pixels, outsideCount};
}
