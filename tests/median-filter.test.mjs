import test from 'node:test';
import assert from 'node:assert/strict';
import {addImpulseNoise, addGaussianNoise, makeMedianTestPattern, medianFilterGrayscale, meanAbsoluteError, absoluteDifferenceGrayscale, countErrorChanges} from '../src/components/MedianPlayground/median-core.mjs';
import {gaussianBlurGrayscale} from '../src/components/BlurPlayground/blur-core.mjs';

test('single bright impulse is removed by 3×3 median, Gaussian spreads it', () => {
  const pixels = new Uint8ClampedArray(25);
  pixels[12] = 255;
  const median = medianFilterGrayscale(pixels, 5, 5, 1);
  const gaussian = gaussianBlurGrayscale(pixels, 5, 5, 1);
  assert.ok(median.every(value => value === 0));
  assert.ok(gaussian[12] > 0);
  assert.equal(pixels[12], 255, 'input remains untouched');
});

test('3×3 median maintains vertical binary step unlike Gaussian blur', () => {
  const p = Uint8ClampedArray.from({length: 7 * 7}, (_, i) => (i % 7) < 3 ? 0 : 255);
  const m = medianFilterGrayscale(p, 7, 7, 1);
  for (let y = 0; y < 7; y += 1) for (let x = 0; x < 7; x += 1) {
    assert.equal(m[y * 7 + x], p[y * 7 + x]);
  }
  const gaussian = gaussianBlurGrayscale(p, 7, 7, 1);
  assert.ok(gaussian[3 * 7 + 2] > 0 && gaussian[3 * 7 + 2] < 255);
});

test('constant image and tiny images use replicated borders', () => {
  for (const radius of [1, 2, 3]) {
    assert.deepEqual(medianFilterGrayscale(new Uint8ClampedArray(16).fill(73), 4, 4, radius),
      new Uint8ClampedArray(16).fill(73));
    assert.deepEqual(medianFilterGrayscale(Uint8ClampedArray.of(199), 1, 1, radius),
      Uint8ClampedArray.of(199));
  }
});

test('noise generation is deterministic and does not mutate its source', () => {
  const source = makeMedianTestPattern(50, 13, 'thin-lines');
  const original = source.slice();
  const noisy1 = addImpulseNoise(source, 50, 13, 30);
  const noisy2 = addImpulseNoise(source, 50, 13, 30);
  assert.deepEqual(noisy1, noisy2);
  assert.notDeepEqual(noisy1, source);
  assert.deepEqual(source, original);
  assert.deepEqual(addImpulseNoise(source, 50, 13, 0), source);
  assert.notStrictEqual(addImpulseNoise(source, 50, 13, 0), source);
});

test('radius increases erosion of thin features; output is separate', () => {
  const w = 17, h = 11;
  const p = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
    if (Math.abs(x - 8) < 2) p[y * w + x] = 255;
  }
  const narrow = medianFilterGrayscale(p, w, h, 1);
  const wide = medianFilterGrayscale(p, w, h, 3);
  assert.ok(narrow.reduce((a, b) => a + b, 0) > wide.reduce((a, b) => a + b, 0));
  assert.notStrictEqual(narrow, p);
});

test('invalid parameters fail explicitly', () => {
  const p = Uint8ClampedArray.of(80);
  assert.throws(() => medianFilterGrayscale(p, 2, 1), RangeError);
  assert.throws(() => medianFilterGrayscale(p, 1, 1, 0), RangeError);
  assert.throws(() => medianFilterGrayscale(p, 1, 1, 4), RangeError);
  assert.throws(() => medianFilterGrayscale([80], 1, 1), RangeError);
  assert.throws(() => addImpulseNoise(p, 1, 1, -1), RangeError);
  assert.throws(() => addImpulseNoise(p, 1, 1, 41), RangeError);
  assert.throws(() => makeMedianTestPattern(10, 10, 'unknown'), RangeError);
});

