import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSharpenTestPattern, unsharpMaskGrayscale, compositeUnsharpGrayscale, visualizeUnsharpResidualGrayscale, countNewSharpenEndpoints} from '../src/components/SharpenPlayground/sharpen-core.mjs';

test('source patterns are deterministic and distinct', () => {
  const a = makeSharpenTestPattern(64, 24, 'edges');
  const b = makeSharpenTestPattern(64, 24, 'texture');
  assert.equal(a.length, 1536);
  assert.notDeepEqual(a, b);
  assert.deepEqual(makeSharpenTestPattern(64, 24), a);
});

test('zero sharpening strength and zero sigma both preserve the source without aliasing', () => {
  const original = makeSharpenTestPattern(40, 20);
  for (const options of [{sigma: 4, amount: 0}, {sigma: 0, amount: 3}]) {
    const {output} = unsharpMaskGrayscale(original, 40, 20, options);
    assert.deepEqual(output, original);
    assert.notStrictEqual(output, original);
  }
});

test('a uniform image remains unchanged with sharpening at the boundaries', () => {
  const original = new Uint8ClampedArray(35).fill(123);
  for (const sigma of [0.5, 2, 7]) {
    const {blurred, output} = unsharpMaskGrayscale(original, 7, 5, {sigma, amount: 3});
    assert.ok(blurred.every(x => x === 123));
    assert.deepEqual(output, original);
  }
});

test('a sharp step creates symmetric highlight/shadow overshoot and clips to display range', () => {
  const width = 31, input = Uint8ClampedArray.from({length: width}, (_, x) => x < 15 ? 40 : 210);
  const {output, blurred} = unsharpMaskGrayscale(input, width, 1, {sigma: 2, amount: 2});
  assert.ok(blurred[14] > input[14]);
  assert.ok(blurred[15] < input[15]);
  assert.ok(output[14] < input[14], 'dark side becomes darker');
  assert.ok(output[15] > input[15], 'bright side becomes brighter');
  assert.ok(output.every(x => x >= 0 && x <= 255));
  assert.deepEqual(input, Uint8ClampedArray.from({length: width}, (_, x) => x < 15 ? 40 : 210));
});

test('invalid dimensions, source and processing settings are rejected', () => {
  assert.throws(() => makeSharpenTestPattern(0, 10), RangeError);
  assert.throws(() => makeSharpenTestPattern(12, 3, 'unknown'), RangeError);
  const pixels = new Uint8ClampedArray(10);
  assert.throws(() => unsharpMaskGrayscale(pixels, 4, 4), RangeError);
  assert.throws(() => unsharpMaskGrayscale(pixels, 2, 5, {sigma: NaN}), RangeError);
  assert.throws(() => unsharpMaskGrayscale(pixels, 2, 5, {amount: 4}), RangeError);
});

test('cached Gaussian reference recomposites identically across sharpening amounts', () => {
  const original = makeSharpenTestPattern(80, 40);
  const {blurred} = unsharpMaskGrayscale(original, 80, 40, {sigma: 6, amount: 0});
  for (const amount of [0, 0.25, 1.5, 3]) {
    assert.deepEqual(compositeUnsharpGrayscale(original, blurred, amount),
      unsharpMaskGrayscale(original, 80, 40, {sigma: 6, amount}).output);
  }
  assert.throws(() => compositeUnsharpGrayscale(original, new Uint8ClampedArray(3)), RangeError);
  assert.throws(() => compositeUnsharpGrayscale(original, blurred, NaN), RangeError);
});

test('cached sharpen composite obeys independently calculated edge arithmetic and byte clipping', () => {
  const before = Uint8ClampedArray.of(100, 160, 200, 0, 255);
  const blurred = Uint8ClampedArray.of(120, 140, 190, 100, 0);
  assert.deepEqual(compositeUnsharpGrayscale(before, blurred, 1),
    Uint8ClampedArray.of(80, 180, 210, 0, 255));
  assert.deepEqual(before, Uint8ClampedArray.of(100, 160, 200, 0, 255));
});


test('display endpoint metric excludes existing black and white, and zero amount adds none', () => {
  const before = Uint8ClampedArray.of(0, 255, 5, 240, 90);
  const after = Uint8ClampedArray.of(0, 255, 0, 255, 90);
  assert.deepEqual(countNewSharpenEndpoints(before, after), {black: 1, white: 1});
  assert.deepEqual(countNewSharpenEndpoints(before, before), {black: 0, white: 0});
  assert.throws(() => countNewSharpenEndpoints(before, new Uint8ClampedArray(4)), RangeError);
  const source = makeSharpenTestPattern(80, 30);
  assert.deepEqual(countNewSharpenEndpoints(source, unsharpMaskGrayscale(source, 80, 30, {amount: 0}).output),
    {black: 0, white: 0});
});


test('signed high-pass preview maps zero to neutral gray and preserves sign', () => {
  const original = Uint8ClampedArray.of(20, 150, 240, 0, 255);
  const blurred = Uint8ClampedArray.of(30, 120, 210, 255, 0);
  assert.deepEqual(visualizeUnsharpResidualGrayscale(original, blurred),
    Uint8ClampedArray.of(118, 158, 158, 0, 255));
  assert.deepEqual(original, Uint8ClampedArray.of(20, 150, 240, 0, 255));
  assert.deepEqual(blurred, Uint8ClampedArray.of(30, 120, 210, 255, 0));
  assert.throws(() => visualizeUnsharpResidualGrayscale(original, new Uint8ClampedArray(4)), RangeError);
});

test('zero-radius unsharp residual preview is uniformly neutral gray', () => {
  const original = makeSharpenTestPattern(48, 20, 'texture');
  const {blurred, output} = unsharpMaskGrayscale(original, 48, 20, {sigma: 0, amount: 3});
  const preview = visualizeUnsharpResidualGrayscale(original, blurred);
  assert.ok(preview.every(value => value === 128));
  assert.deepEqual(output, original);
});
