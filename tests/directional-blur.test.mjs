import test from 'node:test';
import assert from 'node:assert/strict';
import {
  directionalBlurGrayscale, makeDirectionalPattern,
} from '../src/components/DirectionalBlurPlayground/directional-core.mjs';

test('radius zero returns a separate identical array', () => {
  const a = Uint8ClampedArray.from([0, 90, 250]);
  const b = directionalBlurGrayscale(a, 3, 1, 0, 45);
  assert.deepEqual(b, a);
  assert.notStrictEqual(b, a);
});

test('uniform regions are unchanged for every orientation, even at edges', () => {
  const a = new Uint8ClampedArray(12).fill(83);
  for (const angle of [0, 30, 45, 90, 135, 180])
    assert.ok(directionalBlurGrayscale(a, 3, 4, 6, angle).every(v => v === 83));
});

test('horizontal line average matches independent 1D oracle', () => {
  const a = Uint8ClampedArray.from([0, 60, 90, 210, 255]);
  const b = directionalBlurGrayscale(a, 5, 1, 1, 0);
  const oracle = Uint8ClampedArray.from([20, 50, 120, 185, 240]);
  assert.deepEqual(b, oracle);
});

test('vertical and horizontal impulses make perpendicular streaks', () => {
  const a = new Uint8ClampedArray(9 * 9);
  a[4 * 9 + 4] = 255;
  const h = directionalBlurGrayscale(a, 9, 9, 2, 0);
  const v = directionalBlurGrayscale(a, 9, 9, 2, 90);
  assert.equal(h[4 * 9 + 2], 51);
  assert.equal(h[2 * 9 + 4], 0);
  assert.equal(v[2 * 9 + 4], 51);
  assert.equal(v[4 * 9 + 2], 0);
  assert.equal(h[4 * 9 + 7], 0);
});

test('180 degrees equals 0 degrees and diagonal output differs', () => {
  const a = makeDirectionalPattern(32, 20, 'lights');
  assert.deepEqual(
    directionalBlurGrayscale(a, 32, 20, 5, 180),
    directionalBlurGrayscale(a, 32, 20, 5, 0));
  assert.notDeepEqual(
    directionalBlurGrayscale(a, 32, 20, 5, 0),
    directionalBlurGrayscale(a, 32, 20, 5, 45));
});

test('input is not mutated, two patterns are distinct', () => {
  const a = makeDirectionalPattern(64, 32, 'edges');
  const snapshot = a.slice();
  directionalBlurGrayscale(a, 64, 32, 9, 75);
  assert.deepEqual(a, snapshot);
  assert.notDeepEqual(a, makeDirectionalPattern(64, 32, 'lights'));
});

test('invalid dimensions, input, radius, angle and pattern fail', () => {
  const a = new Uint8ClampedArray(4);
  assert.throws(() => directionalBlurGrayscale(a, 3, 3), RangeError);
  assert.throws(() => directionalBlurGrayscale(new Uint8Array(4), 2, 2), RangeError);
  for (const r of [-1, 0.5, 17, Infinity, NaN])
    assert.throws(() => directionalBlurGrayscale(a, 2, 2, r, 0), RangeError);
  for (const theta of [-10, 181, Infinity, NaN])
    assert.throws(() => directionalBlurGrayscale(a, 2, 2, 0, theta), RangeError);
  assert.throws(() => makeDirectionalPattern(4, 4, 'unknown'), RangeError);
});
