import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  BIT_DEPTHS, PREVIEW_WIDTH, PREVIEW_HEIGHT, encodeSample, makeIdealPattern, toDisplayBytes,
} from './bit-depth-core.mjs';
import './bit-depth.css';

const INITIAL = Object.freeze({bits: 4, sample: 500, source: 'ramp', zoom: 1});

function Preview({name, label, detail, values, zoom}) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d', {alpha: false});
    if (!ctx) return;
    const image = ctx.createImageData(PREVIEW_WIDTH, PREVIEW_HEIGHT);
    for (let i = 0; i < values.length; i += 1) {
      const at = i * 4;
      image.data[at] = image.data[at + 1] = image.data[at + 2] = values[i];
      image.data[at + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [values]);
  return <figure className="vp-bit-depth__preview" data-vp-bit-depth-preview={name}>
    <figcaption><strong>{label}</strong><span>{detail}</span></figcaption>
    <div className="vp-bit-depth__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={label + '。拡大時は左右へスクロールできます。'}>
      <canvas ref={ref} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} role="img"
        aria-label={label + 'の8-bit表示用グレースケール画像'}
        style={{width: (zoom * 100) + '%'}} />
    </div>
  </figure>;
}

export default function BitDepthPlayground() {
  const id = useId();
  const [bits, setBits] = useState(INITIAL.bits);
  const [sample, setSample] = useState(INITIAL.sample);
  const [source, setSource] = useState(INITIAL.source);
  const [zoom, setZoom] = useState(INITIAL.zoom);
  const ideal = useMemo(() => makeIdealPattern(PREVIEW_WIDTH, PREVIEW_HEIGHT, source), [source]);
  const original = useMemo(() => toDisplayBytes(ideal, 8), [ideal]);
  const encoded = useMemo(() => toDisplayBytes(ideal, bits), [ideal, bits]);
  const info = useMemo(() => encodeSample(sample / 1000, bits), [bits, sample]);
  const reset = () => {setBits(INITIAL.bits); setSample(INITIAL.sample); setSource(INITIAL.source); setZoom(INITIAL.zoom);};
  return <section className="vp-bit-depth" data-vp-bit-depth="ready"
    data-vp-bit-depth-bits={bits} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>ビット数を変えて、使えるコード値を数える</h3>
    <p className="vp-bit-depth__intro">画像の帯に加え、同じ入力値が何番のコードへ丸められるかを確認します。10/12-bitの違いは数値表示で観察してください。</p>
    <div className="vp-bit-depth__previews">
      <Preview name="input" label="01 / 正規化入力の8-bit表示"
        detail="理想化した標本を画面用に変換" values={original} zoom={zoom} />
      <Preview name="output" label={'02 / ' + bits + '-bit相当の丸め後'}
        detail="結果を8-bit Canvasへ再変換" values={encoded} zoom={zoom} />
    </div>
    <p className="vp-bit-depth__notice">ここにあるCanvasはどちらも8-bit表示用です。10/12-bitの階調やHDRを実際に表示・保存しているわけではありません。</p>
    <div className="vp-bit-depth__readouts" role="status" aria-live="polite">
      <div><small>1成分のコード数</small><strong>{info.codeCount.toLocaleString('ja-JP')} 段階</strong></div>
      <div><small>入力→整数コード</small><strong>{(sample / 10).toFixed(1)}% → {info.code} / {info.maxCode}</strong></div>
      <div><small>整数から復元した比率</small><strong>{(info.reconstructed * 100).toFixed(3)}%</strong></div>
      <div><small>丸め誤差（百分率ポイント）</small><strong>{(info.error * 100).toFixed(4)}</strong></div>
    </div>
    <div className="vp-bit-depth__controls">
      <label><span>1成分のビット深度</span>
        <select aria-label="ビット深度" value={bits} onChange={e => setBits(Number(e.target.value))}>
          {BIT_DEPTHS.map(n => <option value={n} key={n}>{n} bit</option>)}
        </select>
      </label>
      <label><span>入力標本値 <output htmlFor={id + '-sample'}>{(sample / 10).toFixed(1)}%</output></span>
        <input id={id + '-sample'} aria-label="入力標本値" type="range" min="0" max="1000" step="1"
          value={sample} onChange={e => setSample(Number(e.target.value))} />
      </label>
      <label><span>入力パターン</span>
        <select aria-label="入力パターン" value={source} onChange={e => setSource(e.target.value)}>
          <option value="ramp">横方向の明暗グラデーション</option>
          <option value="radial">中心が明るい楕円グラデーション</option>
        </select>
      </label>
      <label><span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom} onChange={e => setZoom(Number(e.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option><option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-bit-depth__actions"><button type="button" onClick={reset}>初期値に戻す</button></div>
  </section>;
}
