import test from 'node:test';
import assert from 'node:assert/strict';
import {thresholdGrayscale} from '../src/components/ThresholdPlayground/threshold-core.mjs';

test('fixed binary threshold includes equality in the black class', () => {
  const source = Uint8ClampedArray.from([0, 64, 127, 128, 129, 220, 255]);
  const output = thresholdGrayscale(source, 7, 1, 128);
  assert.deepEqual([...output], [0, 0, 0, 0, 255, 255, 255]);
  assert.deepEqual([...source], [0, 64, 127, 128, 129, 220, 255]);
});

test('threshold endpoints have precise behavior', () => {
  const source = Uint8ClampedArray.from([0, 1, 254, 255]);
  assert.deepEqual([...thresholdGrayscale(source, 2, 2, 0)], [0, 255, 255, 255]);
  assert.deepEqual([...thresholdGrayscale(source, 2, 2, 255)], [0, 0, 0, 0]);
});

test('moving the threshold changes the white area but not the source', () => {
  const source = Uint8ClampedArray.from([32, 96, 160, 224]);
  const low = thresholdGrayscale(source, 4, 1, 64);
  const high = thresholdGrayscale(source, 4, 1, 192);
  assert.deepEqual([...low], [0, 255, 255, 255]);
  assert.deepEqual([...high], [0, 0, 0, 255]);
  assert.deepEqual([...source], [32, 96, 160, 224]);
  assert.deepEqual([...new Set(low)], [0, 255]);
});

test('invalid dimensions, formats and threshold values fail explicitly', () => {
  const source = Uint8ClampedArray.from([0, 255]);
  assert.throws(() => thresholdGrayscale(source, 3, 1), RangeError);
  assert.throws(() => thresholdGrayscale(source, 0, 2), RangeError);
  assert.throws(() => thresholdGrayscale(source, 2.5, 1), RangeError);
  assert.throws(() => thresholdGrayscale([0, 255], 2, 1), RangeError);
  assert.throws(() => thresholdGrayscale(source, 2, 1, -1), RangeError);
  assert.throws(() => thresholdGrayscale(source, 2, 1, 256), RangeError);
  assert.throws(() => thresholdGrayscale(source, 2, 1, 127.5), RangeError);
});
