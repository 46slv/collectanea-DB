import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  EMBOSS_WIDTH, EMBOSS_HEIGHT, EMBOSS_INITIAL, makeEmbossPattern,
  computeEmbossRelief, visualizeEmbossRelief, renderEmboss,
} from './emboss-core.mjs';
import './playground.css';

function EmbossPreview({kind, title, detail, pixels}) {
  const ref = useRef(null);
  const [unsupported, setUnsupported] = useState(false);
  useEffect(() => {
    let ctx;
    try { ctx = ref.current?.getContext('2d', {alpha: false}); } catch { ctx = null; }
    if (!ctx) { setUnsupported(true); return; }
    const image = ctx.createImageData(EMBOSS_WIDTH, EMBOSS_HEIGHT);
    for (let i = 0; i < pixels.length / 3; i += 1) {
      const rgb = i * 3, rgba = i * 4;
      image.data[rgba] = pixels[rgb];
      image.data[rgba + 1] = pixels[rgb + 1];
      image.data[rgba + 2] = pixels[rgb + 2];
      image.data[rgba + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-emboss__preview" data-vp-emboss-preview={kind}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={EMBOSS_WIDTH} height={EMBOSS_HEIGHT} role="img"
      aria-label={title + '：方向の違いによる輪郭の陰影を比較する画像'} />
    {unsupported && <p role="status">このブラウザではCanvas 2Dを利用できないため、比較画像を表示できません。</p>}
  </figure>;
}

export default function EmbossPlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(EMBOSS_INITIAL.pattern);
  const [direction, setDirection] = useState(EMBOSS_INITIAL.direction);
  const [radius, setRadius] = useState(EMBOSS_INITIAL.radius);
  const [strength, setStrength] = useState(EMBOSS_INITIAL.strength);
  const [texture, setTexture] = useState(EMBOSS_INITIAL.texture);
  const before = useMemo(() => makeEmbossPattern(EMBOSS_WIDTH, EMBOSS_HEIGHT, pattern), [pattern]);
  const relief = useMemo(() => computeEmbossRelief(before, EMBOSS_WIDTH, EMBOSS_HEIGHT,
    {direction, radius}), [before, direction, radius]);
  const middle = useMemo(() => visualizeEmbossRelief(relief), [relief]);
  const after = useMemo(() => renderEmboss(before, EMBOSS_WIDTH, EMBOSS_HEIGHT, relief,
    {strength, texture}), [before, relief, strength, texture]);
  const reset = () => {
    setPattern(EMBOSS_INITIAL.pattern);
    setDirection(EMBOSS_INITIAL.direction);
    setRadius(EMBOSS_INITIAL.radius);
    setStrength(EMBOSS_INITIAL.strength);
    setTexture(EMBOSS_INITIAL.texture);
  };
  return <section className="vp-emboss" data-vp-emboss="ready" aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>画素差の向きから浮き彫り風の陰影を作る</h3>
    <p>差分方向を反転すると、明暗が入れ替わります。中央は差分の符号を中間灰色128で表しています。</p>
    <div className="vp-emboss__previews">
      <EmbossPreview kind="before" title="01 / 元画像" detail="輪郭と平らな領域" pixels={before} />
      <EmbossPreview kind="relief" title="02 / 方向付き差分" detail="128が差0、明暗は差の符号" pixels={middle} />
      <EmbossPreview kind="after" title="03 / エンボス" detail="方向差分 + 元の階調" pixels={after} />
    </div>
    <p className="vp-emboss__hint">陰影強度と「元の階調」をともに0にすると均一な中間灰色になります。距離は画素単位の差分比較位置です。</p>
    <div className="vp-emboss__controls">
      <label><span>テスト画像</span>
        <select aria-label="テスト画像" value={pattern} onChange={e => setPattern(e.target.value)}>
          <option value="blocks">階段と矩形</option>
          <option value="rings">同心円</option>
        </select>
      </label>
      <label><span>差分方向</span>
        <select aria-label="差分方向" value={direction} onChange={e => setDirection(e.target.value)}>
          <option value="right">右</option>
          <option value="left">左</option>
          <option value="down">下</option>
          <option value="up">上</option>
        </select>
      </label>
      <label><span>差分の距離 <output htmlFor={id + '-radius'}>{radius} px</output></span>
        <input id={id + '-radius'} type="range" min="1" max="5" step="1"
          aria-label="差分の距離" value={radius} onChange={e => setRadius(Number(e.target.value))} />
      </label>
      <label><span>陰影強度 <output htmlFor={id + '-strength'}>{strength.toFixed(2)} 倍</output></span>
        <input id={id + '-strength'} type="range" min="0" max="3" step="0.25"
          aria-label="陰影強度" value={strength} onChange={e => setStrength(Number(e.target.value))} />
      </label>
      <label><span>元の階調 <output htmlFor={id + '-texture'}>{texture.toFixed(2)} 倍</output></span>
        <input id={id + '-texture'} type="range" min="0" max="0.5" step="0.05"
          aria-label="元の階調" value={texture} onChange={e => setTexture(Number(e.target.value))} />
      </label>
    </div>
    <button className="vp-emboss__reset" type="button" onClick={reset}>初期値に戻す</button>
  </section>;
}
