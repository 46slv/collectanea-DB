import React,{useEffect,useId,useMemo,useRef,useState} from 'react';
import {LENS_WIDTH,LENS_HEIGHT,LENS_INITIAL,makeLensPattern,warpLensPattern} from './lens-core.mjs';
import './playground.css';
function Preview({name,title,detail,pixels}){
  const ref=useRef(null),[unavailable,setUnavailable]=useState(false);
  useEffect(()=>{
    let ctx;try{ctx=ref.current?.getContext('2d',{alpha:false});}catch{ctx=null;}
    if(!ctx){setUnavailable(true);return;}
    const image=ctx.createImageData(LENS_WIDTH,LENS_HEIGHT);
    image.data.set(pixels);ctx.putImageData(image,0,0);
  },[pixels]);
  return <figure className="vp-ld__panel" data-vp-ld-panel={name}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={LENS_WIDTH} height={LENS_HEIGHT} role="img"
      aria-label={title+'：ページ内生成の直線テスト画像'}/>
    {unavailable&&<p role="status">この端末ではCanvasを利用できません。</p>}
  </figure>;
}
export default function LensDistortionPlayground(){
  const id=useId();
  const [pattern,setPattern]=useState(LENS_INITIAL.pattern);
  const [strength,setStrength]=useState(LENS_INITIAL.strength);
  const [centerX,setCenterX]=useState(LENS_INITIAL.centerX);
  const source=useMemo(()=>makeLensPattern(LENS_WIDTH,LENS_HEIGHT,pattern),[pattern]);
  const original=useMemo(()=>warpLensPattern(source,LENS_WIDTH,LENS_HEIGHT,{mode:'original'}),[source]);
  const barrel=useMemo(()=>warpLensPattern(source,LENS_WIDTH,LENS_HEIGHT,{mode:'barrel',strength,centerX}),[source,strength,centerX]);
  const pin=useMemo(()=>warpLensPattern(source,LENS_WIDTH,LENS_HEIGHT,{mode:'pincushion',strength,centerX}),[source,strength,centerX]);
  const reset=()=>{setPattern(LENS_INITIAL.pattern);setStrength(LENS_INITIAL.strength);setCenterX(LENS_INITIAL.centerX);};
  return <section className="vp-ld" data-vp-lens-distortion="ready" data-vp-ld-strength={strength}
    data-vp-ld-center={centerX} aria-labelledby={id+'-title'}>
    <h3 id={id+'-title'}>直線が曲がる向きを比べる</h3>
    <p>同じ格子を樽型・糸巻き型へ変形し、曲がり方を並べます。</p>
    <div className="vp-ld__previews">
      <Preview name="original" title="01 / 元画像" detail="直線のまま" pixels={original}/>
      <Preview name="barrel" title="02 / 樽型（Barrel）" detail="線の中ほどが外側に膨らむ" pixels={barrel}/>
      <Preview name="pincushion" title="03 / 糸巻き型（Pincushion）" detail="線の中ほどが内側へ引かれる" pixels={pin}/>
    </div>
    <p className="vp-ld__note">画面端の暗い部分は樽型変形で参照元が画像の外に出た場所です。</p>
    <div className="vp-ld__controls">
      <label><span>テスト画像</span><select aria-label="テスト画像" value={pattern}
        onChange={e=>setPattern(e.target.value)}>
        <option value="grid">直線格子</option><option value="frames">長方形の枠と斜線</option>
      </select></label>
      <label><span>歪曲の強さ：<output htmlFor={id+'-strength'}>{strength.toFixed(2)}</output></span>
        <input id={id+'-strength'} type="range" min="0" max="0.30" step="0.01"
          aria-label="歪曲の強さ" value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label>
      <label><span>歪曲中心の横位置：<output htmlFor={id+'-center'}>{centerX}%</output></span>
        <input id={id+'-center'} type="range" min="25" max="75" step="5"
          aria-label="歪曲中心の横位置" value={centerX} onChange={e=>setCenterX(Number(e.target.value))}/></label>
    </div>
    <button type="button" className="vp-ld__reset" onClick={reset}>初期値に戻す</button>
  </section>;
}
