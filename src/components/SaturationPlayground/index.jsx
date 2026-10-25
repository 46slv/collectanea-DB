import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  SATURATION_WIDTH, SATURATION_HEIGHT, SATURATION_DEFAULT, SATURATION_SAMPLES,
  createSaturationPattern, adjustCodeSaturation, renderSaturation,
} from './saturation-core.mjs';
import './saturation.css';

const DEFAULTS = Object.freeze({amount: SATURATION_DEFAULT, pattern: 'hues', zoom: 1});
const OPTIONS = {
  hues: '色相が連続して変わる帯',
  patches: '8色のテストパッチ（灰色を含む）',
};

function ColorPreview({kind, title, hint, frame, zoom}) {
  const canvas = useRef(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d', {alpha: false});
    if (!ctx) return;
    const imageData = ctx.createImageData(SATURATION_WIDTH, SATURATION_HEIGHT);
    imageData.data.set(frame);
    ctx.putImageData(imageData, 0, 0);
  }, [frame]);
  return <figure className="vp-sat__preview" data-vp-saturation-preview={kind}>
    <figcaption><strong>{title}</strong><span>{hint}</span></figcaption>
    <div className="vp-sat__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={title + '。拡大時は横にスクロールできます。'}>
      <canvas ref={canvas} width={SATURATION_WIDTH} height={SATURATION_HEIGHT}
        role="img" aria-label={title + '。教材が作成した8-bit sRGBカラー画像。'}
        style={{width: zoom * 100 + '%'}} />
    </div>
  </figure>;
}

function RGBSwatch({rgb}) {
  return <span className="vp-sat__swatch" style={{backgroundColor: `rgb(${rgb.join(',')})`}}
    role="img" aria-label={'色見本 RGB ' + rgb.join('、')} />;
}

export default function SaturationPlayground() {
  const id = useId();
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [pattern, setPattern] = useState(DEFAULTS.pattern);
  const [zoom, setZoom] = useState(DEFAULTS.zoom);
  const source = useMemo(
    () => createSaturationPattern(SATURATION_WIDTH, SATURATION_HEIGHT, pattern), [pattern],
  );
  const {pixels, clippedPixels} = useMemo(
    () => renderSaturation(source, SATURATION_WIDTH, SATURATION_HEIGHT, amount), [source, amount],
  );
  const samples = SATURATION_SAMPLES.map(({label, rgb}) => ({
    label, original: rgb, after: adjustCodeSaturation(rgb, amount),
  }));
  const reset = () => {
    setAmount(DEFAULTS.amount); setPattern(DEFAULTS.pattern); setZoom(DEFAULTS.zoom);
  };
  return <section className="vp-sat" data-vp-saturation="ready"
    data-vp-saturation-amount={amount} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>色の差を広げたり、無彩色へ寄せたりする</h3>
    <p className="vp-sat__intro">2枚は同じ8-bit sRGBのテストパターンです。
      右だけに、符号化済みRGB値を重み付きの灰色へ寄せる／遠ざける簡易変換を適用します。</p>
    <div className="vp-sat__previews">
      <ColorPreview kind="source" title="01 / 元の色" hint="補正を加えていない8-bit RGB"
        frame={source} zoom={zoom} />
      <ColorPreview kind="processed" title="02 / 彩度の簡易調整"
        hint="RGBの灰色軸からの距離を変更" frame={pixels} zoom={zoom} />
    </div>
    <div className="vp-sat__readout" aria-live="polite">
      <p>彩度係数：<strong>{amount.toFixed(2)}×</strong>
        {' ／ '}計算途中でRGB範囲を超えた画素：
        <strong>{clippedPixels.toLocaleString('ja-JP')}</strong>
        {' / '}{(SATURATION_WIDTH * SATURATION_HEIGHT).toLocaleString('ja-JP')}</p>
      <table>
        <caption>代表色の変化（各チャンネル0–255）</caption>
        <thead><tr><th scope="col">色</th><th scope="col">入力RGB</th><th scope="col">出力RGB</th></tr></thead>
        <tbody>{samples.map(({label, original, after}) => <tr key={label}>
          <th scope="row">{label}</th>
          <td><RGBSwatch rgb={original} />{original.join(' / ')}</td>
          <td><RGBSwatch rgb={after} />{after.join(' / ')}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="vp-sat__hint">「範囲外画素」は計算途中に0未満または255超が出た個数です。
      表示画像は0–255へクリップ済みです。実際の色域変換、色差空間、HDRの彩度制御ではありません。</p>
    <div className="vp-sat__controls">
      <label className="vp-sat__control"><span>入力パターン</span>
        <select aria-label="入力パターン" value={pattern}
          onChange={(e) => setPattern(e.target.value)}>
          {Object.entries(OPTIONS).map(([key, name]) => <option value={key} key={key}>{name}</option>)}
        </select>
      </label>
      <label className="vp-sat__control"><span>彩度係数 <output htmlFor={id + '-amount'}>{amount.toFixed(2)}×</output></span>
        <input id={id + '-amount'} type="range" min="0" max="2" step="0.25"
          value={amount} aria-label="彩度係数（0から2倍）"
          onChange={(e) => setAmount(Number(e.target.value))} />
      </label>
      <label className="vp-sat__control"><span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option><option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-sat__actions"><button type="button" onClick={reset}
      className="vp-sat__reset">初期値に戻す</button></div>
  </section>;
}
