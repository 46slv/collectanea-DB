import test from 'node:test';
import assert from 'node:assert/strict';
import {gaussianKernel1D, gaussianBlurGrayscale, makeBlurTestPattern} from '../src/components/BlurPlayground/blur-core.mjs';

test('Gaussian weights normalize to one and are symmetric', () => {
  assert.deepEqual([...gaussianKernel1D(0)], [1]);
  for (const sigma of [0.5, 1, 3, 12]) {
    const weights = gaussianKernel1D(sigma);
    assert.ok(Math.abs(weights.reduce((sum, x) => sum + x, 0) - 1) < 1e-12);
    assert.equal(weights.length, 2 * Math.ceil(3 * sigma) + 1);
    for (let i = 0; i < weights.length; i++) assert.equal(weights[i], weights[weights.length - 1 - i]);
  }
});

test('constant image stays constant; sigma zero returns an independent copy', () => {
  const pixels = new Uint8ClampedArray(35).fill(137);
  for (const sigma of [0, 0.5, 3, 12]) {
    assert.ok(gaussianBlurGrayscale(pixels, 7, 5, sigma).every(x => x === 137));
  }
  const copy = gaussianBlurGrayscale(pixels, 7, 5, 0);
  assert.deepEqual(copy, pixels);
  assert.notStrictEqual(copy, pixels);
});

test('impulse diffuses symmetrically and wider sigma lowers its peak', () => {
  const w = 31, c = 15, input = new Uint8ClampedArray(w * w);
  input[c * w + c] = 255;
  const output = gaussianBlurGrayscale(input, w, w, 2);
  const sample = (x, y) => output[y * w + x];
  assert.ok(sample(c, c) > 0 && sample(c, c) < 255);
  assert.equal(sample(c - 1, c), sample(c + 1, c));
  assert.equal(sample(c, c - 1), sample(c, c + 1));
  // The final 8-bit rounding loses some low-valued tails of the Gaussian.\n  assert.ok(Math.abs(output.reduce((a, b) => a + b, 0) - 255) < 30);
  assert.ok(gaussianBlurGrayscale(input, w, w, 4)[c * w + c] < sample(c, c));
});

test('step transitions become intermediate values; invalid data is rejected', () => {
  const pixels = Uint8ClampedArray.from({length: 15}, (_, x) => x < 7 ? 0 : 255);
  const output = gaussianBlurGrayscale(pixels, 15, 1, 1.5);
  assert.ok(output[6] > 0 && output[7] < 255);
  for (let i = 1; i < output.length; i++) assert.ok(output[i] >= output[i - 1]);
  assert.throws(() => gaussianBlurGrayscale(pixels, 5, 2, 1), RangeError);
  assert.throws(() => gaussianKernel1D(Infinity), RangeError);
  assert.notDeepEqual(makeBlurTestPattern(64, 32), makeBlurTestPattern(64, 32, 'lights'));
});
