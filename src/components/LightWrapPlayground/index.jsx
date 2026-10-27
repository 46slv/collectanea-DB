import React,{useEffect,useId,useMemo,useRef,useState} from 'react';
import {WRAP_WIDTH,WRAP_HEIGHT,WRAP_DEFAULTS,makeWrapScene,makeWrapMatte,renderLightWrap,countChangedPixels} from './wrap-core.mjs';
import './playground.css';

function Preview({kind,pixels}){
  const canvas=useRef(null);
  const [unsupported,setUnsupported]=useState(false);
  const names={
    original:['01 / 元の合成','光の回り込みを加えていない状態'],
    matte:['02 / 前景のマット','白ほど前景が見える領域'],
    result:['03 / ライトラップ後','輪郭の内側へ背景色を混ぜた状態']
  };
  useEffect(()=>{
    let ctx;
    try{ctx=canvas.current?.getContext('2d',{alpha:false});}catch{ctx=null;}
    if(!ctx){setUnsupported(true);return;}
    const img=ctx.createImageData(WRAP_WIDTH,WRAP_HEIGHT);
    img.data.set(pixels);
    ctx.putImageData(img,0,0);
  },[pixels]);
  const [title,description]=names[kind];
  return <figure className="vp-wrap__panel" data-vp-wrap-panel={kind}>
    <figcaption><strong>{title}</strong><span>{description}</span></figcaption>
    <canvas ref={canvas} width={WRAP_WIDTH} height={WRAP_HEIGHT} role="img"
      aria-label={title+'：生成した背景と前景を比較する画像'}/>
    {unsupported&&<p>Canvasを利用できないため画像を表示できません。</p>}
  </figure>;
}
export default function LightWrapPlayground(){
  const id=useId();
  const [scene,setScene]=useState(WRAP_DEFAULTS.scene);
  const [shape,setShape]=useState(WRAP_DEFAULTS.shape);
  const [radius,setRadius]=useState(WRAP_DEFAULTS.radius);
  const [strength,setStrength]=useState(WRAP_DEFAULTS.strength);
  const frame=useMemo(()=>makeWrapScene(scene,shape),[scene,shape]);
  const input=useMemo(()=>renderLightWrap(frame,{scene,shape,radius:0,strength:0}),[frame,scene,shape]);
  const matte=useMemo(()=>makeWrapMatte(frame),[frame]);
  const result=useMemo(()=>renderLightWrap(frame,{scene,shape,radius,strength}),[frame,scene,shape,radius,strength]);
  const changed=useMemo(()=>countChangedPixels(input,result),[input,result]);
  const reset=()=>{
    setScene(WRAP_DEFAULTS.scene);setShape(WRAP_DEFAULTS.shape);
    setRadius(WRAP_DEFAULTS.radius);setStrength(WRAP_DEFAULTS.strength);
  };
  return <section className="vp-wrap" data-vp-light-wrap="ready"
    data-vp-light-wrap-radius={radius} data-vp-light-wrap-strength={strength}
    aria-labelledby={id+'-title'}>
    <h3 id={id+'-title'}>背景の色を前景の輪郭へ回り込ませる</h3>
    <p>光が強い側の縁に注目し、幅と強さを変えてください。</p>
    <div className="vp-wrap__previews">
      <Preview kind="original" pixels={input}/>
      <Preview kind="matte" pixels={matte}/>
      <Preview kind="result" pixels={result}/>
    </div>
    <p className="vp-wrap__readout" aria-live="polite">元の合成から色が変わった画素：{changed.toLocaleString('ja-JP')} px（全{WRAP_WIDTH*WRAP_HEIGHT} px）</p>
    <p className="vp-wrap__note">合成の輪郭を使った2D近似です。背景のサンプルを前景の内側だけに混ぜ、実際の散乱や反射は計算しません。</p>
    <div className="vp-wrap__controls">
      <label><span>背景の絵柄</span><select value={scene} aria-label="背景の絵柄" onChange={e=>setScene(e.target.value)}>
        <option value="sunset">暖色の光</option><option value="neon">寒色の光</option>
      </select></label>
      <label><span>前景の形</span><select value={shape} aria-label="前景の形" onChange={e=>setShape(e.target.value)}>
        <option value="ellipse">楕円の被写体</option><option value="card">四角い被写体</option>
      </select></label>
      <label><span>回り込みの幅：<output htmlFor={id+'-radius'}>{radius} px</output></span>
        <input id={id+'-radius'} type="range" aria-label="回り込みの幅" min="0" max="18" step="3" value={radius}
          onChange={e=>setRadius(Number(e.target.value))}/></label>
      <label><span>混合の強さ：<output htmlFor={id+'-strength'}>{strength.toFixed(2)}</output></span>
        <input id={id+'-strength'} type="range" aria-label="混合の強さ" min="0" max="1.5" step="0.25"
          value={strength} onChange={e=>setStrength(Number(e.target.value))}/></label>
    </div>
    <button className="vp-wrap__reset" type="button" onClick={reset}>初期値に戻す</button>
  </section>;
}
