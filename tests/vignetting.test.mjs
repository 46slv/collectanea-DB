import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeVignettePattern, vignetteGrayscale,
} from '../src/components/VignettePlayground/vignette-core.mjs';

test('strength zero returns an independent unchanged image', () => {
  const a = Uint8ClampedArray.from([0, 70, 210, 255]);
  const b = vignetteGrayscale(a, 2, 2, {strength: 0});
  assert.deepEqual(b, a);
  assert.notStrictEqual(b, a);
});

test('center is preserved and distant corners attenuated for both falloffs', () => {
  const a = new Uint8ClampedArray(9).fill(200);
  for (const falloff of ['smooth', 'quadratic']) {
    const b = vignetteGrayscale(a, 3, 3,
      {strength: 100, innerRadius: 0, centerX: 50, falloff});
    assert.equal(b[4], 200);
    for (const i of [0, 2, 6, 8]) assert.equal(b[i], 0);
  }
});

test('smoothstep and quadratic produce distinct values between center and corners', () => {
  const a = new Uint8ClampedArray(9).fill(200);
  const s = vignetteGrayscale(a, 3, 3,
    {strength: 100, innerRadius: 0, centerX: 50, falloff: 'smooth'});
  const q = vignetteGrayscale(a, 3, 3,
    {strength: 100, innerRadius: 0, centerX: 50, falloff: 'quadratic'});
  assert.equal(s[1], 41);
  assert.equal(q[1], 100);
});

test('protected center region and radial symmetry', () => {
  const a = new Uint8ClampedArray(25).fill(185);
  const b = vignetteGrayscale(a, 5, 5,
    {strength: 80, innerRadius: 35, centerX: 50});
  assert.equal(b[12], 185);
  assert.equal(b[11], 185);
  assert.equal(b[13], 185);
  assert.equal(b[0], b[4]);
  assert.equal(b[0], b[20]);
  assert.ok(b[0] < b[1]);
});

test('changing center x moves the darkest part left', () => {
  const a = new Uint8ClampedArray(25).fill(180);
  const b = vignetteGrayscale(a, 5, 5,
    {strength: 85, innerRadius: 0, centerX: 80});
  assert.ok(b[10] < b[14]); // horizontal middle row: far-left darker than far-right
});

test('source is unchanged and both generated patterns differ', () => {
  const a = makeVignettePattern(40, 20, 'grid');
  const copy = a.slice();
  vignetteGrayscale(a, 40, 20, {strength: 55, innerRadius: 45});
  assert.deepEqual(a, copy);
  assert.notDeepEqual(a, makeVignettePattern(40, 20, 'gradient'));
});

test('invalid image, dimensions, pattern and parameters are rejected', () => {
  const a = new Uint8ClampedArray(9);
  assert.throws(() => vignetteGrayscale(a, 2, 2), RangeError);
  assert.throws(() => vignetteGrayscale(new Uint8Array(9), 3, 3), RangeError);
  assert.throws(() => makeVignettePattern(1, 3), RangeError);
  assert.throws(() => makeVignettePattern(3, 3, 'unknown'), RangeError);
  for (const opts of [
    {strength: -1}, {strength: 101}, {strength: NaN}, {strength: 1.5},
    {innerRadius: -1}, {innerRadius: 81}, {innerRadius: 2.5},
    {centerX: 19}, {centerX: 81}, {centerX: Infinity},
    {falloff: 'unknown'},
  ]) assert.throws(() => vignetteGrayscale(a, 3, 3, opts), RangeError);
});
