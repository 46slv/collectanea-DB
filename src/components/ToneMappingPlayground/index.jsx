import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  TONE_WIDTH, TONE_HEIGHT, createHdrPattern, mapToneValue,
  encodeSrgb8, renderToneMapping,
} from './tone-mapping-core.mjs';
import './tone-mapping.css';

const DEFAULTS = Object.freeze({peak: 4, ev: 0, source: 'ramp', zoom: 1});
const LABELS = {ramp: '暗部から高輝度へのグラデーション', radial: '中心が明るい高輝度スポット'};

function TonePreview({kind, label, description, pixels, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d', {alpha: false});
    if (!ctx) return;
    const frame = ctx.createImageData(TONE_WIDTH, TONE_HEIGHT);
    for (let i = 0; i < pixels.length; i += 1) {
      const p = i * 4;
      frame.data[p] = frame.data[p + 1] = frame.data[p + 2] = pixels[i];
      frame.data[p + 3] = 255;
    }
    ctx.putImageData(frame, 0, 0);
  }, [pixels]);
  return <figure className="vp-tonemap__preview" data-vp-tonemap-preview={kind}>
    <figcaption><strong>{label}</strong><span>{description}</span></figcaption>
    <div className="vp-tonemap__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={label + '。拡大時は横へスクロールできます。'}>
      <canvas ref={ref} width={TONE_WIDTH} height={TONE_HEIGHT} role="img"
        aria-label={label + '、sRGB 8-bitに符号化したグレースケール出力'}
        style={{width: zoom * 100 + '%'}} />
    </div>
  </figure>;
}

function ToneGraph({peak, ev}) {
  const points = (operator) => {
    const result = [];
    for (let i = 0; i <= 80; i += 1) {
      const L = peak * i / 80;
      const mapped = mapToneValue(L, ev, operator);
      result.push((18 + i * 2.75).toFixed(2) + ',' + (236 - mapped * 214).toFixed(2));
    }
    return result.join(' ');
  };
  return <figure className="vp-tonemap__plot">
    <figcaption><strong>線形入力 → 表示域の出力</strong>
      <span>破線＝切り詰め / 実線＝Reinhard</span></figcaption>
    <svg viewBox="0 0 254 254" role="img"
      aria-label={'入力0〜' + peak + 'の線形光に対する、クリップとReinhardの応答曲線'}>
      <line x1="18" y1="22" x2="18" y2="236" className="vp-tonemap__axis" />
      <line x1="18" y1="236" x2="238" y2="236" className="vp-tonemap__axis" />
      <polyline points={points('clip')} className="vp-tonemap__clip-curve" />
      <polyline points={points('reinhard')} className="vp-tonemap__curve" />
      <text x="18" y="250">0</text>
      <text x="182" y="250">入力 {peak}</text>
      <text x="23" y="18">出力 1</text>
    </svg>
  </figure>;
}

export default function ToneMappingPlayground() {
  const id = useId();
  const [peak, setPeak] = useState(DEFAULTS.peak);
  const [ev, setEv] = useState(DEFAULTS.ev);
  const [source, setSource] = useState(DEFAULTS.source);
  const [zoom, setZoom] = useState(DEFAULTS.zoom);
  const scene = useMemo(
    () => createHdrPattern(TONE_WIDTH, TONE_HEIGHT, peak, source), [peak, source],
  );
  const {clipped, compressed, overDisplay} = useMemo(
    () => renderToneMapping(scene, TONE_WIDTH, TONE_HEIGHT, ev), [scene, ev],
  );
  const reset = () => {
    setPeak(DEFAULTS.peak); setEv(DEFAULTS.ev);
    setSource(DEFAULTS.source); setZoom(DEFAULTS.zoom);
  };
  const sample = [0.5, 1, 2, 4].map((L) => ({
    L,
    clip: encodeSrgb8(mapToneValue(L, ev, 'clip')),
    mapped: encodeSrgb8(mapToneValue(L, ev, 'reinhard')),
  }));
  const evLabel = (ev > 0 ? '+' : '') + ev.toFixed(1) + ' EV';
  return <section className="vp-tonemap" data-vp-tonemap="ready" data-vp-tonemap-ev={ev}
    aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>白へ切り詰める場合と、明部を圧縮する場合</h3>
    <p className="vp-tonemap__intro">入力は画面に直接表示できない、0〜{peak}の線形光の数値です。
      下の2枚は、同じ入力を別の式で表示域0〜1へ変換した結果です。</p>
    <div className="vp-tonemap__previews">
      <TonePreview kind="clip" label="01 / 上限1でクリップ" description="明るい値は同じ白になる"
        pixels={clipped} zoom={zoom} />
      <TonePreview kind="reinhard" label="02 / Reinhard圧縮" description="明部の違いを残しながら圧縮"
        pixels={compressed} zoom={zoom} />
    </div>
    <div className="vp-tonemap__analysis">
      <ToneGraph peak={peak} ev={ev} />
      <div className="vp-tonemap__readout" aria-live="polite">
        <p>線形入力の露出倍率：{(2 ** ev).toFixed(3)}×</p>
        <p>1を超えた入力画素：{overDisplay.toLocaleString('ja-JP')} /
          {' '}{scene.length.toLocaleString('ja-JP')}（EV適用後）</p>
        <table>
          <caption>入力値ごとのsRGB 8-bit出力値</caption>
          <thead><tr><th scope="col">入力</th><th scope="col">切り詰め</th>
            <th scope="col">圧縮</th></tr></thead>
          <tbody>{sample.map(({L, clip, mapped}) => <tr key={L}>
            <th scope="row">{L}</th><td>{clip}</td><td>{mapped}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
    <p className="vp-tonemap__hint">入力ピークはシーンの相対線形光値です。
      画面の輝度nitやHDR信号レベルではありません。384×160画素、表示を拡大しても処理の精度は変わりません。</p>
    <div className="vp-tonemap__controls">
      <label className="vp-tonemap__control"><span>入力パターン</span>
        <select aria-label="入力パターン" value={source}
          onChange={(e) => setSource(e.target.value)}>
          {Object.entries(LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <label className="vp-tonemap__control"><span>入力ピーク（相対線形値）</span>
        <select aria-label="入力ピーク" value={peak}
          onChange={(e) => setPeak(Number(e.target.value))}>
          <option value={2}>2</option><option value={4}>4</option><option value={8}>8</option>
        </select>
      </label>
      <label className="vp-tonemap__control">
        <span>圧縮前の露出補正 <output htmlFor={id + '-ev'}>{evLabel}</output></span>
        <input id={id + '-ev'} type="range" min="-2" max="2" step="0.5" value={ev}
          aria-label="圧縮前の露出補正（EV）"
          onChange={(e) => setEv(Number(e.target.value))} />
      </label>
      <label className="vp-tonemap__control"><span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option><option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-tonemap__actions">
      <button type="button" className="vp-tonemap__reset" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
