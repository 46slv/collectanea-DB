import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HUE_SHIFT_WIDTH, HUE_SHIFT_HEIGHT, HUE_SHIFT_SWATCHES,
  shiftHueRgb, createHueShiftPattern, renderHueShift,
} from '../src/components/HueShiftPlayground/hue-shift-core.mjs';

test('primary hues rotate through HSL angles in both directions', () => {
  assert.deepEqual(shiftHueRgb([255, 0, 0], 0), [255, 0, 0]);
  assert.deepEqual(shiftHueRgb([255, 0, 0], 60), [255, 255, 0]);
  assert.deepEqual(shiftHueRgb([255, 0, 0], 120), [0, 255, 0]);
  assert.deepEqual(shiftHueRgb([255, 0, 0], 180), [0, 255, 255]);
  assert.deepEqual(shiftHueRgb([255, 0, 0], -120), [0, 0, 255]);
  assert.deepEqual(shiftHueRgb([255, 0, 0], -60), [255, 0, 255]);
});
test('identity and neutral channels are unchanged', () => {
  const varied = [180, 100, 80];
  assert.deepEqual(shiftHueRgb(varied, 0), varied);
  for (let d = -180; d <= 180; d += 30) {
    for (const shade of [0, 16, 128, 255]) {
      assert.deepEqual(shiftHueRgb([shade, shade, shade], d), [shade, shade, shade]);
    }
  }
});
test('preserves HSL lightness extrema up to rounding and channel validity', () => {
  for (const rgb of [[220, 100, 80], [12, 230, 52], [70, 103, 202], [255, 128, 0]]) {
    for (let d = -180; d <= 180; d += 30) {
      const next = shiftHueRgb(rgb, d);
      assert.equal(next.length, 3);
      assert.ok(next.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
      assert.ok(Math.abs(Math.max(...next) + Math.min(...next) -
        Math.max(...rgb) - Math.min(...rgb)) <= 1);
    }
  }
});
test('both synthetic scenes are deterministic opaque RGBA', () => {
  for (const mode of ['hues', 'patches']) {
    const first = createHueShiftPattern(24, 10, mode);
    assert.equal(first.length, 24 * 10 * 4);
    assert.deepEqual(first, createHueShiftPattern(24, 10, mode));
    for (let i = 3; i < first.length; i += 4) assert.equal(first[i], 255);
  }
  assert.equal(createHueShiftPattern(HUE_SHIFT_WIDTH, HUE_SHIFT_HEIGHT).length,
    HUE_SHIFT_WIDTH * HUE_SHIFT_HEIGHT * 4);
  assert.equal(HUE_SHIFT_SWATCHES.length, 3);
});
test('render is non-mutating and identity is exact', () => {
  const src = createHueShiftPattern(16, 10);
  const original = [...src];
  assert.deepEqual(renderHueShift(src, 16, 10, 0), src);
  const rotated = renderHueShift(src, 16, 10, 120);
  assert.notDeepEqual(rotated, src);
  assert.deepEqual([...src], original);
  for (let i = 3; i < rotated.length; i += 4) assert.equal(rotated[i], 255);
});
test('angle, tuple, scene size and input alpha reject malformed values', () => {
  for (const invalid of [-181, 181, 15, 0.5, Infinity, NaN, '60']) {
    assert.throws(() => shiftHueRgb([255, 0, 0], invalid), RangeError);
    assert.throws(() => renderHueShift(Uint8ClampedArray.of(255, 0, 0, 255), 1, 1, invalid), RangeError);
  }
  for (const invalid of [[1], [1, 2, 3, 4], [0, 0, 256], [0, 0, -1], [0.5, 0, 0], null]) {
    assert.throws(() => shiftHueRgb(invalid), RangeError);
  }
  assert.throws(() => createHueShiftPattern(1, 8), RangeError);
  assert.throws(() => createHueShiftPattern(8, 1), RangeError);
  assert.throws(() => createHueShiftPattern(8, 8, 'unknown'), RangeError);
  assert.throws(() => renderHueShift([255, 0, 0, 255], 1, 1), RangeError);
  assert.throws(() => renderHueShift(new Uint8ClampedArray(4), 2, 1), RangeError);
  assert.throws(() => renderHueShift(Uint8ClampedArray.of(1, 2, 3, 0), 1, 1), RangeError);
});
