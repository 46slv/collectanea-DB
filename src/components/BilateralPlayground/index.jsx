import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {gaussianBlurGrayscale} from '../BlurPlayground/blur-core.mjs';
import {
  BILATERAL_WIDTH, BILATERAL_HEIGHT, INITIAL_BILATERAL_SETTINGS,
  makeBilateralPattern, makeNoisyBilateralInput, bilateralFilterGrayscale, bilateralMeanAbsoluteError,
} from './bilateral-core.mjs';
import './playground.css';

function ComparisonCanvas({name, label, detail, pixels}) {
  const ref = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d', {alpha: false});
    if (!ctx) { setUnavailable(true); return; }
    const image = ctx.createImageData(BILATERAL_WIDTH, BILATERAL_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const j = i * 4;
      image.data[j] = image.data[j + 1] = image.data[j + 2] = pixels[i];
      image.data[j + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-bilateral__preview" data-vp-bilateral-preview={name}>
    <figcaption><strong>{label}</strong><span>{detail}</span></figcaption>
    <canvas width={BILATERAL_WIDTH} height={BILATERAL_HEIGHT} ref={ref}
      role="img" aria-label={`${label}：8-bitグレースケール画像`} />
    {unavailable && <p role="status">この環境ではCanvas描画を利用できません。</p>}
  </figure>;
}

export default function BilateralPlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(INITIAL_BILATERAL_SETTINGS.pattern);
  const [noise, setNoise] = useState(INITIAL_BILATERAL_SETTINGS.noise);
  const [spatialSigma, setSpatialSigma] = useState(INITIAL_BILATERAL_SETTINGS.spatialSigma);
  const [rangeSigma, setRangeSigma] = useState(INITIAL_BILATERAL_SETTINGS.rangeSigma);
  const clean = useMemo(() => makeBilateralPattern(BILATERAL_WIDTH, BILATERAL_HEIGHT, pattern), [pattern]);
  const noisy = useMemo(() => makeNoisyBilateralInput(clean, BILATERAL_WIDTH, BILATERAL_HEIGHT, noise), [clean, noise]);
  const gaussian = useMemo(() => gaussianBlurGrayscale(noisy, BILATERAL_WIDTH, BILATERAL_HEIGHT, spatialSigma), [noisy, spatialSigma]);
  const bilateral = useMemo(() => bilateralFilterGrayscale(noisy, BILATERAL_WIDTH, BILATERAL_HEIGHT, spatialSigma, rangeSigma), [noisy, spatialSigma, rangeSigma]);
  const maeNoisy = useMemo(() => bilateralMeanAbsoluteError(clean, noisy, BILATERAL_WIDTH, BILATERAL_HEIGHT), [clean, noisy]);
  const maeGaussian = useMemo(() => bilateralMeanAbsoluteError(clean, gaussian, BILATERAL_WIDTH, BILATERAL_HEIGHT), [clean, gaussian]);
  const maeBilateral = useMemo(() => bilateralMeanAbsoluteError(clean, bilateral, BILATERAL_WIDTH, BILATERAL_HEIGHT), [clean, bilateral]);
  const reset = () => {
    setPattern(INITIAL_BILATERAL_SETTINGS.pattern);
    setNoise(INITIAL_BILATERAL_SETTINGS.noise);
    setSpatialSigma(INITIAL_BILATERAL_SETTINGS.spatialSigma);
    setRangeSigma(INITIAL_BILATERAL_SETTINGS.rangeSigma);
  };
  return <section className="vp-bilateral" data-vp-bilateral="ready" data-vp-bilateral-range-sigma={rangeSigma}
    aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>Bilateral Filterを試す</h3>
    <p>空間的に近い画素と、明るさが似ている画素を優先して平均します。まず4枚の処理結果を比べ、その後で設定を変えてください。</p>
    <div className="vp-bilateral__previews">
      <ComparisonCanvas name="clean" label="01 / 参照画像" detail="人工のノイズなし画像" pixels={clean} />
      <ComparisonCanvas name="noisy" label="02 / ノイズ入力" detail={`加法性ガウスノイズ σ=${noise}階調`} pixels={noisy} />
      <ComparisonCanvas name="gaussian" label="03 / Gaussian Blur" detail={`空間σ=${spatialSigma.toFixed(1)}px の比較`} pixels={gaussian} />
      <ComparisonCanvas name="bilateral" label="04 / Bilateral" detail={`空間σ=${spatialSigma.toFixed(1)}px、輝度差σ=${rangeSigma}`} pixels={bilateral} />
    </div>
    <p className="vp-bilateral__mae" data-vp-bilateral-mae aria-live="polite">
      <strong>基準画像とのMAE：</strong>
      ノイズ入力 {maeNoisy.toFixed(2)} ／ Gaussian {maeGaussian.toFixed(2)} ／ Bilateral {maeBilateral.toFixed(2)}
    </p>
    <p className="vp-bilateral__note">MAEは正解を知っている人工画像と8-bit値との差であり、知覚画質や実素材の優劣は測れません。2方式の空間σは同じですが、Bilateralのみ輝度差σで境界を保つ重みが変わります。小さすぎる輝度差σはノイズまで境界と誤認して残しやすくなります。</p>
    <div className="vp-bilateral__controls">
      <label><span>テスト画像</span>
        <select aria-label="テスト画像" value={pattern} onChange={e => setPattern(e.target.value)}>
          <option value="boundary">明暗境界と矩形</option>
          <option value="gradient">階調と細線</option>
        </select>
      </label>
      <label><span>入力ノイズ：σ={noise} 階調</span>
        <input type="range" aria-label="入力ノイズ" min="0" max="35" step="5" value={noise}
          onChange={e => setNoise(Number(e.target.value))} />
      </label>
      <label><span>空間σ：{spatialSigma.toFixed(1)} px</span>
        <input type="range" aria-label="空間シグマ" min="0.5" max="4" step="0.5" value={spatialSigma}
          onChange={e => setSpatialSigma(Number(e.target.value))} />
      </label>
      <label><span>輝度差σ：{rangeSigma} 階調</span>
        <input type="range" aria-label="輝度差シグマ" min="10" max="100" step="10" value={rangeSigma}
          onChange={e => setRangeSigma(Number(e.target.value))} />
      </label>
    </div>
    <button className="vp-bilateral__reset" type="button" onClick={reset}>初期値に戻す</button>
  </section>;
}
