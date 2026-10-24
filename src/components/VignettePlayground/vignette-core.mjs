// Educational radial darkening of display-encoded 8-bit grayscale pixels.
// This does not model measured lens transmission, RAW correction or linear-light exposure.
export const VIGNETTE_WIDTH = 384;
export const VIGNETTE_HEIGHT = 160;
export const VIGNETTE_INITIAL = Object.freeze({
  pattern: 'grid', strength: 65, innerRadius: 35, centerX: 50,
});

export function makeVignettePattern(width, height, pattern = 'grid') {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
      width < 2 || height < 2 || !['grid', 'gradient'].includes(pattern))
    throw new RangeError('画像条件が不正です。');
  const output = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let value;
    if (pattern === 'grid') {
      value = (x % 32 < 2 || y % 32 < 2) ? 226 : 142;
      const dx = x - width * 0.5, dy = y - height * 0.5;
      if (dx * dx + dy * dy < 14 * 14) value = 250;
    } else {
      value = 42 + 184 * x / (width - 1);
    }
    output[y * width + x] = value;
  }
  return output;
}

/**
 * r = distance to adjustable center, normalized by the farthest image corner
 * in aspect-normalized image coordinates. The 0..1 mask uses smoothstep or t^2.
 */
export function vignetteGrayscale(input, width, height, {
  strength = 65, innerRadius = 35, centerX = 50, falloff = 'smooth',
} = {}) {
  if (!(input instanceof Uint8ClampedArray) ||
      !Number.isInteger(width) || !Number.isInteger(height) ||
      width < 2 || height < 2 || input.length !== width * height)
    throw new RangeError('画素配列と画像サイズが一致しません。');
  if (!Number.isInteger(strength) || strength < 0 || strength > 100 ||
      !Number.isInteger(innerRadius) || innerRadius < 0 || innerRadius > 80 ||
      !Number.isInteger(centerX) || centerX < 20 || centerX > 80 ||
      !['smooth', 'quadratic'].includes(falloff))
    throw new RangeError('周辺減光のパラメータが範囲外です。');
  if (strength === 0) return input.slice();
  const cx = centerX / 100;
  const outer = Math.hypot(Math.max(cx, 1 - cx), 0.5);
  const start = innerRadius / 100;
  const output = new Uint8ClampedArray(input.length);
  const scale = strength / 100;
  for (let y = 0; y < height; y++) {
    const v = y / (height - 1) - 0.5;
    for (let x = 0; x < width; x++) {
      const u = x / (width - 1) - cx;
      const radius = Math.hypot(u, v) / outer;
      const t = Math.max(0, Math.min(1, (radius - start) / (1 - start)));
      const mask = falloff === 'smooth' ? t * t * (3 - 2 * t) : t * t;
      const i = y * width + x;
      output[i] = input[i] * (1 - scale * mask);
    }
  }
  return output;
}
