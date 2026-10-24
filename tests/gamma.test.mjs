import test from 'node:test';
import assert from 'node:assert/strict';
import {gammaGrayscale} from '../src/components/GammaPlayground/gamma-core.mjs';

test('gamma exponent 1 is identity and does not mutate its input', () => {
  const source = Uint8ClampedArray.from([0, 64, 128, 192, 255]);
  const result = gammaGrayscale(source, 5, 1, 1);
  assert.deepEqual([...result], [...source]);
  assert.notStrictEqual(result, source);
});

test('gamma 0.5 brightens intermediate codes, gamma 2 darkens them', () => {
  const source = Uint8ClampedArray.from([0, 64, 128, 192, 255]);
  assert.deepEqual([...gammaGrayscale(source, 5, 1, 0.5)], [0, 128, 181, 221, 255]);
  assert.deepEqual([...gammaGrayscale(source, 5, 1, 2)], [0, 16, 64, 145, 255]);
  assert.deepEqual([...source], [0, 64, 128, 192, 255]);
});

test('black/white endpoints are held and code order is monotonic', () => {
  const source = Uint8ClampedArray.from(Array.from({length: 256}, (_, i) => i));
  for (const exponent of [0.25, 1, 3]) {
    const output = gammaGrayscale(source, 256, 1, exponent);
    assert.equal(output[0], 0);
    assert.equal(output[255], 255);
    for (let i = 1; i < output.length; i += 1) {
      assert.ok(output[i] >= output[i - 1]);
    }
  }
});

test('invalid geometry, format and exponent are rejected', () => {
  const source = Uint8ClampedArray.from([0, 255]);
  assert.throws(() => gammaGrayscale(source, 3, 1, 1), RangeError);
  assert.throws(() => gammaGrayscale(source, 0, 2, 1), RangeError);
  assert.throws(() => gammaGrayscale(source, 1.5, 1, 1), RangeError);
  assert.throws(() => gammaGrayscale([0, 255], 2, 1, 1), RangeError);
  for (const exponent of [0, 0.1, 3.01, NaN, Infinity]) {
    assert.throws(() => gammaGrayscale(source, 2, 1, exponent), RangeError);
  }
});
