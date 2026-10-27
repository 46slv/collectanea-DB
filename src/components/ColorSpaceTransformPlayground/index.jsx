import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  CST_WIDTH, CST_HEIGHT, CST_DEFAULTS,
  makeCstPattern, renderCst, convertRgb,
} from './cst-core.mjs';
import './cst.css';

const SPACE_NAMES = {'srgb':'sRGB', 'display-p3':'Display P3'};

function Preview({kind, title, note, pixels, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const context = ref.current?.getContext('2d', {alpha: false});
    if (!context) return;
    const image = context.createImageData(CST_WIDTH, CST_HEIGHT);
    image.data.set(pixels);
    context.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-cst__preview" data-vp-cst-preview={kind}>
    <figcaption><strong>{title}</strong><span>{note}</span></figcaption>
    <div className="vp-cst__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={`${title}。拡大時は横スクロールできます。`}>
      <canvas ref={ref} width={CST_WIDTH} height={CST_HEIGHT}
        role="img" aria-label={`${title}：合成色の色空間変換実験`}
        style={{width: `${100 * zoom}%`}} />
    </div>
  </figure>;
}
function Triplet({label, values}) {
  return <span>{label}：R {values[0].toFixed(3)}、G {values[1].toFixed(3)}、B {values[2].toFixed(3)}</span>;
}

export default function ColorSpaceTransformPlayground() {
  const id = useId();
  const [source, setSource] = useState(CST_DEFAULTS.source);
  const [target, setTarget] = useState(CST_DEFAULTS.target);
  const [pattern, setPattern] = useState(CST_DEFAULTS.pattern);
  const [chroma, setChroma] = useState(CST_DEFAULTS.chroma);
  const [zoom, setZoom] = useState(CST_DEFAULTS.zoom);
  const input = useMemo(() => makeCstPattern(CST_WIDTH, CST_HEIGHT, pattern, chroma), [pattern, chroma]);
  const output = useMemo(() => renderCst(input, CST_WIDTH, CST_HEIGHT, source, target), [input, source, target]);
  const sample = useMemo(() => {
    const x = CST_WIDTH - 1;
    const y = pattern === 'bands' ? Math.floor(CST_HEIGHT / 12) : Math.floor(CST_HEIGHT / 2);
    const a = (y * CST_WIDTH + x) * 3;
    const rgb = Array.from(input.slice(a, a + 3));
    return {rgb, converted: convertRgb(rgb, source, target)};
  }, [input, source, target, pattern]);
  function reset() {
    setSource(CST_DEFAULTS.source);
    setTarget(CST_DEFAULTS.target);
    setPattern(CST_DEFAULTS.pattern);
    setChroma(CST_DEFAULTS.chroma);
    setZoom(CST_DEFAULTS.zoom);
  }
  return <section className="vp-cst" data-vp-cst="ready" data-vp-cst-source={source}
    data-vp-cst-target={target} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>同じRGB数値を別の色空間へ移すと何が変わる？</h3>
    <p className="vp-cst__intro">左はソースのRGB数値を誤ってsRGBとみなした表示例です。
      中央は色空間変換後の値を、出力色域でクリップしてsRGBへ再変換した表示用近似。
      右の赤は出力色空間で成分が0〜1からはみ出す画素です。</p>
    <div className="vp-cst__previews">
      <Preview kind="raw" title="01 / 数値を直表示（誤った扱い）" note="入力コードを無変換でsRGB扱い"
        pixels={output.raw} zoom={zoom} />
      <Preview kind="converted" title="02 / 色空間を解釈して表示" note="XYZ(D65)経由→出力色域クリップ→sRGBプレビュー"
        pixels={output.corrected} zoom={zoom} />
      <Preview kind="mask" title="03 / 出力色域外マスク" note="赤＝出力の線形RGBが範囲外"
        pixels={output.mask} zoom={zoom} />
    </div>
    <div className="vp-cst__readout" role="status" aria-live="polite">
      <p>出力色域外：<strong data-vp-cst-outside>{output.outside.toLocaleString('ja-JP')}</strong>
        ／{output.total.toLocaleString('ja-JP')}画素（{(100 * output.outside / output.total).toFixed(1)}%）</p>
      <p>代表画素（左上の帯の右端、または中央高さの右端）：</p>
      <div className="vp-cst__values">
        <Triplet label={`入力 ${SPACE_NAMES[source]} 符号化値`} values={sample.rgb} />
        <Triplet label={`変換後 ${SPACE_NAMES[target]} 符号化値（クリップ前）`} values={sample.converted} />
      </div>
    </div>
    <div className="vp-cst__controls">
      <label className="vp-cst__control"><span>入力色空間</span>
        <select aria-label="入力色空間" value={source} onChange={event => setSource(event.target.value)}>
          <option value="display-p3">Display P3（D65）</option><option value="srgb">sRGB（D65）</option>
        </select>
      </label>
      <label className="vp-cst__control"><span>出力色空間</span>
        <select aria-label="出力色空間" value={target} onChange={event => setTarget(event.target.value)}>
          <option value="srgb">sRGB（D65）</option><option value="display-p3">Display P3（D65）</option>
        </select>
      </label>
      <label className="vp-cst__control"><span>合成入力のパターン</span>
        <select aria-label="合成入力のパターン" value={pattern} onChange={event => setPattern(event.target.value)}>
          <option value="bands">6色の帯：右ほど色が強い</option>
          <option value="gradient">RGB混合グラデーション</option>
        </select>
      </label>
      <label className="vp-cst__control"><span>彩度方向の強さ <output htmlFor={id+'-chroma'}>{chroma.toFixed(2)}倍</output></span>
        <input id={id+'-chroma'} aria-label="彩度方向の強さ" type="range" min="0.2" max="1"
          step="0.1" value={chroma} onChange={event => setChroma(Number(event.target.value))} />
      </label>
      <label className="vp-cst__control"><span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom} onChange={event => setZoom(Number(event.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option><option value={4}>400%</option>
        </select>
      </label>
    </div>
    <button className="vp-cst__reset" type="button" onClick={reset}>初期値に戻す</button>
    <p className="vp-cst__hint">広色域P3の色をsRGB Canvasで忠実に再現する機能ではありません。
      クリップ後の8-bit表示用近似であり、ICC/OS色管理・知覚的ガマットマッピング・HDR・AE／Resolveとの数値一致は対象外です。</p>
  </section>;
}
