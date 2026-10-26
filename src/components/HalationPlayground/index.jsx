import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  HALATION_WIDTH, HALATION_HEIGHT, HALATION_INITIAL,
  makeHalationPattern, makeHalationSpread, tintHalationSpread, compositeHalation,
} from './halation-core.mjs';
import './playground.css';

function Preview({kind, title, detail, pixels}) {
  const ref = useRef(null);
  const [unsupported, setUnsupported] = useState(false);
  useEffect(() => {
    let ctx;
    try { ctx = ref.current?.getContext('2d', {alpha: false}); } catch { ctx = null; }
    if (!ctx) { setUnsupported(true); return; }
    const image = ctx.createImageData(HALATION_WIDTH, HALATION_HEIGHT);
    for (let i = 0; i < pixels.length / 3; i += 1) {
      const j = i * 3, k = i * 4;
      image.data[k] = pixels[j];
      image.data[k + 1] = pixels[j + 1];
      image.data[k + 2] = pixels[j + 2];
      image.data[k + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-halation__preview" data-vp-halation-preview={kind}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={HALATION_WIDTH} height={HALATION_HEIGHT} role="img"
      aria-label={title + '：明るい図形の周囲に色づいたにじみを観察する画像'} />
    {unsupported && <p role="status">このブラウザではCanvas 2Dを利用できないため、比較画像を表示できません。</p>}
  </figure>;
}

export default function HalationPlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(HALATION_INITIAL.pattern);
  const [threshold, setThreshold] = useState(HALATION_INITIAL.threshold);
  const [sigma, setSigma] = useState(HALATION_INITIAL.sigma);
  const [gain, setGain] = useState(HALATION_INITIAL.gain);
  const [redness, setRedness] = useState(HALATION_INITIAL.redness);
  const before = useMemo(() => makeHalationPattern(HALATION_WIDTH, HALATION_HEIGHT, pattern), [pattern]);
  // Only threshold, sigma and source recompute the Gaussian spread.
  const {spread} = useMemo(() => makeHalationSpread(before, HALATION_WIDTH, HALATION_HEIGHT,
    {threshold, sigma}), [before, threshold, sigma]);
  const tinted = useMemo(() => tintHalationSpread(spread, redness), [spread, redness]);
  const after = useMemo(() => compositeHalation(before, spread, gain, redness),
    [before, spread, gain, redness]);

  const reset = () => {
    setPattern(HALATION_INITIAL.pattern);
    setThreshold(HALATION_INITIAL.threshold);
    setSigma(HALATION_INITIAL.sigma);
    setGain(HALATION_INITIAL.gain);
    setRedness(HALATION_INITIAL.redness);
  };
  return <section className="vp-halation" data-vp-halation="ready"
    data-vp-halation-sigma={sigma} data-vp-halation-gain={gain}
    aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>明部の周辺に赤いにじみを重ねる</h3>
    <p>中間パネルは抽出・拡散した明部を色付けしたものです。最終パネルだけ元画像に加算します。</p>
    <div className="vp-halation__previews">
      <Preview kind="before" title="01 / 元画像" detail="暗背景と強い光源" pixels={before} />
      <Preview kind="spread" title="02 / にじみの層" detail="明部抽出 → Gaussian Blur → 色付け" pixels={tinted} />
      <Preview kind="after" title="03 / ハレーション風の結果" detail="元画像 + 色付きの拡散層" pixels={after} />
    </div>
    <p className="vp-halation__hint">合成強度0では元画像に戻ります。赤み0は中立色の光のにじみとなり、赤み1では赤系を強く残します。σ0では光の周辺に広がりません。</p>
    <div className="vp-halation__controls">
      <label><span>テスト画像</span>
        <select aria-label="テスト画像" value={pattern} onChange={e => setPattern(e.target.value)}>
          <option value="lamps">街灯と点光源</option>
          <option value="sign">光るフレームと線</option>
        </select>
      </label>
      <label><span>明部閾値 <output htmlFor={id + '-threshold'}>{threshold} / 255</output></span>
        <input id={id + '-threshold'} type="range" min="140" max="245" step="5"
          aria-label="明部閾値" value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
      </label>
      <label><span>ぼかし幅 <output htmlFor={id + '-sigma'}>σ {sigma.toFixed(1)} px</output></span>
        <input id={id + '-sigma'} type="range" min="0" max="12" step="0.5"
          aria-label="ぼかし幅" value={sigma} onChange={e => setSigma(Number(e.target.value))} />
      </label>
      <label><span>合成強度 <output htmlFor={id + '-gain'}>{gain.toFixed(2)} 倍</output></span>
        <input id={id + '-gain'} type="range" min="0" max="2.5" step="0.25"
          aria-label="合成強度" value={gain} onChange={e => setGain(Number(e.target.value))} />
      </label>
      <label><span>赤み <output htmlFor={id + '-redness'}>{Math.round(redness * 100)} %</output></span>
        <input id={id + '-redness'} type="range" min="0" max="1" step="0.25"
          aria-label="赤み" value={redness} onChange={e => setRedness(Number(e.target.value))} />
      </label>
    </div>
    <button type="button" className="vp-halation__reset" onClick={reset}>初期値に戻す</button>
  </section>;
}
