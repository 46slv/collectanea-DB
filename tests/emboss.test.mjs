import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeEmbossPattern, computeEmbossRelief, visualizeEmbossRelief, renderEmboss,
} from '../src/components/EmbossPlayground/emboss-core.mjs';

test('two deterministic self-generated RGB images differ', () => {
  const blocks = makeEmbossPattern(80, 40, 'blocks');
  const rings = makeEmbossPattern(80, 40, 'rings');
  assert.equal(blocks.length, 80 * 40 * 3);
  assert.deepEqual(blocks, makeEmbossPattern(80, 40, 'blocks'));
  assert.notDeepEqual(blocks, rings);
});

test('constant image produces neutral difference and emboss', () => {
  const source = new Uint8ClampedArray(7 * 5 * 3).fill(90);
  const relief = computeEmbossRelief(source, 7, 5);
  assert.ok(relief.every(value => value === 0));
  assert.deepEqual(visualizeEmbossRelief(relief), new Uint8ClampedArray(source.length).fill(128));
  assert.deepEqual(renderEmboss(source, 7, 5, relief, {strength: 2, texture: 0}),
    new Uint8ClampedArray(source.length).fill(128));
});

test('opposite directions invert sign; vertical misses a vertical border', () => {
  const source = Uint8ClampedArray.of(0, 0, 0, 255, 255, 255, 255, 255, 255);
  const east = computeEmbossRelief(source, 3, 1, {direction: 'right', radius: 1});
  const west = computeEmbossRelief(source, 3, 1, {direction: 'left', radius: 1});
  const north = computeEmbossRelief(source, 3, 1, {direction: 'up', radius: 1});
  assert.equal(east[1], 127.5);
  assert.equal(west[1], -127.5);
  assert.deepEqual(Array.from(north), [0, 0, 0]);
  assert.equal(visualizeEmbossRelief(east)[3], 255);
  assert.equal(visualizeEmbossRelief(west)[3], 1);
});

test('zero strength and zero texture yield flat mid-gray regardless of image', () => {
  const source = makeEmbossPattern(70, 30, 'rings');
  const relief = computeEmbossRelief(source, 70, 30);
  const flat = renderEmboss(source, 70, 30, relief, {strength: 0, texture: 0});
  assert.ok(flat.every(value => value === 128));
});

test('texture restores a restrained share of the original gray value', () => {
  const source = Uint8ClampedArray.of(0, 0, 0, 255, 255, 255);
  const relief = new Float32Array(2);
  const output = renderEmboss(source, 2, 1, relief, {strength: 0, texture: 0.5});
  assert.deepEqual(output, Uint8ClampedArray.of(64, 64, 64, 192, 192, 192));
});

test('settings and output operations do not mutate source or intermediate relief', () => {
  const source = makeEmbossPattern(64, 32);
  const sourceSnapshot = source.slice();
  const relief = computeEmbossRelief(source, 64, 32, {direction: 'down', radius: 3});
  const reliefSnapshot = relief.slice();
  for (const strength of [0, 1, 1.5, 3]) {
    assert.equal(renderEmboss(source, 64, 32, relief, {strength, texture: 0.2}).length, source.length);
  }
  assert.deepEqual(source, sourceSnapshot);
  assert.deepEqual(relief, reliefSnapshot);
});

test('bad dimensions, patterns, directions, radius and arrays throw', () => {
  assert.throws(() => makeEmbossPattern(0, 20), RangeError);
  assert.throws(() => makeEmbossPattern(2000, 2000), RangeError);
  assert.throws(() => makeEmbossPattern(8, 8, 'unknown'), RangeError);
  assert.throws(() => computeEmbossRelief(new Uint8ClampedArray(3), 2, 1), RangeError);
  assert.throws(() => computeEmbossRelief(new Uint8ClampedArray(6), 2, 1, {direction: 'diagonal'}), RangeError);
  assert.throws(() => computeEmbossRelief(new Uint8ClampedArray(6), 2, 1, {radius: 0}), RangeError);
  assert.throws(() => renderEmboss(new Uint8ClampedArray(6), 2, 1, new Float32Array(3)), RangeError);
  assert.throws(() => renderEmboss(new Uint8ClampedArray(6), 2, 1, new Float32Array(2), {strength: NaN}), RangeError);
  assert.throws(() => renderEmboss(new Uint8ClampedArray(6), 2, 1, new Float32Array(2), {texture: 1}), RangeError);
  assert.throws(() => visualizeEmbossRelief(Float32Array.of(NaN)), RangeError);
});
