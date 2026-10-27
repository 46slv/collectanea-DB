import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LUT_WIDTH, LUT_HEIGHT, LUT_DEFAULTS, LUT_ENTRIES, LUT_SAMPLE_CODES,
  curveAt, makeLut, lookupAt, createLutPattern, renderLut,
} from '../src/components/LutPlayground/lut-core.mjs';

test('1D LUT has normalized endpoints and expected sample count', () => {
  for (const entries of LUT_ENTRIES) {
    const lut = makeLut(entries, 'power', 2);
    assert.equal(lut.length, entries);
    assert.equal(lut[0], 0);
    assert.equal(lut[entries - 1], 1);
  }
  assert.deepEqual(LUT_SAMPLE_CODES, [0, 64, 128, 192, 255]);
});
test('identity with linear interpolation preserves every 8-bit channel', () => {
  for (const entries of LUT_ENTRIES) {
    const lut = makeLut(entries, 'identity');
    for (let code = 0; code < 256; code++) {
      assert.equal(Math.round(255 * lookupAt(code / 255, lut, 'linear')), code);
    }
  }
});
test('nearest sampling quantizes the domain, while linear interpolation keeps identity', () => {
  const lut = makeLut(4, 'identity');
  assert.equal(Math.round(255 * lookupAt(100 / 255, lut, 'nearest')), 85);
  assert.equal(Math.round(255 * lookupAt(100 / 255, lut, 'linear')), 100);
});
test('power and smoothstep operate on each channel independently', () => {
  assert.equal(curveAt(0.5, 'power', 2), 0.25);
  assert.equal(curveAt(0.5, 'power', 0.5), Math.sqrt(0.5));
  assert.equal(curveAt(0.5, 'smoothstep'), 0.5);
  assert.equal(curveAt(0.5, 'identity'), 0.5);
});
test('more samples decrease the error of smooth quadratic curve under linear interpolation', () => {
  const src = createLutPattern(32, 6);
  const coarse = renderLut(src, 32, 6, 4, 'power', 2, 'linear');
  const fine = renderLut(src, 32, 6, 32, 'power', 2, 'linear');
  assert.ok(coarse.maxErrorCode > fine.maxErrorCode);
  assert.equal(renderLut(src, 32, 6, 256, 'identity', 1, 'linear').maxErrorCode, 0);
});
test('both deterministic patterns are opaque and preserve RGB channel masks', () => {
  for (const kind of ['gray', 'rgb']) {
    const src = createLutPattern(24, 12, kind);
    assert.equal(src.length, 24 * 12 * 4);
    assert.deepEqual(src, createLutPattern(24, 12, kind));
    assert.ok(src.every((v, i) => i % 4 !== 3 || v === 255));
  }
  const rgb = createLutPattern(24, 12, 'rgb');
  assert.deepEqual([...rgb.slice((0 * 24 + 23) * 4, (0 * 24 + 23) * 4 + 3)], [255, 0, 0]);
  assert.equal(createLutPattern(LUT_WIDTH, LUT_HEIGHT).length, LUT_WIDTH * LUT_HEIGHT * 4);
  assert.equal(LUT_DEFAULTS.interpolation, 'nearest');
});
test('render produces two different previews without mutating input', () => {
  const src = createLutPattern(24, 12);
  const before = src.slice();
  const result = renderLut(src, 24, 12);
  assert.deepEqual(src, before);
  assert.equal(result.ideal.length, src.length);
  assert.equal(result.approximation.length, src.length);
  assert.ok(result.maxErrorCode > 0);
  assert.notDeepEqual(result.ideal, result.approximation);
});
test('invalid domains, settings, dimensions and alpha are rejected', () => {
  for (const invalid of [0, -1, Infinity, NaN, 1.1, '1', null]) {
    assert.throws(() => curveAt(invalid), RangeError);
  }
  assert.throws(() => makeLut(3), RangeError);
  assert.throws(() => makeLut(4, 'other'), RangeError);
  assert.throws(() => makeLut(4, 'power', 4), RangeError);
  assert.throws(() => lookupAt(0.5, makeLut(), 'cubic'), RangeError);
  assert.throws(() => lookupAt(0.5, []), RangeError);
  assert.throws(() => createLutPattern(1, 8), RangeError);
  assert.throws(() => createLutPattern(10, 10, 'unknown'), RangeError);
  assert.throws(() => renderLut(new Uint8ClampedArray(4), 2, 2), RangeError);
  assert.throws(() => renderLut(Uint8ClampedArray.of(0, 0, 0, 0), 2, 2), RangeError);
  const transparent = createLutPattern(2, 2);
  transparent[3] = 0;
  assert.throws(() => renderLut(transparent, 2, 2), RangeError);
});
