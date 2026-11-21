import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  GRAIN_WIDTH, GRAIN_HEIGHT, GRAIN_INITIAL, makeGrainScene, renderFilmGrain,
} from './grain-core.mjs';
import './playground.css';

function Preview({kind, title, detail, pixels}) {
  const ref = useRef(null);
  const [unsupported, setUnsupported] = useState(false);
  useEffect(() => {
    let context;
    try { context = ref.current?.getContext('2d', {alpha: false}); } catch { context = null; }
    if (!context) { setUnsupported(true); return; }
    const frame = context.createImageData(GRAIN_WIDTH, GRAIN_HEIGHT);
    for (let i = 0; i < pixels.length / 3; i += 1) {
      const k = i * 3, j = i * 4;
      frame.data[j] = pixels[k];
      frame.data[j + 1] = pixels[k + 1];
      frame.data[j + 2] = pixels[k + 2];
      frame.data[j + 3] = 255;
    }
    context.putImageData(frame, 0, 0);
  }, [pixels]);
  return <figure className="vp-film-grain__preview" data-vp-film-grain-preview={kind}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={GRAIN_WIDTH} height={GRAIN_HEIGHT} role="img"
      aria-label={title + '：生成画像に対する粒子の変化を観察する'} />
    {unsupported && <p role="status">Canvas 2Dを利用できないため、比較画像を表示できません。</p>}
  </figure>;
}

export default function FilmGrainPlayground() {
  const id = useId();
  const [scene, setScene] = useState(GRAIN_INITIAL.scene);
  const [amount, setAmount] = useState(GRAIN_INITIAL.amount);
  const [size, setSize] = useState(GRAIN_INITIAL.size);
  const [chroma, setChroma] = useState(GRAIN_INITIAL.chroma);
  const [shadow, setShadow] = useState(GRAIN_INITIAL.shadow);
  const [frame, setFrame] = useState(GRAIN_INITIAL.frame);
  const before = useMemo(() => makeGrainScene(GRAIN_WIDTH, GRAIN_HEIGHT, scene), [scene]);
  const grain = useMemo(() => renderFilmGrain(before, GRAIN_WIDTH, GRAIN_HEIGHT,
    {amount, size, chroma, shadow, frame}),
  [before, amount, size, chroma, shadow, frame]);
  const reset = () => {
    setScene(GRAIN_INITIAL.scene);
    setAmount(GRAIN_INITIAL.amount);
    setSize(GRAIN_INITIAL.size);
    setChroma(GRAIN_INITIAL.chroma);
    setShadow(GRAIN_INITIAL.shadow);
    setFrame(GRAIN_INITIAL.frame);
  };

  return <section className="vp-film-grain" data-vp-film-grain="ready"
    data-vp-film-grain-amount={amount} data-vp-film-grain-size={size}
    data-vp-film-grain-frame={frame} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>粒子の大きさ・強さ・色成分を比較する</h3>
    <p>中間パネルは灰色128を基準とする粒子差分です。最終パネルだけ元画像に差分を加えます。</p>
    <div className="vp-film-grain__previews">
      <Preview kind="before" title="01 / 元画像" detail="未加工の合成テスト画像" pixels={before} />
      <Preview kind="layer" title="02 / 粒子差分" detail="灰色128からの変動" pixels={grain.layer} />
      <Preview kind="after" title="03 / 粒子の合成" detail="元画像 + 粒子差分" pixels={grain.result} />
    </div>
    <p className="vp-film-grain__hint">適用後の平均絶対変化量：{grain.meanAbsDelta.toFixed(2)} / 255、RGBクリップ数：{grain.clippedSamples}。数値は教材内での表示コード値の変化で、物理的なフィルム粒状度ではありません。</p>
    <div className="vp-film-grain__controls">
      <label><span>入力パターン</span>
        <select aria-label="入力パターン" value={scene} onChange={e => setScene(e.target.value)}>
          <option value="gradient">明暗グラデーションと色帯</option>
          <option value="night">暗い街灯と窓</option>
        </select>
      </label>
      <label><span>粒子の強さ <output htmlFor={id + '-amount'}>{amount} / 255</output></span>
        <input id={id + '-amount'} aria-label="粒子の強さ" type="range" min="0" max="60" step="2"
          value={amount} onChange={e => setAmount(Number(e.target.value))} />
      </label>
      <label><span>粒子の大きさ <output htmlFor={id + '-size'}>{size} px</output></span>
        <input id={id + '-size'} aria-label="粒子の大きさ" type="range" min="1" max="6" step="1"
          value={size} onChange={e => setSize(Number(e.target.value))} />
      </label>
      <label><span>色粒子の混合率 <output htmlFor={id + '-chroma'}>{Math.round(chroma * 100)} %</output></span>
        <input id={id + '-chroma'} aria-label="色粒子の混合率" type="range" min="0" max="1" step="0.1"
          value={chroma} onChange={e => setChroma(Number(e.target.value))} />
      </label>
      <label><span>暗部を優先 <output htmlFor={id + '-shadow'}>{Math.round(shadow * 100)} %</output></span>
        <input id={id + '-shadow'} aria-label="暗部を優先" type="range" min="0" max="1" step="0.1"
          value={shadow} onChange={e => setShadow(Number(e.target.value))} />
      </label>
    </div>
    <div className="vp-film-grain__actions">
      <button type="button" onClick={() => setFrame(f => (f + 1) % 4096)}>
        次のフレームの粒子へ（現在 {frame}）
      </button>
      <button type="button" onClick={reset}>初期値に戻す</button>
    </div>
  </section>;
}
