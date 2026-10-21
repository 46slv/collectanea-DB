import test from 'node:test';
import assert from 'node:assert/strict';
import {makeTestPattern, processGrayscale, toPreviewBytes} from '../src/components/DitheringPlayground/dither-core.mjs';

test('test patterns have exact dimensions and stable endpoints', () => {
  const ramp = makeTestPattern(5, 3, 'ramp');
  assert.equal(ramp.length, 15);
  assert.deepEqual(Array.from(ramp.slice(0, 5)), [0, 0.25, 0.5, 0.75, 1]);
  assert.equal(toPreviewBytes(ramp)[4], 255);
  const radial = makeTestPattern(5, 5, 'radial');
  assert.equal(radial[12], 1);
  assert.equal(radial[0], 0);
});

test('plain quantization rounds to exactly the requested levels', () => {
  const ramp = makeTestPattern(73, 3);
  const result = processGrayscale(ramp, 73, 3, {levels: 4, method: 'none'});
  assert.deepEqual([...new Set(result)].sort((a, b) => a - b), [0, 85, 170, 255]);
  assert.equal(result[0], 0);
  assert.equal(result[72], 255);
});

test('Bayer matrices use requested size and preserve the output palette', () => {
  const width = 64, height = 32;
  const input = new Float32Array(width * height).fill(0.4);
  for (const matrixSize of [2, 4, 8]) {
    const pixels = processGrayscale(input, width, height, {levels: 2, method: 'ordered', matrixSize});
    assert.deepEqual([...new Set(pixels)].sort((a, b) => a - b), [0, 255]);
    assert.equal(pixels.length, input.length);
  }
  const a = processGrayscale(input, width, height, {levels: 2, method: 'ordered', matrixSize: 2});
  const b = processGrayscale(input, width, height, {levels: 2, method: 'ordered', matrixSize: 8});
  assert.notDeepEqual(a, b, 'Changing matrix size must visibly change the pattern');
});

test('Floyd–Steinberg diffusion distributes intermediate brightness', () => {
  const width = 64, height = 64;
  const input = new Float32Array(width * height).fill(0.4);
  const pixels = processGrayscale(input, width, height, {levels: 2, method: 'error-diffusion'});
  assert.deepEqual([...new Set(pixels)].sort((a, b) => a - b), [0, 255]);
  const average = pixels.reduce((sum, pixel) => sum + pixel, 0) / pixels.length;
  assert.ok(Math.abs(average - 0.4 * 255) < 10,
    'Distributed error should approximately retain the input mean brightness');
  assert.notDeepEqual(pixels, processGrayscale(input, width, height, {levels: 2, method: 'none'}));
});

test('none method ignores the pattern size and invalid input fails explicitly', () => {
  const input = makeTestPattern(9, 9);
  const defaultPlain = processGrayscale(input, 9, 9, {levels: 3});
  const weirdSizePlain = processGrayscale(input, 9, 9, {levels: 3, method: 'none', matrixSize: 99});
  assert.deepEqual(defaultPlain, weirdSizePlain);
  assert.throws(() => processGrayscale(input, 8, 9), RangeError);
  assert.throws(() => processGrayscale(input, 9, 9, {levels: 1}), RangeError);
  assert.throws(() => processGrayscale(input, 9, 9, {levels: 17}), RangeError);
  assert.throws(() => processGrayscale(input, 9, 9, {method: 'unknown'}), RangeError);
  assert.throws(() => processGrayscale(input, 9, 9, {method: 'ordered', matrixSize: 3}), RangeError);
});