test('MAE reports exact 8-bit absolute differences without changing images', () => {
  const original = Uint8ClampedArray.of(0, 50, 200, 255);
  const sample = Uint8ClampedArray.of(0, 70, 170, 250);
  assert.equal(meanAbsoluteError(original, sample, 2, 2), 13.75);
  assert.equal(meanAbsoluteError(original, original, 2, 2), 0);
  assert.deepEqual(original, Uint8ClampedArray.of(0, 50, 200, 255));
  assert.throws(() => meanAbsoluteError(original, new Uint8ClampedArray(3), 2, 2), RangeError);
});

test('median suppresses sparse impulse noise but wider neighborhoods may erase real thin lines', () => {
  const width = 64, height = 32;
  const clean = makeMedianTestPattern(width, height, 'thin-lines');
  const noisy = addImpulseNoise(clean, width, height, 20);
  const narrow = medianFilterGrayscale(noisy, width, height, 1);
  const wide = medianFilterGrayscale(noisy, width, height, 3);
  assert.ok(meanAbsoluteError(clean, narrow, width, height) < meanAbsoluteError(clean, noisy, width, height));
  assert.ok(meanAbsoluteError(clean, wide, width, height) > meanAbsoluteError(clean, narrow, width, height));
});


test('noise seed changes impulse locations without changing replacement probability or input', () => {
  const clean = makeMedianTestPattern(64, 32, 'edges');
  const copy = clean.slice();
  const a = addImpulseNoise(clean, 64, 32, 20, 2026);
  const b = addImpulseNoise(clean, 64, 32, 20, 2027);
  const repeatA = addImpulseNoise(clean, 64, 32, 20, 2026);
  assert.deepEqual(a, repeatA, 'the same choice reproduces the same source noise');
  assert.notDeepEqual(a, b, 'different choices change spatial realization');
  assert.deepEqual(clean, copy, 'seed switching does not write into clean source');
});

test('zero-noise output remains the same for all presets and seed must be finite integer', () => {
  const clean = makeMedianTestPattern(16, 16, 'thin-lines');
  for (const seed of [2026, 2027, 2028]) {
    assert.deepEqual(addImpulseNoise(clean, 16, 16, 0, seed), clean);
  }
  assert.throws(() => addImpulseNoise(clean, 16, 16, 20, Number.NaN), RangeError);
  assert.throws(() => addImpulseNoise(clean, 16, 16, 20, 2026.5), RangeError);
});

test('absolute-error map pinpoints mismatched pixels without changing its inputs', () => {
  const clean = Uint8ClampedArray.of(0, 50, 200, 255);
  const output = Uint8ClampedArray.of(0, 70, 170, 250);
  const error = absoluteDifferenceGrayscale(clean, output, 2, 2);
  assert.deepEqual(error, Uint8ClampedArray.of(0, 20, 30, 5));
  assert.equal(error.reduce((sum, value) => sum + value, 0) / error.length,
    meanAbsoluteError(clean, output, 2, 2));
  assert.deepEqual(clean, Uint8ClampedArray.of(0, 50, 200, 255));
  assert.deepEqual(output, Uint8ClampedArray.of(0, 70, 170, 250));
  assert.notStrictEqual(error, clean);
});

test('error-map boundaries, identity and invalid comparison shape', () => {
  const clean = Uint8ClampedArray.of(0, 255, 128, 128);
  const inverse = Uint8ClampedArray.of(255, 0, 128, 129);
  assert.deepEqual(absoluteDifferenceGrayscale(clean, inverse, 2, 2), Uint8ClampedArray.of(255, 255, 0, 1));
  assert.deepEqual(absoluteDifferenceGrayscale(clean, clean, 2, 2), new Uint8ClampedArray(4));
  assert.throws(() => absoluteDifferenceGrayscale(clean, inverse, 3, 2), RangeError);
  assert.throws(() => absoluteDifferenceGrayscale(clean, [0, 0, 0, 0], 2, 2), RangeError);
});


test('additive Gaussian noise is seeded, independent of source and clamped to display levels', () => {
  const clean = new Uint8ClampedArray(4096).fill(128);
  const baseline = clean.slice();
  const a = addGaussianNoise(clean, 64, 64, 20, 2026);
  const b = addGaussianNoise(clean, 64, 64, 20, 2027);
  assert.deepEqual(a, addGaussianNoise(clean, 64, 64, 20, 2026));
  assert.notDeepEqual(a, b, 'a new seed changes spatial realization');
  assert.notDeepEqual(a, clean);
  assert.deepEqual(clean, baseline, 'source is not mutated');
  assert.deepEqual(addGaussianNoise(clean, 64, 64, 0), clean);
  assert.notStrictEqual(addGaussianNoise(clean, 64, 64, 0), clean);
  const rms = Math.sqrt(a.reduce((sum, value) => sum + (value - 128) ** 2, 0) / a.length);
  assert.ok(rms > 17 && rms < 23, `σ=20 noise RMS ${rms.toFixed(2)} is plausible`);
});

