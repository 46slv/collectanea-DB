import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  HUE_SHIFT_WIDTH, HUE_SHIFT_HEIGHT, HUE_SHIFT_DEFAULT, HUE_SHIFT_SWATCHES,
  createHueShiftPattern, shiftHueRgb, renderHueShift,
} from './hue-shift-core.mjs';
import './hue-shift.css';

const DEFAULTS = Object.freeze({degrees: HUE_SHIFT_DEFAULT, pattern: 'hues', zoom: 1});
const PATTERNS = {
  hues: '色相帯（上下で明るさが変化）',
  patches: '8色のテストパッチ（灰色を含む）',
};
function Preview({kind, title, subtitle, pixels, zoom}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d', {alpha: false});
    if (!ctx) return;
    const image = ctx.createImageData(HUE_SHIFT_WIDTH, HUE_SHIFT_HEIGHT);
    image.data.set(pixels);
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-hue__preview" data-vp-hue-preview={kind}>
    <figcaption><strong>{title}</strong><span>{subtitle}</span></figcaption>
    <div className="vp-hue__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={title + '。拡大時は横スクロールできます。'}>
      <canvas ref={canvasRef} width={HUE_SHIFT_WIDTH} height={HUE_SHIFT_HEIGHT}
        role="img" aria-label={title + '。合成8-bit RGBパターン。'}
        style={{width: zoom * 100 + '%'}} />
    </div>
  </figure>;
}
function Chip({rgb}) {
  return <span className="vp-hue__chip" style={{backgroundColor: `rgb(${rgb.join(',')})`}}
    role="img" aria-label={'RGB ' + rgb.join('、')} />;
}
export default function HueShiftPlayground() {
  const id = useId();
  const [degrees, setDegrees] = useState(DEFAULTS.degrees);
  const [pattern, setPattern] = useState(DEFAULTS.pattern);
  const [zoom, setZoom] = useState(DEFAULTS.zoom);
  const source = useMemo(() => createHueShiftPattern(HUE_SHIFT_WIDTH, HUE_SHIFT_HEIGHT, pattern),
    [pattern]);
  const processed = useMemo(() => renderHueShift(source, HUE_SHIFT_WIDTH, HUE_SHIFT_HEIGHT, degrees),
    [source, degrees]);
  const samples = HUE_SHIFT_SWATCHES.map(({label, rgb}) =>
    ({label, before: rgb, after: shiftHueRgb(rgb, degrees)}));
  const reset = () => {
    setDegrees(DEFAULTS.degrees); setPattern(DEFAULTS.pattern); setZoom(DEFAULTS.zoom);
  };
  return <section className="vp-hue" data-vp-hue-shift="ready"
    data-vp-hue-shift-angle={degrees} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>HSLの色相角度だけを回す</h3>
    <p className="vp-hue__intro">
      同じ不透明8-bit sRGB画像から、右だけHSLへ変換して色相角度を加え、RGBへ戻します。
      彩度やHSLの明るさの数値を固定しても、知覚上の明るさは一定とは限りません。
    </p>
    <div className="vp-hue__previews">
      <Preview kind="source" title="01 / 元画像" subtitle="色相回転なし" pixels={source} zoom={zoom} />
      <Preview kind="processed" title="02 / HSL色相回転" subtitle={degrees + '° 回転'}
        pixels={processed} zoom={zoom} />
    </div>
    <div className="vp-hue__readout" aria-live="polite">
      <p>色相回転：<strong>{degrees > 0 ? '+' : ''}{degrees}°</strong>。
        色相のない灰色は変更されません。</p>
      <table><caption>代表色のRGB値（0–255）</caption>
        <thead><tr><th scope="col">色</th><th scope="col">入力</th><th scope="col">出力</th></tr></thead>
        <tbody>{samples.map(({label, before, after}) => <tr key={label}>
          <th scope="row">{label}</th>
          <td><Chip rgb={before} />{before.join(' / ')}</td>
          <td><Chip rgb={after} />{after.join(' / ')}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="vp-hue__controls">
      <label className="vp-hue__control"><span>入力パターン</span>
        <select value={pattern} aria-label="入力パターン"
          onChange={e => setPattern(e.target.value)}>
          {Object.entries(PATTERNS).map(([key, value]) =>
            <option key={key} value={key}>{value}</option>)}
        </select>
      </label>
      <label className="vp-hue__control">
        <span>色相の回転量 <output htmlFor={id + '-degrees'}>{degrees}°</output></span>
        <input id={id + '-degrees'} type="range" min="-180" max="180" step="30" value={degrees}
          aria-label="色相回転（マイナス180度からプラス180度）"
          onChange={e => setDegrees(Number(e.target.value))} />
      </label>
      <label className="vp-hue__control"><span>表示倍率</span>
        <select value={zoom} aria-label="表示倍率" onChange={e => setZoom(Number(e.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-hue__actions"><button type="button" onClick={reset}>初期値に戻す</button></div>
    <p className="vp-hue__hint">
      表示用RGBコード値のHSL計算です。色管理・HDR・LChの知覚的一様なHue操作や、
      After Effects / DaVinci Resolveの色相ツールと同じ結果を保証しません。
    </p>
  </section>;
}
