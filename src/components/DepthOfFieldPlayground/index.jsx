import React, {useEffect,useId,useMemo,useRef,useState} from 'react';
import {DOF_WIDTH,DOF_HEIGHT,DOF_PLANES,DOF_DEFAULTS,makeDofScene,makeDofDepthMap,planeBlurRadii,applyDofDefocus} from './dof-core.mjs';
import './playground.css';

function Preview({kind,pixels}){
  const canvasRef=useRef(null);
  const [error,setError]=useState(false);
  const descriptions={
    original:['01 / 入力','すべての距離帯で鮮明な原画'],
    depth:['02 / 距離帯とピント','明るい帯がピント位置'],
    result:['03 / 出力','距離に応じた簡易ぼかし']
  };
  useEffect(()=>{
    let ctx;
    try{ctx=canvasRef.current?.getContext('2d',{alpha:false});}catch{ctx=null;}
    if(!ctx){setError(true);return;}
    const frame=ctx.createImageData(DOF_WIDTH,DOF_HEIGHT);
    frame.data.set(pixels);
    ctx.putImageData(frame,0,0);
  },[pixels]);
  const [heading,subtitle]=descriptions[kind];
  return <figure className="vp-dof__panel" data-vp-dof-panel={kind}>
    <figcaption><strong>{heading}</strong><span>{subtitle}</span></figcaption>
    <canvas ref={canvasRef} width={DOF_WIDTH} height={DOF_HEIGHT} role="img"
      aria-label={heading+'：左から1.5、3、9メートルの三つの距離帯'} />
    {error&&<p>Canvasが使用できないため、この比較画像は表示できません。</p>}
  </figure>;
}

export default function DepthOfFieldPlayground(){
  const id=useId();
  const [focus,setFocus]=useState(DOF_DEFAULTS.focus);
  const [aperture,setAperture]=useState(DOF_DEFAULTS.aperture);
  const [strength,setStrength]=useState(DOF_DEFAULTS.strength);
  const [pattern,setPattern]=useState(DOF_DEFAULTS.pattern);
  const options=useMemo(()=>({focus,aperture,strength,pattern}),[focus,aperture,strength,pattern]);
  const source=useMemo(()=>makeDofScene(pattern),[pattern]);
  const depth=useMemo(()=>makeDofDepthMap(focus),[focus]);
  const output=useMemo(()=>applyDofDefocus(source,options),[source,options]);
  const radii=useMemo(()=>planeBlurRadii(options),[options]);
  const reset=()=>{setFocus(DOF_DEFAULTS.focus);setAperture(DOF_DEFAULTS.aperture);
    setStrength(DOF_DEFAULTS.strength);setPattern(DOF_DEFAULTS.pattern);};
  return <section className="vp-dof" data-vp-dof="ready" data-vp-dof-focus={focus}
    data-vp-dof-aperture={aperture} data-vp-dof-strength={strength} aria-labelledby={id+'-heading'}>
    <h3 id={id+'-heading'}>ピントの距離と絞りを切り替える</h3>
    <p>左から近距離（1.5 m）、中距離（3 m）、遠距離（9 m）の三つの独立した帯を並べています。</p>
    <div className="vp-dof__previews">
      <Preview kind="original" pixels={source}/>
      <Preview kind="depth" pixels={depth}/>
      <Preview kind="result" pixels={output}/>
    </div>
    <p className="vp-dof__readout" aria-live="polite">
      ぼかし半径（近／中／遠）：{DOF_PLANES.map((d,i)=>d+' m '+radii[i]+' px').join(' ／ ')}
    </p>
    <p className="vp-dof__note">距離を3領域に分けた教育用の2段階ボックスぼかしです。実際のレンズによるボケ円や奥行きの遮蔽は表しません。</p>
    <div className="vp-dof__controls">
      <label><span>ピントの距離</span>
        <select aria-label="ピントの距離" value={focus} onChange={e=>setFocus(Number(e.target.value))}>
          <option value={1.5}>近距離 1.5 m</option><option value={3}>中距離 3 m</option><option value={9}>遠距離 9 m</option>
        </select></label>
      <label><span>絞り値（f値）</span>
        <select aria-label="絞り値" value={aperture} onChange={e=>setAperture(Number(e.target.value))}>
          <option value={1.8}>f/1.8</option><option value={2.8}>f/2.8</option>
          <option value={5.6}>f/5.6</option><option value={11}>f/11</option>
        </select></label>
      <label><span>ぼかし強度：<output htmlFor={id+'-strength'}>{strength.toFixed(2)}</output></span>
        <input id={id+'-strength'} aria-label="ぼかし強度" type="range" min="0" max="2" step="0.25"
          value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label>
      <label><span>比較する絵柄</span>
        <select aria-label="比較する絵柄" value={pattern} onChange={e=>setPattern(e.target.value)}>
          <option value="lights">夜景の点光源と線</option><option value="edges">高コントラスト図形</option>
        </select></label>
    </div>
    <button type="button" className="vp-dof__reset" onClick={reset}>初期値に戻す</button>
  </section>;
}
