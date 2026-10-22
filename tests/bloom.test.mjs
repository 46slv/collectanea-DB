import test from 'node:test';
import assert from 'node:assert/strict';
import {bloomGrayscale, compositeBloomGrayscale, extractBloomHighlights, makeBloomTestPattern, countNewBloomEndpoints} from '../src/components/BloomPlayground/bloom-core.mjs';

test('test scenes are deterministic, dimensioned and distinct', () => {
  const a = makeBloomTestPattern(96, 40, 'lights');
  const b = makeBloomTestPattern(96, 40, 'frame');
  assert.equal(a.length, 3840);
  assert.notDeepEqual(a, b);
  assert.deepEqual(makeBloomTestPattern(96, 40), a);
});

test('bright pass uses inclusive threshold and does not mutate input', () => {
  const input = Uint8ClampedArray.of(0, 189, 190, 255);
  assert.deepEqual(extractBloomHighlights(input, 190), Uint8ClampedArray.of(0, 0, 190, 255));
  assert.deepEqual(input, Uint8ClampedArray.of(0, 189, 190, 255));
});

test('zero composite strength exactly preserves source even when spread is present', () => {
  const input = makeBloomTestPattern(64, 32);
  const {spread, output} = bloomGrayscale(input, 64, 32, {sigma: 3, strength: 0});
  assert.deepEqual(output, input);
  assert.notStrictEqual(output, input);
  assert.ok(spread.some(x => x > 0));
});

test('zero sigma does not create a halo outside the bright-pass region', () => {
  const input = Uint8ClampedArray.of(20, 240, 20);
  const layers = bloomGrayscale(input, 3, 1, {threshold: 200, sigma: 0, strength: 1});
  assert.deepEqual(layers.spread, Uint8ClampedArray.of(0, 240, 0));
  assert.deepEqual(layers.output, Uint8ClampedArray.of(20, 255, 20));
});

test('Gaussian spread expands a bright point and additive composite clips safely', () => {
  const input = new Uint8ClampedArray(31 * 31).fill(10);
  input[15 * 31 + 15] = 250;
  const {spread, output} = bloomGrayscale(input, 31, 31, {threshold: 200, sigma: 3, strength: 2});
  assert.ok(spread[15 * 31 + 14] > 0);
  assert.ok(output[15 * 31 + 14] > 10);
  assert.ok(output[15 * 31 + 15] >= input[15 * 31 + 15]);
  assert.ok(output.every(value => value >= 0 && value <= 255));
});

test('uniform highlights stay uniform with clamp boundary handling', () => {
  const input = new Uint8ClampedArray(30).fill(200);
  const {spread, output} = bloomGrayscale(input, 6, 5, {threshold: 190, sigma: 4, strength: 0.25});
  assert.ok(spread.every(value => value === 200));
  assert.ok(output.every(value => value === 250));
});

test('invalid image, threshold and processing settings fail explicitly', () => {
  const p = new Uint8ClampedArray(6);
  assert.throws(() => makeBloomTestPattern(0, 2), RangeError);
  assert.throws(() => makeBloomTestPattern(2, 3, 'invalid'), RangeError);
  assert.throws(() => extractBloomHighlights(p, 256), RangeError);
  assert.throws(() => bloomGrayscale(p, 2, 4), RangeError);
  assert.throws(() => bloomGrayscale(p, 2, 3, {sigma: Infinity}), RangeError);
  assert.throws(() => bloomGrayscale(p, 2, 3, {strength: -0.5}), RangeError);
});

test('cached bright-pass spread recomposites identically across strength changes', () => {
  const original = makeBloomTestPattern(80, 40);
  const cached = bloomGrayscale(original, 80, 40, {threshold: 190, sigma: 7, strength: 0});
  for (const strength of [0, 0.25, 1.5, 3]) {
    const output = compositeBloomGrayscale(original, cached.spread, strength);
    assert.deepEqual(output, bloomGrayscale(original, 80, 40, {threshold: 190, sigma: 7, strength}).output);
  }
  assert.throws(() => compositeBloomGrayscale(original, new Uint8ClampedArray(3)), RangeError);
  assert.throws(() => compositeBloomGrayscale(original, cached.spread, 4), RangeError);
});

test('cached composite uses independent byte arithmetic and clips at 255', () => {
  const before = Uint8ClampedArray.of(8, 240, 255);
  const spread = Uint8ClampedArray.of(4, 20, 255);
  assert.deepEqual(compositeBloomGrayscale(before, spread, 0.5), Uint8ClampedArray.of(10, 250, 255));
  assert.deepEqual(before, Uint8ClampedArray.of(8, 240, 255));
  assert.deepEqual(spread, Uint8ClampedArray.of(4, 20, 255));
});


