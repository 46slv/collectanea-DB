import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  FORMATS, PATTERNS, PREVIEW_WIDTH, PREVIEW_HEIGHT,
  makeChromaPattern, subsampleChroma,
} from './chroma-core.mjs';
import './chroma.css';

const INITIAL = Object.freeze({format: '420', pattern: 'columns', zoom: 2});
const FORMAT_LABEL = {'444': '4:4:4', '422': '4:2:2', '420': '4:2:0'};
const PATTERN_LABEL = {
  columns: '縦の1画素色線',
  rows: '横の1画素色線',
  checker: '1画素市松模様',
};

function Preview({label, bytes, zoom, name}) {
  const canvas = useRef(null);
  useEffect(() => {
    const context = canvas.current?.getContext('2d', {alpha: false});
    if (!context) return;
    const image = context.createImageData(PREVIEW_WIDTH, PREVIEW_HEIGHT);
    image.data.set(bytes);
    context.putImageData(image, 0, 0);
  }, [bytes]);
  return <figure className="vp-chroma__preview" data-vp-chroma-preview={name}>
    <figcaption><strong>{label}</strong><small>8-bit RGBA Canvas表示</small></figcaption>
    <div className="vp-chroma__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={label + '。拡大時は横へスクロールできます。'}>
      <canvas width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} ref={canvas}
        role="img" aria-label={label + 'の合成カラーパターン'}
        style={{width: (zoom * 100) + '%'}} />
    </div>
  </figure>;
}
export default function ChromaSubsamplingPlayground() {
  const id = useId();
  const [format, setFormat] = useState(INITIAL.format);
  const [pattern, setPattern] = useState(INITIAL.pattern);
  const [zoom, setZoom] = useState(INITIAL.zoom);
  const original = useMemo(
    () => makeChromaPattern(PREVIEW_WIDTH, PREVIEW_HEIGHT, pattern), [pattern]);
  const result = useMemo(
    () => subsampleChroma(original, PREVIEW_WIDTH, PREVIEW_HEIGHT, format), [original, format]);
  const ratio = 100 * result.chromaSamplesPerPlane / result.lumaSamples;
  const reset = () => {
    setFormat(INITIAL.format); setPattern(INITIAL.pattern); setZoom(INITIAL.zoom);
  };
  return <section className="vp-chroma" data-vp-chroma="ready" data-vp-chroma-format={format}
    aria-labelledby={id + '-heading'}>
    <h3 id={id + '-heading'}>色の解像度だけを減らす</h3>
    <p className="vp-chroma__lead">赤紫と青緑の細線は、計算上のY′が近い色です。4:4:4 → 4:2:2 → 4:2:0と切り替え、縦線と横線で何が消えるか比べてください。</p>
    <div className="vp-chroma__previews">
      <Preview name="before" label="01 / 変換前（4:4:4相当）" bytes={original} zoom={zoom} />
      <Preview name="after" label={'02 / ' + FORMAT_LABEL[format] + '近似'} bytes={result.rgba} zoom={zoom} />
    </div>
    <p className="vp-chroma__note">表示の格子は合成した1画素模様です。色差は各ブロックで平均し、復元時に同じ色差を共有する教育用モデルです。コーデックの実際の補間や転送特性は再現しません。</p>
    <div className="vp-chroma__stats" role="status" aria-live="polite">
      <div><small>輝度Y′ 標本</small><strong>{result.lumaSamples.toLocaleString('ja-JP')} 個</strong></div>
      <div><small>色差Cb/Cr 各標本</small><strong>{result.chromaSamplesPerPlane.toLocaleString('ja-JP')} 個</strong></div>
      <div><small>色差標本の比率（各面 / Y′）</small><strong>{ratio.toFixed(1)}%</strong></div>
      <div><small>共有する画素ブロック</small><strong>{result.stepX} × {result.stepY}</strong></div>
    </div>
    <div className="vp-chroma__controls">
      <label><span>色差サブサンプリング形式</span><select aria-label="色差形式"
        value={format} onChange={event => setFormat(event.target.value)}>
        {FORMATS.map(key => <option value={key} key={key}>{FORMAT_LABEL[key]}</option>)}
      </select></label>
      <label><span>入力パターン</span><select aria-label="入力パターン"
        value={pattern} onChange={event => setPattern(event.target.value)}>
        {PATTERNS.map(key => <option value={key} key={key}>{PATTERN_LABEL[key]}</option>)}
      </select></label>
      <label><span>表示倍率</span><select aria-label="表示倍率"
        value={zoom} onChange={event => setZoom(Number(event.target.value))}>
        <option value={1}>100%</option><option value={2}>200%</option><option value={4}>400%</option>
      </select></label>
    </div>
    <div className="vp-chroma__actions">
      <button type="button" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
