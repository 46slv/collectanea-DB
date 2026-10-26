import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeHalationPattern, extractHalationHighlights, makeHalationSpread,
  tintHalationSpread, compositeHalation,
} from '../src/components/HalationPlayground/halation-core.mjs';

test('two deterministic RGB patterns have the requested dimensions and differ', () => {
  const a = makeHalationPattern(64, 32, 'lamps');
  assert.equal(a.length, 64 * 32 * 3);
  assert.deepEqual(a, makeHalationPattern(64, 32, 'lamps'));
  assert.notDeepEqual(a, makeHalationPattern(64, 32, 'sign'));
});

test('bright-pass threshold selects highlights and leaves source unchanged', () => {
  const source = Uint8ClampedArray.of(14, 14, 14, 255, 255, 255, 190, 190, 190);
  const result = extractHalationHighlights(source, 3, 1, 185);
  assert.deepEqual(result, Uint8ClampedArray.of(0, 255, 18));
  assert.deepEqual(source, Uint8ClampedArray.of(14, 14, 14, 255, 255, 255, 190, 190, 190));
});

test('gain zero returns exactly the source without aliasing the input', () => {
  const source = makeHalationPattern(96, 40);
  const {spread} = makeHalationSpread(source, 96, 40);
  const result = compositeHalation(source, spread, 0, 1);
  assert.deepEqual(result, source);
  assert.notStrictEqual(result, source);
});

test('colored Gaussian halo spreads into dark surroundings', () => {
  const width = 41, height = 21;
  const source = new Uint8ClampedArray(width * height * 3).fill(10);
  const center = (10 * width + 20) * 3;
  source[center] = source[center + 1] = source[center + 2] = 255;
  const {spread} = makeHalationSpread(source, width, height, {sigma: 3});
  const near = 10 * width + 21;
  assert.ok(spread[near] > 0);
  const output = compositeHalation(source, spread, 2, 1);
  assert.ok(output[near * 3] > 10);
  assert.ok(output[near * 3] > output[near * 3 + 1]);
  assert.ok(output[near * 3 + 1] >= output[near * 3 + 2]);
});

test('sigma zero does not spread outside the source highlight', () => {
  const source = Uint8ClampedArray.of(0, 0, 0, 255, 255, 255, 0, 0, 0);
  const {spread} = makeHalationSpread(source, 3, 1, {sigma: 0});
  assert.deepEqual(spread, Uint8ClampedArray.of(0, 255, 0));
  assert.deepEqual(compositeHalation(source, spread, 2, 1).slice(0, 3), Uint8ClampedArray.of(0, 0, 0));
});

test('redness 0 makes spread neutral, redness 1 reduces green and blue', () => {
  const spread = Uint8ClampedArray.of(0, 200);
  assert.deepEqual(tintHalationSpread(spread, 0), Uint8ClampedArray.of(0, 0, 0, 200, 200, 200));
  assert.deepEqual(tintHalationSpread(spread, 1), Uint8ClampedArray.of(0, 0, 0, 200, 36, 10));
});

test('the cached spread can be recomposited without changing the input', () => {
  const source = makeHalationPattern(96, 40, 'sign');
  const cache = makeHalationSpread(source, 96, 40, {threshold: 185, sigma: 4});
  const snapshot = source.slice();
  for (const gain of [0, 0.5, 1.5, 2.5]) {
    assert.deepEqual(compositeHalation(source, cache.spread, gain, 1),
      compositeHalation(source, makeHalationSpread(source, 96, 40, {threshold: 185, sigma: 4}).spread, gain, 1));
  }
  assert.deepEqual(source, snapshot);
  assert.ok(cache.spread.some(value => value > 0));
});

test('invalid dimensions, patterns, image types and numeric settings fail explicitly', () => {
  assert.throws(() => makeHalationPattern(0, 20), RangeError);
  assert.throws(() => makeHalationPattern(3, 2, 'unknown'), RangeError);
  assert.throws(() => extractHalationHighlights(new Uint8ClampedArray(3), 2, 2), RangeError);
  assert.throws(() => extractHalationHighlights(new Uint8ClampedArray(6), 2, 1, 250), RangeError);
  assert.throws(() => makeHalationSpread(new Uint8ClampedArray(6), 2, 1, {sigma: Infinity}), RangeError);
  assert.throws(() => compositeHalation(new Uint8ClampedArray(3), new Uint8ClampedArray(2)), RangeError);
  assert.throws(() => compositeHalation(new Uint8ClampedArray(3), new Uint8ClampedArray(1), -1), RangeError);
  assert.throws(() => tintHalationSpread(new Uint8ClampedArray(1), NaN), RangeError);
});
