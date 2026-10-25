import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeChromaticPattern, shiftChromaticChannels,
} from '../src/components/ChromaticAberrationPlayground/chromatic-core.mjs';

function pixel(image, width, x, y) {
  return [...image.slice((y * width + x) * 4, (y * width + x + 1) * 4)];
}

test('zero shift preserves grayscale values as independent opaque RGBA', () => {
  const source = Uint8ClampedArray.from([0, 60, 180, 255]);
  const result = shiftChromaticChannels(source, 2, 2, {shift: 0});
  assert.deepEqual(pixel(result, 2, 0, 0), [0, 0, 0, 255]);
  assert.deepEqual(pixel(result, 2, 1, 0), [60, 60, 60, 255]);
  assert.deepEqual(pixel(result, 2, 0, 1), [180, 180, 180, 255]);
  assert.deepEqual(pixel(result, 2, 1, 1), [255, 255, 255, 255]);
  result[0] = 123;
  assert.equal(source[0], 0);
});

test('horizontal shift uses R left and B right around unchanged G', () => {
  const source = Uint8ClampedArray.from(Array.from({length: 21},
    (_, index) => index % 7 < 3 ? 0 : 255));
  const out = shiftChromaticChannels(source, 7, 3, {shift: 1, mode: 'horizontal'});
  assert.deepEqual(pixel(out, 7, 2, 1), [0, 0, 255, 255]);
  assert.deepEqual(pixel(out, 7, 3, 1), [0, 255, 255, 255]);
});

test('radial model preserves the optical center', () => {
  const source = Uint8ClampedArray.from(Array.from({length: 25}, (_, i) => i * 10));
  const result = shiftChromaticChannels(source, 5, 5, {shift: 8});
  assert.deepEqual(pixel(result, 5, 2, 2), [120, 120, 120, 255]);
});

test('symmetric test pattern gives separately mirrored radial channels', () => {
  const w = 9, h = 5;
  const source = Uint8ClampedArray.from(Array.from({length: w * h},
    (_, i) => i % w === 4 ? 250 : 10));
  const out = shiftChromaticChannels(source, w, h, {shift: 4});
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    assert.equal(pixel(out, w, x, y)[0], pixel(out, w, w - 1 - x, h - 1 - y)[0]);
    assert.equal(pixel(out, w, x, y)[2], pixel(out, w, w - 1 - x, h - 1 - y)[2]);
  }
});

test('moving radial center moves the neutral point', () => {
  const w = 11, h = 5;
  const source = Uint8ClampedArray.from(Array.from({length: w * h},
    (_, i) => i % w * 20));
  const left = shiftChromaticChannels(source, w, h, {shift: 5, centerX: 20});
  const right = shiftChromaticChannels(source, w, h, {shift: 5, centerX: 80});
  assert.deepEqual(pixel(left, w, 2, 2), [40, 40, 40, 255]);
  assert.deepEqual(pixel(right, w, 8, 2), [160, 160, 160, 255]);
  assert.notDeepEqual(pixel(left, w, 8, 2), pixel(right, w, 8, 2));
});

test('constant fields remain constant beyond image borders', () => {
  const source = new Uint8ClampedArray(6).fill(117);
  for (const mode of ['radial', 'horizontal']) {
    const out = shiftChromaticChannels(source, 3, 2, {shift: 12, mode});
    for (let i = 0; i < out.length; i += 4)
      assert.deepEqual([...out.slice(i, i + 4)], [117, 117, 117, 255]);
  }
});

test('input is unchanged and both generated patterns differ', () => {
  const source = makeChromaticPattern(40, 24, 'grid'), copy = source.slice();
  const out = shiftChromaticChannels(source, 40, 24, {shift: 7});
  assert.deepEqual(source, copy);
  assert.notDeepEqual(source, makeChromaticPattern(40, 24, 'bars'));
  assert.equal(out.length, source.length * 4);
  assert.ok(out.some((v, i) => i % 4 !== 3 && v !== out[Math.floor(i / 4) * 4 + 1]));
});

test('invalid inputs and parameters are rejected', () => {
  const sample = new Uint8ClampedArray(9);
  assert.throws(() => shiftChromaticChannels(sample, 2, 2), RangeError);
  assert.throws(() => shiftChromaticChannels(new Uint8Array(9), 3, 3), RangeError);
  assert.throws(() => makeChromaticPattern(1, 4), RangeError);
  assert.throws(() => makeChromaticPattern(3, 3, 'unknown'), RangeError);
  assert.throws(() => makeChromaticPattern(2048, 2048), RangeError);
  for (const opts of [
    {shift: -1}, {shift: 13}, {shift: NaN}, {shift: 2.5},
    {centerX: 19}, {centerX: 81}, {centerX: Infinity},
    {mode: 'unknown'},
  ]) assert.throws(() => shiftChromaticChannels(sample, 3, 3, opts), RangeError);
});
