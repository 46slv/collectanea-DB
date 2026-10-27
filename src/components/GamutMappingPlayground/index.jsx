import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  GAMUT_WIDTH, GAMUT_HEIGHT, GAMUT_DEFAULTS,
  createGamutPattern, renderGamut, clipRgb, radialRgb,
} from './gamut-core.mjs';
import './gamut.css';

function Preview({kind, title, note, pixels, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const context = ref.current?.getContext('2d', {alpha: false});
    if (!context) return;
    const image = context.createImageData(GAMUT_WIDTH, GAMUT_HEIGHT);
    image.data.set(pixels);
    context.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-gamut__preview" data-vp-gamut-preview={kind}>
    <figcaption><strong>{title}</strong><span>{note}</span></figcaption>
    <div className="vp-gamut__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={title + '。拡大時は横スクロールできます。'}>
      <canvas ref={ref} width={GAMUT_WIDTH} height={GAMUT_HEIGHT}
        role="img" aria-label={title + '：合成RGBの色域実験'}
        style={{width: String(zoom * 100) + '%'}} />
    </div>
  </figure>;
}

function Values({label, rgb}) {
  return <span>{label}（R {rgb[0].toFixed(2)}, G {rgb[1].toFixed(2)}, B {rgb[2].toFixed(2)}）</span>;
}

export default function GamutMappingPlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(GAMUT_DEFAULTS.pattern);
  const [drive, setDrive] = useState(GAMUT_DEFAULTS.drive);
  const [anchor, setAnchor] = useState(GAMUT_DEFAULTS.anchor);
  const [zoom, setZoom] = useState(GAMUT_DEFAULTS.zoom);
  const input = useMemo(() => createGamutPattern(GAMUT_WIDTH, GAMUT_HEIGHT, pattern, drive),
    [pattern, drive]);
  const mapped = useMemo(() => renderGamut(input, GAMUT_WIDTH, GAMUT_HEIGHT, anchor),
    [input, anchor]);
  const sample = useMemo(() => {
    const x = GAMUT_WIDTH - 1;
    const y = pattern === 'bands' ? Math.floor(GAMUT_HEIGHT / 12) : Math.floor(GAMUT_HEIGHT * 7 / 8);
    const offset = (y * GAMUT_WIDTH + x) * 3;
    const rgb = Array.from(input.slice(offset, offset + 3));
    return {input: rgb, clipped: clipRgb(rgb), radial: radialRgb(rgb, anchor)};
  }, [input, pattern, anchor]);
  function reset() {
    setPattern(GAMUT_DEFAULTS.pattern);
    setDrive(GAMUT_DEFAULTS.drive);
    setAnchor(GAMUT_DEFAULTS.anchor);
    setZoom(GAMUT_DEFAULTS.zoom);
  }
  return <section className="vp-gamut" data-vp-gamut="ready"
    data-vp-gamut-drive={drive} data-vp-gamut-anchor={anchor}
    aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>範囲外の色を、2つの方法で収める</h3>
    <p className="vp-gamut__intro">合成入力は0〜1を超える数値を含むため、そのままの色は表示できません。
      左は範囲外マスク（赤）、中央と右は同じ入力の2つの変換結果です。</p>
    <div className="vp-gamut__previews">
      <Preview kind="mask" title="01 / 範囲外マスク" note="赤＝RGB成分が0未満／1超"
        pixels={mapped.mask} zoom={zoom} />
      <Preview kind="clip" title="02 / 成分クリップ" note="各成分を個別に0〜1へ"
        pixels={mapped.clipped} zoom={zoom} />
      <Preview kind="radial" title="03 / 灰軸への縮小" note={'灰色基準 '+anchor.toFixed(1)+' から一様縮小'}
        pixels={mapped.radial} zoom={zoom} />
    </div>
    <div className="vp-gamut__readout" role="status" aria-live="polite">
      <p>範囲外：<strong data-vp-gamut-outside>{mapped.outOfGamutPixels.toLocaleString('ja-JP')}</strong>
        ／{mapped.totalPixels.toLocaleString('ja-JP')}画素（{(100 * mapped.outOfGamutPixels / mapped.totalPixels).toFixed(1)}%）</p>
      <p>代表画素（線形RGB、丸め表示）：</p>
      <div className="vp-gamut__values">
        <Values label="入力" rgb={sample.input} />
        <Values label="クリップ" rgb={sample.clipped} />
        <Values label="灰軸縮小" rgb={sample.radial} />
      </div>
    </div>
    <div className="vp-gamut__controls">
      <label className="vp-gamut__control"><span>合成入力の配置</span>
        <select aria-label="合成入力の配置" value={pattern}
          onChange={event => setPattern(event.target.value)}>
          <option value="bands">6本の帯：左から色差が増える</option>
          <option value="blocks">色タイル：上から色差が増える</option>
        </select>
      </label>
      <label className="vp-gamut__control">
        <span>色差倍率 <output htmlFor={id + '-drive'}>{drive.toFixed(2)}倍</output></span>
        <input id={id + '-drive'} aria-label="色差倍率" type="range" min="0.5" max="2"
          step="0.25" value={drive} onChange={event => setDrive(Number(event.target.value))} />
      </label>
      <label className="vp-gamut__control">
        <span>灰色基準（縮小のみ） <output htmlFor={id + '-anchor'}>{anchor.toFixed(1)}</output></span>
        <input id={id + '-anchor'} aria-label="灰色基準" type="range" min="0.2" max="0.8"
          step="0.1" value={anchor} onChange={event => setAnchor(Number(event.target.value))} />
      </label>
      <label className="vp-gamut__control"><span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom}
          onChange={event => setZoom(Number(event.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>
    <button className="vp-gamut__reset" type="button" onClick={reset}>初期値に戻す</button>
    <p className="vp-gamut__hint">Canvasへ出す時点で線形RGBをsRGB符号化・8-bit丸めします。
      この2方式は教育用の単純化で、CSS／ACESの知覚的色域マッピング、
      HDRやAE／Resolveのカラー管理と同等ではありません。</p>
  </section>;
}
