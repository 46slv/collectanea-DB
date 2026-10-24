import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  VIGNETTE_WIDTH, VIGNETTE_HEIGHT, VIGNETTE_INITIAL,
  makeVignettePattern, vignetteGrayscale,
} from './vignette-core.mjs';
import './playground.css';

function Preview({name, title, detail, pixels}) {
  const ref = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let context;
    try { context = ref.current?.getContext('2d', {alpha: false}); }
    catch { context = null; }
    if (!context) { setUnavailable(true); return; }
    const image = context.createImageData(VIGNETTE_WIDTH, VIGNETTE_HEIGHT);
    for (let i = 0; i < pixels.length; i++) {
      const j = i * 4;
      image.data[j] = image.data[j + 1] = image.data[j + 2] = pixels[i];
      image.data[j + 3] = 255;
    }
    context.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-vig__panel" data-vp-vig-preview={name}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={VIGNETTE_WIDTH} height={VIGNETTE_HEIGHT}
      role="img" aria-label={title + '：自動生成したグレースケール画像'} />
    {unavailable && <p role="status">この端末ではCanvasの描画を利用できません。</p>}
  </figure>;
}

export default function VignettePlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(VIGNETTE_INITIAL.pattern);
  const [strength, setStrength] = useState(VIGNETTE_INITIAL.strength);
  const [innerRadius, setInnerRadius] = useState(VIGNETTE_INITIAL.innerRadius);
  const [centerX, setCenterX] = useState(VIGNETTE_INITIAL.centerX);
  const source = useMemo(() =>
    makeVignettePattern(VIGNETTE_WIDTH, VIGNETTE_HEIGHT, pattern), [pattern]);
  const smooth = useMemo(() =>
    vignetteGrayscale(source, VIGNETTE_WIDTH, VIGNETTE_HEIGHT,
      {strength, innerRadius, centerX, falloff: 'smooth'}),
    [source, strength, innerRadius, centerX]);
  const quadratic = useMemo(() =>
    vignetteGrayscale(source, VIGNETTE_WIDTH, VIGNETTE_HEIGHT,
      {strength, innerRadius, centerX, falloff: 'quadratic'}),
    [source, strength, innerRadius, centerX]);
  const reset = () => {
    setPattern(VIGNETTE_INITIAL.pattern);
    setStrength(VIGNETTE_INITIAL.strength);
    setInnerRadius(VIGNETTE_INITIAL.innerRadius);
    setCenterX(VIGNETTE_INITIAL.centerX);
  };
  return <section className="vp-vig" data-vp-vignette="ready"
    data-vp-vig-strength={strength} data-vp-vig-center={centerX}
    aria-labelledby={id + '-heading'}>
    <h3 id={id + '-heading'}>中心と減衰の形を変えて比較</h3>
    <p>周辺の暗さは同じでも、中心から暗くなり始める位置と暗さの変化を比較できます。</p>
    <div className="vp-vig__previews">
      <Preview name="before" title="01 / 元画像" detail="加工なし" pixels={source} />
      <Preview name="smooth" title="02 / 滑らかな減衰"
        detail="smoothstep・中心／外周の傾き0" pixels={smooth} />
      <Preview name="quadratic" title="03 / 二乗減衰"
        detail="t²・外側で強く暗くなる" pixels={quadratic} />
    </div>
    <p className="vp-vig__note">
      暗くならない中心域から外周までの移行を比較します。
      横位置を動かすと、暗さの中心も移動します。
    </p>
    <div className="vp-vig__controls">
      <label><span>テスト画像</span>
        <select aria-label="テスト画像" value={pattern}
          onChange={event => setPattern(event.target.value)}>
          <option value="grid">格子と中央光点</option>
          <option value="gradient">横方向グラデーション</option>
        </select>
      </label>
      <label><span>暗さの強さ：<output htmlFor={id + '-strength'}>{strength}%</output></span>
        <input id={id + '-strength'} type="range" aria-label="暗さの強さ"
          min="0" max="100" step="5" value={strength}
          onChange={event => setStrength(Number(event.target.value))} />
      </label>
      <label><span>中心の保護範囲：<output htmlFor={id + '-inner'}>{innerRadius}%</output></span>
        <input id={id + '-inner'} type="range" aria-label="中心の保護範囲"
          min="0" max="80" step="5" value={innerRadius}
          onChange={event => setInnerRadius(Number(event.target.value))} />
      </label>
      <label><span>中心の横位置：<output htmlFor={id + '-center'}>{centerX}%</output></span>
        <input id={id + '-center'} type="range" aria-label="中心の横位置"
          min="20" max="80" step="5" value={centerX}
          onChange={event => setCenterX(Number(event.target.value))} />
      </label>
    </div>
    <button className="vp-vig__reset" type="button" onClick={reset}>初期値に戻す</button>
  </section>;
}
