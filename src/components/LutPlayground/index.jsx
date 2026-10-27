import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  LUT_WIDTH, LUT_HEIGHT, LUT_ENTRIES, LUT_DEFAULTS, LUT_SAMPLE_CODES,
  createLutPattern, renderLut, curveAt, makeLut, lookupAt,
} from './lut-core.mjs';
import './lut.css';

const CURVE_OPTIONS = {
  identity: '恒等（入力を維持）',
  power: 'べき乗カーブ',
  smoothstep: 'S字カーブ（smoothstep）',
};
function Preview({kind, title, note, pixels, zoom}) {
  const element = useRef(null);
  useEffect(() => {
    const ctx = element.current?.getContext('2d', {alpha: false});
    if (!ctx) return;
    const image = ctx.createImageData(LUT_WIDTH, LUT_HEIGHT);
    image.data.set(pixels);
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-lut__preview" data-vp-lut-preview={kind}>
    <figcaption><strong>{title}</strong><span>{note}</span></figcaption>
    <div className="vp-lut__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={title + '。拡大表示時は横にスクロールできます。'}>
      <canvas ref={element} width={LUT_WIDTH} height={LUT_HEIGHT}
        role="img" aria-label={title + '、合成8-bit RGBテスト画像'}
        style={{width: (zoom * 100) + '%'}} />
    </div>
  </figure>;
}
export default function LutPlayground() {
  const id = useId();
  const [curve, setCurve] = useState(LUT_DEFAULTS.curve);
  const [exponent, setExponent] = useState(LUT_DEFAULTS.exponent);
  const [entries, setEntries] = useState(LUT_DEFAULTS.entries);
  const [interpolation, setInterpolation] = useState(LUT_DEFAULTS.interpolation);
  const [pattern, setPattern] = useState(LUT_DEFAULTS.pattern);
  const [zoom, setZoom] = useState(LUT_DEFAULTS.zoom);
  const source = useMemo(() => createLutPattern(LUT_WIDTH, LUT_HEIGHT, pattern), [pattern]);
  const result = useMemo(() => renderLut(source, LUT_WIDTH, LUT_HEIGHT,
    entries, curve, exponent, interpolation), [source, entries, curve, exponent, interpolation]);
  const values = useMemo(() => makeLut(entries, curve, exponent), [entries, curve, exponent]);
  const samples = LUT_SAMPLE_CODES.map(code => ({
    input: code,
    ideal: Math.round(255 * curveAt(code / 255, curve, exponent)),
    approximate: Math.round(255 * lookupAt(code / 255, values, interpolation)),
  }));
  function reset() {
    setCurve(LUT_DEFAULTS.curve);
    setExponent(LUT_DEFAULTS.exponent);
    setEntries(LUT_DEFAULTS.entries);
    setInterpolation(LUT_DEFAULTS.interpolation);
    setPattern(LUT_DEFAULTS.pattern);
    setZoom(LUT_DEFAULTS.zoom);
  }
  return <section className="vp-lut" data-vp-lut="ready"
    data-vp-lut-entries={entries} data-vp-lut-interpolation={interpolation}
    aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>少数の記録点からカーブを復元する</h3>
    <p className="vp-lut__intro">中央は計算式を直接評価した参照結果、右は同じカーブを
      {entries}個の記録点だけで近似した結果です。補間を変えると、記録点の間が
      段差になるか滑らかにつながるかを観察できます。</p>
    <div className="vp-lut__previews">
      <Preview kind="input" title="01 / 入力" note="8-bit表示コード" pixels={source} zoom={zoom} />
      <Preview kind="ideal" title="02 / 数式から計算" note="参照カーブ" pixels={result.ideal} zoom={zoom} />
      <Preview kind="lookup" title="03 / 1D LUTで近似"
        note={entries + '点、' + (interpolation === 'nearest' ? '最近傍' : '線形補間')}
        pixels={result.approximation} zoom={zoom} />
    </div>
    <div className="vp-lut__readout" aria-live="polite">
      <p>記録点：<strong>{entries}点／RGB各成分</strong>。
        0〜255の全入力コードに対する最大差（参照式 vs LUT）：
        <strong data-vp-lut-error>{result.maxErrorCode}コード値</strong>。</p>
      <table><caption>代表的な入力コード（各チャンネルに同じ表を適用）</caption>
        <thead><tr><th scope="col">入力</th><th scope="col">数式</th><th scope="col">1D LUT</th></tr></thead>
        <tbody>{samples.map(sample => <tr key={sample.input}>
          <th scope="row">{sample.input}</th><td>{sample.ideal}</td>
          <td>{sample.approximate}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="vp-lut__controls">
      <label className="vp-lut__control"><span>変換カーブ</span>
        <select aria-label="変換カーブ" value={curve}
          onChange={event => setCurve(event.target.value)}>
          {Object.entries(CURVE_OPTIONS).map(([value, label]) =>
            <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="vp-lut__control"><span>べき指数 <output htmlFor={id + '-exp'}>{exponent.toFixed(1)}</output></span>
        <input id={id + '-exp'} type="range" min="0.5" max="3" step="0.5"
          aria-label="べき乗カーブの指数" disabled={curve !== 'power'} value={exponent}
          onChange={event => setExponent(Number(event.target.value))} />
      </label>
      <label className="vp-lut__control"><span>LUTの記録点数</span>
        <select aria-label="LUTの記録点数" value={entries}
          onChange={event => setEntries(Number(event.target.value))}>
          {LUT_ENTRIES.map(size => <option key={size} value={size}>{size}点</option>)}
        </select>
      </label>
      <label className="vp-lut__control"><span>点の間の補間</span>
        <select aria-label="点の間の補間" value={interpolation}
          onChange={event => setInterpolation(event.target.value)}>
          <option value="nearest">最近傍（段差）</option>
          <option value="linear">線形（直線で結ぶ）</option>
        </select>
      </label>
      <label className="vp-lut__control"><span>入力パターン</span>
        <select aria-label="入力パターン" value={pattern}
          onChange={event => setPattern(event.target.value)}>
          <option value="gray">灰色グラデーション</option>
          <option value="rgb">RGBと混色の6本の帯</option>
        </select>
      </label>
      <label className="vp-lut__control"><span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom}
          onChange={event => setZoom(Number(event.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-lut__actions">
      <button type="button" onClick={reset}>初期値に戻す</button>
    </div>
    <p className="vp-lut__hint">入力は表示用8-bit RGBコードを0〜1へ正規化した値です。
      線形光・Log・HDR、3D LUT、色空間変換、クリッピング領域外の値は扱いません。
      これはLUTの補間を理解するための教育用モデルで、AE・Resolveと同等ではありません。</p>
  </section>;
}