test('display endpoint metric excludes preexisting white and detects new clipping', () => {
  const before = Uint8ClampedArray.of(255, 244, 100, 0);
  const after = Uint8ClampedArray.of(255, 255, 110, 0);
  assert.equal(countNewBloomEndpoints(before, after), 1);
  assert.equal(countNewBloomEndpoints(before, before), 0);
  assert.throws(() => countNewBloomEndpoints(before, new Uint8ClampedArray(3)), RangeError);
  const source = makeBloomTestPattern(80, 30);
  assert.equal(countNewBloomEndpoints(source, bloomGrayscale(source, 80, 30, {strength: 0}).output), 0);
});


test('gradient scene lets threshold traverse genuinely different highlight regions', () => {
  const width = 96, height = 40;
  const input = makeBloomTestPattern(width, height, 'gradient');
  assert.ok(new Set(input).size > 100, 'The scene must contain many brightness levels');
  const selected = [64, 120, 190, 230].map(threshold =>
    extractBloomHighlights(input, threshold).filter(value => value > 0).length);
  assert.ok(selected.every((count, index) => index === 0 || selected[index - 1] > count),
    'Each higher threshold must select strictly fewer pixels');
  const results = [64, 120, 190, 230].map(threshold =>
    bloomGrayscale(input, width, height, {threshold, sigma: 3, strength: 1}).output);
  for (let i = 1; i < results.length; i += 1) {
    assert.notDeepEqual(results[i], results[i - 1], 'Threshold must change output');
  }
  assert.deepEqual(makeBloomTestPattern(width, height, 'gradient'), input);
});


test('soft-knee transitions gradually around the threshold without changing hard-knee default', () => {
  const original = Uint8ClampedArray.of(160, 170, 180, 190, 200, 210, 220);
  const hard = extractBloomHighlights(original, 190);
  assert.deepEqual(hard, Uint8ClampedArray.of(0, 0, 0, 190, 200, 210, 220));
  assert.deepEqual(extractBloomHighlights(original, 190, 0), hard);
  const soft = extractBloomHighlights(original, 190, 40);
  assert.deepEqual(soft, Uint8ClampedArray.of(0, 0, 45, 95, 150, 210, 220));
  assert.deepEqual(original, Uint8ClampedArray.of(160, 170, 180, 190, 200, 210, 220));
  assert.throws(() => extractBloomHighlights(original, 190, -1), RangeError);
  assert.throws(() => extractBloomHighlights(original, 190, 97), RangeError);
  assert.throws(() => extractBloomHighlights(original, 190, 1.5), RangeError);
});

test('soft-knee produces a different Bloom result and still respects zero strength', () => {
  const source = makeBloomTestPattern(96, 40, 'gradient');
  const hard = bloomGrayscale(source, 96, 40, {threshold: 190, softKnee: 0, sigma: 4, strength: 1});
  const soft = bloomGrayscale(source, 96, 40, {threshold: 190, softKnee: 80, sigma: 4, strength: 1});
  assert.notDeepEqual(soft.highlights, hard.highlights);
  assert.notDeepEqual(soft.output, hard.output);
  assert.deepEqual(bloomGrayscale(source, 96, 40, {softKnee: 80, strength: 0}).output, source);
  assert.deepEqual(bloomGrayscale(source, 96, 40, {softKnee: 0}).output,
    bloomGrayscale(source, 96, 40).output);
});


test('bright-pass and Gaussian spread expose two independently observable stages', () => {
  const width = 96, height = 40;
  const original = makeBloomTestPattern(width, height, 'gradient');
  const options = {threshold: 190, softKnee: 64, sigma: 4, strength: 1};
  const {highlights, spread, output} = bloomGrayscale(original, width, height, options);
  assert.deepEqual(highlights, extractBloomHighlights(original, options.threshold, options.softKnee));
  assert.notDeepEqual(highlights, spread, 'Blur must spatially redistribute selected highlights');
  assert.notDeepEqual(spread, original, 'Middle stage must be distinct from input');
  assert.deepEqual(output, compositeBloomGrayscale(original, spread, options.strength));
  // The UI middle-image mode only selects an existing layer; changing it must
  // never require rerunning or altering the final composite.
  const stages = {highlights, spread};
  assert.notStrictEqual(stages.highlights, stages.spread);
  assert.deepEqual(output, bloomGrayscale(original, width, height, options).output);
});
