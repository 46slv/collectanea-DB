import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  SOBEL_PREVIEW_WIDTH, SOBEL_PREVIEW_HEIGHT, INITIAL_SOBEL_SETTINGS,
  makeSobelTestPattern, sobelEdgesGrayscale,
} from './sobel-core.mjs';
import './playground.css';

function SobelPreview({kind, title, detail, pixels}) {
  const canvasRef = useRef(null);
  const [canvasUnavailable, setCanvasUnavailable] = useState(false);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d', {alpha: false});
    if (!ctx) {
      setCanvasUnavailable(true);
      return;
    }
    const image = ctx.createImageData(SOBEL_PREVIEW_WIDTH, SOBEL_PREVIEW_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const offset = i * 4;
      image.data[offset] = image.data[offset + 1] = image.data[offset + 2] = pixels[i];
      image.data[offset + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);

  return <figure className="vp-sobel__preview" data-vp-sobel-preview={kind}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={canvasRef} width={SOBEL_PREVIEW_WIDTH} height={SOBEL_PREVIEW_HEIGHT}
      role="img" aria-label={title + '：Sobel輪郭抽出の白黒実験画像'} />
    {canvasUnavailable && <p role="status" className="vp-sobel__fallback">
      この環境ではCanvas 2Dを使用できません。比較画像は表示できません。
    </p>}
  </figure>;
}

export default function SobelPlayground() {
  const id = useId();
  const [source, setSource] = useState(INITIAL_SOBEL_SETTINGS.source);
  const [component, setComponent] = useState('magnitude');
  const [gain, setGain] = useState(INITIAL_SOBEL_SETTINGS.gain);
  const [threshold, setThreshold] = useState(INITIAL_SOBEL_SETTINGS.threshold);
  const before = useMemo(() => makeSobelTestPattern(SOBEL_PREVIEW_WIDTH, SOBEL_PREVIEW_HEIGHT, source), [source]);
  const {magnitude, gradientX, gradientY, signedGradientX, signedGradientY, edges, edgeCount} = useMemo(() => sobelEdgesGrayscale(
    before, SOBEL_PREVIEW_WIDTH, SOBEL_PREVIEW_HEIGHT, {gain, threshold}), [before, gain, threshold]);
  const reset = () => {
    setSource(INITIAL_SOBEL_SETTINGS.source);
    setComponent('magnitude');
    setGain(INITIAL_SOBEL_SETTINGS.gain);
    setThreshold(INITIAL_SOBEL_SETTINGS.threshold);
  };

  return <section className="vp-sobel" data-vp-sobel="ready" data-vp-sobel-gain={gain}
    data-vp-sobel-threshold={threshold} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>Sobel輪郭抽出を試す</h3>
    <p>近傍の明るさの変化を数値化します。線だけの画像は元の写真の復元ではありません。</p>
    <div className="vp-sobel__previews">
      <SobelPreview kind="before" title="01 / 元画像" detail="入力の濃淡" pixels={before} />
      <SobelPreview kind={component} title={component.startsWith('signed-') ? '02 / 勾配の符号' : '02 / 勾配の強さ'}
        detail={component === 'magnitude' ? '縦横の変化を合成' : component === 'x' ? '横方向の変化 |Gx|'
          : component === 'y' ? '縦方向の変化 |Gy|' : component === 'signed-x'
            ? 'Gx：暗 ＝ 負、128 ＝ 変化なし、明 ＝ 正'
            : 'Gy：暗 ＝ 負、128 ＝ 変化なし、明 ＝ 正'}
        pixels={component === 'x' ? gradientX : component === 'y' ? gradientY
          : component === 'signed-x' ? signedGradientX : component === 'signed-y' ? signedGradientY : magnitude} />
      <SobelPreview kind="edges" title="03 / 抽出した輪郭" detail="閾値未満の勾配は黒" pixels={edges} />
    </div>
    <p className="vp-sobel__metric">出力で明るさが残った画素：<strong>{edgeCount.toLocaleString('ja-JP')}</strong> / {edges.length.toLocaleString('ja-JP')}。線の長さや物理的な輪郭数ではありません。</p>
    <div className="vp-sobel__controls">
      <label className="vp-sobel__control">
        <span>中間プレビューの表示</span>
        <select aria-label="中間プレビューの表示" value={component} onChange={(e) => setComponent(e.target.value)}>
          <option value="magnitude">縦横の変化を合成</option>
          <option value="x">横方向の変化 |Gx|</option>
          <option value="y">縦方向の変化 |Gy|</option>
          <option value="signed-x">横方向の変化 Gx（符号あり）</option>
          <option value="signed-y">縦方向の変化 Gy（符号あり）</option>
        </select>
      </label>
      <label className="vp-sobel__control">
        <span>テスト画像</span>
        <select aria-label="テスト画像" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="edge">垂直境界と図形</option>
          <option value="diagonal">斜め境界</option>
          <option value="texture">細かい模様と四角</option>
        </select>
      </label>
      <label className="vp-sobel__control">
        <span>勾配の強調 <output htmlFor={id + '-gain'}>{gain.toFixed(2)} 倍</output></span>
        <input id={id + '-gain'} type="range" min="0.25" max="4" step="0.25" value={gain}
          aria-label="勾配の強調" onChange={(e) => setGain(Number(e.target.value))} />
      </label>
      <label className="vp-sobel__control">
        <span>輪郭の閾値 <output htmlFor={id + '-threshold'}>{threshold} / 255</output></span>
        <input id={id + '-threshold'} type="range" min="0" max="255" step="5" value={threshold}
          aria-label="輪郭の閾値" onChange={(e) => setThreshold(Number(e.target.value))} />
      </label>
    </div>
    <div className="vp-sobel__actions"><button type="button" onClick={reset}>初期値に戻す</button></div>
  </section>;
}
