import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WHITE_BALANCE_WIDTH, WHITE_BALANCE_HEIGHT, WHITE_BALANCE_DEFAULTS, WHITE_BALANCE_CAST,
  WHITE_BALANCE_SAMPLES, whiteBalanceGains, adjustWhiteBalanceRgb,
  createWhiteBalancePattern, renderWhiteBalance,
} from '../src/components/WhiteBalancePlayground/white-balance-core.mjs';

test('zero correction is identity for all 8-bit code values', () => {
  assert.deepEqual(whiteBalanceGains(0, 0), [1, 1, 1]);
  for (let v = 0; v < 256; v++) {
    assert.deepEqual(adjustWhiteBalanceRgb([v, v, v]), [v, v, v]);
  }
  assert.deepEqual(adjustWhiteBalanceRgb([31, 128, 249]), [31, 128, 249]);
});

test('temperature changes red and blue in opposite directions', () => {
  assert.deepEqual(adjustWhiteBalanceRgb([128, 128, 128], 50, 0), [150, 128, 109]);
  assert.deepEqual(adjustWhiteBalanceRgb([128, 128, 128], -50, 0), [109, 128, 150]);
  assert.deepEqual(adjustWhiteBalanceRgb([128, 128, 128], 0, 50), [128, 109, 128]);
  assert.deepEqual(adjustWhiteBalanceRgb([128, 128, 128], 0, -50), [128, 150, 128]);
});

test('synthetic warm cast has an approximately invertible neutral midtone', () => {
  const base = [128, 128, 128];
  const cast = adjustWhiteBalanceRgb(base, WHITE_BALANCE_CAST.temperature, WHITE_BALANCE_CAST.tint);
  const corrected = adjustWhiteBalanceRgb(cast,
    -WHITE_BALANCE_CAST.temperature, -WHITE_BALANCE_CAST.tint);
  assert.ok(cast[0] > cast[2]);
  assert.ok(cast[1] > 128);
  assert.ok(corrected.every((v, i) => Math.abs(v - base[i]) <= 1));
});

test('black stays black; bright pixel clipping is counted', () => {
  assert.deepEqual(adjustWhiteBalanceRgb([0, 0, 0], 100, -100), [0, 0, 0]);
  const src = Uint8ClampedArray.from([255, 255, 255, 255, 0, 0, 0, 255]);
  const {pixels, clippedPixels} = renderWhiteBalance(src, 2, 1, 100, -100);
  assert.equal(clippedPixels, 1);
  assert.deepEqual([...pixels.slice(4)], [0, 0, 0, 255]);
});

test('two patterns are deterministic, opaque and sized correctly', () => {
  for (const kind of ['warm', 'neutral']) {
    const a = createWhiteBalancePattern(24, 8, kind);
    const b = createWhiteBalancePattern(24, 8, kind);
    assert.deepEqual(a, b);
    assert.equal(a.length, 24 * 8 * 4);
    assert.ok(a.every((v, i) => i % 4 !== 3 || v === 255));
  }
  assert.equal(createWhiteBalancePattern(WHITE_BALANCE_WIDTH, WHITE_BALANCE_HEIGHT).length,
    WHITE_BALANCE_WIDTH * WHITE_BALANCE_HEIGHT * 4);
  assert.equal(WHITE_BALANCE_SAMPLES.warm.length, 3);
  assert.equal(WHITE_BALANCE_DEFAULTS.pattern, 'warm');
});

test('neutral grayscale source is unchanged at zero and altered at nonzero', () => {
  const source = createWhiteBalancePattern(20, 5, 'neutral');
  const original = [...source];
  assert.deepEqual(renderWhiteBalance(source, 20, 5).pixels, source);
  const changed = renderWhiteBalance(source, 20, 5, 40, -20).pixels;
  assert.notDeepEqual(changed, source);
  assert.deepEqual([...source], original);
});

test('validates parameters, input shape and opaque requirement', () => {
  for (const invalid of [-110, 110, 7, 2.5, NaN, Infinity, '10', null]) {
    assert.throws(() => whiteBalanceGains(invalid, 0), RangeError);
    assert.throws(() => whiteBalanceGains(0, invalid), RangeError);
  }
  for (const invalid of [null, [0, 0], [0, 0, 0, 0], [0, 0, 256], [-1, 0, 0], [0.5, 0, 0]]) {
    assert.throws(() => adjustWhiteBalanceRgb(invalid), RangeError);
  }
  assert.throws(() => createWhiteBalancePattern(1, 8), RangeError);
  assert.throws(() => createWhiteBalancePattern(8, 1), RangeError);
  assert.throws(() => createWhiteBalancePattern(8, 8, 'invalid'), RangeError);
  assert.throws(() => renderWhiteBalance([0, 0, 0, 255], 1, 1), RangeError);
  assert.throws(() => renderWhiteBalance(new Uint8ClampedArray(4), 2, 1), RangeError);
  assert.throws(() => renderWhiteBalance(Uint8ClampedArray.of(128, 128, 128, 0), 1, 1), RangeError);
});
