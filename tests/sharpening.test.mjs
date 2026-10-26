import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeSharpenPattern, extractSharpenDetail,
  visualizeSharpenDetail, renderKernelSharpen,
} from '../src/components/KernelSharpenPlayground/sharpen-core.mjs';

test('two RGB sample patterns are deterministic and visually distinct', () => {
  const edges = makeSharpenPattern(100, 60, 'edges');
  const texture = makeSharpenPattern(100, 60, 'texture');
  assert.equal(edges.length, 100 * 60 * 3);
  assert.deepEqual(edges, makeSharpenPattern(100, 60, 'edges'));
  assert.notDeepEqual(edges, texture);
});

test('constant RGB field has zero detail and sharpening changes nothing', () => {
  const input = new Uint8ClampedArray(6 * 4 * 3).fill(72);
  for (const neighbors of ['cross', 'square']) {
    const detail = extractSharpenDetail(input, 6, 4, neighbors);
    assert.ok(detail.every(value => value === 0));
    assert.ok(visualizeSharpenDetail(detail).every(value => value === 128));
    assert.deepEqual(renderKernelSharpen(input, 6, 4, detail, 3),
      {pixels: input, clippedChannels: 0});
  }
});

test('cross neighborhood produces analytically expected 1-D border response', () => {
  const input = Uint8ClampedArray.of(0, 0, 0, 200, 200, 200, 200, 200, 200);
  const detail = extractSharpenDetail(input, 3, 1, 'cross');
  assert.deepEqual(Array.from(detail), [-50, -50, -50, 50, 50, 50, 0, 0, 0]);
  assert.deepEqual(renderKernelSharpen(input, 3, 1, detail, 0.5), {
    pixels: Uint8ClampedArray.of(0, 0, 0, 225, 225, 225, 200, 200, 200),
    clippedChannels: 3,
  });
});

test('eight-neighbor kernel notices diagonal feature differently', () => {
  const input = new Uint8ClampedArray(3 * 3 * 3);
  input[0] = input[1] = input[2] = 255;
  const cross = extractSharpenDetail(input, 3, 3, 'cross');
  const square = extractSharpenDetail(input, 3, 3, 'square');
  const center = (1 * 3 + 1) * 3;
  assert.equal(cross[center], 0);
  assert.equal(square[center], -255 / 8);
});

test('zero amount is identity; nonzero amount amplifies contrast and reports clipping', () => {
  const input = Uint8ClampedArray.of(0, 18, 120, 255, 240, 160);
  const detail = Float32Array.of(-10, -20, -5, 10, 20, 5);
  assert.deepEqual(renderKernelSharpen(input, 2, 1, detail, 0), {pixels: input, clippedChannels: 0});
  assert.deepEqual(renderKernelSharpen(input, 2, 1, detail, 2), {
    pixels: Uint8ClampedArray.of(0, 0, 110, 255, 255, 170), clippedChannels: 4,
  });
});

test('source and intermediate arrays are not mutated', () => {
  const input = makeSharpenPattern(60, 30, 'texture');
  const snapshot = input.slice();
  const detail = extractSharpenDetail(input, 60, 30, 'square');
  const detailSnapshot = detail.slice();
  for (const amount of [0, 0.5, 1, 3]) {
    assert.equal(renderKernelSharpen(input, 60, 30, detail, amount).pixels.length, input.length);
  }
  assert.deepEqual(input, snapshot);
  assert.deepEqual(detail, detailSnapshot);
});

test('invalid bounds, input types and nonfinite values throw', () => {
  assert.throws(() => makeSharpenPattern(0, 20), RangeError);
  assert.throws(() => makeSharpenPattern(2000, 2000), RangeError);
  assert.throws(() => makeSharpenPattern(10, 4, 'unknown'), RangeError);
  assert.throws(() => extractSharpenDetail(new Uint8ClampedArray(5), 2, 1), RangeError);
  assert.throws(() => extractSharpenDetail(new Uint8ClampedArray(6), 2, 1, 'circle'), RangeError);
  assert.throws(() => renderKernelSharpen(new Uint8ClampedArray(6), 2, 1, new Float32Array(1)), RangeError);
  assert.throws(() => renderKernelSharpen(new Uint8ClampedArray(6), 2, 1, new Float32Array(6), Infinity), RangeError);
  assert.throws(() => renderKernelSharpen(new Uint8ClampedArray(6), 2, 1, Float32Array.of(0, 0, NaN, 0, 0, 0)), RangeError);
  assert.throws(() => visualizeSharpenDetail(Float32Array.of(1, 2)), RangeError);
  assert.throws(() => visualizeSharpenDetail(Float32Array.of(0, NaN, 0)), RangeError);
});
