import test from 'node:test';
import assert from 'node:assert/strict';
import {makeDoGTestPattern, makeDoGBlurPair, renderDoGFromBlurs, differenceOfGaussiansGrayscale} from '../src/components/DoGPlayground/dog-core.mjs';

test('all DoG scenes are deterministic and distinguishable', () => {
  const a = makeDoGTestPattern(48, 32, 'spots');
  const b = makeDoGTestPattern(48, 32, 'stripes');
  const c = makeDoGTestPattern(48, 32, 'texture');
  assert.equal(a.length, 48 * 32);
  assert.deepEqual(a, makeDoGTestPattern(48, 32, 'spots'));
  assert.notDeepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test('constant input is neutral on signed DoG, zero on absolute and output', () => {
  const input = new Uint8ClampedArray(14 * 9).fill(128);
  const result = differenceOfGaussiansGrayscale(input, 14, 9, {threshold: 0});
  assert.ok(result.signed.every(v => v === 128));
  assert.ok(result.absolute.every(v => v === 0));
  assert.ok(result.edges.every(v => v === 0));
  assert.equal(result.edgeCount, 0);
});

test('impulse produces positive centre and negative surrounding ring', () => {
  const width = 31, height = 31;
  const input = new Uint8ClampedArray(width * height);
  input[15 * width + 15] = 255;
  const result = differenceOfGaussiansGrayscale(input, width, height, {sigma: 1, ratio: 3, gain: 2, threshold: 0});
  assert.ok(result.signed[15 * width + 15] > 128);
  assert.ok(result.signed[15 * width + 20] < 128);
  assert.ok(result.absolute[15 * width + 15] > 0);
  assert.equal(result.edges[15 * width + 15], result.absolute[15 * width + 15]);
  assert.ok(result.edgeCount > 0);
});

test('threshold only masks the magnitude and never changes blur or signed difference', () => {
  const input = makeDoGTestPattern(64, 40, 'stripes');
  const low = differenceOfGaussiansGrayscale(input, 64, 40, {sigma: 1.5, ratio: 2.5, gain: 3, threshold: 5});
  const high = differenceOfGaussiansGrayscale(input, 64, 40, {sigma: 1.5, ratio: 2.5, gain: 3, threshold: 100});
  assert.deepEqual(low.narrow, high.narrow);
  assert.deepEqual(low.wide, high.wide);
  assert.deepEqual(low.signed, high.signed);
  assert.deepEqual(low.absolute, high.absolute);
  assert.ok(high.edgeCount < low.edgeCount);
  for (let i = 0; i < input.length; i++) {
    if (high.edges[i]) assert.equal(high.edges[i], low.edges[i]);
  }
});

test('gain scales unsaturated DoG response, but leaves input unchanged', () => {
  const input = makeDoGTestPattern(54, 33, 'spots');
  const saved = input.slice();
  const a = differenceOfGaussiansGrayscale(input, 54, 33, {gain: 1, threshold: 0});
  const b = differenceOfGaussiansGrayscale(input, 54, 33, {gain: 4, threshold: 0});
  assert.deepEqual(input, saved);
  assert.ok(b.absolute.some((v, i) => v > a.absolute[i]));
  for (let i = 0; i < input.length; i++) assert.ok(b.absolute[i] >= a.absolute[i]);
});

test('invalid image sizes, settings, source and buffer type are rejected', () => {
  const input = new Uint8ClampedArray(9);
  assert.throws(() => makeDoGTestPattern(0, 4), RangeError);
  assert.throws(() => makeDoGTestPattern(3, 3, 'unknown'), RangeError);
  assert.throws(() => makeDoGTestPattern(5000, 5000), RangeError);
  assert.throws(() => differenceOfGaussiansGrayscale(input, 3, 4), RangeError);
  assert.throws(() => differenceOfGaussiansGrayscale(new Uint8Array(9), 3, 3), RangeError);
  assert.throws(() => differenceOfGaussiansGrayscale(input, 3, 3, {sigma: -1}), RangeError);
  assert.throws(() => differenceOfGaussiansGrayscale(input, 3, 3, {sigma: 10}), RangeError);
  assert.throws(() => differenceOfGaussiansGrayscale(input, 3, 3, {ratio: 1}), RangeError);
  assert.throws(() => differenceOfGaussiansGrayscale(input, 3, 3, {sigma: 5, ratio: 3.5}), RangeError);
  assert.throws(() => differenceOfGaussiansGrayscale(input, 3, 3, {gain: Infinity}), RangeError);
  assert.throws(() => differenceOfGaussiansGrayscale(input, 3, 3, {threshold: 256}), RangeError);
});

test('sigma and scale ratio independently change the observed difference', () => {
  const input = makeDoGTestPattern(72, 48, 'spots');
  const base = differenceOfGaussiansGrayscale(input, 72, 48, {sigma: 1, ratio: 2, gain: 2});
  const wider = differenceOfGaussiansGrayscale(input, 72, 48, {sigma: 1, ratio: 3, gain: 2});
  const coarser = differenceOfGaussiansGrayscale(input, 72, 48, {sigma: 3, ratio: 2, gain: 2});
  assert.notDeepEqual(base.absolute, wider.absolute);
  assert.notDeepEqual(base.absolute, coarser.absolute);
  assert.ok(base.absolute.some(value => value > 0));
});

test('DoG exposes both Gaussian inputs so the scale comparison is independently inspectable', () => {
  const width = 72, height = 45;
  const input = makeDoGTestPattern(width, height, 'texture');
  const result = differenceOfGaussiansGrayscale(input, width, height, {sigma: 1, ratio: 2.5});
  assert.equal(result.narrow.length, width * height);
  assert.equal(result.wide.length, width * height);
  assert.notDeepEqual(result.narrow, result.wide, 'The scales must not be identical');
  assert.notDeepEqual(result.narrow, input, 'Each blur must modify the test pattern');
  assert.deepEqual(result.signed, Uint8ClampedArray.from(result.narrow, (v, i) => 128 + (v - result.wide[i]) * 3));
});

test('changing threshold preserves both Gaussian previews and does not mutate previous results', () => {
  const input = makeDoGTestPattern(40, 40, 'spots');
  const a = differenceOfGaussiansGrayscale(input, 40, 40, {threshold: 0});
  const originalSmall = a.narrow.slice();
  const originalLarge = a.wide.slice();
  const b = differenceOfGaussiansGrayscale(input, 40, 40, {threshold: 150});
  assert.deepEqual(a.narrow, b.narrow);
  assert.deepEqual(a.wide, b.wide);
  assert.deepEqual(a.narrow, originalSmall);
  assert.deepEqual(a.wide, originalLarge);
  assert.notDeepEqual(a.edges, b.edges);
});


test('cached spatial stages produce exactly the same previews as full DoG', () => {
  const width = 72, height = 44;
  const input = makeDoGTestPattern(width, height, 'texture');
  const pair = makeDoGBlurPair(input, width, height, {sigma: 2, ratio: 3});
  const narrowCopy = pair.narrow.slice();
  const wideCopy = pair.wide.slice();
  for (const [gain, threshold] of [[0.5, 0], [2, 60], [8, 255]]) {
    const cached = renderDoGFromBlurs(pair.narrow, pair.wide, {gain, threshold});
    const full = differenceOfGaussiansGrayscale(input, width, height, {
      sigma: 2, ratio: 3, gain, threshold,
    });
    assert.deepEqual({narrow: pair.narrow, wide: pair.wide, ...cached}, full);
    assert.deepEqual(pair.narrow, narrowCopy, 'Presentation must not modify cached blur A');
    assert.deepEqual(pair.wide, wideCopy, 'Presentation must not modify cached blur B');
  }
});

test('cached DoG stages reject invalid image/pair and display parameters', () => {
  const a = new Uint8ClampedArray(16).fill(140);
  assert.throws(() => makeDoGBlurPair(a, 4, 4, {ratio: Number.NaN}), RangeError);
  assert.throws(() => makeDoGBlurPair(a, 4, 4, {sigma: 7}), RangeError);
  assert.throws(() => makeDoGBlurPair(a, 3, 4), RangeError);
  assert.throws(() => renderDoGFromBlurs(a, new Uint8ClampedArray(8)), RangeError);
  assert.throws(() => renderDoGFromBlurs(new Uint8Array(16), a), RangeError);
  assert.throws(() => renderDoGFromBlurs(a, a, {gain: 0}), RangeError);
  assert.throws(() => renderDoGFromBlurs(a, a, {threshold: 12.5}), RangeError);
});
