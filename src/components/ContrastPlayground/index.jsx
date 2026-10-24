import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  PREVIEW_WIDTH, PREVIEW_HEIGHT, makeTestPattern, toPreviewBytes,
} from '../DitheringPlayground/dither-core.mjs';
import {contrastGrayscale} from './contrast-core.mjs';
import './contrast.css';

const INITIAL = Object.freeze({source: 'ramp', gain: 1, pivot: 128, zoom: 1});

function ContrastPreview({kind, label, detail, pixels, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d', {alpha: false});
    if (!ctx) return;
    const image = ctx.createImageData(PREVIEW_WIDTH, PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const offset = i * 4;
      image.data[offset] = pixels[i];
      image.data[offset + 1] = pixels[i];
      image.data[offset + 2] = pixels[i];
      image.data[offset + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-contrast__preview" data-vp-contrast-preview={kind}>
    <figcaption><strong>{label}</strong><span>{detail}</span></figcaption>
    <div className="vp-contrast__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={label + 'の画像。拡大時は横方向にスクロールできます。'}>
      <canvas ref={ref} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} role="img"
        aria-label={label + '：8-bitグレースケール画像'}
        style={{width: String(zoom * 100) + '%'}} />
    </div>
  </figure>;
}

export default function ContrastPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL.source);
  const [gain, setGain] = useState(INITIAL.gain);
  const [pivot, setPivot] = useState(INITIAL.pivot);
  const [zoom, setZoom] = useState(INITIAL.zoom);
  const original = useMemo(
    () => toPreviewBytes(makeTestPattern(PREVIEW_WIDTH, PREVIEW_HEIGHT, source)),
    [source],
  );
  const result = useMemo(
    () => contrastGrayscale(original, PREVIEW_WIDTH, PREVIEW_HEIGHT, gain, pivot),
    [original, gain, pivot],
  );
  const samples = useMemo(
    () => contrastGrayscale(Uint8ClampedArray.from([64, 128, 192]), 3, 1, gain, pivot).pixels,
    [gain, pivot],
  );
  const reset = () => {
    setSource(INITIAL.source);
    setGain(INITIAL.gain);
    setPivot(INITIAL.pivot);
    setZoom(INITIAL.zoom);
  };
  return <section className="vp-contrast" data-vp-contrast="ready"
    data-vp-contrast-gain={gain} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>ピボットを中心に明暗差を変える</h3>
    <p className="vp-contrast__intro">1.00は元のまま。倍率を上げるとクリッピングも観察できます。</p>
    <div className="vp-contrast__previews">
      <ContrastPreview kind="original" label="01 / 元画像"
        detail="表示用8-bit入力" pixels={original} zoom={zoom} />
      <ContrastPreview kind="output" label="02 / 線形コントラスト後"
        detail={'倍率 ' + gain.toFixed(2) + ' ／ ピボット ' + pivot}
        pixels={result.pixels} zoom={zoom} />
    </div>
    <p className="vp-contrast__sample" role="status">
      入力64 → {samples[0]} ／ 入力128 → {samples[1]} ／ 入力192 → {samples[2]}
      <br />範囲外でクリップされた画素：{result.outsideCount} / {original.length}
    </p>
    <p className="vp-contrast__hint">各画像384×160画素。拡大時は横スクロールできます。</p>
    <div className="vp-contrast__controls">
      <label className="vp-contrast__control">
        <span>元画像</span>
        <select value={source} aria-label="元画像" onChange={(event) => setSource(event.target.value)}>
          <option value="ramp">横方向グラデーション</option>
          <option value="radial">中心が明るい楕円グラデーション</option>
        </select>
      </label>
      <label className="vp-contrast__control">
        <span>倍率 c <output htmlFor={id + '-gain'}>{gain.toFixed(2)}</output></span>
        <input id={id + '-gain'} type="range" aria-label="コントラスト倍率 c"
          min="0.5" max="2" step="0.25" value={gain}
          onChange={(event) => setGain(Number(event.target.value))} />
      </label>
      <label className="vp-contrast__control">
        <span>ピボット p（8-bit値） <output htmlFor={id + '-pivot'}>{pivot}</output></span>
        <input id={id + '-pivot'} type="range" aria-label="ピボット p"
          min="64" max="192" step="16" value={pivot}
          onChange={(event) => setPivot(Number(event.target.value))} />
      </label>
      <label className="vp-contrast__control">
        <span>表示倍率</span>
        <select value={zoom} aria-label="表示倍率" onChange={(event) => setZoom(Number(event.target.value))}>
          <option value={1}>100%</option>
          <option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-contrast__actions">
      <button type="button" className="vp-contrast__reset" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
