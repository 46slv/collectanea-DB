import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSobelTestPattern, sobelEdgesGrayscale} from '../src/components/SobelPlayground/sobel-core.mjs';

test('test scenes have deterministic dimensions and distinct structures', () => {
  const vertical = makeSobelTestPattern(32, 20, 'edge');
  const diagonal = makeSobelTestPattern(32, 20, 'diagonal');
  const texture = makeSobelTestPattern(32, 20, 'texture');
  assert.equal(vertical.length, 640);
  assert.notDeepEqual(vertical, diagonal);
  assert.notDeepEqual(vertical, texture);
  assert.deepEqual(vertical, makeSobelTestPattern(32, 20, 'edge'));
});

test('uniform grayscale has no Sobel gradients, even with threshold zero', () => {
  const input = new Uint8ClampedArray(6 * 5).fill(127);
  const result = sobelEdgesGrayscale(input, 6, 5, {threshold: 0});
  assert.deepEqual([...result.magnitude], new Array(30).fill(0));
  assert.deepEqual([...result.edges], new Array(30).fill(0));
  assert.equal(result.edgeCount, 0);
});

test('hard vertical step creates two bright columns at its boundary', () => {
  const input = new Uint8ClampedArray(5 * 5);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) input[y * 5 + x] = x < 2 ? 0 : 255;
  const result = sobelEdgesGrayscale(input, 5, 5, {gain: 1, threshold: 120});
  assert.deepEqual(Array.from(result.magnitude.slice(10, 15)), [0, 255, 255, 0, 0]);
  assert.deepEqual(Array.from(result.edges.slice(10, 15)), [0, 255, 255, 0, 0]);
  assert.equal(result.edgeCount, 10);
});

test('threshold only removes weaker pixels without changing magnitude', () => {
  const input = makeSobelTestPattern(44, 29, 'texture');
  const low = sobelEdgesGrayscale(input, 44, 29, {gain: 1, threshold: 30});
  const high = sobelEdgesGrayscale(input, 44, 29, {gain: 1, threshold: 220});
  assert.deepEqual(low.magnitude, high.magnitude);
  assert.ok(high.edgeCount < low.edgeCount);
  for (let i = 0; i < input.length; i++) {
    if (high.edges[i] > 0) assert.equal(low.edges[i], high.edges[i]);
  }
});

test('gain scales unsaturated gradients, leaves input unchanged, and saturates', () => {
  const input = makeSobelTestPattern(52, 33, 'texture');
  const frozenCopy = input.slice();
  const low = sobelEdgesGrayscale(input, 52, 33, {gain: 0.5, threshold: 0});
  const high = sobelEdgesGrayscale(input, 52, 33, {gain: 4, threshold: 0});
  assert.deepEqual(input, frozenCopy);
  assert.ok(high.magnitude.some((v, i) => v > low.magnitude[i]));
  assert.ok(high.magnitude.some((v) => v === 255));
  for (let i = 0; i < input.length; i++) assert.ok(high.magnitude[i] >= low.magnitude[i]);
});

test('invalid sizes, scenes, input buffers and settings fail visibly', () => {
  const input = new Uint8ClampedArray(9).fill(10);
  assert.throws(() => makeSobelTestPattern(0, 4), RangeError);
  assert.throws(() => makeSobelTestPattern(3, 3, 'missing'), RangeError);
  assert.throws(() => makeSobelTestPattern(5000, 5000), RangeError);
  assert.throws(() => sobelEdgesGrayscale(input, 2, 3), RangeError);
  assert.throws(() => sobelEdgesGrayscale(new Uint8Array(9), 3, 3), RangeError);
  assert.throws(() => sobelEdgesGrayscale(input, 3, 3, {gain: Infinity}), RangeError);
  assert.throws(() => sobelEdgesGrayscale(input, 3, 3, {threshold: -1}), RangeError);
  assert.throws(() => sobelEdgesGrayscale(input, 3, 3, {threshold: 3.5}), RangeError);
});

