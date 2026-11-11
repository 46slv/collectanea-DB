import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ST_WIDTH, ST_HEIGHT, ST_DEFAULTS, hueDirection, toneWeights,
  makeSplitPattern, renderSplitTone,
} from '../src/components/SplitToningPlayground/split-toning-core.mjs';

const near = (a, b, eps = 1e-10) =>
  assert.ok(Math.abs(a - b) < eps, String(a) + ' != ' + String(b));

test('defaults and deterministic synthetic patterns', () => {
  assert.equal(ST_WIDTH, 320); assert.equal(ST_HEIGHT, 144);
  assert.equal(ST_DEFAULTS.balance, 0);
  const a = makeSplitPattern(32, 12);
  assert.deepEqual(a, makeSplitPattern(32, 12));
  assert.notDeepEqual(a, makeSplitPattern(32, 12, 'patches'));
  assert.equal(a.length, 32 * 12 * 3);
  assert.deepEqual(Array.from(a.slice(0, 3)), [0, 0, 0]);
  assert.deepEqual(Array.from(a.slice(-3)), [255, 255, 255]);
});
test('hue direction is circular and zero-luma by construction', () => {
  assert.deepEqual(hueDirection(0), hueDirection(360));
  for (const angle of [0, 35, 180, 220, 359]) {
    const [r, g, b] = hueDirection(angle);
    near(0.2126 * r + 0.7152 * g + 0.0722 * b, 0);
  }
});
test('tone weights sum to one and balance shifts the boundary', () => {
  for (const luma of [0, 0.1, 0.5, 0.9, 1]) {
    const w = toneWeights(luma);
    near(w.shadow + w.highlight, 1);
  }
  near(toneWeights(0).shadow, 1);
  near(toneWeights(1).highlight, 1);
  near(toneWeights(0.5).highlight, 0.5);
  assert.ok(toneWeights(0.5, 0.2).shadow > toneWeights(0.5, -0.2).shadow);
});
test('zero strength exactly preserves the original RGB bytes', () => {
  for (const pattern of ['gradient', 'patches']) {
    const src = makeSplitPattern(32, 12, pattern);
    const before = src.slice();
    const r = renderSplitTone(src, 32, 12,
      {shadowStrength: 0, highlightStrength: 0});
    assert.deepEqual(src, before);
    for (let i = 0; i < src.length / 3; i++) {
      assert.deepEqual(Array.from(r.graded.slice(i * 4, i * 4 + 3)),
        Array.from(src.slice(i * 3, i * 3 + 3)));
    }
    assert.equal(r.clippedPixels, 0);
  }
});
test('cool shadows and warm highlights differ in a grayscale ramp', () => {
  const src = makeSplitPattern(101, 1);
  const r = renderSplitTone(src, 101, 1, {
    shadowHue: 240, highlightHue: 0, shadowStrength: 1, highlightStrength: 1,
  });
  const dark = 25 * 4, light = 75 * 4;
  assert.ok(r.graded[dark + 2] > r.graded[dark]);
  assert.ok(r.graded[light] > r.graded[light + 2]);
  assert.deepEqual(Array.from(r.graded.slice(0, 3)), [0, 0, 0]);
  assert.deepEqual(Array.from(r.graded.slice(100 * 4, 100 * 4 + 3)), [255, 255, 255]);
});
test('three opaque previews and weight mask respond to balance', () => {
  const src = makeSplitPattern(33, 3);
  const a = renderSplitTone(src, 33, 3);
  const b = renderSplitTone(src, 33, 3, {balance: 0.35});
  for (const image of [a.original, a.graded, a.weights]) {
    assert.equal(image.length, 33 * 3 * 4);
    for (let i = 3; i < image.length; i += 4) assert.equal(image[i], 255);
  }
  assert.ok(a.graded.some((v, i) => v !== a.original[i]));
  assert.notDeepEqual(a.weights, b.weights);
  assert.ok(a.clippedPixels >= 0 && a.clippedPixels <= a.total);
});
test('reset settings restore exactly the default output', () => {
  const src = makeSplitPattern(19, 7);
  assert.deepEqual(renderSplitTone(src, 19, 7),
    renderSplitTone(src, 19, 7, {...ST_DEFAULTS}));
});
test('invalid dimensions, pattern, controls or RGB buffer are rejected', () => {
  assert.throws(() => makeSplitPattern(0, 2), RangeError);
  assert.throws(() => makeSplitPattern(2, 2, 'bad'), RangeError);
  assert.throws(() => renderSplitTone(new Uint8ClampedArray(2), 1, 1), RangeError);
  assert.throws(() => renderSplitTone(makeSplitPattern(2, 2), 2, 2, {shadowHue: NaN}), RangeError);
  assert.throws(() => renderSplitTone(makeSplitPattern(2, 2), 2, 2, {balance: 1}), RangeError);
  assert.throws(() => toneWeights(0.5, 0, 0), RangeError);
});
