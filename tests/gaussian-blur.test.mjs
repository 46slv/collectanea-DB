import test from 'node:test';
import assert from 'node:assert/strict';
import {gaussianKernel1D, gaussianBlurGrayscale} from '../src/components/BlurPlayground/blur-core.mjs';

test('normalized Gaussian weights', () => {
  for (const sigma of [1, 3, 12]) {
    const weights = gaussianKernel1D(sigma);
    assert.ok(Math.abs(weights.reduce((sum, x) => sum + x, 0) - 1) < 1e-12);
    assert.equal(weights[0], weights[weights.length - 1]);
  }
});

test('constant image stays constant, including edge pixels', () => {
  const pixels = new Uint8ClampedArray(35).fill(137);
  for (const sigma of [0, 1, 3, 12]) {
    assert.ok(gaussianBlurGrayscale(pixels, 7, 5, sigma).every(x => x === 137));
  }
});

test('zero sigma returns equal but independent data', () => {
  const pixels = Uint8ClampedArray.from([0, 30, 128, 255]);
  const output = gaussianBlurGrayscale(pixels, 2, 2, 0);
  assert.deepEqual(output, pixels);
  assert.notStrictEqual(output, pixels);
});