test('axis channels isolate a vertical versus horizontal intensity step', () => {
  const width = 7, height = 7;
  const vertical = new Uint8ClampedArray(width * height);
  const horizontal = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    vertical[y * width + x] = x < 3 ? 0 : 200;
    horizontal[y * width + x] = y < 3 ? 0 : 200;
  }
  const v = sobelEdgesGrayscale(vertical, width, height, {threshold: 50});
  const h = sobelEdgesGrayscale(horizontal, width, height, {threshold: 50});
  assert.equal(v.gradientX[3 * width + 3], 200);
  assert.equal(v.gradientY[3 * width + 3], 0);
  assert.equal(h.gradientX[3 * width + 3], 0);
  assert.equal(h.gradientY[3 * width + 3], 200);
  assert.equal(v.magnitude[3 * width + 3], 200);
  assert.equal(h.magnitude[3 * width + 3], 200);
});

test('separate axis channels are unsigned, bounded and independent of edge threshold', () => {
  const input = makeSobelTestPattern(28, 24, 'diagonal');
  const a = sobelEdgesGrayscale(input, 28, 24, {gain: 0.5, threshold: 10});
  const b = sobelEdgesGrayscale(input, 28, 24, {gain: 0.5, threshold: 220});
  assert.deepEqual(a.gradientX, b.gradientX);
  assert.deepEqual(a.gradientY, b.gradientY);
  assert.deepEqual(a.magnitude, b.magnitude);
  assert.ok(a.gradientX.some((v) => v > 0));
  assert.ok(a.gradientY.some((v) => v > 0));
  for (let i = 0; i < input.length; i++) {
    assert.ok(a.gradientX[i] >= 0 && a.gradientX[i] <= 255);
    assert.ok(a.gradientY[i] >= 0 && a.gradientY[i] <= 255);
  }
});


test('signed gradient distinguishes rising and falling edges with neutral mid-gray', () => {
  const width = 7, height = 7;
  const rising = new Uint8ClampedArray(width * height);
  const falling = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    rising[y * width + x] = x < 3 ? 0 : 200;
    falling[y * width + x] = 200 - rising[y * width + x];
  }
  const a = sobelEdgesGrayscale(rising, width, height, {threshold: 50});
  const b = sobelEdgesGrayscale(falling, width, height, {threshold: 50});
  const i = 3 * width + 3;
  assert.equal(a.signedGradientX[i], 228); // Gx = +800 -> 128 + 800/8
  assert.equal(b.signedGradientX[i], 28);  // Gx = -800 -> 128 - 800/8
  assert.equal(a.signedGradientY[i], 128);
  assert.equal(b.signedGradientY[i], 128);
  assert.equal(a.gradientX[i], b.gradientX[i]);
  assert.equal(a.magnitude[i], b.magnitude[i]);
});

test('signed displays preserve zero as 128 and are threshold independent', () => {
  const uniform = sobelEdgesGrayscale(new Uint8ClampedArray(30).fill(127), 6, 5);
  assert.ok(uniform.signedGradientX.every((v) => v === 128));
  assert.ok(uniform.signedGradientY.every((v) => v === 128));
  const pixels = makeSobelTestPattern(28, 24, 'edge');
  const low = sobelEdgesGrayscale(pixels, 28, 24, {gain: 4, threshold: 10});
  const high = sobelEdgesGrayscale(pixels, 28, 24, {gain: 4, threshold: 220});
  assert.deepEqual(low.signedGradientX, high.signedGradientX);
  assert.deepEqual(low.signedGradientY, high.signedGradientY);
  assert.ok(low.signedGradientX.some((v) => v > 128));
  assert.ok(low.signedGradientX.some((v) => v < 128));
  assert.ok(low.signedGradientX.every((v) => v >= 0 && v <= 255));
  assert.ok(low.signedGradientY.every((v) => v >= 0 && v <= 255));
});
