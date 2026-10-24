import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  PREVIEW_WIDTH, PREVIEW_HEIGHT, makeTestPattern, toPreviewBytes,
} from '../DitheringPlayground/dither-core.mjs';
import {gammaGrayscale} from './gamma-core.mjs';
import './gamma.css';

const INITIAL = Object.freeze({source: 'ramp', exponent: 1, zoom: 1});

function GammaPreview({kind, label, detail, pixels, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const context = ref.current?.getContext('2d', {alpha: false});
    if (!context) return;
    const image = context.createImageData(PREVIEW_WIDTH, PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const offset = i * 4;
      image.data[offset] = pixels[i];
      image.data[offset + 1] = pixels[i];
      image.data[offset + 2] = pixels[i];
      image.data[offset + 3] = 255;
    }
    context.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-gamma__preview" data-vp-gamma-preview={kind}>
    <figcaption><strong>{label}</strong><span>{detail}</span></figcaption>
    <div className="vp-gamma__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={label + 'の画像。拡大時は横方向にスクロールできます。'}>
      <canvas ref={ref} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT}
        role="img" aria-label={label + '：8-bitグレースケール実験画像'}
        style={{width: String(zoom * 100) + '%'}} />
    </div>
  </figure>;
}

export default function GammaPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL.source);
  const [exponent, setExponent] = useState(INITIAL.exponent);
  const [zoom, setZoom] = useState(INITIAL.zoom);
  const original = useMemo(
    () => toPreviewBytes(makeTestPattern(PREVIEW_WIDTH, PREVIEW_HEIGHT, source)),
    [source],
  );
  const processed = useMemo(
    () => gammaGrayscale(original, PREVIEW_WIDTH, PREVIEW_HEIGHT, exponent),
    [original, exponent],
  );
  const midtone = useMemo(
    () => gammaGrayscale(Uint8ClampedArray.from([128]), 1, 1, exponent)[0],
    [exponent],
  );
  const reset = () => {
    setSource(INITIAL.source);
    setExponent(INITIAL.exponent);
    setZoom(INITIAL.zoom);
  };
  return <section className="vp-gamma" data-vp-gamma="ready"
    data-vp-gamma-exponent={exponent} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>指数を変えて中間調の動きを見る</h3>
    <p className="vp-gamma__intro">黒（0）と白（255）を保ちながら、中間の値の割り当てを曲線で変えます。</p>
    <div className="vp-gamma__previews">
      <GammaPreview kind="original" label="01 / 元画像" detail="表示用8-bitの入力値"
        pixels={original} zoom={zoom} />
      <GammaPreview kind="output" label="02 / べき乗変換後"
        detail={'指数 ' + exponent.toFixed(2) + '・y = x^g'}
        pixels={processed} zoom={zoom} />
    </div>
    <p className="vp-gamma__sample" role="status">
      入力128 → 出力{midtone} ／ 0と255は維持
    </p>
    <p className="vp-gamma__hint">拡大時は各画像を横スクロールできます。両方とも384×160画素です。</p>
    <div className="vp-gamma__controls">
      <label className="vp-gamma__control">
        <span>元画像</span>
        <select value={source} aria-label="元画像"
          onChange={(event) => setSource(event.target.value)}>
          <option value="ramp">横方向グラデーション</option>
          <option value="radial">中心が明るい楕円グラデーション</option>
        </select>
      </label>
      <label className="vp-gamma__control">
        <span>べき乗指数 g <output htmlFor={id + '-exponent'}>{exponent.toFixed(2)}</output></span>
        <input id={id + '-exponent'} type="range" aria-label="べき乗指数 g"
          min="0.25" max="3" step="0.25" value={exponent}
          onChange={(event) => setExponent(Number(event.target.value))} />
      </label>
      <label className="vp-gamma__control">
        <span>表示倍率</span>
        <select value={zoom} aria-label="表示倍率"
          onChange={(event) => setZoom(Number(event.target.value))}>
          <option value={1}>100%</option>
          <option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-gamma__actions">
      <button type="button" className="vp-gamma__reset" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
