import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  BILATERAL_WIDTH, BILATERAL_HEIGHT, makeBilateralPattern,
  makeNoisyBilateralInput, bilateralMeanAbsoluteError,
} from '../BilateralPlayground/bilateral-core.mjs';
import {guidedFilterGrayscale} from './guided-core.mjs';
import './playground.css';

const INITIAL = Object.freeze({pattern: 'boundary', noise: 20, radius: 3, regularization: 20, guideMode: 'self'});

function ImagePanel({name, label, note, pixels}) {
  const canvas = useRef(null);
  const [unsupported, setUnsupported] = useState(false);
  useEffect(() => {
    let context;
    try { context = canvas.current?.getContext('2d', {alpha: false}); }
    catch { context = null; }
    if (!context) { setUnsupported(true); return; }
    const picture = context.createImageData(BILATERAL_WIDTH, BILATERAL_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const j = i * 4;
      picture.data[j] = picture.data[j + 1] = picture.data[j + 2] = pixels[i];
      picture.data[j + 3] = 255;
    }
    context.putImageData(picture, 0, 0);
  }, [pixels]);
  return <figure className="vp-guided__panel" data-vp-guided-preview={name}>
    <figcaption><strong>{label}</strong><span>{note}</span></figcaption>
    <canvas ref={canvas} width={BILATERAL_WIDTH} height={BILATERAL_HEIGHT}
      role="img" aria-label={label + '：8-bitグレースケールの人工画像'} />
    {unsupported && <p role="status">この端末ではCanvas表示を利用できません。</p>}
  </figure>;
}

export default function GuidedFilterPlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(INITIAL.pattern);
  const [noise, setNoise] = useState(INITIAL.noise);
  const [radius, setRadius] = useState(INITIAL.radius);
  const [regularization, setRegularization] = useState(INITIAL.regularization);
  const [guideMode, setGuideMode] = useState(INITIAL.guideMode);
  const clean = useMemo(() => makeBilateralPattern(BILATERAL_WIDTH, BILATERAL_HEIGHT, pattern), [pattern]);
  const noisy = useMemo(() => makeNoisyBilateralInput(clean, BILATERAL_WIDTH, BILATERAL_HEIGHT, noise), [clean, noise]);
  const guide = guideMode === 'ideal' ? clean : noisy;
  const filtered = useMemo(
    () => guidedFilterGrayscale(noisy, guide, BILATERAL_WIDTH, BILATERAL_HEIGHT, radius, regularization),
    [noisy, guide, radius, regularization],
  );
  const noisyMae = useMemo(
    () => bilateralMeanAbsoluteError(clean, noisy, BILATERAL_WIDTH, BILATERAL_HEIGHT), [clean, noisy],
  );
  const filteredMae = useMemo(
    () => bilateralMeanAbsoluteError(clean, filtered, BILATERAL_WIDTH, BILATERAL_HEIGHT), [clean, filtered],
  );
  const reset = () => {
    setPattern(INITIAL.pattern);
    setNoise(INITIAL.noise);
    setRadius(INITIAL.radius);
    setRegularization(INITIAL.regularization);
    setGuideMode(INITIAL.guideMode);
  };
  return <section className="vp-guided" data-vp-guided="ready"
    data-vp-guided-guide-mode={guideMode} data-vp-guided-radius={radius}
    aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>Guided Filterを試す</h3>
    <p>最初に4画面を比較します。右端の結果は「ガイド画像」の輪郭を参考にノイズ入力を平滑化したものです。</p>
    <div className="vp-guided__previews">
      <ImagePanel name="reference" label="01 / 正解画像" note="ノイズを加える前の人工画像" pixels={clean} />
      <ImagePanel name="source" label="02 / ノイズ入力" note={'加法性ノイズ σ=' + noise + '階調'} pixels={noisy} />
      <ImagePanel name="guide" label="03 / ガイド" note={guideMode === 'ideal' ? '正解画像（人工例のみ）' : 'ノイズ入力と同じ'} pixels={guide} />
      <ImagePanel name="output" label="04 / Guided結果" note={'半径' + radius + 'px、正則化' + regularization + '階調'} pixels={filtered} />
    </div>
    <p className="vp-guided__metric" data-vp-guided-mae aria-live="polite">
      <strong>正解画像とのMAE：</strong>入力 {noisyMae.toFixed(2)} ／ Guided {filteredMae.toFixed(2)}
    </p>
    <p className="vp-guided__note">MAEは人工の正解画像を知っている場合だけ測れる平均画素誤差です。「理想ガイド」は正解を特別に渡した比較条件で、通常の写真で正解を入手できることを意味しません。</p>
    <div className="vp-guided__controls">
      <label><span>画像パターン</span>
        <select aria-label="画像パターン" value={pattern} onChange={e => setPattern(e.target.value)}>
          <option value="boundary">明暗境界と矩形</option>
          <option value="gradient">階調と細線</option>
        </select>
      </label>
      <label><span>ガイドの種類</span>
        <select aria-label="ガイドの種類" value={guideMode} onChange={e => setGuideMode(e.target.value)}>
          <option value="self">自己ガイド（ノイズ入力）</option>
          <option value="ideal">理想ガイド（ノイズなし）</option>
        </select>
      </label>
      <label><span>入力ノイズ：σ={noise} 階調</span>
        <input type="range" aria-label="入力ノイズ" min="0" max="35" step="5"
          value={noise} onChange={e => setNoise(Number(e.target.value))} />
      </label>
      <label><span>近傍半径：{radius} px（{2 * radius + 1}×{2 * radius + 1}）</span>
        <input type="range" aria-label="近傍半径" min="1" max="6" step="1"
          value={radius} onChange={e => setRadius(Number(e.target.value))} />
      </label>
      <label><span>正則化の目安：{regularization} 階調</span>
        <input type="range" aria-label="正則化" min="5" max="75" step="5"
          value={regularization} onChange={e => setRegularization(Number(e.target.value))} />
      </label>
    </div>
    <button className="vp-guided__reset" type="button" onClick={reset}>初期値に戻す</button>
  </section>;
}
