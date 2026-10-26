import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  SELECTIVE_WIDTH, SELECTIVE_HEIGHT, SELECTIVE_DEFAULTS, SELECTIVE_SAMPLES,
  createSelectiveColorPattern, selectiveColorWeight, selectiveColorRgb, renderSelectiveColor,
} from './selective-color-core.mjs';
import './selective-color.css';

const PATTERNS = {
  patches: '8色のパッチ（灰色を含む）',
  spectrum: '色相帯（下ほど高彩度）',
};
function Preview({kind, title, subtitle, pixels, zoom}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d', {alpha: false});
    if (!ctx) return;
    const image = ctx.createImageData(SELECTIVE_WIDTH, SELECTIVE_HEIGHT);
    image.data.set(pixels);
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-selective__preview" data-vp-selective-preview={kind}>
    <figcaption><strong>{title}</strong><span>{subtitle}</span></figcaption>
    <div className="vp-selective__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={title + '。拡大時は横スクロールできます。'}>
      <canvas ref={canvasRef} width={SELECTIVE_WIDTH} height={SELECTIVE_HEIGHT}
        role="img" aria-label={title + '。合成された不透明8-bit RGB画像。'}
        style={{width: zoom * 100 + '%'}} />
    </div>
  </figure>;
}
export default function SelectiveColorPlayground() {
  const id = useId();
  const [center, setCenter] = useState(SELECTIVE_DEFAULTS.center);
  const [width, setWidth] = useState(SELECTIVE_DEFAULTS.width);
  const [softness, setSoftness] = useState(SELECTIVE_DEFAULTS.softness);
  const [amount, setAmount] = useState(SELECTIVE_DEFAULTS.amount);
  const [pattern, setPattern] = useState(SELECTIVE_DEFAULTS.pattern);
  const [zoom, setZoom] = useState(SELECTIVE_DEFAULTS.zoom);
  const settings = useMemo(() => ({center, width, softness, amount}),
    [center, width, softness, amount]);
  const source = useMemo(() => createSelectiveColorPattern(SELECTIVE_WIDTH, SELECTIVE_HEIGHT, pattern),
    [pattern]);
  const result = useMemo(() => renderSelectiveColor(source, SELECTIVE_WIDTH, SELECTIVE_HEIGHT, settings),
    [source, settings]);
  const samples = SELECTIVE_SAMPLES.map(({label, rgb}) =>
    ({label, source: rgb, weight: selectiveColorWeight(rgb, settings),
      output: selectiveColorRgb(rgb, settings)}));
  function reset() {
    setCenter(SELECTIVE_DEFAULTS.center); setWidth(SELECTIVE_DEFAULTS.width);
    setSoftness(SELECTIVE_DEFAULTS.softness); setAmount(SELECTIVE_DEFAULTS.amount);
    setPattern(SELECTIVE_DEFAULTS.pattern); setZoom(SELECTIVE_DEFAULTS.zoom);
  }
  return <section className="vp-selective" data-vp-selective-color="ready"
    data-vp-selective-center={center} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>色相範囲を選び、彩度だけを調整する</h3>
    <p className="vp-selective__intro">
      中央は色相から計算した選択マスクです。白ほど調整が強く、黒は対象外です。
      右の出力はマスクに応じてHSLの彩度だけを変えます。
    </p>
    <div className="vp-selective__previews">
      <Preview kind="source" title="01 / 入力" subtitle="合成テスト画像" pixels={source} zoom={zoom} />
      <Preview kind="mask" title="02 / 選択マスク" subtitle="白＝選択、灰＝境界" pixels={result.mask} zoom={zoom} />
      <Preview kind="output" title="03 / 出力" subtitle={'彩度係数 ' + amount.toFixed(2)}
        pixels={result.output} zoom={zoom} />
    </div>
    <div className="vp-selective__readout" aria-live="polite">
      <p>マスク値が0より大きい画素：<strong>{result.selectedPixels.toLocaleString('ja-JP')}</strong>
        / {(SELECTIVE_WIDTH * SELECTIVE_HEIGHT).toLocaleString('ja-JP')}。
        半透明のマスクも1画素として数えます。</p>
      <table><caption>代表色の選択率とRGB値</caption>
        <thead><tr><th scope="col">色</th><th scope="col">選択率</th>
          <th scope="col">入力RGB</th><th scope="col">出力RGB</th></tr></thead>
        <tbody>{samples.map(sample => <tr key={sample.label}>
          <th scope="row">{sample.label}</th>
          <td>{Math.round(sample.weight * 100)}%</td>
          <td>{sample.source.join(' / ')}</td><td>{sample.output.join(' / ')}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="vp-selective__controls">
      <label className="vp-selective__control"><span>入力パターン</span>
        <select aria-label="入力パターン" value={pattern} onChange={e => setPattern(e.target.value)}>
          {Object.entries(PATTERNS).map(([key, value]) =>
            <option key={key} value={key}>{value}</option>)}
        </select>
      </label>
      <label className="vp-selective__control">
        <span>選択する色相の中心 <output htmlFor={id + '-center'}>{center}°</output></span>
        <input id={id + '-center'} aria-label="色相中心" type="range"
          min="0" max="330" step="30" value={center}
          onChange={e => setCenter(Number(e.target.value))} />
      </label>
      <label className="vp-selective__control">
        <span>色相範囲の半幅 <output htmlFor={id + '-width'}>{width}°</output></span>
        <input id={id + '-width'} aria-label="色相範囲の半幅" type="range"
          min="30" max="90" step="15" value={width}
          onChange={e => setWidth(Number(e.target.value))} />
      </label>
      <label className="vp-selective__control">
        <span>境界のやわらかさ <output htmlFor={id + '-softness'}>{softness}%</output></span>
        <input id={id + '-softness'} aria-label="境界のやわらかさ" type="range"
          min="0" max="100" step="25" value={softness}
          onChange={e => setSoftness(Number(e.target.value))} />
      </label>
      <label className="vp-selective__control">
        <span>選択範囲の彩度係数 <output htmlFor={id + '-amount'}>{amount.toFixed(2)}</output></span>
        <input id={id + '-amount'} aria-label="選択範囲の彩度係数" type="range"
          min="0" max="2" step="0.25" value={amount}
          onChange={e => setAmount(Number(e.target.value))} />
      </label>
      <label className="vp-selective__control"><span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom} onChange={e => setZoom(Number(e.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-selective__actions"><button type="button" onClick={reset}>初期値に戻す</button></div>
    <p className="vp-selective__hint">
      HSLによる教育用の選択マスクです。HDR、広色域、肌色保護、動き追跡、AE・Resolveの
      QualifierやSelective Colorの内部計算と同じものではありません。
    </p>
  </section>;
}
