import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  PREVIEW_WIDTH, PREVIEW_HEIGHT, makeTestPattern, toPreviewBytes,
} from '../DitheringPlayground/dither-core.mjs';
import {exposureGrayscale} from './exposure-core.mjs';
import './exposure.css';

const DEFAULTS = Object.freeze({source: 'ramp', ev: 0, zoom: 1});

function ExposurePreview({kind, label, description, pixels, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const context = ref.current?.getContext('2d', {alpha: false});
    if (!context) return;
    const frame = context.createImageData(PREVIEW_WIDTH, PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const offset = i * 4;
      frame.data[offset] = frame.data[offset + 1] = frame.data[offset + 2] = pixels[i];
      frame.data[offset + 3] = 255;
    }
    context.putImageData(frame, 0, 0);
  }, [pixels]);
  return <figure className="vp-exposure__preview" data-vp-exposure-preview={kind}>
    <figcaption><strong>{label}</strong><span>{description}</span></figcaption>
    <div className="vp-exposure__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={label + '。拡大時は横へスクロールできます。'}>
      <canvas ref={ref} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} role="img"
        aria-label={label + '：表示用8-bitグレースケール'} style={{width: zoom * 100 + '%'}} />
    </div>
  </figure>;
}

function TransferPlot({lut, ev}) {
  const points = [];
  for (let code = 0; code <= 255; code += 8) {
    points.push((16 + 224 * code / 255).toFixed(2) + ',' +
      (240 - 224 * lut[code] / 255).toFixed(2));
  }
  points.push('240,16');
  return <figure className="vp-exposure__plot">
    <figcaption><strong>入力→出力の対応線</strong><span>破線は無補正</span></figcaption>
    <svg viewBox="0 0 256 256" role="img"
      aria-label={'露出補正' + ev + ' EVのsRGB入力値と出力値の対応線'}>
      <line x1="16" y1="240" x2="240" y2="16" className="vp-exposure__identity" />
      <polyline points={points.join(' ')} className="vp-exposure__curve" />
      <text x="16" y="253">0</text><text x="210" y="253">入力255</text>
      <text x="18" y="14">出力255</text>
    </svg>
  </figure>;
}

export default function ExposurePlayground() {
  const id = useId();
  const [source, setSource] = useState(DEFAULTS.source);
  const [ev, setEv] = useState(DEFAULTS.ev);
  const [zoom, setZoom] = useState(DEFAULTS.zoom);
  const original = useMemo(
    () => toPreviewBytes(makeTestPattern(PREVIEW_WIDTH, PREVIEW_HEIGHT, source)),
    [source],
  );
  const {pixels, lut, clippedCount} = useMemo(
    () => exposureGrayscale(original, PREVIEW_WIDTH, PREVIEW_HEIGHT, ev),
    [original, ev],
  );
  const reset = () => {
    setSource(DEFAULTS.source);
    setEv(DEFAULTS.ev);
    setZoom(DEFAULTS.zoom);
  };
  const evLabel = (ev > 0 ? '+' : '') + ev.toFixed(1) + ' EV';
  return <section className="vp-exposure" data-vp-exposure="ready" data-vp-exposure-ev={ev}
    aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>露出段数を変え、明部のクリップを観察する</h3>
    <p className="vp-exposure__intro">
      sRGBを線形光に戻して倍率をかけます。特に+1 EV以上で明るい端がどう変わるか確認してください。
    </p>
    <div className="vp-exposure__previews">
      <ExposurePreview kind="original" label="01 / 元画像" description="表示用sRGB 8-bit"
        pixels={original} zoom={zoom} />
      <ExposurePreview kind="output" label="02 / 露出補正後" description={evLabel}
        pixels={pixels} zoom={zoom} />
    </div>
    <div className="vp-exposure__analysis">
      <TransferPlot lut={lut} ev={evLabel} />
      <p className="vp-exposure__readout" role="status">
        入力32 → {lut[32]}<br />入力128 → {lut[128]}<br />入力224 → {lut[224]}<br />
        倍率：{(2 ** ev).toFixed(3)}×<br />
        上限1を超えた元画素：{clippedCount.toLocaleString('ja-JP')} /
        {' '}{original.length.toLocaleString('ja-JP')}
      </p>
    </div>
    <p className="vp-exposure__hint">プレビューは384×160画素。拡大すると横スクロールできます。</p>
    <div className="vp-exposure__controls">
      <label className="vp-exposure__control">
        <span>元画像</span>
        <select aria-label="元画像" value={source}
          onChange={(event) => setSource(event.target.value)}>
          <option value="ramp">横方向グラデーション</option>
          <option value="radial">中心が明るい楕円グラデーション</option>
        </select>
      </label>
      <label className="vp-exposure__control">
        <span>露出補正（EV） <output htmlFor={id + '-ev'}>{evLabel}</output></span>
        <input id={id + '-ev'} type="range" min="-2" max="2" step="0.5" value={ev}
          aria-label="露出補正（EV）" onChange={(event) => setEv(Number(event.target.value))} />
      </label>
      <label className="vp-exposure__control">
        <span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option><option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-exposure__actions">
      <button className="vp-exposure__reset" type="button" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
