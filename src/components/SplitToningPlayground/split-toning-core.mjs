// A deliberately limited 8-bit sRGB-code-value teaching model, not a host color-grading engine.
export const ST_WIDTH = 320;
export const ST_HEIGHT = 144;
export const ST_DEFAULTS = Object.freeze({
  pattern: 'gradient', shadowHue: 220, highlightHue: 35,
  shadowStrength: 0.65, highlightStrength: 0.65,
  balance: 0, transition: 0.5, zoom: 1,
});

const clamp01 = x => Math.max(0, Math.min(1, x));
function finiteInRange(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(label + ' is out of range');
  }
}
function validateSize(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) ||
      width < 1 || height < 1 || width > 2048 || height > 2048) {
    throw new RangeError('Image size must be 1–2048 in each dimension');
  }
}
function validateControls(p) {
  finiteInRange(p.shadowHue, 0, 360, 'shadowHue');
  finiteInRange(p.highlightHue, 0, 360, 'highlightHue');
  finiteInRange(p.shadowStrength, 0, 1, 'shadowStrength');
  finiteInRange(p.highlightStrength, 0, 1, 'highlightStrength');
  finiteInRange(p.balance, -0.35, 0.35, 'balance');
  finiteInRange(p.transition, 0.1, 0.9, 'transition');
}

export function hueDirection(degrees) {
  finiteInRange(degrees, 0, 360, 'hue');
  const h = (degrees % 360) / 60;
  const x = 1 - Math.abs(h % 2 - 1);
  const sector = Math.floor(h);
  const rgb = [[1, x, 0], [x, 1, 0], [0, 1, x],
    [0, x, 1], [x, 0, 1], [1, 0, x]][sector];
  const y = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return rgb.map(v => v - y); // zero Y' in encoded-RGB arithmetic before clipping
}

export function toneWeights(luma, balance = 0, transition = 0.5) {
  finiteInRange(luma, 0, 1, 'luma');
  finiteInRange(balance, -0.35, 0.35, 'balance');
  finiteInRange(transition, 0.1, 0.9, 'transition');
  // Positive balance expands the shadow interval in THIS teaching model.
  const t = clamp01((luma - (0.5 + balance)) / transition + 0.5);
  const highlight = t * t * (3 - 2 * t);
  return {shadow: 1 - highlight, highlight};
}

export function makeSplitPattern(width = ST_WIDTH, height = ST_HEIGHT, pattern = 'gradient') {
  validateSize(width, height);
  if (!['gradient', 'patches'].includes(pattern)) throw new RangeError('Unsupported pattern');
  const src = new Uint8ClampedArray(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rgb;
      if (pattern === 'gradient') {
        const v = Math.round(255 * x / Math.max(1, width - 1));
        rgb = [v, v, v];
      } else {
        const col = Math.min(7, Math.floor(x * 8 / width));
        const row = Math.min(2, Math.floor(y * 3 / height));
        const v = Math.round((col + 0.5) * 255 / 8);
        rgb = row === 0 ? [v, v, v] :
          row === 1 ? [Math.min(255, v * 1.15), v * 0.92, v * 0.8] :
            [v * 0.78, v * 0.94, Math.min(255, v * 1.15)];
      }
      const at = (y * width + x) * 3;
      for (let c = 0; c < 3; c++) src[at + c] = rgb[c];
    }
  }
  return src;
}

export function renderSplitTone(source, width, height, params = {}) {
  validateSize(width, height);
  if (!(source instanceof Uint8ClampedArray) || source.length !== width * height * 3) {
    throw new RangeError('Expected an RGB Uint8ClampedArray with three bytes per pixel');
  }
  const p = {...ST_DEFAULTS, ...params};
  validateControls(p);
  const shadowTint = hueDirection(p.shadowHue);
  const highlightTint = hueDirection(p.highlightHue);
  const original = new Uint8ClampedArray(width * height * 4);
  const graded = new Uint8ClampedArray(original.length);
  const weights = new Uint8ClampedArray(original.length);
  let clippedPixels = 0;
  for (let i = 0; i < width * height; i++) {
    const src = i * 3, dst = i * 4;
    const rgb = [source[src] / 255, source[src + 1] / 255, source[src + 2] / 255];
    const luma = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    const weight = toneWeights(luma, p.balance, p.transition);
    // Reduce color displacement at pure black/white; no synthetic HDR claims.
    const amplitude = 0.45 * Math.sqrt(Math.max(0, 4 * luma * (1 - luma)));
    let clipped = false;
    for (let c = 0; c < 3; c++) {
      const tint = weight.shadow * p.shadowStrength * shadowTint[c] +
        weight.highlight * p.highlightStrength * highlightTint[c];
      const v = rgb[c] + amplitude * tint;
      clipped ||= v < 0 || v > 1;
      original[dst + c] = source[src + c];
      graded[dst + c] = Math.round(clamp01(v) * 255);
    }
    if (clipped) clippedPixels++;
    weights[dst] = Math.round(255 * weight.highlight);
    weights[dst + 1] = 58;
    weights[dst + 2] = Math.round(255 * weight.shadow);
    original[dst + 3] = graded[dst + 3] = weights[dst + 3] = 255;
  }
  const sampleIndex = (Math.floor(height / 2) * width + Math.floor(width / 2));
  const at = sampleIndex * 4;
  return {
    original, graded, weights, clippedPixels, total: width * height,
    sampleOriginal: Array.from(original.slice(at, at + 3)),
    sampleGraded: Array.from(graded.slice(at, at + 3)),
  };
}
