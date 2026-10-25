import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  PREVIEW_WIDTH, PREVIEW_HEIGHT, makeTestPattern, toPreviewBytes,
} from '../DitheringPlayground/dither-core.mjs';
import {toneCurveGrayscale} from './tone-curve-core.mjs';
import './tone-curve.css';

const DEFAULTS = Object.freeze({source: 'ramp', middle: 128, zoom: 1});

function TonePreview({kind, label, detail, pixels, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', {alpha: false});
    if (!ctx) return;
    const image = ctx.createImageData(PREVIEW_WIDTH, PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const offset = i * 4;
      image.data[offset] = image.data[offset + 1] = image.data[offset + 2] = pixels[i];
      image.data[offset + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-tone-curve__preview" data-vp-tone-preview={kind}>
    <figcaption><strong>{label}</strong><span>{detail}</span></figcaption>
    <div className="vp-tone-curve__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={label + 'の画像。拡大時は横スクロールできます。'}>
      <canvas ref={ref} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} role="img"
        aria-label={label + '：8-bitグレースケール画像'}
        style={{width: (zoom * 100) + '%'}} />
    </div>
  </figure>;
}

function CurvePlot({middle}) {
  const yMiddle = 240 - middle * 224 / 255;
  return <figure className="vp-tone-curve__plot">
    <figcaption><strong>入力 → 出力の対応線</strong><span>破線は変化なし（直線）</span></figcaption>
    <svg viewBox="0 0 256 256" role="img"
      aria-label={'入力0→0、入力128→' + middle + '、入力255→255を結ぶ2本の直線'}>
      <line x1="16" y1="240" x2="240" y2="16" className="vp-tone-curve__identity" />
      <polyline points={'16,240 128.439,' + yMiddle + ' 240,16'}
        className="vp-tone-curve__line" />
      <circle cx="128.439" cy={yMiddle} r="5" className="vp-tone-curve__point" />
      <text x="16" y="253">0</text><text x="212" y="253">入力255</text>
      <text x="18" y="14">出力255</text>
    </svg>
  </figure>;
}

export default function ToneCurvePlayground() {
  const id = useId();
  const [source, setSource] = useState(DEFAULTS.source);
  const [middle, setMiddle] = useState(DEFAULTS.middle);
  const [zoom, setZoom] = useState(DEFAULTS.zoom);
  const original = useMemo(
    () => toPreviewBytes(makeTestPattern(PREVIEW_WIDTH, PREVIEW_HEIGHT, source)),
    [source],
  );
  const {pixels, lut} = useMemo(
    () => toneCurveGrayscale(original, PREVIEW_WIDTH, PREVIEW_HEIGHT, middle),
    [original, middle],
  );
  const reset = () => {
    setSource(DEFAULTS.source);
    setMiddle(DEFAULTS.middle);
    setZoom(DEFAULTS.zoom);
  };
  return <section className="vp-tone-curve" data-vp-tone-curve="ready"
    data-vp-tone-middle={middle} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>曲線の中間点を動かして階調を再配置する</h3>
    <p className="vp-tone-curve__intro">
      0と255は固定。中央の点を上げ下げして、暗い範囲と明るい範囲の傾きの違いを見ます。
    </p>
    <div className="vp-tone-curve__previews">
      <TonePreview kind="original" label="01 / 元画像" detail="表示用8-bit入力"
        pixels={original} zoom={zoom} />
      <TonePreview kind="output" label="02 / 2直線のトーンカーブ後"
        detail={'入力128 → 出力' + middle} pixels={pixels} zoom={zoom} />
    </div>
    <div className="vp-tone-curve__analysis">
      <CurvePlot middle={middle} />
      <p className="vp-tone-curve__readout" role="status">
        入力64 → {lut[64]}<br />入力128 → {lut[128]}<br />入力192 → {lut[192]}<br />
        シャドウ域の傾き：{(middle / 128).toFixed(3)}<br />
        ハイライト域の傾き：{((255 - middle) / 127).toFixed(3)}
      </p>
    </div>
    <p className="vp-tone-curve__hint">画像は各384×160画素。表示を拡大すると横スクロールできます。</p>
    <div className="vp-tone-curve__controls">
      <label className="vp-tone-curve__control">
        <span>元画像</span>
        <select aria-label="元画像" value={source} onChange={(event) => setSource(event.target.value)}>
          <option value="ramp">横方向グラデーション</option>
          <option value="radial">中心が明るい楕円グラデーション</option>
        </select>
      </label>
      <label className="vp-tone-curve__control">
        <span>中間点の出力値（入力128） <output htmlFor={id + '-middle'}>{middle}</output></span>
        <input id={id + '-middle'} aria-label="中間点の出力値" type="range"
          min="32" max="224" step="16" value={middle}
          onChange={(event) => setMiddle(Number(event.target.value))} />
      </label>
      <label className="vp-tone-curve__control">
        <span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option><option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-tone-curve__actions">
      <button type="button" className="vp-tone-curve__reset" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
