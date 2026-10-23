import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  BLOOM_PREVIEW_WIDTH, BLOOM_PREVIEW_HEIGHT, INITIAL_BLOOM_SETTINGS,
  makeBloomTestPattern, bloomGrayscale, compositeBloomGrayscale, countNewBloomEndpoints,
} from './bloom-core.mjs';
import './playground.css';

function BloomPreview({kind, title, detail, pixels}) {
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
    const image = ctx.createImageData(BLOOM_PREVIEW_WIDTH, BLOOM_PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const offset = i * 4;
      image.data[offset] = pixels[i];
      image.data[offset + 1] = pixels[i];
      image.data[offset + 2] = pixels[i];
      image.data[offset + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);

  return <figure className="vp-bloom__preview" data-vp-bloom-preview={kind}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={BLOOM_PREVIEW_WIDTH} height={BLOOM_PREVIEW_HEIGHT}
      role="img" aria-label={title + '：白黒の明るい図形によるBloom実験'} />
    {unsupported && <p className="vp-bloom__fallback" role="status">このブラウザではCanvas 2Dが利用できないため、比較画像を表示できません。</p>}
  </figure>;
}

export default function BloomPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL_BLOOM_SETTINGS.source);
  const [intermediate, setIntermediate] = useState('spread');
  const [threshold, setThreshold] = useState(INITIAL_BLOOM_SETTINGS.threshold);
  const [softKnee, setSoftKnee] = useState(INITIAL_BLOOM_SETTINGS.softKnee);
  const [sigma, setSigma] = useState(INITIAL_BLOOM_SETTINGS.sigma);
  const [strength, setStrength] = useState(INITIAL_BLOOM_SETTINGS.strength);
  const before = useMemo(() => makeBloomTestPattern(BLOOM_PREVIEW_WIDTH, BLOOM_PREVIEW_HEIGHT, source), [source]);
  // Gaussian spread is costly; changing only composite strength must not run it again.
  const layers = useMemo(() => bloomGrayscale(before, BLOOM_PREVIEW_WIDTH, BLOOM_PREVIEW_HEIGHT,
    {threshold, softKnee, sigma, strength: 0}), [before, threshold, softKnee, sigma]);
  const result = useMemo(() => compositeBloomGrayscale(before, layers.spread, strength),
    [before, layers.spread, strength]);
  // Count newly saturated highlight pixels; existing 255 values are not caused by the effect.
  const saturatedPixels = useMemo(() => countNewBloomEndpoints(before, result), [before, result]);

  const reset = () => {
    setSource(INITIAL_BLOOM_SETTINGS.source);
    setIntermediate('spread');
    setThreshold(INITIAL_BLOOM_SETTINGS.threshold);
    setSoftKnee(INITIAL_BLOOM_SETTINGS.softKnee);
    setSigma(INITIAL_BLOOM_SETTINGS.sigma);
    setStrength(INITIAL_BLOOM_SETTINGS.strength);
  };

  return <section className="vp-bloom" data-vp-bloom="ready" data-vp-bloom-sigma={sigma}
    data-vp-bloom-strength={strength} data-vp-bloom-soft-knee={softKnee} aria-labelledby={id + '-title'}>
    <div className="vp-bloom__heading">
      <h3 id={id + '-title'}>Bloomを試す</h3>
      <p>明るい部分を抽出し、境界を調整して広げ、元画像へ足します。</p>
    </div>
    <div className="vp-bloom__previews">
      <BloomPreview kind="before" title="01 / 元画像" detail="発光のない状態" pixels={before} />
      <BloomPreview kind={intermediate}
        title={intermediate === 'highlights' ? '02 / 抽出した明部' : '02 / ぼけた明部'}
        detail={intermediate === 'highlights' ? '閾値・境界幅を適用した直後（ぼかし前）' : '抽出した明部をGaussian Blurで拡散'}
        pixels={intermediate === 'highlights' ? layers.highlights : layers.spread} />
      <BloomPreview kind="after" title="03 / Bloom合成" detail="元画像 + ぼけた明部" pixels={result} />
    </div>
    <p className="vp-bloom__hint">合成強度を0にすると元画像に戻ります。中間画像を「明部抽出」にすると、閾値と境界幅の効果だけを確認できます。「ぼかした明部」にすると、ぼかし幅による広がりが分かります。</p>
    <p className="vp-bloom__metric">新たに8-bit上限（255）に達した画素：<strong>{saturatedPixels.toLocaleString('ja-JP')}</strong> / {result.length.toLocaleString('ja-JP')}（{(100 * saturatedPixels / result.length).toFixed(2)}%）。上限到達の目安であり、光量の計測ではありません。</p>
    <div className="vp-bloom__controls">
      <label className="vp-bloom__control">
        <span>テスト画像</span>
        <select aria-label="テスト画像" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="lights">光点・光線</option>
          <option value="frame">光る枠・細線</option>
          <option value="gradient">光量グラデーション（閾値の観察）</option>
        </select>
      </label>
      <label className="vp-bloom__control">
        <span>中間画像の表示</span>
        <select aria-label="中間画像の表示" value={intermediate} onChange={(e) => setIntermediate(e.target.value)}>
          <option value="spread">ぼかした明部</option>
          <option value="highlights">明部抽出（ぼかし前）</option>
        </select>
      </label>
      <label className="vp-bloom__control">
        <span>明るさの閾値 <output htmlFor={id + '-threshold'}>{threshold} / 255</output></span>
        <input id={id + '-threshold'} type="range" min="64" max="240" step="2"
          aria-label="明るさの閾値" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
      </label>
      <label className="vp-bloom__control">
        <span>閾値の境界幅（Soft Knee） <output htmlFor={id + '-soft-knee'}>{softKnee} 階調</output></span>
        <input id={id + '-soft-knee'} type="range" min="0" max="96" step="8"
          aria-label="閾値の境界幅（Soft Knee）" value={softKnee} onChange={(e) => setSoftKnee(Number(e.target.value))} />
      </label>
      <label className="vp-bloom__control">
        <span>ぼかし幅 <output htmlFor={id + '-sigma'}>{sigma.toFixed(1)} px（σ）</output></span>
        <input id={id + '-sigma'} type="range" min="0" max="12" step="0.5"
          aria-label="ぼかし幅" value={sigma} onChange={(e) => setSigma(Number(e.target.value))} />
      </label>
      <label className="vp-bloom__control">
        <span>合成強度 <output htmlFor={id + '-strength'}>{strength.toFixed(2)} 倍</output></span>
        <input id={id + '-strength'} type="range" min="0" max="3" step="0.25"
          aria-label="合成強度" value={strength} onChange={(e) => setStrength(Number(e.target.value))} />
      </label>
    </div>
    <div className="vp-bloom__actions">
      <button type="button" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
