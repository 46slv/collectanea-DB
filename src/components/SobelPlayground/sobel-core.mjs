// Display-encoded grayscale 8-bit teaching model, not a color-managed edge detector.
export const SOBEL_PREVIEW_WIDTH = 384;
export const SOBEL_PREVIEW_HEIGHT = 160;
export const INITIAL_SOBEL_SETTINGS = Object.freeze({source: 'edge', gain: 1, threshold: 70});

function assertSize(width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 ||
      width * height > 4_194_304) {
    throw new RangeError('画像サイズは正の整数で、総画素数4194304以下にしてください。');
  }
}

/** Make deterministic original 8-bit scenes; no downloaded assets or random seed. */
export function makeSobelTestPattern(width, height, source = 'edge') {
  assertSize(width, height);
  if (!['edge', 'diagonal', 'texture'].includes(source)) throw new RangeError('未知のテスト画像です。');
  const output = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value;
      if (source === 'edge') {
        // One crisp boundary, a small rectangle, and a thin line.
        value = x < width * 0.50 ? 32 : 210;
        if (x > width * 0.15 && x < width * 0.32 && y > height * 0.18 && y < height * 0.77) value = 245;
        if (y > height * 0.83 && y < height * 0.86) value = 115;
      } else if (source === 'diagonal') {
        const signed = x / width - y / height - 0.07;
        value = signed > 0 ? 223 : 26;
      } else {
        // Low-contrast fine texture versus one strong square boundary.
        value = ((Math.floor(x / 5) + Math.floor(y / 5)) % 2) ? 112 : 144;
        if (x > width * 0.28 && x < width * 0.73 && y > height * 0.24 && y < height * 0.77) value = 222;
      }
      output[y * width + x] = value;
    }
  }
  return output;
}

/**
 * Sobel 3x3 horizontal/vertical derivatives with clamped edge coordinates.
 * Derivative normalization /4 maps an ideal 0→255 vertical edge to 255 at gain=1.
 * Returns unthresholded gradient magnitude, unsigned and signed-display x/y components, and thresholded edge intensity.
 * Outputs are 8-bit display encoded, not calibrated contrast/gradient units.
 */
export function sobelEdgesGrayscale(pixels, width, height, {gain = 1, threshold = 70} = {}) {
  assertSize(width, height);
  if (!(pixels instanceof Uint8ClampedArray) || pixels.length !== width * height) {
    throw new RangeError('入力画素数または8-bitグレースケール型が不正です。');
  }
  if (!Number.isFinite(gain) || gain < 0.25 || gain > 4 ||
      !Number.isInteger(threshold) || threshold < 0 || threshold > 255) {
    throw new RangeError('強調倍率は0.25〜4、閾値は0〜255の整数で指定してください。');
  }

  const magnitude = new Uint8ClampedArray(pixels.length);
  const gradientX = new Uint8ClampedArray(pixels.length);
  const gradientY = new Uint8ClampedArray(pixels.length);
  // Signed displays: neutral 128, positive >128, negative <128; /8 reserves headroom on both sides.
  const signedGradientX = new Uint8ClampedArray(pixels.length);
  const signedGradientY = new Uint8ClampedArray(pixels.length);
  const edges = new Uint8ClampedArray(pixels.length);
  let edgeCount = 0;
  const sample = (x, y) => pixels[Math.max(0, Math.min(height - 1, y)) * width +
    Math.max(0, Math.min(width - 1, x))];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const tl = sample(x - 1, y - 1), tc = sample(x, y - 1), tr = sample(x + 1, y - 1);
      const ml = sample(x - 1, y), mr = sample(x + 1, y);
      const bl = sample(x - 1, y + 1), bc = sample(x, y + 1), br = sample(x + 1, y + 1);
      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      const i = y * width + x;
      gradientX[i] = Math.min(255, Math.abs(gx) * gain / 4);
      gradientY[i] = Math.min(255, Math.abs(gy) * gain / 4);
      signedGradientX[i] = Math.max(0, Math.min(255, 128 + gx * gain / 8));
      signedGradientY[i] = Math.max(0, Math.min(255, 128 + gy * gain / 8));
      magnitude[i] = Math.min(255, Math.hypot(gx, gy) * gain / 4);
      edges[i] = magnitude[i] >= threshold ? magnitude[i] : 0;
      if (edges[i] > 0) edgeCount += 1;
    }
  }
  return {magnitude, gradientX, gradientY, signedGradientX, signedGradientY, edges, edgeCount};
}
