import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {
  WHITE_BALANCE_WIDTH, WHITE_BALANCE_HEIGHT, WHITE_BALANCE_DEFAULTS,
  WHITE_BALANCE_CAST, WHITE_BALANCE_SAMPLES, whiteBalanceGains,
  adjustWhiteBalanceRgb, createWhiteBalancePattern, renderWhiteBalance,
} from './white-balance-core.mjs';
import './white-balance.css';

const PATTERNS = {
  warm: '色かぶりを加えた8色パッチ',
  neutral: '色かぶりのない灰色グラデーション',
};

function Preview({kind, label, note, frame, zoom}) {
  const canvas = useRef(null);
  useEffect(() => {
    const context = canvas.current?.getContext('2d', {alpha: false});
    if (!context) return;
    const image = context.createImageData(WHITE_BALANCE_WIDTH, WHITE_BALANCE_HEIGHT);
    image.data.set(frame);
    context.putImageData(image, 0, 0);
  }, [frame]);
  return <figure className="vp-wb__preview" data-vp-white-balance-preview={kind}>
    <figcaption><strong>{label}</strong><span>{note}</span></figcaption>
    <div className="vp-wb__viewport" tabIndex={zoom > 1 ? 0 : undefined}
      aria-label={label + '。拡大時は横スクロールできます。'}>
      <canvas ref={canvas} width={WHITE_BALANCE_WIDTH} height={WHITE_BALANCE_HEIGHT}
        role="img" aria-label={label + '。教材で生成した8-bit sRGBパターン。'}
        style={{width: zoom * 100 + '%'}} />
    </div>
  </figure>;
}
function Swatch({rgb}) {
  return <span className="vp-wb__swatch" style={{backgroundColor: 'rgb(' + rgb.join(',') + ')'}}
    role="img" aria-label={'RGB ' + rgb.join('、')} />;
}
export default function WhiteBalancePlayground() {
  const id = useId();
  const [temperature, setTemperature] = useState(WHITE_BALANCE_DEFAULTS.temperature);
  const [tint, setTint] = useState(WHITE_BALANCE_DEFAULTS.tint);
  const [pattern, setPattern] = useState(WHITE_BALANCE_DEFAULTS.pattern);
  const [zoom, setZoom] = useState(WHITE_BALANCE_DEFAULTS.zoom);
  const source = useMemo(() => createWhiteBalancePattern(
    WHITE_BALANCE_WIDTH, WHITE_BALANCE_HEIGHT, pattern), [pattern]);
  const result = useMemo(() => renderWhiteBalance(
    source, WHITE_BALANCE_WIDTH, WHITE_BALANCE_HEIGHT, temperature, tint),
  [source, temperature, tint]);
  const gains = whiteBalanceGains(temperature, tint);
  const samples = WHITE_BALANCE_SAMPLES[pattern].map(({label, rgb}) => {
    const input = pattern === 'warm' ? adjustWhiteBalanceRgb(
      rgb, WHITE_BALANCE_CAST.temperature, WHITE_BALANCE_CAST.tint) : rgb;
    return {label, input, output: adjustWhiteBalanceRgb(input, temperature, tint)};
  });
  function reset() {
    setTemperature(0); setTint(0); setPattern(WHITE_BALANCE_DEFAULTS.pattern);
    setZoom(WHITE_BALANCE_DEFAULTS.zoom);
  }
  function compensateCast() {
    setPattern('warm');
    setTemperature(-WHITE_BALANCE_CAST.temperature);
    setTint(-WHITE_BALANCE_CAST.tint);
  }
  return <section className="vp-wb" data-vp-white-balance="ready"
    data-vp-white-balance-temperature={temperature}
    data-vp-white-balance-tint={tint} aria-labelledby={id + '-title'}>
    <h3 id={id + '-title'}>灰色が色づく理由をRGBゲインで確かめる</h3>
    <p className="vp-wb__intro">最初のパターンには教材独自の色かぶりを加えています。
      左は入力、右は線形光sRGBへ戻してR/G/Bを個別に増減した画像です。
      「打ち消す」操作で灰色が無彩色へ戻るか比較できます。</p>
    <div className="vp-wb__previews">
      <Preview kind="source" label="01 / 入力" note="合成された表示用RGB" frame={source} zoom={zoom} />
      <Preview kind="output" label="02 / ゲイン補正後"
        note={'暖色方向 ' + temperature + ' / マゼンタ方向 ' + tint}
        frame={result.pixels} zoom={zoom} />
    </div>
    <div className="vp-wb__readout" aria-live="polite">
      <p>線形光ゲイン：R <strong>{gains[0].toFixed(3)}×</strong> ／
        G <strong>{gains[1].toFixed(3)}×</strong> ／
        B <strong>{gains[2].toFixed(3)}×</strong>。
        色域外で上限を超えた画素：<strong>{result.clippedPixels.toLocaleString('ja-JP')}</strong>
        {' / '}{(WHITE_BALANCE_WIDTH * WHITE_BALANCE_HEIGHT).toLocaleString('ja-JP')}</p>
      <table>
        <caption>代表色のコード値（0–255、選択パターンの原色参照）</caption>
        <thead><tr><th scope="col">色</th><th scope="col">入力RGB</th>
          <th scope="col">出力RGB</th></tr></thead>
        <tbody>{samples.map(({label, input, output}) => <tr key={label}>
          <th scope="row">{label}</th>
          <td><Swatch rgb={input} />{input.join(' / ')}</td>
          <td><Swatch rgb={output} />{output.join(' / ')}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="vp-wb__controls">
      <label className="vp-wb__control"><span>入力パターン</span>
        <select aria-label="入力パターン" value={pattern}
          onChange={event => setPattern(event.target.value)}>
          {Object.entries(PATTERNS).map(([key, name]) =>
            <option value={key} key={key}>{name}</option>)}
        </select>
      </label>
      <label className="vp-wb__control">
        <span>寒色 − / 暖色 ＋ <output htmlFor={id + '-temperature'}>{temperature}</output></span>
        <input id={id + '-temperature'} type="range" min="-100" max="100" step="10"
          value={temperature} aria-label="寒色と暖色のゲイン軸（ケルビンではありません）"
          onChange={event => setTemperature(Number(event.target.value))} />
      </label>
      <label className="vp-wb__control">
        <span>緑 − / マゼンタ ＋ <output htmlFor={id + '-tint'}>{tint}</output></span>
        <input id={id + '-tint'} type="range" min="-100" max="100" step="10"
          value={tint} aria-label="緑とマゼンタのゲイン軸"
          onChange={event => setTint(Number(event.target.value))} />
      </label>
      <label className="vp-wb__control"><span>表示倍率</span>
        <select aria-label="表示倍率" value={zoom}
          onChange={event => setZoom(Number(event.target.value))}>
          <option value={1}>100%</option><option value={2}>200%</option>
          <option value={4}>400%</option>
        </select>
      </label>
    </div>
    <div className="vp-wb__actions">
      <button type="button" onClick={compensateCast}>テスト色かぶりを打ち消す</button>
      <button type="button" onClick={reset}>初期値に戻す</button>
    </div>
    <p className="vp-wb__hint">温度方向とティント方向は教材独自の無次元パラメータで、色温度K、
      実照明の分光分布、RAW現像、色順応変換、AE・ResolveのWBアルゴリズムを再現しません。
      一度上限へクリップした色は逆補正しても復元できません。</p>
  </section>;
}
