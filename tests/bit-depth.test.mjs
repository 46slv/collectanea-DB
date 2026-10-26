import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIT_DEPTHS, PREVIEW_WIDTH, PREVIEW_HEIGHT, encodeSample, makeIdealPattern, toDisplayBytes,
} from '../src/components/BitDepthPlayground/bit-depth-core.mjs';

test('supported bit depths have expected unsigned code ranges', () => {
  assert.deepEqual(BIT_DEPTHS, [4, 8, 10, 12]);
  for (const bits of BIT_DEPTHS) {
    const start = encodeSample(0, bits);
    const end = encodeSample(1, bits);
    assert.equal(start.code, 0);
    assert.equal(end.code, 2 ** bits - 1);
    assert.equal(end.codeCount, 2 ** bits);
    assert.equal(start.reconstructed, 0);
    assert.equal(end.reconstructed, 1);
  }
});

test('50% of four-bit unsigned normalized range rounds to code 8', () => {
  const info = encodeSample(0.5, 4);
  assert.equal(info.code, 8);
  assert.equal(info.reconstructed, 8 / 15);
  assert.equal(info.error, 8 / 15 - 0.5);
});

test('maximum absolute error is a half code step for all supported depths', () => {
  for (const bits of BIT_DEPTHS) {
    const limit = 0.5 / (2 ** bits - 1);
    let lastCode = -1;
    for (let step = 0; step <= 1000; step += 1) {
      const info = encodeSample(step / 1000, bits);
      assert.ok(Math.abs(info.error) <= limit + 1e-12);
      assert.ok(info.code >= lastCode);
      lastCode = info.code;
    }
  }
});

test('four-bit display mapping and 8-bit identity follow exact grayscale codes', () => {
  const samples = Float32Array.from([0, 0.2, 0.5, 1]);
  assert.deepEqual([...toDisplayBytes(samples, 4)], [0, 51, 136, 255]);
  assert.deepEqual([...toDisplayBytes(Float32Array.from([0, 64 / 255, 1]), 8)], [0, 64, 255]);
});

test('higher bit-depth values are reduced to 8-bit for Canvas display', () => {
  const value = Float64Array.from([0.5, 1, 0]);
  for (const bits of [10, 12]) {
    const result = toDisplayBytes(value, bits);
    assert.ok(result instanceof Uint8ClampedArray);
    assert.deepEqual([...result], [128, 255, 0]);
  }
});

test('test patterns have predictable geometry, distinct output and fresh buffers', () => {
  const ramp = makeIdealPattern(4, 4, 'ramp');
  const radial = makeIdealPattern(4, 4, 'radial');
  assert.equal(ramp.length, 16);
  assert.equal(ramp[0], 0);
  assert.equal(ramp[3], 1);
  assert.equal(ramp[4], 0);
  assert.ok(radial[5] > radial[0]);
  assert.notDeepEqual([...ramp], [...radial]);
  const copy = Float32Array.from(ramp);
  const display = toDisplayBytes(ramp, 4);
  assert.equal(display.length, ramp.length);
  assert.deepEqual([...ramp], [...copy]);
  assert.notStrictEqual(display.buffer, ramp.buffer);
  assert.equal(PREVIEW_WIDTH, 384);
  assert.equal(PREVIEW_HEIGHT, 160);
});

test('reject invalid sample, format, shape and input type', () => {
  for (const value of [-0.01, 1.01, NaN, Infinity, '0.5', null]) {
    assert.throws(() => encodeSample(value, 8), RangeError);
  }
  for (const bits of [0, 7, 16, 32, 8.5, '8']) {
    assert.throws(() => encodeSample(0.5, bits), RangeError);
    assert.throws(() => toDisplayBytes(new Float32Array([0]), bits), RangeError);
  }
  assert.throws(() => makeIdealPattern(0, 4), RangeError);
  assert.throws(() => makeIdealPattern(2, 1), RangeError);
  assert.throws(() => makeIdealPattern(4, 4, 'unknown'), RangeError);
  assert.throws(() => toDisplayBytes([0, 1], 8), TypeError);
  assert.throws(() => toDisplayBytes(Float32Array.from([0, 1.1]), 8), RangeError);
});
