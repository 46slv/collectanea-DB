import test from 'node:test';
import assert from 'node:assert/strict';
import {buildExposureLut, exposureGrayscale} from '../src/components/ExposurePlayground/exposure-core.mjs';

test('0 EV returns identity LUT without mutating input', () => {
  const source = Uint8ClampedArray.from([0, 1, 32, 128, 224, 255]);
  const result = exposureGrayscale(source, 3, 2, 0);
  assert.deepEqual([...result.pixels], [...source]);
  assert.notStrictEqual(result.pixels, source);
  assert.equal(result.clippedCount, 0);
  assert.deepEqual([...result.lut], Array.from({length: 256}, (_, i) => i));
});

test('±1 EV maps reference sRGB code values correctly', () => {
  const source = Uint8ClampedArray.from([0, 32, 128, 224, 255]);
  assert.deepEqual([...exposureGrayscale(source, 5, 1, +1).pixels], [0, 47, 176, 255, 255]);
  assert.deepEqual([...exposureGrayscale(source, 5, 1, -1).pixels], [0, 20, 92, 164, 188]);
});

test('highlights clip only after linear-light multiplication', () => {
  const source = Uint8ClampedArray.from([128, 224, 255, 224]);
  const bright = exposureGrayscale(source, 2, 2, +1);
  assert.equal(bright.clippedCount, 2);
  assert.equal(bright.pixels[1], 255);
  assert.equal(bright.pixels[2], 255);
  assert.equal(exposureGrayscale(source, 2, 2, -1).clippedCount, 0);
});

test('half-stop controls have a monotonic non-decreasing LUT', () => {
  for (const ev of [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]) {
    const {lut} = buildExposureLut(ev);
    assert.equal(lut[0], 0);
    assert.equal(lut.length, 256);
    for (let i = 1; i < 256; i += 1) assert.ok(lut[i] >= lut[i - 1]);
    if (ev <= 0) assert.equal(lut[255] <= 255, true);
  }
});

test('exposure changes preserve black but reduce white at negative EV', () => {
  for (const ev of [-2, -1.5, -1, -0.5]) {
    const {lut} = buildExposureLut(ev);
    assert.equal(lut[0], 0);
    assert.ok(lut[255] < 255);
    assert.ok(lut[128] < 128);
  }
});

test('dimension-independent lookup and no mutation of a constant source', () => {
  const source = Uint8ClampedArray.from([128, 128, 128, 128]);
  const a = exposureGrayscale(source, 1, 4, +1);
  const b = exposureGrayscale(source, 4, 1, +1);
  assert.deepEqual([...a.pixels], [...b.pixels]);
  assert.deepEqual([...source], [128, 128, 128, 128]);
  assert.deepEqual([...a.pixels], [176, 176, 176, 176]);
});

test('rejects invalid EV, type, dimensions, and array length', () => {
  const sample = Uint8ClampedArray.from([0, 255]);
  for (const ev of [-2.5, 2.5, 0.25, 1.25, NaN, Infinity, -Infinity]) {
    assert.throws(() => buildExposureLut(ev), RangeError);
    assert.throws(() => exposureGrayscale(sample, 2, 1, ev), RangeError);
  }
  assert.throws(() => exposureGrayscale(sample, 1, 1), RangeError);
  assert.throws(() => exposureGrayscale([0, 255], 2, 1), RangeError);
  assert.throws(() => exposureGrayscale(sample, 0, 2), RangeError);
  assert.throws(() => exposureGrayscale(sample, 2.5, 1), RangeError);
});
