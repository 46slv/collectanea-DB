import test from 'node:test';
import assert from 'node:assert/strict';
import {guidedFilterGrayscale} from '../src/components/GuidedFilterPlayground/guided-core.mjs';

const plane = values => Uint8ClampedArray.from(values);
const filter = (p, I, width, height, radius = 2, reg = 20) =>
  guidedFilterGrayscale(p, I, width, height, radius, reg);

// Independent brute-force box mean: no integral images.
function slowMean(values, w, h, r) {
  const output = new Float64Array(w * h);
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
    let total = 0, count = 0;
    for (let yy = Math.max(0, y - r); yy <= Math.min(h - 1, y + r); yy += 1)
      for (let xx = Math.max(0, x - r); xx <= Math.min(w - 1, x + r); xx += 1) {
        total += values[yy * w + xx]; count += 1;
      }
    output[y * w + x] = total / count;
  }
  return output;
}

function slowGuided(source, guide, w, h, r, reg) {
  const n = w * h, I = Float64Array.from(guide, x => x / 255),
    p = Float64Array.from(source, x => x / 255);
  const I2 = I.map(x => x * x), Ip = I.map((x, i) => x * p[i]);
  const mI = slowMean(I, w, h, r), mp = slowMean(p, w, h, r),
    mI2 = slowMean(I2, w, h, r), mIp = slowMean(Ip, w, h, r);
  const a = new Float64Array(n), b = new Float64Array(n), eps = (reg / 255) ** 2;
  for (let i = 0; i < n; i += 1) {
    a[i] = (mIp[i] - mI[i] * mp[i]) / (Math.max(0, mI2[i] - mI[i] ** 2) + eps);
    b[i] = mp[i] - a[i] * mI[i];
  }
  const ma = slowMean(a, w, h, r), mb = slowMean(b, w, h, r);
  return Uint8ClampedArray.from(I, (x, i) => 255 * (ma[i] * x + mb[i]));
}

test('constant source remains constant with both flat and structured guidance', () => {
  const p = plane(Array(20).fill(128));
  for (const guide of [plane(Array(20).fill(0)), plane(Array.from({length: 20}, (_, i) => i < 10 ? 30 : 230))]) {
    const result = filter(p, guide, 5, 4);
    assert.deepEqual([...result], [...p]);
    assert.notStrictEqual(result, p);
  }
});

test('integral-image output matches independent truncated-window reference', () => {
  const p = plane([0, 14, 123, 250, 11, 88, 190, 252, 44, 90, 170, 230]);
  const guide = plane([3, 3, 3, 235, 4, 12, 240, 240, 9, 24, 250, 251]);
  for (const r of [1, 2]) for (const reg of [5, 40, 75]) {
    assert.deepEqual([...filter(p, guide, 4, 3, r, reg)], [...slowGuided(p, guide, 4, 3, r, reg)]);
  }
});

test('self-guidance keeps a hard step more strongly with low regularization', () => {
  const step = plane([0, 0, 0, 0, 255, 255, 255, 255]);
  const low = filter(step, step, 8, 1, 2, 1);
  const high = filter(step, step, 8, 1, 2, 100);
  assert.ok(low[3] < high[3], 'dark-side neighbor should bleed more with larger epsilon');
  assert.ok(low[4] > high[4], 'light-side neighbor should bleed more with larger epsilon');
});

test('guide changes result for noisy source without changing the source', () => {
  const source = plane([20, 50, 110, 200, 30, 60, 160, 190]);
  const guide = plane([0, 0, 0, 255, 0, 0, 255, 255]);
  const initial = source.slice();
  const own = filter(source, source, 4, 2, 1, 15);
  const separate = filter(source, guide, 4, 2, 1, 15);
  assert.notDeepEqual([...own], [...separate]);
  assert.deepEqual(source, initial);
  assert.deepEqual(guide, plane([0, 0, 0, 255, 0, 0, 255, 255]));
});

test('single pixel and oversized clipped windows remain finite and constant', () => {
  assert.deepEqual([...filter(plane([240]), plane([12]), 1, 1, 8, 10)], [240]);
  const input = plane([85, 85]);
  assert.deepEqual([...filter(input, plane([15, 240]), 2, 1, 8, 5)], [85, 85]);
});

test('invalid shapes, types and parameters reject explicitly', () => {
  const p = plane([1, 2, 3, 4]);
  assert.throws(() => filter(p, p, 3, 2), RangeError);
  assert.throws(() => filter(p, [1, 2, 3, 4], 2, 2), RangeError);
  assert.throws(() => filter(p, plane([1, 2]), 2, 2), RangeError);
  assert.throws(() => filter(p, p, 0, 4), RangeError);
  assert.throws(() => filter(p, p, 2, 2, 0), RangeError);
  assert.throws(() => filter(p, p, 2, 2, 9), RangeError);
  assert.throws(() => filter(p, p, 2, 2, 2, 0), RangeError);
  assert.throws(() => filter(p, p, 2, 2, 2, 101), RangeError);
});

test('computed output has valid 8-bit range, input and guidance are immutable', () => {
  const p = plane(Array.from({length: 35}, (_, i) => (i * 57) % 256));
  const I = plane(Array.from({length: 35}, (_, i) => (i * 31) % 256));
  const beforeP = p.slice(), beforeI = I.slice();
  const result = filter(p, I, 7, 5, 3, 25);
  assert.equal(result.length, 35);
  assert.ok(result.every(x => x >= 0 && x <= 255));
  assert.deepEqual(p, beforeP);
  assert.deepEqual(I, beforeI);
  assert.notStrictEqual(result, p);
  assert.notStrictEqual(result, I);
});
