import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {gaussianBlurGrayscale} from '../BlurPlayground/blur-core.mjs';
import {
  BOX_WIDTH, BOX_HEIGHT, BOX_INITIAL, makeBlurTestPattern,
  boxBlurGrayscale, equivalentGaussianSigma,
} from './box-core.mjs';
import './playground.css';

function Preview({name, title, subtitle, pixels}) {
  const ref = useRef(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    let context;
    try { context = ref.current?.getContext('2d', {alpha: false}); }
    catch { context = null; }
    if (!context) { setFallback(true); return; }
    const picture = context.createImageData(BOX_WIDTH, BOX_HEIGHT);
    for (let i = 0; i < pixels.length; i++) {
      const offset = i * 4;
      picture.data[offset] = picture.data[offset + 1] = picture.data[offset + 2] = pixels[i];
      picture.data[offset + 3] = 255;
    }
    context.putImageData(picture, 0, 0);
  }, [pixels]);
  return <figure className="vp-box__panel" data-vp-box-preview={name}>
    <figcaption><strong>{title}</strong><span>{subtitle}</span></figcaption>
    <canvas ref={ref} width={BOX_WIDTH} height={BOX_HEIGHT}
      role="img" aria-label={title + '：白黒の人工テスト画像'} />
    {fallback && <p role="status">この端末ではCanvas表示を利用できません。</p>}
  </figure>;
}

export default function BoxBlurPlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(BOX_INITIAL.pattern);
  const [radius, setRadius] = useState(BOX_INITIAL.radius);
  const source = useMemo(() => makeBlurTestPattern(BOX_WIDTH, BOX_HEIGHT, pattern), [pattern]);
  const sigma = equivalentGaussianSigma(radius);
  const box = useMemo(() => boxBlurGrayscale(source, BOX_WIDTH, BOX_HEIGHT, radius), [source, radius]);
  const gaussian = useMemo(
    () => gaussianBlurGrayscale(source, BOX_WIDTH, BOX_HEIGHT, sigma), [source, sigma]);
  const reset = () => { setPattern(BOX_INITIAL.pattern); setRadius(BOX_INITIAL.radius); };

  return <section className="vp-box" data-vp-box="ready" data-vp-box-radius={radius}
    aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>ボックスブラーとガウシアンブラーを比較</h3>
    <p>同じ入力で、均等な重みと中心ほど大きな重みを持つぼかしを比べます。</p>
    <div className="vp-box__previews">
      <Preview name="before" title="01 / 元画像" subtitle="加工なし" pixels={source} />
      <Preview name="box" title="02 / Box Blur"
        subtitle={radius === 0 ? '加工なし' : (2 * radius + 1) + '×' + (2 * radius + 1) + ' 一様平均'} pixels={box} />
      <Preview name="gaussian" title="03 / Gaussian Blur"
        subtitle={'比較用 σ ≈ ' + sigma.toFixed(2) + ' px'} pixels={gaussian} />
    </div>
    <p className="vp-box__note">Gaussianのσは離散Boxの分散に合わせた比較値です。輪郭の形が一致するという意味ではありません。半径0では両者とも加工なしです。</p>
    <div className="vp-box__controls">
      <label><span>テスト画像</span>
        <select aria-label="テスト画像" value={pattern} onChange={e => setPattern(e.target.value)}>
          <option value="edges">輪郭と細い線</option>
          <option value="lights">明るい点と細い光線</option>
        </select>
      </label>
      <label><span>Box半径：<output htmlFor={id + '-radius'}>{radius} px（{2 * radius + 1}×{2 * radius + 1}）</output></span>
        <input id={id + '-radius'} type="range" aria-label="Box半径" min="0" max="12" step="1"
          value={radius} onChange={e => setRadius(Number(e.target.value))} />
      </label>
    </div>
    <button className="vp-box__reset" type="button" onClick={reset}>初期値に戻す</button>
  </section>;
}
