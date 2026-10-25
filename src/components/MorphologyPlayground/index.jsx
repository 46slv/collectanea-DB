import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {MORPH_WIDTH, MORPH_HEIGHT, MORPH_INITIAL, makeMorphologyMask, morphologyBinary} from './morphology-core.mjs';
import './playground.css';

function Preview({kind, heading, detail, pixels}) {
  const canvasRef=useRef(null);
  const [unsupported,setUnsupported]=useState(false);
  useEffect(()=>{
    let ctx;
    try{ctx=canvasRef.current?.getContext('2d',{alpha:false});}catch{ctx=null;}
    if(!ctx){setUnsupported(true);return;}
    const img=ctx.createImageData(MORPH_WIDTH,MORPH_HEIGHT);
    for(let i=0;i<pixels.length;i++){
      const j=i*4;
      img.data[j]=img.data[j+1]=img.data[j+2]=pixels[i];
      img.data[j+3]=255;
    }
    ctx.putImageData(img,0,0);
  },[pixels]);
  return <figure className="vp-morph__panel" data-vp-morph-preview={kind}>
    <figcaption><strong>{heading}</strong><span>{detail}</span></figcaption>
    <canvas ref={canvasRef} width={MORPH_WIDTH} height={MORPH_HEIGHT}
      role="img" aria-label={heading+'：二値マスクの白い領域を表示'} />
    {unsupported && <p role="status">この端末ではCanvas画像を表示できません。</p>}
  </figure>;
}
export default function MorphologyPlayground(){
  const id=useId();
  const [scene,setScene]=useState(MORPH_INITIAL.scene);
  const [radius,setRadius]=useState(MORPH_INITIAL.radius);
  const source=useMemo(()=>makeMorphologyMask(MORPH_WIDTH,MORPH_HEIGHT,scene),[scene]);
  const result=useMemo(()=>morphologyBinary(source,MORPH_WIDTH,MORPH_HEIGHT,{radius}),[source,radius]);
  const reset=()=>{setScene(MORPH_INITIAL.scene);setRadius(MORPH_INITIAL.radius);};
  return <section className="vp-morph" data-vp-morphology="ready" data-vp-morph-radius={radius}
      aria-labelledby={id+'-heading'}>
    <h3 id={id+'-heading'}>同じマスクを広げる／削る</h3>
    <p>白は選択領域、黒は非選択領域です。結果を見ながら半径を変えてください。</p>
    <div className="vp-morph__previews">
      <Preview kind="before" heading="01 / 元マスク" detail="未加工" pixels={source}/>
      <Preview kind="dilation" heading="02 / 膨張（Dilation）" detail="一つでも白があれば白" pixels={result.dilated}/>
      <Preview kind="erosion" heading="03 / 収縮（Erosion）" detail="全部白のときだけ白" pixels={result.eroded}/>
    </div>
    <p className="vp-morph__metric" aria-live="polite">
      白画素：元 {result.whiteBefore.toLocaleString('ja-JP')} ／
      膨張 {result.whiteDilated.toLocaleString('ja-JP')} ／
      収縮 {result.whiteEroded.toLocaleString('ja-JP')}
    </p>
    <div className="vp-morph__controls">
      <label><span>テストマスク</span><select aria-label="テストマスク" value={scene}
          onChange={e=>setScene(e.target.value)}>
        <option value="shapes">穴のある楕円・細い棒・孤立点</option>
        <option value="lines">途切れた線・点列</option>
      </select></label>
      <label><span>近傍の半径：<output htmlFor={id+'-radius'}>{radius} px</output></span>
        <input id={id+'-radius'} type="range" aria-label="近傍の半径"
          min="0" max="8" step="1" value={radius}
          onChange={e=>setRadius(Number(e.target.value))}/>
      </label>
    </div>
    <button type="button" className="vp-morph__reset" onClick={reset}>初期値に戻す</button>
  </section>;
}
