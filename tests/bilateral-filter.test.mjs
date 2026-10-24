import test from 'node:test';
import assert from 'node:assert/strict';
import {gaussianBlurGrayscale} from '../src/components/BlurPlayground/blur-core.mjs';
import {
  makeBilateralPattern, makeNoisyBilateralInput, bilateralFilterGrayscale, bilateralMeanAbsoluteError,
} from '../src/components/BilateralPlayground/bilateral-core.mjs';

test('constant 8-bit images remain constant, including replicated borders', () => {
  for (const sigma of [0, 0.5, 1, 4]) {
    const pixels = new Uint8ClampedArray(35).fill(173);
    const result = bilateralFilterGrayscale(pixels, 7, 5, sigma, 25);
    assert.deepEqual(result, pixels);
    assert.notStrictEqual(result, pixels);
  }
});

test('low range sigma preserves a sharp step better than a spatial-only Gaussian', () => {
  const width = 21, height = 11;
  const pixels = Uint8ClampedArray.from({length: width * height}, (_, i) => i % width < 10 ? 20 : 230);
  const bilateral = bilateralFilterGrayscale(pixels, width, height, 2, 10);
  const gaussian = gaussianBlurGrayscale(pixels, width, height, 2);
  const left = 5 * width + 9;
  const right = left + 1;
  assert.equal(bilateral[left], 20);
  assert.equal(bilateral[right], 230);
  assert.ok(gaussian[left] > 20 && gaussian[right] < 230);
});

test('larger range sigma mixes more across a sharp boundary', () => {
  const w = 11, h = 9;
  const pixels = Uint8ClampedArray.from({length: w * h}, (_, i) => i % w < 5 ? 0 : 120);
  const narrow = bilateralFilterGrayscale(pixels, w, h, 2, 10);
  const wide = bilateralFilterGrayscale(pixels, w, h, 2, 128);
  assert.equal(narrow[4 * w + 4], 0);
  assert.ok(wide[4 * w + 4] > narrow[4 * w + 4]);
  assert.ok(wide[4 * w + 5] < narrow[4 * w + 5]);
});

test('input remains untouched; outputs use 8-bit clamping even with noise', () => {
  const base = makeBilateralPattern(22, 13, 'gradient');
  const original = base.slice();
  const noisy = makeNoisyBilateralInput(base, 22, 13, 25);
  const before = noisy.slice();
  const filtered = bilateralFilterGrayscale(noisy, 22, 13, 3, 30);
  assert.deepEqual(base, original);
  assert.deepEqual(noisy, before);
  assert.notStrictEqual(filtered, noisy);
  assert.ok(filtered.every(value => value >= 0 && value <= 255));
});

test('noise model is deterministic and zero-noise is an independent copy', () => {
  const input = makeBilateralPattern(31, 17);
  const a = makeNoisyBilateralInput(input, 31, 17, 15, 2026);
  const b = makeNoisyBilateralInput(input, 31, 17, 15, 2026);
  const other = makeNoisyBilateralInput(input, 31, 17, 15, 2027);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, other);
  assert.deepEqual(makeNoisyBilateralInput(input, 31, 17, 0), input);
  assert.notStrictEqual(makeNoisyBilateralInput(input, 31, 17, 0), input);
});

test('the two synthetic patterns differ, and MAE uses known reference only', () => {
  const clean = makeBilateralPattern(64, 24, 'boundary');
  const other = makeBilateralPattern(64, 24, 'gradient');
  assert.notDeepEqual(clean, other);
  assert.equal(bilateralMeanAbsoluteError(clean, clean, 64, 24), 0);
  assert.equal(bilateralMeanAbsoluteError(Uint8ClampedArray.of(0, 100, 255), Uint8ClampedArray.of(10, 70, 225), 3, 1), 70 / 3);
});

test('rejects sizes, unknown patterns and out-of-range parameters', () => {
  const pixel = Uint8ClampedArray.of(90);
  assert.throws(() => bilateralFilterGrayscale(pixel, 2, 1), RangeError);
  assert.throws(() => bilateralFilterGrayscale(pixel, 1, 1, -1, 20), RangeError);
  assert.throws(() => bilateralFilterGrayscale(pixel, 1, 1, 1, 0), RangeError);
  assert.throws(() => bilateralFilterGrayscale(pixel, 1, 1, 1, 129), RangeError);
  assert.throws(() => bilateralFilterGrayscale(pixel, 1, 1, Infinity, 40), RangeError);
  assert.throws(() => makeBilateralPattern(1, 1, 'none'), RangeError);
  assert.throws(() => makeNoisyBilateralInput(pixel, 1, 1, 41), RangeError);
  assert.throws(() => bilateralMeanAbsoluteError(pixel, new Uint8ClampedArray(2), 1, 1), RangeError);
});
