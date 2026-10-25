import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adjustCodeSaturation, createSaturationPattern, renderSaturation,
  SATURATION_WIDTH, SATURATION_HEIGHT, SATURATION_SAMPLES,
} from '../src/components/SaturationPlayground/saturation-core.mjs';

test('neutral pivot and identity are transparent at exact controls', () => {
  assert.deepEqual(adjustCodeSaturation([180, 100, 80], 0), [116, 116, 116]);
  assert.deepEqual(adjustCodeSaturation([180, 100, 80], 0.5), [148, 108, 98]);
  assert.deepEqual(adjustCodeSaturation([180, 100, 80], 1), [180, 100, 80]);
  assert.deepEqual(adjustCodeSaturation([180, 100, 80], 2), [244, 84, 44]);
});

test('neutral pixels remain neutral at all amounts', () => {
  for (let amount = 0; amount <= 2; amount += 0.25) {
    for (const shade of [0, 16, 128, 255]) {
      assert.deepEqual(adjustCodeSaturation([shade, shade, shade], amount), [shade, shade, shade]);
    }
  }
});

test('RGB adjustments operate on code values and clamp to 8-bit gamut', () => {
  assert.deepEqual(adjustCodeSaturation([255, 0, 0], 0), [54, 54, 54]);
  assert.deepEqual(adjustCodeSaturation([255, 0, 0], 2), [255, 0, 0]);
  assert.deepEqual(adjustCodeSaturation([0, 255, 0], 0), [182, 182, 182]);
  assert.deepEqual(adjustCodeSaturation([0, 0, 255], 0), [18, 18, 18]);
});

test('image render matches per-pixel function without mutating input', () => {
  const source = Uint8ClampedArray.from([180, 100, 80, 255, 255, 0, 0, 255]);
  const before = [...source];
  const {pixels, clippedPixels} = renderSaturation(source, 2, 1, 2);
  assert.deepEqual([...pixels], [244, 84, 44, 255, 255, 0, 0, 255]);
  assert.equal(clippedPixels, 1);
  assert.deepEqual([...source], before);
});

test('both synthetic test scenes are opaque, deterministic and respect dimensions', () => {
  for (const kind of ['hues', 'patches']) {
    const first = createSaturationPattern(24, 8, kind);
    const second = createSaturationPattern(24, 8, kind);
    assert.deepEqual(first, second);
    assert.equal(first.length, 24 * 8 * 4);
    assert.ok(first.every((v, i) => i % 4 !== 3 || v === 255));
    assert.ok([...first].some((v, i) => i % 4 !== 3 && v !== 0));
  }
  assert.equal(createSaturationPattern(SATURATION_WIDTH, SATURATION_HEIGHT).length,
    SATURATION_WIDTH * SATURATION_HEIGHT * 4);
  assert.equal(SATURATION_SAMPLES.length, 3);
});

test('render respects identity, monochrome and responsive resize', () => {
  const source = createSaturationPattern(6, 3, 'hues');
  const identity = renderSaturation(source, 6, 3, 1);
  assert.deepEqual(identity.pixels, source);
  assert.equal(identity.clippedPixels, 0);
  const gray = renderSaturation(source, 6, 3, 0).pixels;
  for (let i = 0; i < gray.length; i += 4) {
    assert.equal(gray[i], gray[i + 1]);
    assert.equal(gray[i + 1], gray[i + 2]);
  }
});

test('rejects malformed amount, source, dimensions, and semitransparent input', () => {
  for (const invalid of [-0.1, 2.1, 0.1, Infinity, NaN, '1']) {
    assert.throws(() => adjustCodeSaturation([80, 100, 120], invalid), RangeError);
    assert.throws(() => renderSaturation(Uint8ClampedArray.of(10, 20, 30, 255), 1, 1, invalid), RangeError);
  }
  for (const invalid of [[0, 1], [0, 1, 2, 3], [0, 1, 256], [0, -1, 255], [0.5, 1, 2], null]) {
    assert.throws(() => adjustCodeSaturation(invalid), RangeError);
  }
  assert.throws(() => createSaturationPattern(1, 8), RangeError);
  assert.throws(() => createSaturationPattern(8, 1), RangeError);
  assert.throws(() => createSaturationPattern(8, 8, 'unknown'), RangeError);
  assert.throws(() => renderSaturation([0, 0, 0, 255], 1, 1), RangeError);
  assert.throws(() => renderSaturation(new Uint8ClampedArray(4), 2, 1), RangeError);
  assert.throws(() => renderSaturation(Uint8ClampedArray.of(0, 0, 0, 0), 1, 1), RangeError);
});
