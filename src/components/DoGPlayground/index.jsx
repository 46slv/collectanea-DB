import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  DOG_PREVIEW_WIDTH, DOG_PREVIEW_HEIGHT, INITIAL_DOG_SETTINGS,
  makeDoGTestPattern, makeDoGBlurPair, renderDoGFromBlurs,
} from './dog-core.mjs';
import './playground.css';

function DoGPreview({kind, title, detail, pixels}) {
  const canvasRef = useRef(null);
  const [canvasUnavailable, setCanvasUnavailable] = useState(false);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d', {alpha: false});
    if (!ctx) {
      setCanvasUnavailable(true);
      return;
    }
    const image = ctx.createImageData(DOG_PREVIEW_WIDTH, DOG_PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const offset = i * 4;
      image.data[offset] = image.data[offset + 1] = image.data[offset + 2] = pixels[i];
      image.data[offset + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);

  return <figure className="vp-dog__preview" data-vp-dog-preview={kind}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={canvasRef} width={DOG_PREVIEW_WIDTH} height={DOG_PREVIEW_HEIGHT}
      role="img" aria-label={`${title}：グレースケールの差分実験`} />
    {canvasUnavailable && <p role="status" className="vp-dog__fallback">
      この環境ではCanvas 2Dを利用できません。計算と説明は閲覧できますが、画像は表示できません。
    </p>}
  </figure>;
}

export default function DoGPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL_DOG_SETTINGS.source);
  const [sigma, setSigma] = useState(INITIAL_DOG_SETTINGS.sigma);
  const [ratio, setRatio] = useState(INITIAL_DOG_SETTINGS.ratio);
  const [gain, setGain] = useState(INITIAL_DOG_SETTINGS.gain);
  const [threshold, setThreshold] = useState(INITIAL_DOG_SETTINGS.threshold);
  const [view, setView] = useState(INITIAL_DOG_SETTINGS.view);
  const before = useMemo(() => makeDoGTestPattern(DOG_PREVIEW_WIDTH, DOG_PREVIEW_HEIGHT, source), [source]);
  // Changing gain or threshold must not repeat the two costly Gaussian convolutions.
  const {narrow, wide} = useMemo(
    () => makeDoGBlurPair(before, DOG_PREVIEW_WIDTH, DOG_PREVIEW_HEIGHT, {sigma, ratio}),
    [before, sigma, ratio]);
  const {signed, absolute, edges, edgeCount} = useMemo(
    () => renderDoGFromBlurs(narrow, wide, {gain, threshold}),
    [narrow, wide, gain, threshold]);
  const reset = () => {
    setSource(INITIAL_DOG_SETTINGS.source);
    setSigma(INITIAL_DOG_SETTINGS.sigma);
    setRatio(INITIAL_DOG_SETTINGS.ratio);
    setGain(INITIAL_DOG_SETTINGS.gain);
    setThreshold(INITIAL_DOG_SETTINGS.threshold);
    setView(INITIAL_DOG_SETTINGS.view);
  };

  return <section className="vp-dog" data-vp-dog="ready" data-vp-dog-source={source}
    data-vp-dog-sigma={sigma} data-vp-dog-ratio={ratio} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>Difference of Gaussiansを試す</h3>
    <p>弱いぼかしと強いぼかしを引き算し、残った濃淡差を観察します。</p>
    <div className="vp-dog__previews">
      <DoGPreview kind="before" title="01 / 元画像" detail="ぼかす前の濃淡" pixels={before} />
      <DoGPreview kind={view} title="02 / 2種類のぼかしと差分"
        detail={{
          narrow: '小さいσのぼかし。細部が比較的残ります',
          wide: '大きいσのぼかし。細部がより消えます',
          signed: '128＝差なし・明＝正・暗＝負',
          absolute: '正負を同じ明るさへ変換',
        }[view]}
        pixels={{narrow, wide, signed, absolute}[view]} />
      <DoGPreview kind="edges" title="03 / 閾値適用後" detail="弱い差分を黒で隠す" pixels={edges} />
    </div>
    <p className="vp-dog__metric">閾値後に差分が残った画素：<strong>{edgeCount.toLocaleString('ja-JP')}</strong> / {edges.length.toLocaleString('ja-JP')}。物体の数や線の長さではありません。</p>
    <div className="vp-dog__controls">
      <label className="vp-dog__control">
        <span>中間プレビュー</span>
        <select value={view} onChange={(event) => setView(event.target.value)} aria-label="中間プレビュー">
          <option value="narrow">小さいぼかし（σ小）</option>
          <option value="wide">大きいぼかし（σ大）</option>
          <option value="signed">符号あり（128＝変化なし）</option>
          <option value="absolute">絶対値（明るいほど差が大きい）</option>
        </select>
      </label>
      <label className="vp-dog__control">
        <span>元画像</span>
        <select value={source} onChange={(event) => setSource(event.target.value)} aria-label="元画像">
          <option value="spots">大小の明るい点</option>
          <option value="stripes">幅の異なる縞模様</option>
          <option value="texture">細かい模様と図形</option>
        </select>
      </label>
      <label className="vp-dog__control">
        <span>小さいぼかし <output htmlFor={id + '-sigma'}>σ {sigma.toFixed(1)} px</output></span>
        <input id={id + '-sigma'} type="range" min="0.5" max="5" step="0.5" value={sigma}
          aria-label="小さいぼかしの標準偏差" onChange={(event) => setSigma(Number(event.target.value))} />
      </label>
      <label className="vp-dog__control">
        <span>大きいぼかしとの比率 <output htmlFor={id + '-ratio'}>{ratio.toFixed(1)} 倍（σ {(sigma * ratio).toFixed(1)} px）</output></span>
        <input id={id + '-ratio'} type="range" min="1.5" max="3" step="0.5" value={ratio}
          aria-label="大きいぼかしとの比率" onChange={(event) => setRatio(Number(event.target.value))} />
      </label>
      <label className="vp-dog__control">
        <span>差分の強調 <output htmlFor={id + '-gain'}>{gain.toFixed(1)} 倍</output></span>
        <input id={id + '-gain'} type="range" min="0.5" max="8" step="0.5" value={gain}
          aria-label="差分の強調" onChange={(event) => setGain(Number(event.target.value))} />
      </label>
      <label className="vp-dog__control">
        <span>閾値 <output htmlFor={id + '-threshold'}>{threshold} / 255</output></span>
        <input id={id + '-threshold'} type="range" min="0" max="255" step="5" value={threshold}
          aria-label="閾値" onChange={(event) => setThreshold(Number(event.target.value))} />
      </label>
    </div>
    <div className="vp-dog__actions"><button type="button" onClick={reset}>初期値に戻す</button></div>
  </section>;
}
