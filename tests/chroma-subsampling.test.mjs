import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FORMATS, PATTERNS, PREVIEW_WIDTH, PREVIEW_HEIGHT,
  chromaGrid, rgbToYcc, yccToRgb, makeChromaPattern, subsampleChroma,
} from '../src/components/ChromaSubsamplingPlayground/chroma-core.mjs';

test('each chroma format has the expected sample density, including odd dimensions', () => {
  assert.deepEqual(FORMATS, ['444', '422', '420']);
  assert.deepEqual(PATTERNS, ['columns', 'rows', 'checker']);
  for (const [format, samples, block] of [
    ['444', 24, [1, 1]], ['422', 12, [2, 1]], ['420', 6, [2, 2]],
  ]) {
    const grid = chromaGrid(6, 4, format);
    assert.equal(grid.lumaSamples, 24);
    assert.equal(grid.chromaSamplesPerPlane, samples);
    assert.deepEqual([grid.stepX, grid.stepY], block);
  }
  assert.equal(chromaGrid(5, 3, '420').chromaSamplesPerPlane, 6);
  assert.equal(chromaGrid(PREVIEW_WIDTH, PREVIEW_HEIGHT, '420').chromaSamplesPerPlane, 4608);
});

test('conversion round trips RGB within one display code', () => {
  for (const color of [[0, 0, 0], [255, 255, 255], [192, 56, 96], [0, 112, 108], [10, 200, 38]]) {
    const output = yccToRgb(...rgbToYcc(...color));
    color.forEach((value, i) => assert.ok(Math.abs(value - output[i]) <= 1));
  }
});

test('4:4:4 is visually lossless at 8-bit code granularity', () => {
  for (const pattern of PATTERNS) {
    const input = makeChromaPattern(8, 6, pattern);
    const {rgba} = subsampleChroma(input, 8, 6, '444');
    for (let i = 0; i < input.length; i++) assert.ok(Math.abs(rgba[i] - input[i]) <= 1);
    assert.notStrictEqual(rgba.buffer, input.buffer);
  }
});

test('horizontal chroma reduction blends alternating colored columns', () => {
  const input = makeChromaPattern(8, 6, 'columns');
  const encoded = subsampleChroma(input, 8, 6, '422').rgba;
  assert.ok(Math.abs(encoded[0] - input[0]) > 30);
  assert.ok(Math.abs(encoded[4] - input[4]) > 30);
  assert.equal(encoded[0], encoded[4]);
});

test('4:2:2 preserves row-only chroma whereas 4:2:0 blends it', () => {
  const input = makeChromaPattern(8, 6, 'rows');
  const a = subsampleChroma(input, 8, 6, '422').rgba;
  const b = subsampleChroma(input, 8, 6, '420').rgba;
  assert.ok(Math.abs(a[0] - input[0]) <= 1);
  assert.ok(Math.abs(a[8 * 4] - input[8 * 4]) <= 1);
  assert.ok(Math.abs(b[0] - input[0]) > 30);
  assert.equal(b[0], b[8 * 4]);
});

test('odd image dimensions and constant RGB give stable output', () => {
  const input = new Uint8ClampedArray(5 * 3 * 4);
  for (let i = 0; i < input.length; i += 4) input.set([30, 105, 155, 255], i);
  for (const format of FORMATS) {
    const {rgba, chromaSamplesPerPlane} = subsampleChroma(input, 5, 3, format);
    assert.equal(rgba.length, input.length);
    assert.equal(chromaSamplesPerPlane, format === '420' ? 6 : format === '422' ? 9 : 15);
    for (let i = 0; i < rgba.length; i++) assert.ok(Math.abs(rgba[i] - input[i]) <= 1);
  }
});

test('input validation rejects malformed types, dimensions and patterns', () => {
  assert.throws(() => chromaGrid(1, 4, '420'), RangeError);
  assert.throws(() => chromaGrid(99999, 99999, '420'), RangeError);
  assert.throws(() => chromaGrid(4, 4, '4444'), RangeError);
  assert.throws(() => makeChromaPattern(4, 4, 'unknown'), RangeError);
  assert.throws(() => rgbToYcc(NaN, 0, 0), RangeError);
  assert.throws(() => subsampleChroma([0, 1], 4, 4, '420'), TypeError);
  assert.throws(() => subsampleChroma(new Uint8ClampedArray(2), 4, 4, '420'), TypeError);
  const transparent = makeChromaPattern(4, 4);
  transparent[3] = 0;
  assert.throws(() => subsampleChroma(transparent, 4, 4, '420'), RangeError);
});
