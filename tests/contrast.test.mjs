import test from 'node:test';
import assert from 'node:assert/strict';
import {contrastGrayscale} from '../src/components/ContrastPlayground/contrast-core.mjs';

test('gain 1 is an immutable identity at any pivot', () => {
  const source = Uint8ClampedArray.from([0, 64, 128, 192, 255]);
  const {pixels, outsideCount} = contrastGrayscale(source, 5, 1, 1, 64);
  assert.deepEqual([...pixels], [...source]);
  assert.notStrictEqual(pixels, source);
  assert.equal(outsideCount, 0);
});

test('reference midpoint table for gain 0.5 and 2', () => {
  const source = Uint8ClampedArray.from([0, 64, 128, 192, 255]);
  assert.deepEqual([...contrastGrayscale(source, 5, 1, 0.5, 128).pixels], [64, 96, 128, 160, 192]);
  assert.deepEqual([...contrastGrayscale(source, 5, 1, 2, 128).pixels], [0, 0, 128, 255, 255]);
});

test('out-of-range count excludes in-range endpoints and includes real clipping', () => {
  const values = Uint8ClampedArray.from([0, 64, 128, 192, 255]);
  const res = contrastGrayscale(values, 5, 1, 2, 128);
  assert.equal(res.outsideCount, 3); // 0 < 0, 192 > 255, 255 > 255; 64 maps exactly 0.
  assert.deepEqual([...values], [0, 64, 128, 192, 255]);
});

test('moving pivot preserves its own value but changes other inputs', () => {
  const src = Uint8ClampedArray.from([64, 128, 192]);
  assert.deepEqual([...contrastGrayscale(src, 3, 1, 1.5, 64).pixels], [64, 160, 255]);
  assert.deepEqual([...contrastGrayscale(src, 3, 1, 1.5, 192).pixels], [0, 96, 192]);
});

test('positive gains are monotonic and clamp within 8-bit bounds', () => {
  const ramp = Uint8ClampedArray.from(Array.from({length: 256}, (_, i) => i));
  for (const gain of [0.5, 1, 1.75, 2]) {
    const {pixels} = contrastGrayscale(ramp, 256, 1, gain, 128);
    for (let i = 1; i < pixels.length; i += 1) {
      assert.ok(pixels[i] >= pixels[i - 1]);
    }
  }
});

test('rejects invalid geometry, type and parameters', () => {
  const input = Uint8ClampedArray.from([0, 255]);
  assert.throws(() => contrastGrayscale(input, 3, 1), RangeError);
  assert.throws(() => contrastGrayscale(input, 0, 2), RangeError);
  assert.throws(() => contrastGrayscale([0, 255], 2, 1), RangeError);
  for (const gain of [0, 0.25, 2.1, NaN, Infinity]) {
    assert.throws(() => contrastGrayscale(input, 2, 1, gain), RangeError);
  }
  for (const pivot of [0, 63, 193, Infinity, NaN]) {
    assert.throws(() => contrastGrayscale(input, 2, 1, 1, pivot), RangeError);
  }
});
