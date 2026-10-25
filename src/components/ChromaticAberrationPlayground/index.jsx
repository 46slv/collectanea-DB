import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  CHROMA_WIDTH, CHROMA_HEIGHT, CHROMA_INITIAL,
  makeChromaticPattern, shiftChromaticChannels,
} from './chromatic-core.mjs';
import './playground.css';

function Preview({name, title, detail, pixels}) {
  const ref = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let context;
    try { context = ref.current?.getContext('2d', {alpha: false}); }
    catch { context = null; }
    if (!context) { setUnavailable(true); return; }
    const image = context.createImageData(CHROMA_WIDTH, CHROMA_HEIGHT);
    image.data.set(pixels);
    context.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-ca__panel" data-vp-ca-panel={name}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={CHROMA_WIDTH} height={CHROMA_HEIGHT} role="img"
      aria-label={title + '：自動生成した高コントラスト画像'} />
    {unavailable && <p role="status">この端末ではCanvasの描画を利用できません。</p>}
  </figure>;
}

export default function ChromaticAberrationPlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(CHROMA_INITIAL.pattern);
  const [shift, setShift] = useState(CHROMA_INITIAL.shift);
  const [centerX, setCenterX] = useState(CHROMA_INITIAL.centerX);
  const source = useMemo(() =>
    makeChromaticPattern(CHROMA_WIDTH, CHROMA_HEIGHT, pattern), [pattern]);
  const before = useMemo(() =>
    shiftChromaticChannels(source, CHROMA_WIDTH, CHROMA_HEIGHT, {shift: 0}), [source]);
  const radial = useMemo(() =>
    shiftChromaticChannels(source, CHROMA_WIDTH, CHROMA_HEIGHT, {shift, centerX, mode: 'radial'}),
    [source, shift, centerX]);
  const horizontal = useMemo(() =>
    shiftChromaticChannels(source, CHROMA_WIDTH, CHROMA_HEIGHT, {shift, mode: 'horizontal'}),
    [source, shift]);
  const reset = () => {
    setPattern(CHROMA_INITIAL.pattern);
    setShift(CHROMA_INITIAL.shift);
    setCenterX(CHROMA_INITIAL.centerX);
  };
  return <section className="vp-ca" data-vp-chromatic="ready"
    data-vp-ca-shift={shift} data-vp-ca-center={centerX}
    aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>画面の外側と内側で色ずれを比べる</h3>
    <p>同じ白黒画像からRGBをずらし、赤・青の縁が出る位置を観察します。</p>
    <div className="vp-ca__previews">
      <Preview name="before" title="01 / 元画像" detail="RGBの位置が同じ" pixels={before} />
      <Preview name="radial" title="02 / 放射方向の色ずれ" detail="中心では0・隅ほど強い" pixels={radial} />
      <Preview name="horizontal" title="03 / 水平方向の色ずれ" detail="画面全体で一定量" pixels={horizontal} />
    </div>
    <p className="vp-ca__note">放射方向モデルは横中心の移動に追従します。水平方向のモデルには中心位置が影響しません。</p>
    <div className="vp-ca__controls">
      <label><span>テスト画像</span>
        <select aria-label="テスト画像" value={pattern}
          onChange={event => setPattern(event.target.value)}>
          <option value="grid">格子と中央光点</option>
          <option value="bars">明暗の縦境界と横線</option>
        </select>
      </label>
      <label><span>各色チャンネルの最大ずれ量：<output htmlFor={id + '-shift'}>{shift} px</output></span>
        <input id={id + '-shift'} type="range" min="0" max="12" step="1"
          aria-label="各色チャンネルの最大ずれ量" value={shift}
          onChange={event => setShift(Number(event.target.value))} />
      </label>
      <label><span>放射方向の横中心：<output htmlFor={id + '-center'}>{centerX}%</output></span>
        <input id={id + '-center'} type="range" min="20" max="80" step="5"
          aria-label="放射方向の横中心" value={centerX}
          onChange={event => setCenterX(Number(event.target.value))} />
      </label>
    </div>
    <button type="button" className="vp-ca__reset" onClick={reset}>初期値に戻す</button>
  </section>;
}
