import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHdrPattern, encodeSrgb8, mapToneValue, renderToneMapping,
} from '../src/components/ToneMappingPlayground/tone-mapping-core.mjs';

test('linear 0, 0.5, 1, 2, 4, 8 map to known display code values', () => {
  const input = Float32Array.from([0, 0.5, 1, 2, 4, 8]);
  const {clipped, compressed, overDisplay} = renderToneMapping(input, 6, 1, 0);
  assert.deepEqual([...clipped], [0, 188, 255, 255, 255, 255]);
  assert.deepEqual([...compressed], [0, 156, 188, 213, 231, 242]);
  assert.equal(overDisplay, 3);
});

test('0 remains black; Reinhard never clips finite positive highlights', () => {
  assert.equal(mapToneValue(0), 0);
  assert.equal(encodeSrgb8(mapToneValue(8)), 242);
  assert.ok(mapToneValue(8) < 1);
  assert.equal(mapToneValue(8, 0, 'clip'), 1);
});

test('EV is applied to scene-linear values before either operator', () => {
  assert.equal(mapToneValue(1, -1, 'reinhard'), 1 / 3);
  assert.equal(mapToneValue(1, 1, 'reinhard'), 2 / 3);
  assert.equal(mapToneValue(1, -1, 'clip'), 0.5);
  assert.equal(mapToneValue(1, 1, 'clip'), 1);
});

test('global compression is monotonic, nonnegative and below unity', () => {
  for (let ev = -2; ev <= 2; ev += 0.5) {
    let previous = -1;
    for (let input = 0; input <= 8; input += 0.125) {
      const output = mapToneValue(input, ev);
      assert.ok(output >= previous && output >= 0 && output < 1);
      previous = output;
    }
  }
});

test('synthetic source peaks and shapes are deterministic and finite', () => {
  for (const source of ['ramp', 'radial']) {
    const a = createHdrPattern(20, 10, 8, source);
    const b = createHdrPattern(20, 10, 8, source);
    assert.deepEqual(a, b);
    assert.ok(a.every((x) => x >= 0 && x <= 8));
    assert.ok(a.some((x) => x > 1));
  }
  const ramp = createHdrPattern(20, 10, 4, 'ramp');
  assert.equal(ramp[0], 0);
  assert.equal(ramp[19], 4);
});

test('render keeps float input unchanged and dimensions independent', () => {
  const source = Float32Array.from([0, 0.5, 1, 2]);
  const a = renderToneMapping(source, 2, 2);
  const b = renderToneMapping(source, 4, 1);
  assert.deepEqual([...a.clipped], [...b.clipped]);
  assert.deepEqual([...a.compressed], [...b.compressed]);
  assert.deepEqual([...source], [0, 0.5, 1, 2]);
});

test('rejects invalid types, lengths, scene values, exposure and operators', () => {
  const source = Float32Array.from([0, 1]);
  assert.throws(() => renderToneMapping([0, 1], 2, 1), RangeError);
  assert.throws(() => renderToneMapping(source, 1, 1), RangeError);
  assert.throws(() => renderToneMapping(source, 0, 2), RangeError);
  assert.throws(() => renderToneMapping(Float32Array.from([0, NaN]), 2, 1), RangeError);
  assert.throws(() => renderToneMapping(Float32Array.from([0, -1]), 2, 1), RangeError);
  assert.throws(() => createHdrPattern(1, 4), RangeError);
  assert.throws(() => createHdrPattern(4, 4, 3), RangeError);
  assert.throws(() => createHdrPattern(4, 4, 4, 'other'), RangeError);
  for (const ev of [-3, 3, 0.25, Infinity, NaN]) {
    assert.throws(() => mapToneValue(1, ev), RangeError);
    assert.throws(() => renderToneMapping(source, 2, 1, ev), RangeError);
  }
  assert.throws(() => mapToneValue(-1), RangeError);
  assert.throws(() => mapToneValue(1, 0, 'unknown'), RangeError);
  assert.throws(() => encodeSrgb8(2), RangeError);
});
