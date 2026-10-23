import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  BLUR_PREVIEW_WIDTH, BLUR_PREVIEW_HEIGHT, INITIAL_BLUR_SETTINGS,
  makeBlurTestPattern, gaussianBlurGrayscale,
} from './blur-core.mjs';
import './playground.css';

function BlurPreview({kind, label, detail, pixels}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', {alpha: false});
    if (!context) return;
    const image = context.createImageData(BLUR_PREVIEW_WIDTH, BLUR_PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const offset = i * 4;
      image.data[offset] = pixels[i];
      image.data[offset + 1] = pixels[i];
      image.data[offset + 2] = pixels[i];
      image.data[offset + 3] = 255;
    }
    context.putImageData(image, 0, 0);
  }, [pixels]);

  return <figure className="vp-blur__preview" data-vp-blur-preview={kind}>
    <figcaption><strong>{label}</strong><span>{detail}</span></figcaption>
    <canvas ref={canvasRef} width={BLUR_PREVIEW_WIDTH} height={BLUR_PREVIEW_HEIGHT}
      role="img" aria-label={label + '：白黒のテストパターン'} />
  </figure>;
}

export default function BlurPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL_BLUR_SETTINGS.source);
  const [sigma, setSigma] = useState(INITIAL_BLUR_SETTINGS.sigma);
  const input = useMemo(
    () => makeBlurTestPattern(BLUR_PREVIEW_WIDTH, BLUR_PREVIEW_HEIGHT, source), [source]);
  const output = useMemo(
    () => gaussianBlurGrayscale(input, BLUR_PREVIEW_WIDTH, BLUR_PREVIEW_HEIGHT, sigma), [input, sigma]);

  const reset = () => {
    setSource(INITIAL_BLUR_SETTINGS.source);
    setSigma(INITIAL_BLUR_SETTINGS.sigma);
  };

  return <section className="vp-blur" data-vp-blur="ready" data-vp-sigma={sigma}
    aria-labelledby={id + '-title'}>
    <div className="vp-blur__heading">
      <h3 id={id + '-title'}>ガウシアンブラーを試す</h3>
      <p>同じ画像の輪郭や細い線が、ぼかし幅によってどう変わるか比較します。</p>
    </div>
    <div className="vp-blur__previews">
      <BlurPreview kind="before" label="01 / 元画像" detail="ぼかしなし" pixels={input} />
      <BlurPreview kind="after" label="02 / ガウシアンブラー" detail={'σ ' + sigma.toFixed(1) + ' px'} pixels={output} />
    </div>
    <p className="vp-blur__hint">σが0なら元画像と同じです。値を上げると、鋭い境界は広い範囲へなだらかに変わります。</p>
    <div className="vp-blur__controls">
      <label className="vp-blur__control">
        <span>テスト画像</span>
        <select value={source} onChange={(event) => setSource(event.target.value)} aria-label="テスト画像">
          <option value="edges">輪郭と細い線</option>
          <option value="lights">明るい点と細い光線</option>
        </select>
      </label>
      <label className="vp-blur__control">
        <span>ぼかし幅 <output htmlFor={id + '-sigma'}>{sigma.toFixed(1)} px（σ）</output></span>
        <input type="range" id={id + '-sigma'} aria-label="ぼかし幅" min="0" max="12" step="0.5"
          value={sigma} onChange={(event) => setSigma(Number(event.target.value))} />
      </label>
    </div>
    <div className="vp-blur__actions">
      <button type="button" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
