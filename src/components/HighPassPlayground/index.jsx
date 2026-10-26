import React, {useEffect,useId,useMemo,useRef,useState} from 'react';
import {HP_WIDTH,HP_HEIGHT,HP_INITIAL,makeHighPassPattern,gaussianLowPass,composeHighPass} from './high-pass-core.mjs';
import './playground.css';

function Preview({kind,title,detail,pixels}){
  const canvasRef=useRef(null);
  const [unavailable,setUnavailable]=useState(false);
  useEffect(()=>{
    let ctx;
    try{ctx=canvasRef.current?.getContext('2d',{alpha:false});}catch{ctx=null;}
    if(!ctx){setUnavailable(true);return;}
    const image=ctx.createImageData(HP_WIDTH,HP_HEIGHT);
    for(let i=0;i<pixels.length;i++){
      const n=i*4;
      image.data[n]=image.data[n+1]=image.data[n+2]=pixels[i];
      image.data[n+3]=255;
    }
    ctx.putImageData(image,0,0);
  },[pixels]);
  return <figure className="vp-hp__preview" data-vp-hp-preview={kind}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={canvasRef} width={HP_WIDTH} height={HP_HEIGHT} role="img"
      aria-label={title+'：ページ内で生成したグレースケール画像'}/>
    {unavailable&&<p role="status">この環境ではCanvas 2Dを表示できません。</p>}
  </figure>;
}

export default function HighPassPlayground(){
  const id=useId();
  const [pattern,setPattern]=useState(HP_INITIAL.pattern);
  const [sigma,setSigma]=useState(HP_INITIAL.sigma);
  const [gain,setGain]=useState(HP_INITIAL.gain);
  const source=useMemo(()=>makeHighPassPattern(HP_WIDTH,HP_HEIGHT,pattern),[pattern]);
  const low=useMemo(()=>gaussianLowPass(source,HP_WIDTH,HP_HEIGHT,sigma),[source,sigma]);
  const {original,detail,recomposed,clippedCount}=useMemo(
    ()=>composeHighPass(source,low,HP_WIDTH,HP_HEIGHT,{gain}),[source,low,gain]);
  const reset=()=>{
    setPattern(HP_INITIAL.pattern);setSigma(HP_INITIAL.sigma);setGain(HP_INITIAL.gain);
  };
  return <section className="vp-hp" data-vp-high-pass="ready" data-vp-hp-sigma={sigma}
    data-vp-hp-gain={gain} aria-labelledby={id+'-title'}>
    <h3 id={id+'-title'}>低周波を引き、細部を再合成する</h3>
    <p>128を中立灰色として、明るい高周波成分と暗い高周波成分を両方表示します。</p>
    <div className="vp-hp__previews">
      <Preview kind="before" title="01 / 元画像" detail="ぼかし前の明暗" pixels={original}/>
      <Preview kind="detail" title="02 / ハイパス差分" detail="灰色128＝差分0、白＝正、黒＝負" pixels={detail}/>
      <Preview kind="recomposed" title="03 / 再合成結果"
        detail="ぼかした画像に細部を加える" pixels={recomposed}/>
    </div>
    <p className="vp-hp__metric" role="status">再合成で0〜255を超えてクリップされた画素：
      <strong>{clippedCount.toLocaleString('ja-JP')}</strong> / {HP_WIDTH*HP_HEIGHT}</p>
    <div className="vp-hp__controls">
      <label><span>テスト画像</span>
        <select value={pattern} aria-label="テスト画像" onChange={e=>setPattern(e.target.value)}>
          <option value="edges">大きな明暗境界と細い線</option>
          <option value="texture">低周波の模様と細かな格子</option>
        </select>
      </label>
      <label><span>ぼかしの標準偏差 <output htmlFor={id+'-sigma'}>σ {sigma.toFixed(1)} px</output></span>
        <input id={id+'-sigma'} type="range" min="0.5" max="8" step="0.5" value={sigma}
          aria-label="ぼかしの標準偏差" onChange={e=>setSigma(Number(e.target.value))}/>
      </label>
      <label><span>再合成・差分表示の倍率 <output htmlFor={id+'-gain'}>{gain.toFixed(1)} 倍</output></span>
        <input id={id+'-gain'} type="range" min="0" max="3" step="0.25" value={gain}
          aria-label="再合成・差分表示の倍率" onChange={e=>setGain(Number(e.target.value))}/>
      </label>
    </div>
    <button type="button" className="vp-hp__reset" onClick={reset}>初期値に戻す</button>
  </section>;
}
