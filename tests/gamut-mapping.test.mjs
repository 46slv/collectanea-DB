import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GAMUT_WIDTH, GAMUT_HEIGHT, GAMUT_DEFAULTS,
  clipRgb, radialRgb, linearToByte, createGamutPattern, renderGamut,
} from '../src/components/GamutMappingPlayground/gamut-core.mjs';

test('component clipping handles outside and inside and leaves input unchanged', () => {
  const input = [1.4, 0.5, -0.2];
  assert.deepEqual(clipRgb(input), [1, 0.5, 0]);
  assert.deepEqual(input, [1.4, 0.5, -0.2]);
  assert.deepEqual(clipRgb([0.2, 0.5, 0.7]), [0.2, 0.5, 0.7]);
});
test('gray-axis scaling hits RGB boundary with one common multiplier', () => {
  const original = [1.4, 0.5, -0.2];
  const mapped = radialRgb(original, 0.5);
  assert.ok(Math.abs(mapped[0] - 1) < 1e-9);
  assert.ok(Math.abs(mapped[1] - 0.5) < 1e-9);
  assert.ok(Math.abs(mapped[2] - 1 / 9) < 1e-9);
  assert.deepEqual(original, [1.4, 0.5, -0.2]);
});
test('gray-axis map preserves all in-gamut colors exactly', () => {
  for (const anchor of [0.2, 0.5, 0.8]) {
    assert.deepEqual(radialRgb([0.01, 0.5, 1], anchor), [0.01, 0.5, 1]);
  }
});
test('all mapped components stay within output cube for extended inputs', () => {
  for (let k = 0; k < 300; k++) {
    const rgb = [Math.sin(k) * 2, Math.cos(k * 2) * 2, Math.sin(k * 3) * 2];
    for (const anchor of [0.2, 0.5, 0.8]) {
      for (const val of radialRgb(rgb, anchor)) assert.ok(val >= 0 && val <= 1);
    }
  }
});
test('sRGB display encoding has stable endpoints and half-gray code', () => {
  assert.equal(linearToByte(0), 0);
  assert.equal(linearToByte(1), 255);
  assert.equal(linearToByte(0.5), 188);
});
test('patterns are reproducible, finite and include gamut violations', () => {
  for (const mode of ['bands', 'blocks']) {
    const src = createGamutPattern(36, 24, mode, 1.5);
    assert.equal(src.length, 36 * 24 * 3);
    assert.deepEqual(src, createGamutPattern(36, 24, mode, 1.5));
    assert.ok(src.every(v => Number.isFinite(v)));
    const out = renderGamut(src, 36, 24);
    assert.ok(out.outOfGamutPixels > 0 && out.outOfGamutPixels < 36 * 24);
  }
  assert.notDeepEqual(createGamutPattern(36, 24, 'bands'), createGamutPattern(36, 24, 'blocks'));
});
test('render makes three opaque RGBA images, mask and mapping differ', () => {
  const source = createGamutPattern(32, 12);
  const original = source.slice();
  const images = renderGamut(source, 32, 12);
  for (const output of [images.mask, images.clipped, images.radial]) {
    assert.equal(output.length, 32 * 12 * 4);
    for (let i = 3; i < output.length; i += 4) assert.equal(output[i], 255);
  }
  assert.ok(images.clipped.some((v,i) => v !== images.radial[i]));
  assert.deepEqual(source, original);
});
test('invalid dimensions, settings and extended source values fail clearly', () => {
  assert.throws(() => createGamutPattern(0, 10), RangeError);
  assert.throws(() => createGamutPattern(10, 10, 'unknown'), RangeError);
  assert.throws(() => createGamutPattern(10, 10, 'bands', Infinity), RangeError);
  assert.throws(() => clipRgb([1, 2]), RangeError);
  assert.throws(() => radialRgb([1, 1, 1], 0), RangeError);
  assert.throws(() => renderGamut(new Float32Array(2), 1, 1), RangeError);
  assert.throws(() => renderGamut(new Float32Array([NaN, 0, 0]), 1, 1), RangeError);
});
test('baseline dimensions and reset values remain explicit', () => {
  assert.equal(GAMUT_WIDTH, 320);
  assert.equal(GAMUT_HEIGHT, 144);
  assert.deepEqual({...GAMUT_DEFAULTS}, {pattern:'bands',drive:1.5,anchor:0.5,zoom:1});
});
