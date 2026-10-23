import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {gaussianBlurGrayscale} from '../BlurPlayground/blur-core.mjs';
import {
  MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT, INITIAL_MEDIAN_SETTINGS,
  makeMedianTestPattern, addImpulseNoise, addGaussianNoise, medianFilterGrayscale, meanAbsoluteError, absoluteDifferenceGrayscale, countErrorChanges,
} from './median-core.mjs';
import './playground.css';

function MedianPreview({kind, title, detail, pixels}) {
  const canvas = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d', {alpha: false});
    if (!ctx) { setUnavailable(true); return; }
    const image = ctx.createImageData(MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const pos = i * 4;
      image.data[pos] = image.data[pos + 1] = image.data[pos + 2] = pixels[i];
      image.data[pos + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);

  return <figure className="vp-median__preview" data-vp-median-preview={kind}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={canvas} width={MEDIAN_PREVIEW_WIDTH} height={MEDIAN_PREVIEW_HEIGHT}
      role="img" aria-label={`${title}：8-bitグレースケールの比較画像`} />
    {unavailable && <p role="status">この環境ではCanvas 2Dを使用できません。比較画像を表示できません。</p>}
  </figure>;
}

export default function MedianPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL_MEDIAN_SETTINGS.source);
  const [noise, setNoise] = useState(INITIAL_MEDIAN_SETTINGS.noise);
  const [noiseMode, setNoiseMode] = useState('impulse');
  const [radius, setRadius] = useState(INITIAL_MEDIAN_SETTINGS.radius);
  const [seed, setSeed] = useState(INITIAL_MEDIAN_SETTINGS.seed);
  const [errorTarget, setErrorTarget] = useState('median');
  const clean = useMemo(() => makeMedianTestPattern(MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT, source), [source]);
  const noisy = useMemo(() => (noiseMode === 'impulse'
    ? addImpulseNoise(clean, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT, noise, seed)
    : addGaussianNoise(clean, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT, noise, seed)),
  [clean, noise, seed, noiseMode]);
  const median = useMemo(() => medianFilterGrayscale(noisy, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT, radius), [noisy, radius]);
  // Nearby Gaussian scale illustrates a distinct linear operation; it is not parameter-equivalent to a median.
  const sigma = radius * 0.85;
  const gaussian = useMemo(() => gaussianBlurGrayscale(noisy, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT, sigma), [noisy, sigma]);
  // These values use the intentionally known synthetic reference, not a blind denoising quality metric.
  const noisyMAE = useMemo(() => meanAbsoluteError(clean, noisy, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT), [clean, noisy]);
  const medianMAE = useMemo(() => meanAbsoluteError(clean, median, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT), [clean, median]);
  const gaussianMAE = useMemo(() => meanAbsoluteError(clean, gaussian, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT), [clean, gaussian]);
  // Pixel counts complement MAE: net average improvement can hide damaged fine detail.
  const medianChanges = useMemo(() => countErrorChanges(clean, noisy, median, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT), [clean, noisy, median]);
  const gaussianChanges = useMemo(() => countErrorChanges(clean, noisy, gaussian, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT), [clean, noisy, gaussian]);
  const percent = (count, total) => (100 * count / total).toFixed(1) + '%';
  const errorCandidate = errorTarget === 'median' ? median : gaussian;
  const errorMap = useMemo(() => absoluteDifferenceGrayscale(clean, errorCandidate, MEDIAN_PREVIEW_WIDTH, MEDIAN_PREVIEW_HEIGHT), [clean, errorCandidate]);
  const reset = () => {
    setSource(INITIAL_MEDIAN_SETTINGS.source);
    setNoise(INITIAL_MEDIAN_SETTINGS.noise);
    setNoiseMode('impulse');
    setRadius(INITIAL_MEDIAN_SETTINGS.radius);
    setSeed(INITIAL_MEDIAN_SETTINGS.seed);
    setErrorTarget('median');
  };

  return <section className="vp-median" data-vp-median="ready" data-vp-median-radius={radius} data-vp-median-seed={seed}
    data-vp-median-error-target={errorTarget} data-vp-median-noise-mode={noiseMode} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>メディアンフィルタを試す</h3>
    <p>中央値とGaussian Blurの違いを、塩胡椒ノイズと連続的な加法性ノイズで比べます。方式を変えると同じ「20」でも単位が異なります。</p>
    <div className="vp-median__previews">
      <MedianPreview kind="clean" title="01 / 参照画像" detail="ノイズなし（正解の見た目）" pixels={clean} />
      <MedianPreview kind="noisy" title="02 / ノイズあり" detail={`${noiseMode === 'impulse' ? `置換確率 ${noise}%` : `ノイズ σ = ${noise} 階調`}・配置 ${seed} の入力`} pixels={noisy} />
      <MedianPreview kind="median" title="03 / Median" detail={`${radius * 2 + 1} × ${radius * 2 + 1} の中央値`} pixels={median} />
      <MedianPreview kind="gaussian" title="04 / Gaussian" detail={`σ = ${sigma.toFixed(2)} px（対照）`} pixels={gaussian} />
      <MedianPreview kind="error" title="05 / 誤差マップ" detail={`参照画像との差（${errorTarget === 'median' ? 'Median' : 'Gaussian'}）`} pixels={errorMap} />
    </div>
    <p className="vp-median__mae" aria-live="polite" data-vp-median-mae>
      <strong>基準画像との差（MAE・0〜255）：</strong>
      ノイズあり {noisyMAE.toFixed(2)} ／ Median {medianMAE.toFixed(2)} ／ Gaussian {gaussianMAE.toFixed(2)}
    </p>
    <div className="vp-median__changes" data-vp-median-error-changes aria-label="処理前後の画素誤差の変化">
      <strong>ノイズ入力からの画素ごとの改善・悪化：</strong>
      <span>Median：改善 {percent(medianChanges.improved, medianChanges.total)} ／ 悪化 {percent(medianChanges.worsened, medianChanges.total)} ／ 同じ {percent(medianChanges.unchanged, medianChanges.total)}</span>
      <span>Gaussian：改善 {percent(gaussianChanges.improved, gaussianChanges.total)} ／ 悪化 {percent(gaussianChanges.worsened, gaussianChanges.total)} ／ 同じ {percent(gaussianChanges.unchanged, gaussianChanges.total)}</span>
    </div>
    <p className="vp-median__note">誤差マップは黒=一致、白=255の最大差です。参照画像が既知の場合だけ作れます。改善・悪化はノイズ入力に比べて各画素の絶対誤差が減ったか増えたかを数え、誤差が等しければ「同じ」です。MAEは既知のテスト画像との差の平均です。0が画素一致を意味しますが、見た目の良さや実写素材での性能を示す指標ではありません。MedianとGaussianは処理原理が違い、半径とσは等価な強さを表しません。細線は中央値で消えることがあります。ノイズ方式によって得意な処理が変わり、どちらが優れるかは画像や条件に依存します。</p>
    <div className="vp-median__controls">
      <label className="vp-median__control">
        <span>ノイズの方式</span>
        <select value={noiseMode} aria-label="ノイズの方式" onChange={event => setNoiseMode(event.target.value)}>
          <option value="impulse">塩胡椒ノイズ（画素の置換）</option>
          <option value="gaussian">加法性ガウスノイズ（画素値の揺れ）</option>
        </select>
      </label>
      <label className="vp-median__control">
        <span>誤差マップの対象</span>
        <select value={errorTarget} aria-label="誤差マップの対象" onChange={event => setErrorTarget(event.target.value)}>
          <option value="median">Median</option>
          <option value="gaussian">Gaussian</option>
        </select>
      </label>
      <label className="vp-median__control">
        <span>ノイズ配置（再現可能な乱数seed）</span>
        <select value={seed} aria-label="ノイズ配置" onChange={event => setSeed(Number(event.target.value))}>
          <option value={2026}>配置 A</option>
          <option value={2027}>配置 B</option>
          <option value={2028}>配置 C</option>
        </select>
      </label>
      <label className="vp-median__control">
        <span>テスト画像</span>
        <select value={source} aria-label="テスト画像" onChange={event => setSource(event.target.value)}>
          <option value="edges">垂直境界と四角形</option>
          <option value="thin-lines">細線と長方形</option>
        </select>
      </label>
      <label className="vp-median__control">
        <span>{noiseMode === 'impulse' ? '塩胡椒ノイズ（置換確率）' : '加法性ガウスノイズ（σ・階調）'} <output htmlFor={id + '-noise'}>{noise}{noiseMode === 'impulse' ? '%' : ' / 255'}</output></span>
        <input id={id + '-noise'} type="range" min="0" max="40" step="5" value={noise}
          aria-label={noiseMode === 'impulse' ? '塩胡椒ノイズ' : 'ガウスノイズの標準偏差'} onChange={event => setNoise(Number(event.target.value))} />
      </label>
      <label className="vp-median__control">
        <span>Medianの近傍半径 <output htmlFor={id + '-radius'}>{radius} px（{radius * 2 + 1} × {radius * 2 + 1}）</output></span>
        <input id={id + '-radius'} type="range" min="1" max="3" step="1" value={radius}
          aria-label="Medianの近傍半径" onChange={event => setRadius(Number(event.target.value))} />
      </label>
    </div>
    <div className="vp-median__actions"><button type="button" onClick={reset}>初期値に戻す</button></div>
  </section>;
}
