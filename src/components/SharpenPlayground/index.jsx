import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  SHARPEN_PREVIEW_WIDTH, SHARPEN_PREVIEW_HEIGHT, INITIAL_SHARPEN_SETTINGS,
  makeSharpenTestPattern, unsharpMaskGrayscale, compositeUnsharpGrayscale,
  visualizeUnsharpResidualGrayscale, countNewSharpenEndpoints,
} from './sharpen-core.mjs';
import './playground.css';

function Preview({kind, label, detail, pixels}) {
  const ref = useRef(null);
  const [unsupported, setUnsupported] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', {alpha: false});
    if (!ctx) {
      setUnsupported(true);
      return;
    }
    const image = ctx.createImageData(SHARPEN_PREVIEW_WIDTH, SHARPEN_PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const j = i * 4;
      image.data[j] = pixels[i];
      image.data[j + 1] = pixels[i];
      image.data[j + 2] = pixels[i];
      image.data[j + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-sharpen__preview" data-vp-sharpen-preview={kind}>
    <figcaption><strong>{label}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={SHARPEN_PREVIEW_WIDTH} height={SHARPEN_PREVIEW_HEIGHT}
      role="img" aria-label={label + '：白黒テストパターンの比較画像'} />
    {unsupported && <p className="vp-sharpen__fallback" role="status">このブラウザではCanvas 2Dが利用できないため、比較画像を表示できません。</p>}
  </figure>;
}

export default function SharpenPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL_SHARPEN_SETTINGS.source);
  const [intermediate, setIntermediate] = useState('blurred');
  const [sigma, setSigma] = useState(INITIAL_SHARPEN_SETTINGS.sigma);
  const [amount, setAmount] = useState(INITIAL_SHARPEN_SETTINGS.amount);
  const original = useMemo(() => makeSharpenTestPattern(SHARPEN_PREVIEW_WIDTH, SHARPEN_PREVIEW_HEIGHT, source), [source]);
  // Memoize Gaussian reference independently so amount-only slider movement remains cheap.
  const {blurred} = useMemo(() => unsharpMaskGrayscale(original, SHARPEN_PREVIEW_WIDTH,
    SHARPEN_PREVIEW_HEIGHT, {sigma, amount: 0}), [original, sigma]);
  const residual = useMemo(() => intermediate === 'residual'
    ? visualizeUnsharpResidualGrayscale(original, blurred) : null, [original, blurred, intermediate]);
  const output = useMemo(() => compositeUnsharpGrayscale(original, blurred, amount),
    [original, blurred, amount]);
  // Distinguish newly clamped endpoints from pixel values already at 0 or 255.
  const limits = useMemo(() => countNewSharpenEndpoints(original, output), [original, output]);
  const reset = () => {
    setSource(INITIAL_SHARPEN_SETTINGS.source);
    setIntermediate('blurred');
    setSigma(INITIAL_SHARPEN_SETTINGS.sigma);
    setAmount(INITIAL_SHARPEN_SETTINGS.amount);
  };

  return <section className="vp-sharpen" data-vp-sharpen="ready" data-vp-sharpen-sigma={sigma}
    data-vp-sharpen-amount={amount} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>Unsharp Maskを試す</h3>
    <p className="vp-sharpen__description">ぼかしとの差分を元画像へ加え、輪郭を強調します。</p>
    <div className="vp-sharpen__previews">
      <Preview kind="before" label="01 / 元画像" detail="輪郭・模様" pixels={original} />
      <Preview kind={intermediate} label={intermediate === 'blurred' ? '02 / ぼかした画像' : '02 / 差分（輪郭成分）'}
        detail={intermediate === 'blurred' ? '差分を取る参照画像' : '中間灰色=差分0、白黒=正負の差分'}
        pixels={intermediate === 'blurred' ? blurred : residual} />
      <Preview kind="after" label="03 / シャープ化" detail="輪郭の明暗差を増幅" pixels={output} />
    </div>
    <p className="vp-sharpen__hint">強さを0にすると元画像に戻ります。強くすると輪郭の白黒の縁（ハロー）や模様の強調が目立ちます。中間画像を「差分」に切り替えると、128の灰色を基準として輪郭の明暗差を観察できます。</p>
    <p className="vp-sharpen__metric">処理で新たに8-bit下限（0）／上限（255）に達した画素：<strong>{limits.black.toLocaleString('ja-JP')} / {limits.white.toLocaleString('ja-JP')}</strong>。端値到達の目安で、復元された細部の量ではありません。</p>
    <div className="vp-sharpen__controls">
      <label className="vp-sharpen__control">
        <span>テスト画像</span>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="edges">輪郭と細線</option>
          <option value="texture">緩やかな濃淡と模様</option>
        </select>
      </label>
      <label className="vp-sharpen__control">
        <span>中間画像の表示</span>
        <select aria-label="中間画像の表示" value={intermediate} onChange={(e) => setIntermediate(e.target.value)}>
          <option value="blurred">ぼかし画像</option>
          <option value="residual">差分（輪郭成分）</option>
        </select>
      </label>
      <label className="vp-sharpen__control">
        <span>ぼかし幅（標準偏差） <output htmlFor={id + '-sigma'}>{sigma.toFixed(1)} px（σ）</output></span>
        <input id={id + '-sigma'} type="range" min="0" max="12" step="0.5"
          aria-label="ぼかし幅（標準偏差）" value={sigma} onChange={(e) => setSigma(Number(e.target.value))} />
      </label>
      <label className="vp-sharpen__control">
        <span>強さ <output htmlFor={id + '-amount'}>{amount.toFixed(2)} 倍</output></span>
        <input id={id + '-amount'} type="range" min="0" max="3" step="0.25"
          aria-label="強さ" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </label>
    </div>
    <div className="vp-sharpen__actions"><button type="button" onClick={reset}>初期値に戻す</button></div>
  </section>;
}