test('additive noise validates its bounds and clamps at 0/255', () => {
  const clean = new Uint8ClampedArray(200).fill(255);
  const output = addGaussianNoise(clean, 20, 10, 40, 2028);
  assert.ok(output.every(n => Number.isInteger(n) && n >= 0 && n <= 255));
  assert.ok(output.some(n => n < 255), 'negative perturbations survive bright-end clipping');
  assert.throws(() => addGaussianNoise(clean, 20, 10, -1), RangeError);
  assert.throws(() => addGaussianNoise(clean, 20, 10, 41), RangeError);
  assert.throws(() => addGaussianNoise(clean, 20, 10, 20, NaN), RangeError);
  assert.throws(() => addGaussianNoise(clean, 20, 10, 20, 2026.5), RangeError);
  assert.throws(() => addGaussianNoise(clean, 19, 10, 20), RangeError);
});


test('didactic contrast: impulse favors median; additive Gaussian can favor blur on broad regions', () => {
  const w = 384, h = 160;
  const clean = makeMedianTestPattern(w, h, 'edges');
  const impulse = addImpulseNoise(clean, w, h, 20, 2026);
  const smooth = addGaussianNoise(clean, w, h, 20, 2026);
  const impulseMedian = meanAbsoluteError(clean, medianFilterGrayscale(impulse, w, h, 1), w, h);
  const impulseBlur = meanAbsoluteError(clean, gaussianBlurGrayscale(impulse, w, h, 0.85), w, h);
  const smoothMedian = meanAbsoluteError(clean, medianFilterGrayscale(smooth, w, h, 1), w, h);
  const smoothBlur = meanAbsoluteError(clean, gaussianBlurGrayscale(smooth, w, h, 0.85), w, h);
  assert.ok(impulseMedian < impulseBlur, 'median removes sparse point corruption');
  assert.ok(smoothBlur < smoothMedian, 'blur is slightly closer to this broad reference under additive noise');
});


test('per-pixel error changes separate improvement, damage and unchanged without mutation', () => {
  const clean = Uint8ClampedArray.of(50, 50, 50, 50, 50, 50);
  const noisy = Uint8ClampedArray.of(0, 100, 50, 40, 70, 20);
  const processed = Uint8ClampedArray.of(40, 10, 50, 60, 90, 30);
  assert.deepEqual(countErrorChanges(clean, noisy, processed, 3, 2), {
    improved: 3, unchanged: 2, worsened: 1, total: 6,
  });
  assert.deepEqual(clean, Uint8ClampedArray.of(50, 50, 50, 50, 50, 50));
  assert.deepEqual(noisy, Uint8ClampedArray.of(0, 100, 50, 40, 70, 20));
  assert.deepEqual(processed, Uint8ClampedArray.of(40, 10, 50, 60, 90, 30));
});

test('error change categories partition all pixels for identity, isolated damage and malformed inputs', () => {
  const clean = Uint8ClampedArray.of(0, 255, 120, 80);
  const noisy = Uint8ClampedArray.of(0, 255, 120, 80);
  const damaged = Uint8ClampedArray.of(12, 250, 120, 20);
  assert.deepEqual(countErrorChanges(clean, noisy, damaged, 2, 2), {
    improved: 0, unchanged: 1, worsened: 3, total: 4,
  });
  assert.deepEqual(countErrorChanges(clean, noisy, noisy, 2, 2), {
    improved: 0, unchanged: 4, worsened: 0, total: 4,
  });
  assert.throws(() => countErrorChanges(clean, noisy, damaged, 3, 2), RangeError);
  assert.throws(() => countErrorChanges(clean, noisy, [0, 0, 0, 0], 2, 2), RangeError);
});