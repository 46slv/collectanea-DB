import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {ST_WIDTH, ST_HEIGHT, ST_DEFAULTS, makeSplitPattern, renderSplitTone} from './split-toning-core.mjs';
import './split-toning.css';

function Preview({kind, title, note, pixels, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const context = ref.current?.getContext('2d', {alpha: false});
    if (!context) return;
    const image = context.createImageData(ST_WIDTH, ST_HEIGHT);
    image.data.set(pixels);
    context.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-split__preview" data-vp-split-preview={kind}>
    <figcaption><strong>{title}</strong><span>{note}</span></figcaption>
    <div className="vp-split__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={title + '。拡大時は横スクロールできます。'}>
      <canvas ref={ref} width={ST_WIDTH} height={ST_HEIGHT}
        role="img" aria-label={title + '：合成画像のスプリットトーニング比較'}
        style={{width: (zoom * 100) + '%'}} />
    </div>
  </figure>;
}

export default function SplitToningPlayground() {
  const id = useId();
  const [options, setOptions] = useState({...ST_DEFAULTS});
  const set = change => setOptions(current => ({...current, ...change}));
  const source = useMemo(
    () => makeSplitPattern(ST_WIDTH, ST_HEIGHT, options.pattern), [options.pattern]);
  const result = useMemo(
    () => renderSplitTone(source, ST_WIDTH, ST_HEIGHT, options), [source, options]);
  const control = (label, key, min, max, step, suffix = '') =>
    <label className="vp-split__control" key={key}>
      <span>{label}<output htmlFor={id + key}>
        {Number(options[key]).toFixed(step < 1 ? 2 : 0)}{suffix}
      </output></span>
      <input id={id + key} type="range" aria-label={label} min={min} max={max} step={step}
        value={options[key]} onChange={event => set({[key]: Number(event.target.value)})} />
    </label>;
  return <section className="vp-split" data-vp-split="ready" data-vp-split-pattern={options.pattern}
    aria-labelledby={id + 'title'}>
    <h3 id={id + 'title'}>暗部は寒色、明部は暖色にするとどう変わる？</h3>
    <p className="vp-split__intro">左が合成入力、中央が階調別の色付け、右が暗部・明部の割当です。
      右は青が暗部、赤が明部、紫が両方の混合範囲を示します。</p>
    <div className="vp-split__previews">
      <Preview kind="original" title="01 / 入力" note="生成した8-bit sRGBコード値"
        pixels={result.original} zoom={options.zoom} />
      <Preview kind="graded" title="02 / 色付け結果" note="入力ルマに応じて2つの色を加える"
        pixels={result.graded} zoom={options.zoom} />
      <Preview kind="weights" title="03 / 階調範囲" note="青＝暗部の重み、赤＝明部の重み"
        pixels={result.weights} zoom={options.zoom} />
    </div>
    <div className="vp-split__readout" role="status" aria-live="polite">
      <p>RGB成分のクリップ発生：<strong data-vp-split-clipped>{result.clippedPixels}</strong>
        ／{result.total}画素。中心画素のRGB（8-bit）：入力
        {result.sampleOriginal.join(' / ')} → 出力 {result.sampleGraded.join(' / ')}</p>
    </div>
    <div className="vp-split__controls">
      <label className="vp-split__control"><span>入力パターン</span>
        <select aria-label="入力パターン" value={options.pattern}
          onChange={event => set({pattern: event.target.value})}>
          <option value="gradient">白黒グラデーション</option>
          <option value="patches">灰色・暖色・寒色のパッチ</option>
        </select>
      </label>
      {control('暗部の色相', 'shadowHue', 0, 360, 5, '°')}
      {control('暗部の色付け強度', 'shadowStrength', 0, 1, 0.05, '倍')}
      {control('明部の色相', 'highlightHue', 0, 360, 5, '°')}
      {control('明部の色付け強度', 'highlightStrength', 0, 1, 0.05, '倍')}
      {control('暗部／明部の境界位置', 'balance', -0.35, 0.35, 0.05)}
      {control('重なりの幅', 'transition', 0.1, 0.9, 0.05)}
      <label className="vp-split__control"><span>表示倍率</span>
        <select aria-label="表示倍率" value={options.zoom}
          onChange={event => set({zoom: Number(event.target.value)})}>
          <option value={1}>100%</option><option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>
    <button type="button" className="vp-split__reset"
      onClick={() => setOptions({...ST_DEFAULTS})}>初期値に戻す</button>
    <p className="vp-split__hint">この境界・混合は教材独自の数式です。
      AdobeのBalance/BlendingやAE・Resolveのホイール処理と同一ではありません。
      入力は合成画像のみ、出力は表示向け8-bit Canvasです。</p>
  </section>;
}
