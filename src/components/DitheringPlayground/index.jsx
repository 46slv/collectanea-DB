import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  INITIAL_DITHER_SETTINGS, PREVIEW_WIDTH, PREVIEW_HEIGHT,
  makeTestPattern, toPreviewBytes, processGrayscale,
} from './dither-core.mjs';
import './playground.css';

const descriptions = {
  none: 'ディザなし：画素を最も近い階調へ丸めるため、グラデーションに帯状の段差が現れます。',
  ordered: '規則的ディザ：小さな閾値行列を繰り返し、隣り合う画素の明暗で中間の階調を表現します。',
  'error-diffusion': '誤差拡散：丸めた際の誤差を右・下の画素へ分配し、より不規則な粒で段差を目立ちにくくします。',
};

function CanvasPreview({kind, label, detail, pixels, zoom}) {
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

  return <figure className="vp-dither__preview" data-vp-preview={kind}>
    <figcaption><strong>{label}</strong><span>{detail}</span></figcaption>
    <div className="vp-dither__viewport" aria-label={label + 'の拡大画像。横にスクロールできます。'} tabIndex={zoom > 1 ? 0 : undefined}>
      <canvas ref={ref} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT}
        role="img" aria-label={label + '：白黒のテスト画像'}
        style={{width: String(zoom * 100) + '%'}} />
    </div>
  </figure>;
}

export default function DitheringPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL_DITHER_SETTINGS.source);
  const [levels, setLevels] = useState(INITIAL_DITHER_SETTINGS.levels);
  const [method, setMethod] = useState(INITIAL_DITHER_SETTINGS.method);
  const [matrixSize, setMatrixSize] = useState(INITIAL_DITHER_SETTINGS.matrixSize);
  const [zoom, setZoom] = useState(INITIAL_DITHER_SETTINGS.zoom);

  const original = useMemo(() => makeTestPattern(PREVIEW_WIDTH, PREVIEW_HEIGHT, source), [source]);
  const originalBytes = useMemo(() => toPreviewBytes(original), [original]);
  const plain = useMemo(() => processGrayscale(original, PREVIEW_WIDTH, PREVIEW_HEIGHT,
    {levels, method: 'none'}), [original, levels]);
  const processed = useMemo(() => processGrayscale(original, PREVIEW_WIDTH, PREVIEW_HEIGHT,
    {levels, method, matrixSize}), [original, levels, method, matrixSize]);

  const reset = () => {
    setSource(INITIAL_DITHER_SETTINGS.source);
    setLevels(INITIAL_DITHER_SETTINGS.levels);
    setMethod(INITIAL_DITHER_SETTINGS.method);
    setMatrixSize(INITIAL_DITHER_SETTINGS.matrixSize);
    setZoom(INITIAL_DITHER_SETTINGS.zoom);
  };

  return <section className="vp-dither" data-vp-dither="ready" data-vp-method={method} data-vp-levels={levels}
    aria-labelledby={id + '-title'}>
    <div className="vp-dither__heading">
      <div>
        <h3 id={id + '-title'}>ディザリングを試す</h3>
        <p>元画像 → 単純な量子化 → ディザ処理。同じ階調数のまま見え方が変わります。</p>
      </div>
      <button type="button" className="vp-dither__reset" onClick={reset}>初期値に戻す</button>
    </div>

    <div className="vp-dither__controls">
      <label className="vp-dither__control">
        <span>元画像</span>
        <select value={source} onChange={(event) => setSource(event.target.value)} aria-label="元画像">
          <option value="ramp">横方向グラデーション</option>
          <option value="radial">中心が明るい円形グラデーション</option>
        </select>
      </label>
      <label className="vp-dither__control">
        <span>階調数 <output htmlFor={id + '-levels'}>{levels} 段階</output></span>
        <input id={id + '-levels'} aria-label="階調数" type="range" min="2" max="16" step="1"
          value={levels} onChange={(event) => setLevels(Number(event.target.value))} />
      </label>
      <label className="vp-dither__control">
        <span>処理方式</span>
        <select value={method} onChange={(event) => setMethod(event.target.value)} aria-label="処理方式">
          <option value="none">ディザなし（量子化）</option>
          <option value="ordered">規則的ディザ（Bayer）</option>
          <option value="error-diffusion">誤差拡散（Floyd–Steinberg）</option>
        </select>
      </label>
      {method === 'ordered' && <label className="vp-dither__control">
        <span>パターンの大きさ</span>
        <select value={matrixSize} onChange={(event) => setMatrixSize(Number(event.target.value))}
          aria-label="パターンの大きさ">
          <option value={2}>2 × 2</option>
          <option value={4}>4 × 4</option>
          <option value={8}>8 × 8</option>
        </select>
      </label>}
      <label className="vp-dither__control">
        <span>表示倍率</span>
        <select value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="表示倍率">
          <option value={1}>100%</option>
          <option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>

    <p className="vp-dither__explanation" role="status">{descriptions[method]}</p>
    <div className="vp-dither__previews">
      <CanvasPreview kind="original" label="01 / 元画像" detail="滑らかな入力" pixels={originalBytes} zoom={zoom} />
      <CanvasPreview kind="plain" label="02 / 量子化のみ" detail={String(levels) + ' 階調・ディザなし'} pixels={plain} zoom={zoom} />
      <CanvasPreview kind="processed" label="03 / 処理結果" detail={method === 'none' ? '02と同じ' : method === 'ordered' ? '規則的な画素の模様' : '誤差を周囲に拡散'} pixels={processed} zoom={zoom} />
    </div>
    <p className="vp-dither__hint">拡大時は各画像を横方向にスクロールして画素を観察できます。3枚は同じ元画像と階調数を使用しています。</p>
  </section>;
}
