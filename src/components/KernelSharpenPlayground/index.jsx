import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  SHARPEN_WIDTH, SHARPEN_HEIGHT, SHARPEN_INITIAL,
  makeSharpenPattern, extractSharpenDetail, visualizeSharpenDetail, renderKernelSharpen,
} from './sharpen-core.mjs';
import './playground.css';

function SharpenPreview({kind, title, caption, pixels}) {
  const canvas = useRef(null);
  const [unsupported, setUnsupported] = useState(false);
  useEffect(() => {
    let ctx;
    try { ctx = canvas.current?.getContext('2d', {alpha: false}); } catch { ctx = null; }
    if (!ctx) { setUnsupported(true); return; }
    const image = ctx.createImageData(SHARPEN_WIDTH, SHARPEN_HEIGHT);
    for (let i = 0; i < pixels.length / 3; i += 1) {
      const src = i * 3, dest = i * 4;
      image.data[dest] = pixels[src];
      image.data[dest + 1] = pixels[src + 1];
      image.data[dest + 2] = pixels[src + 2];
      image.data[dest + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return <figure className="vp-ksharpen__preview" data-vp-ksharpen-preview={kind}>
    <figcaption><strong>{title}</strong><span>{caption}</span></figcaption>
    <canvas ref={canvas} width={SHARPEN_WIDTH} height={SHARPEN_HEIGHT}
      role="img" aria-label={title + '：シャープ処理の比較画像'} />
    {unsupported && <p role="status">このブラウザではCanvas 2Dが使えないため、比較画像を表示できません。</p>}
  </figure>;
}

export default function KernelSharpenPlayground() {
  const id = useId();
  const [pattern, setPattern] = useState(SHARPEN_INITIAL.pattern);
  const [neighbors, setNeighbors] = useState(SHARPEN_INITIAL.neighbors);
  const [amount, setAmount] = useState(SHARPEN_INITIAL.amount);
  const original = useMemo(() => makeSharpenPattern(SHARPEN_WIDTH, SHARPEN_HEIGHT, pattern), [pattern]);
  const detail = useMemo(() => extractSharpenDetail(original, SHARPEN_WIDTH, SHARPEN_HEIGHT, neighbors), [original, neighbors]);
  const response = useMemo(() => visualizeSharpenDetail(detail), [detail]);
  const result = useMemo(() => renderKernelSharpen(original, SHARPEN_WIDTH, SHARPEN_HEIGHT, detail, amount), [original, detail, amount]);
  const reset = () => {
    setPattern(SHARPEN_INITIAL.pattern);
    setNeighbors(SHARPEN_INITIAL.neighbors);
    setAmount(SHARPEN_INITIAL.amount);
  };
  return <section className="vp-ksharpen" data-vp-ksharpen="ready" aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>隣接画素との差を加えて輪郭を強める</h3>
    <p>中央は元画像と近傍平均の符号付き差分です。灰色128は差0、明るい側は正、暗い側は負を表します。</p>
    <div className="vp-ksharpen__previews">
      <SharpenPreview kind="before" title="01 / 元画像" caption="色境界と細い線" pixels={original} />
      <SharpenPreview kind="detail" title="02 / 輪郭差分" caption="各RGB成分の差を128中心で表示" pixels={response} />
      <SharpenPreview kind="after" title="03 / シャープ化" caption="元画像 + 強さ × 差分" pixels={result.pixels} />
    </div>
    <p className="vp-ksharpen__status" role="status">表示範囲を超えた成分：{result.clippedChannels.toLocaleString('ja-JP')} / {(SHARPEN_WIDTH * SHARPEN_HEIGHT * 3).toLocaleString('ja-JP')}（RGB成分単位）</p>
    <div className="vp-ksharpen__controls">
      <label><span>テスト画像</span>
        <select aria-label="テスト画像" value={pattern} onChange={e => setPattern(e.target.value)}>
          <option value="edges">色の面と細い線</option>
          <option value="texture">細部とノイズ</option>
        </select>
      </label>
      <label><span>比較する近傍</span>
        <select aria-label="比較する近傍" value={neighbors} onChange={e => setNeighbors(e.target.value)}>
          <option value="cross">上下左右 4画素</option>
          <option value="square">周囲 8画素（斜めを含む）</option>
        </select>
      </label>
      <label><span>差分を加える強さ <output htmlFor={id + '-amount'}>{amount.toFixed(2)} 倍</output></span>
        <input id={id + '-amount'} aria-label="差分を加える強さ" type="range"
          min="0" max="3" step="0.25" value={amount} onChange={e => setAmount(Number(e.target.value))} />
      </label>
    </div>
    <button className="vp-ksharpen__reset" type="button" onClick={reset}>初期値に戻す</button>
  </section>;
}
