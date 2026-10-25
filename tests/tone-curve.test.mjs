import test from 'node:test';
import assert from 'node:assert/strict';
import {buildToneCurveLut, toneCurveGrayscale} from '../src/components/ToneCurvePlayground/tone-curve-core.mjs';

test('middle=128 gives an identity LUT and distinct output pixels', () => {
  const source = Uint8ClampedArray.from([0, 32, 64, 127, 128, 129, 192, 255]);
  const {pixels, lut} = toneCurveGrayscale(source, 8, 1);
  assert.deepEqual([...pixels], [...source]);
  assert.notStrictEqual(pixels, source);
  assert.deepEqual([...lut], Array.from({length: 256}, (_, i) => i));
});

test('three anchors remain exact at every supported midpoint', () => {
  for (const middle of [32, 48, 64, 128, 192, 224]) {
    const lut = buildToneCurveLut(middle);
    assert.equal(lut[0], 0);
    assert.equal(lut[128], middle);
    assert.equal(lut[255], 255);
  }
});

test('piecewise interpolation is numerically correct on either side', () => {
  const source = Uint8ClampedArray.from([0, 64, 128, 192, 255]);
  assert.deepEqual([...toneCurveGrayscale(source, 5, 1, 64).pixels], [0, 32, 64, 160, 255]);
  assert.deepEqual([...toneCurveGrayscale(source, 5, 1, 192).pixels], [0, 96, 192, 224, 255]);
});

test('all LUTs are non-decreasing and stay in the 8-bit domain', () => {
  for (const middle of [32, 64, 80, 128, 160, 192, 224]) {
    const lut = buildToneCurveLut(middle);
    assert.equal(lut.length, 256);
    for (let i = 1; i < lut.length; i += 1) {
      assert.ok(lut[i] >= lut[i - 1], 'decreased at ' + i);
      assert.ok(lut[i] >= 0 && lut[i] <= 255);
    }
  }
});

test('constant image remains constant with new output allocation', () => {
  const source = Uint8ClampedArray.from([64, 64, 64, 64]);
  const out = toneCurveGrayscale(source, 2, 2, 192).pixels;
  assert.deepEqual([...out], [96, 96, 96, 96]);
  assert.deepEqual([...source], [64, 64, 64, 64]);
  assert.notStrictEqual(out, source);
});

test('lookup is independent from image dimensions and matches a direct oracle', () => {
  const ramp = Uint8ClampedArray.from(Array.from({length: 256}, (_, i) => i));
  for (const middle of [48, 112, 208]) {
    const {pixels} = toneCurveGrayscale(ramp, 16, 16, middle);
    for (let i = 0; i < 256; i += 1) {
      const expected = i <= 128
        ? Math.round(i * middle / 128)
        : Math.round(middle + (i - 128) * (255 - middle) / 127);
      assert.equal(pixels[i], expected);
    }
  }
});

test('rejects invalid geometry, sample type, and midpoint parameters', () => {
  const sample = Uint8ClampedArray.from([0, 255]);
  assert.throws(() => toneCurveGrayscale(sample, 3, 1), RangeError);
  assert.throws(() => toneCurveGrayscale(sample, 0, 2), RangeError);
  assert.throws(() => toneCurveGrayscale([0, 255], 2, 1), RangeError);
  assert.throws(() => toneCurveGrayscale(sample, 2.5, 1), RangeError);
  for (const mid of [0, 31, 225, 256, 64.5, NaN, Infinity]) {
    assert.throws(() => buildToneCurveLut(mid), RangeError);
    assert.throws(() => toneCurveGrayscale(sample, 2, 1, mid), RangeError);
  }
});
