import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GRAIN_WIDTH, GRAIN_HEIGHT, GRAIN_INITIAL, makeGrainScene, renderFilmGrain,
} from '../src/components/FilmGrainPlayground/grain-core.mjs';

test('synthetic scenes are independent RGB images with dark and light samples', () => {
  const a = makeGrainScene(GRAIN_WIDTH, GRAIN_HEIGHT, 'gradient');
  const b = makeGrainScene(GRAIN_WIDTH, GRAIN_HEIGHT, 'night');
  assert.equal(a.length, GRAIN_WIDTH * GRAIN_HEIGHT * 3);
  assert.equal(b.length, a.length);
  assert.notDeepEqual(a, b);
  assert.ok(Math.min(...a.slice(0, 320)) < Math.max(...a.slice(0, 320)));
});

test('zero strength preserves the source and makes a neutral difference panel', () => {
  const source = makeGrainScene(21, 11);
  const out = renderFilmGrain(source, 21, 11, {amount: 0});
  assert.deepEqual(out.result, source);
  assert.ok(out.layer.every(value => value === 128));
  assert.equal(out.meanAbsDelta, 0);
  assert.equal(out.clippedSamples, 0);
});

test('same source, options and frame give identical output', () => {
  const source = makeGrainScene(41, 23);
  const a = renderFilmGrain(source, 41, 23, GRAIN_INITIAL);
  const b = renderFilmGrain(source, 41, 23, GRAIN_INITIAL);
  assert.deepEqual(a, b);
});

test('changing the frame changes the grain but not the scene', () => {
  const source = makeGrainScene(49, 29);
  const a = renderFilmGrain(source, 49, 29, {frame: 0});
  const b = renderFilmGrain(source, 49, 29, {frame: 1});
  assert.notDeepEqual(a.layer, b.layer);
  assert.notDeepEqual(a.result, b.result);
  assert.deepEqual(source, makeGrainScene(49, 29));
});

test('monochrome setting produces identical RGB offsets', () => {
  const source = makeGrainScene(31, 17);
  const {layer} = renderFilmGrain(source, 31, 17, {chroma: 0, shadow: 0});
  for (let i = 0; i < layer.length; i += 3) {
    assert.equal(layer[i], layer[i + 1]);
    assert.equal(layer[i], layer[i + 2]);
  }
});

test('full chromatic noise and coarse scale alter the difference image', () => {
  const source = makeGrainScene(43, 27);
  const mono = renderFilmGrain(source, 43, 27, {chroma: 0, size: 1});
  const color = renderFilmGrain(source, 43, 27, {chroma: 1, size: 1});
  const coarse = renderFilmGrain(source, 43, 27, {chroma: 1, size: 6});
  assert.notDeepEqual(mono.layer, color.layer);
  assert.notDeepEqual(color.layer, coarse.layer);
});

test('shadow emphasis reduces applied change on a brighter equal-sized flat patch', () => {
  const dark = new Uint8ClampedArray(32 * 18 * 3).fill(20);
  const light = new Uint8ClampedArray(32 * 18 * 3).fill(230);
  const a = renderFilmGrain(dark, 32, 18, {amount: 40, shadow: 1});
  const b = renderFilmGrain(light, 32, 18, {amount: 40, shadow: 1});
  assert.ok(a.meanAbsDelta > b.meanAbsDelta);
});

test('invalid input is rejected and valid output remains in byte range', () => {
  assert.throws(() => makeGrainScene(0, 3), RangeError);
  assert.throws(() => makeGrainScene(2, 3, 'unknown'), RangeError);
  assert.throws(() => renderFilmGrain(new Uint8Array(4), 2, 3), RangeError);
  const source = makeGrainScene(22, 14, 'night');
  assert.throws(() => renderFilmGrain(source, 22, 14, {size: 0}), RangeError);
  assert.throws(() => renderFilmGrain(source, 22, 14, {amount: NaN}), RangeError);
  const out = renderFilmGrain(source, 22, 14, {amount: 60, shadow: 0, chroma: 1});
  assert.equal(out.result.length, source.length);
  assert.ok(out.result.every(value => value >= 0 && value <= 255));
  assert.ok(out.layer.every(value => value >= 0 && value <= 255));
});
