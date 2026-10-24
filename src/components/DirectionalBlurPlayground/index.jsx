import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  DIRECTIONAL_WIDTH, DIRECTIONAL_HEIGHT, DIRECTIONAL_INITIAL,
  makeDirectionalPattern, directionalBlurGrayscale,
} from './directional-core.mjs';
import './playground.css';

function Preview({name, title, detail, pixels}) {
  const ref = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let ctx;
    try { ctx = ref.current?.getContext('2d', {alpha: false}); } catch { ctx = null; }
    if (!ctx) { setUnavailable(true); return; }
    const image = ctx.createImageData(DIRECTIONAL_WIDTH, DIRECTIONAL_HEIGHT);
    for (let i = 0; i < pixels.length; i++) {
      const o = i * 4;
      image.data[o] = image.data[o + 1] = image.data[o + 2] = pixels[i];
      image.data[o + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-dir__panel" data-vp-dir-preview={name}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={DIRECTIONAL_WIDTH} height={DIRECTIONAL_HEIGHT}
      role="img" aria-label={title + '：生成したグレースケール画像'} />
    {unavailable && <p role="status">この端末ではCanvasの描画を利用できません。</p>}
  </figure>;
}

export default function DirectionalBlurPlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(DIRECTIONAL_INITIAL.pattern);
  const [radius, setRadius] = useState(DIRECTIONAL_INITIAL.radius);
  const [angle, setAngle] = useState(DIRECTIONAL_INITIAL.angle);
  const otherAngle = (angle + 90) % 180;
  const source = useMemo(
    () => makeDirectionalPattern(DIRECTIONAL_WIDTH, DIRECTIONAL_HEIGHT, pattern), [pattern]);
  const aligned = useMemo(
    () => directionalBlurGrayscale(source, DIRECTIONAL_WIDTH, DIRECTIONAL_HEIGHT, radius, angle),
    [source, radius, angle]);
  const across = useMemo(
    () => directionalBlurGrayscale(source, DIRECTIONAL_WIDTH, DIRECTIONAL_HEIGHT, radius, otherAngle),
    [source, radius, otherAngle]);
  const reset = () => {
    setPattern(DIRECTIONAL_INITIAL.pattern);
    setRadius(DIRECTIONAL_INITIAL.radius);
    setAngle(DIRECTIONAL_INITIAL.angle);
  };

  return <section className="vp-dir" data-vp-dir="ready"
    data-vp-dir-radius={radius} data-vp-dir-angle={angle} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>方向を変えて線状のぼけを比較</h3>
    <p>同じ線の長さで方向を90°変えると、明るい点や細線の残り方が変わります。</p>
    <div className="vp-dir__previews">
      <Preview name="before" title="01 / 元画像" detail="加工なし" pixels={source} />
      <Preview name="along" title="02 / 指定方向"
        detail={angle + '°・' + (radius * 2 + 1) + 'サンプル'} pixels={aligned} />
      <Preview name="across" title="03 / 直交方向"
        detail={otherAngle + '°・' + (radius * 2 + 1) + 'サンプル'} pixels={across} />
    </div>
    <p className="vp-dir__note">0°は横方向、90°は縦方向です。長さ0 pxではどちらも元画像と一致します。斜め方向は画素間を補間して平均します。</p>
    <div className="vp-dir__controls">
      <label><span>テスト画像</span>
        <select aria-label="テスト画像" value={pattern} onChange={event => setPattern(event.target.value)}>
          <option value="lights">光点と縦線</option>
          <option value="edges">矩形と斜線</option>
        </select>
      </label>
      <label><span>方向：<output htmlFor={id + '-angle'}>{angle}°</output></span>
        <input id={id + '-angle'} type="range" aria-label="方向" min="0" max="180" step="15"
          value={angle} onChange={event => setAngle(Number(event.target.value))} />
      </label>
      <label><span>線の半径：<output htmlFor={id + '-radius'}>{radius} px</output></span>
        <input id={id + '-radius'} type="range" aria-label="線の半径" min="0" max="16" step="1"
          value={radius} onChange={event => setRadius(Number(event.target.value))} />
      </label>
    </div>
    <button className="vp-dir__reset" type="button" onClick={reset}>初期値に戻す</button>
  </section>;
}
