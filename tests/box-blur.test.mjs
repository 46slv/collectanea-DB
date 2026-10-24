import test from 'node:test';
import assert from 'node:assert/strict';
import {boxBlurGrayscale, equivalentGaussianSigma, makeBlurTestPattern} from '../src/components/BoxBlurPlayground/box-core.mjs';

function slowOracle(input, width, height, radius) {
  const out = new Uint8ClampedArray(input.length);
  const size = (2 * radius + 1) ** 2;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let dy = -radius; dy <= radius; dy++)
      for (let dx = -radius; dx <= radius; dx++) {
        const sx = Math.max(0, Math.min(width - 1, x + dx));
        const sy = Math.max(0, Math.min(height - 1, y + dy));
        sum += input[sy * width + sx];
      }
    out[y * width + x] = sum / size;
  }
  return out;
}

test('radius 0 returns an independent identical copy', () => {
  const a = Uint8ClampedArray.from([0, 127, 255]);
  const b = boxBlurGrayscale(a, 3, 1, 0);
  assert.deepEqual(b, a);
  assert.notStrictEqual(b, a);
});

test('constant images remain constant at edges and with large radius', () => {
  for (const r of [0, 1, 5, 12]) {
    const a = new Uint8ClampedArray(12).fill(83);
    assert.ok(boxBlurGrayscale(a, 3, 4, r).every(v => v === 83));
  }
});

test('separable output agrees with independent full 2D oracle', () => {
  const a = Uint8ClampedArray.from([0, 33, 220, 255, 17, 91, 162, 199, 12, 68, 141, 204]);
  for (const r of [0, 1, 2, 4])
    assert.deepEqual(boxBlurGrayscale(a, 4, 3, r), slowOracle(a, 4, 3, r));
});

test('impulse creates square uniform support away from edges', () => {
  const a = new Uint8ClampedArray(13 * 13);
  a[6 * 13 + 6] = 250;
  const b = boxBlurGrayscale(a, 13, 13, 2);
  assert.equal(b[6 * 13 + 6], 10);
  assert.equal(b[4 * 13 + 4], 10);
  assert.equal(b[6 * 13 + 9], 0);
  assert.equal(b[6 * 13 + 3], 0);
});

test('no input mutation; patterns and radius change the result', () => {
  const a = makeBlurTestPattern(64, 32, 'edges');
  const before = a.slice();
  assert.notDeepEqual(boxBlurGrayscale(a, 64, 32, 1), boxBlurGrayscale(a, 64, 32, 4));
  assert.notDeepEqual(makeBlurTestPattern(64, 32, 'edges'), makeBlurTestPattern(64, 32, 'lights'));
  assert.deepEqual(a, before);
});

test('finite Gaussian comparison sigma has the discrete-box variance', () => {
  assert.equal(equivalentGaussianSigma(0), 0);
  for (const r of [1, 3, 8, 12]) {
    const sigma = equivalentGaussianSigma(r);
    assert.ok(Math.abs(sigma ** 2 - r * (r + 1) / 3) < 1e-12);
  }
});

test('invalid dimensions, input, and radii fail closed', () => {
  const a = new Uint8ClampedArray(4);
  assert.throws(() => boxBlurGrayscale(a, 3, 3, 1), RangeError);
  assert.throws(() => boxBlurGrayscale(a, 2.5, 2, 1), RangeError);
  assert.throws(() => boxBlurGrayscale(new Uint8Array(4), 2, 2, 1), RangeError);
  for (const r of [-1, 0.5, 17, Infinity, NaN])
    assert.throws(() => boxBlurGrayscale(a, 2, 2, r), RangeError);
  assert.throws(() => equivalentGaussianSigma(-1), RangeError);
});
