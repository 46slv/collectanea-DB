import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  PREVIEW_WIDTH, PREVIEW_HEIGHT, makeTestPattern, toPreviewBytes,
} from '../DitheringPlayground/dither-core.mjs';
import {thresholdGrayscale} from './threshold-core.mjs';
import './threshold.css';

const INITIAL = Object.freeze({source: 'ramp', threshold: 128, zoom: 1});

function ThresholdPreview({kind, label, detail, pixels, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', {alpha: false});
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

  return <figure className="vp-threshold__preview" data-vp-threshold-preview={kind}>
    <figcaption><strong>{label}</strong><span>{detail}</span></figcaption>
    <div className="vp-threshold__viewport"
      aria-label={label + 'の拡大画像。拡大時は横にスクロールできます。'}
      tabIndex={zoom > 1 ? 0 : undefined}>
      <canvas ref={ref} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT}
        role="img" aria-label={label + '：グレースケールのテスト画像'}
        style={{width: String(zoom * 100) + '%'}} />
    </div>
  </figure>;
}

export default function ThresholdPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL.source);
  const [threshold, setThreshold] = useState(INITIAL.threshold);
  const [zoom, setZoom] = useState(INITIAL.zoom);

  const original = useMemo(
    () => toPreviewBytes(makeTestPattern(PREVIEW_WIDTH, PREVIEW_HEIGHT, source)),
    [source],
  );
  const processed = useMemo(
    () => thresholdGrayscale(original, PREVIEW_WIDTH, PREVIEW_HEIGHT, threshold),
    [original, threshold],
  );
  const whiteCount = useMemo(
    () => processed.reduce((count, value) => count + (value === 255 ? 1 : 0), 0),
    [processed],
  );

  const reset = () => {
    setSource(INITIAL.source);
    setThreshold(INITIAL.threshold);
    setZoom(INITIAL.zoom);
  };

  return <section className="vp-threshold" data-vp-threshold="ready"
    data-vp-threshold-value={threshold} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>しきい値を動かして二値化する</h3>
    <p className="vp-threshold__intro">明るさが設定値を超えた画素だけ白になります。境界と白黒の面積の変化を観察してください。</p>
    <div className="vp-threshold__previews">
      <ThresholdPreview kind="original" label="01 / 元画像"
        detail="256段階の表示用グレースケール"
        pixels={original} zoom={zoom} />
      <ThresholdPreview kind="binary" label="02 / 二値化後"
        detail={'しきい値 ' + threshold + '・出力は黒か白'}
        pixels={processed} zoom={zoom} />
    </div>
    <p className="vp-threshold__count" role="status">
      白：{whiteCount.toLocaleString('ja-JP')} 画素 ／ 黒：{(processed.length - whiteCount).toLocaleString('ja-JP')} 画素
    </p>
    <p className="vp-threshold__hint">拡大時は各プレビューを横方向にスクロールできます。画面と処理結果は同じ384×160画素です。</p>
    <div className="vp-threshold__controls">
      <label className="vp-threshold__control">
        <span>元画像</span>
        <select value={source} onChange={(event) => setSource(event.target.value)} aria-label="元画像">
          <option value="ramp">横方向グラデーション</option>
          <option value="radial">中心が明るい楕円グラデーション</option>
        </select>
      </label>
      <label className="vp-threshold__control">
        <span>しきい値 <output htmlFor={id + '-threshold'}>{threshold} / 255</output></span>
        <input id={id + '-threshold'} aria-label="しきい値" type="range"
          min="0" max="255" step="1" value={threshold}
          onChange={(event) => setThreshold(Number(event.target.value))} />
      </label>
      <label className="vp-threshold__control">
        <span>表示倍率</span>
        <select value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="表示倍率">
          <option value={1}>100%</option>
          <option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-threshold__actions">
      <button type="button" className="vp-threshold__reset" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
