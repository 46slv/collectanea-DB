import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  SELECTIVE_WIDTH, SELECTIVE_HEIGHT, SELECTIVE_DEFAULTS, SELECTIVE_SAMPLES,
  selectiveColorWeight, selectiveColorRgb, createSelectiveColorPattern, renderSelectiveColor,
} from '../src/components/SelectiveColorPlayground/selective-color-core.mjs';

test('hue selection distinguishes red, blue and undefined gray hue', () => {
  assert.equal(selectiveColorWeight([255, 0, 0]), 1);
  assert.equal(selectiveColorWeight([0, 0, 255]), 0);
  assert.equal(selectiveColorWeight([128, 128, 128]), 0);
  assert.equal(SELECTIVE_SAMPLES.length, 3);
});
test('hue distance wraps around 0/360 degrees', () => {
  const settings = {...SELECTIVE_DEFAULTS, width: 45, softness: 0};
  assert.equal(selectiveColorWeight([255, 0, 32], settings), 1);
  assert.equal(selectiveColorWeight([255, 32, 0], settings), 1);
  assert.equal(selectiveColorWeight([0, 255, 0], settings), 0);
});
test('softness creates fractional values only in the feather region', () => {
  const settings = {...SELECTIVE_DEFAULTS, width: 60, softness: 50};
  const near = selectiveColorWeight([255, 128, 0], settings);
  const edge = selectiveColorWeight([255, 191, 0], settings);
  assert.ok(near > 0.99 && near <= 1);
  assert.ok(edge > 0 && edge < 1);
  assert.equal(selectiveColorWeight([255, 255, 0], settings), 0);
  const hard = {...settings, softness: 0};
  assert.equal(selectiveColorWeight([255, 191, 0], hard), 1);
});
test('saturation factor obeys identity, zero and out-of-selection invariants', () => {
  const zero = {...SELECTIVE_DEFAULTS, amount: 0};
  assert.deepEqual(selectiveColorRgb([255, 0, 0], zero), [128, 128, 128]);
  assert.deepEqual(selectiveColorRgb([0, 0, 255], zero), [0, 0, 255]);
  assert.deepEqual(selectiveColorRgb([128, 128, 128], zero), [128, 128, 128]);
  assert.deepEqual(selectiveColorRgb([230, 61, 57], {...zero, amount: 1}), [230, 61, 57]);
  const boosted = selectiveColorRgb([220, 100, 90], {...zero, amount: 2});
  assert.ok(boosted.every(value => Number.isInteger(value) && value >= 0 && value <= 255));
});
test('two generated synthetic images are deterministic opaque RGBA', () => {
  for (const pattern of ['patches', 'spectrum']) {
    const pixels = createSelectiveColorPattern(32, 16, pattern);
    assert.equal(pixels.length, 32 * 16 * 4);
    assert.deepEqual(pixels, createSelectiveColorPattern(32, 16, pattern));
    for (let i = 3; i < pixels.length; i += 4) assert.equal(pixels[i], 255);
  }
  assert.equal(createSelectiveColorPattern(SELECTIVE_WIDTH, SELECTIVE_HEIGHT).length,
    SELECTIVE_WIDTH * SELECTIVE_HEIGHT * 4);
});
test('render returns opaque source-independent output and grayscale selection mask', () => {
  const input = createSelectiveColorPattern(32, 12);
  const snapshot = Uint8ClampedArray.from(input);
  const result = renderSelectiveColor(input, 32, 12);
  assert.equal(result.output.length, input.length);
  assert.equal(result.mask.length, input.length);
  assert.ok(result.selectedPixels > 0 && result.selectedPixels < 32 * 12);
  assert.notDeepEqual(result.output, input);
  assert.deepEqual(input, snapshot);
  for (let i = 0; i < result.mask.length; i += 4) {
    assert.equal(result.mask[i], result.mask[i + 1]);
    assert.equal(result.mask[i + 1], result.mask[i + 2]);
    assert.equal(result.mask[i + 3], 255);
    assert.equal(result.output[i + 3], 255);
  }
  assert.deepEqual(renderSelectiveColor(input, 32, 12,
    {...SELECTIVE_DEFAULTS, amount: 1}).output, input);
});
test('rejects invalid options, source dimensions, array types and alpha', () => {
  for (const settings of [
    {...SELECTIVE_DEFAULTS, center: 360}, {...SELECTIVE_DEFAULTS, center: 15},
    {...SELECTIVE_DEFAULTS, width: 10}, {...SELECTIVE_DEFAULTS, softness: 101},
    {...SELECTIVE_DEFAULTS, amount: 2.1}, {...SELECTIVE_DEFAULTS, amount: NaN},
  ]) assert.throws(() => selectiveColorRgb([255, 0, 0], settings), RangeError);
  for (const rgb of [[1], [0, 0, 256], [-1, 0, 0], [0.5, 1, 2], null]) {
    assert.throws(() => selectiveColorWeight(rgb), RangeError);
  }
  assert.throws(() => createSelectiveColorPattern(1, 8), RangeError);
  assert.throws(() => createSelectiveColorPattern(16, 8, 'other'), RangeError);
  assert.throws(() => renderSelectiveColor([255, 0, 0, 255], 1, 1), RangeError);
  assert.throws(() => renderSelectiveColor(Uint8ClampedArray.of(255, 0, 0, 255), 2, 1), RangeError);
  assert.throws(() => renderSelectiveColor(Uint8ClampedArray.of(255, 0, 0, 0), 1, 1), RangeError);
});
test('lesson and UI retain before/mask/after, controls and source qualifications', () => {
  const article = readFileSync(new URL('../reference/visual-processing/selective-color.mdx', import.meta.url), 'utf8');
  const ui = readFileSync(new URL('../src/components/SelectiveColorPlayground/index.jsx', import.meta.url), 'utf8');
  for (const marker of ['SelectiveColorPlayground', '## 入力・操作・出力',
    '## 参考資料', 'After Effects', 'DaVinci Resolve']) assert.ok(article.includes(marker));
  for (const marker of ['kind="source"', 'kind="mask"', 'kind="output"',
    'aria-label="色相中心"', 'aria-label="選択範囲の彩度係数"', '初期値に戻す']) {
    assert.ok(ui.includes(marker));
  }
});
