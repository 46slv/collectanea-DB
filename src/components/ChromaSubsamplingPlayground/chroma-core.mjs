// Educational Y'CbCr-like chroma averaging on 8-bit display-coded RGB.
// Not a conformant video encoder, Rec.709 transfer implementation, or chroma-siting model.
export const FORMATS = Object.freeze(['444', '422', '420']);
export const PATTERNS = Object.freeze(['columns', 'rows', 'checker']);
export const PREVIEW_WIDTH = 192;
export const PREVIEW_HEIGHT = 96;
const KR = 0.2126;
const KB = 0.0722;
const KG = 1 - KR - KB;
const COLOR_A = Object.freeze([192, 56, 96]);
const COLOR_B = Object.freeze([0, 112, 108]);

function checkShape(width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width < 2 || height < 2 || width * height > 262144) {
    throw new RangeError('画像の幅・高さは2以上、画素数は262144以下にしてください。');
  }
}
export function chromaGrid(width, height, format = '420') {
  checkShape(width, height);
  if (!FORMATS.includes(format)) throw new RangeError('形式は444/422/420です。');
  const stepX = format === '444' ? 1 : 2;
  const stepY = format === '420' ? 2 : 1;
  const chromaWidth = Math.ceil(width / stepX);
  const chromaHeight = Math.ceil(height / stepY);
  return {
    stepX, stepY, chromaWidth, chromaHeight,
    lumaSamples: width * height,
    chromaSamplesPerPlane: chromaWidth * chromaHeight,
  };
}
export function rgbToYcc(r, g, b) {
  for (const value of [r, g, b]) {
    if (!Number.isFinite(value) || value < 0 || value > 255) {
      throw new RangeError('RGBは0〜255の有限数です。');
    }
  }
  const y = KR * r + KG * g + KB * b;
  return [y, (b - y) / (2 * (1 - KB)), (r - y) / (2 * (1 - KR))];
}
export function yccToRgb(y, cb, cr) {
  const r = y + 2 * (1 - KR) * cr;
  const b = y + 2 * (1 - KB) * cb;
  const g = (y - KR * r - KB * b) / KG;
  return [r, g, b].map(value => Math.max(0, Math.min(255, Math.round(value))));
}
export function makeChromaPattern(width, height, pattern = 'columns') {
  checkShape(width, height);
  if (!PATTERNS.includes(pattern)) throw new RangeError('未対応のテストパターンです。');
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const odd = pattern === 'columns' ? x % 2
        : pattern === 'rows' ? y % 2 : (x + y) % 2;
      const color = odd ? COLOR_B : COLOR_A;
      const at = (y * width + x) * 4;
      rgba[at] = color[0];
      rgba[at + 1] = color[1];
      rgba[at + 2] = color[2];
      rgba[at + 3] = 255;
    }
  }
  return rgba;
}
export function subsampleChroma(source, width, height, format = '420') {
  const grid = chromaGrid(width, height, format);
  if (!(source instanceof Uint8ClampedArray) || source.length !== width * height * 4) {
    throw new TypeError('幅×高さ×4の8-bit RGBA入力が必要です。');
  }
  const yPlane = new Float64Array(width * height);
  const cbPlane = new Float64Array(width * height);
  const crPlane = new Float64Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const at = i * 4;
    if (source[at + 3] !== 255) throw new RangeError('教材では不透明な入力のみ対応します。');
    const [y, cb, cr] = rgbToYcc(source[at], source[at + 1], source[at + 2]);
    yPlane[i] = y;
    cbPlane[i] = cb;
    crPlane[i] = cr;
  }
  const count = grid.chromaSamplesPerPlane;
  const cbSmall = new Float64Array(count);
  const crSmall = new Float64Array(count);
  for (let cy = 0; cy < grid.chromaHeight; cy += 1) {
    for (let cx = 0; cx < grid.chromaWidth; cx += 1) {
      let sumCb = 0, sumCr = 0, samples = 0;
      for (let dy = 0; dy < grid.stepY; dy += 1) {
        const y = cy * grid.stepY + dy;
        if (y >= height) continue;
        for (let dx = 0; dx < grid.stepX; dx += 1) {
          const x = cx * grid.stepX + dx;
          if (x >= width) continue;
          const at = y * width + x;
          sumCb += cbPlane[at];
          sumCr += crPlane[at];
          samples += 1;
        }
      }
      const small = cy * grid.chromaWidth + cx;
      cbSmall[small] = sumCb / samples;
      crSmall[small] = sumCr / samples;
    }
  }
  const rgba = new Uint8ClampedArray(source.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const small = Math.floor(y / grid.stepY) * grid.chromaWidth + Math.floor(x / grid.stepX);
      const [r, g, b] = yccToRgb(yPlane[i], cbSmall[small], crSmall[small]);
      rgba[i * 4] = r;
      rgba[i * 4 + 1] = g;
      rgba[i * 4 + 2] = b;
      rgba[i * 4 + 3] = 255;
    }
  }
  return {rgba, ...grid};
}
