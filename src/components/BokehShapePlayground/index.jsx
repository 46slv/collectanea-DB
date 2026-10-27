import React, {useEffect,useId,useMemo,useRef,useState} from 'react';
import {BOKEH_WIDTH,BOKEH_HEIGHT,BOKEH_INITIAL,BOKEH_LIGHTS,bokehVertices,layoutBokeh} from './bokeh-core.mjs';
import './playground.css';

function drawBackdrop(ctx){
  const grad=ctx.createLinearGradient(0,0,0,BOKEH_HEIGHT);
  grad.addColorStop(0,'#10192c');grad.addColorStop(1,'#354052');
  ctx.fillStyle=grad;ctx.fillRect(0,0,BOKEH_WIDTH,BOKEH_HEIGHT);
  ctx.fillStyle='#1b2434';
  for(let i=0;i<9;i++){const h=41+(i*29)%53;ctx.fillRect(i*44-6,BOKEH_HEIGHT-h,36+(i%2)*5,h);}
  ctx.fillStyle='#b6a384';
  for(let i=0;i<21;i++){const x=8+(i*31)%340,y=108+(i*17)%41;ctx.fillRect(x,y,2,4);}
  // Foreground railing remains sharp in both input and result.
  ctx.fillStyle='#111a25';ctx.fillRect(0,152,BOKEH_WIDTH,7);
  for(let x=22;x<360;x+=58)ctx.fillRect(x,139,5,41);
}
function drawSourceLights(ctx){
  for(const p of BOKEH_LIGHTS){
    ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,2.4,0,2*Math.PI);ctx.fill();
  }
}
function fillShape(ctx,vertices,color,edge){
  ctx.beginPath();ctx.moveTo(vertices[0].x,vertices[0].y);
  for(let i=1;i<vertices.length;i++)ctx.lineTo(vertices[i].x,vertices[i].y);
  ctx.closePath();
  ctx.fillStyle=color;ctx.globalAlpha=.34;ctx.fill();
  if(edge>0){ctx.globalAlpha=.12+.67*edge;ctx.strokeStyle=color;ctx.lineWidth=1.2+edge*1.5;ctx.stroke();}
  ctx.globalAlpha=1;
}
function BokehPreview({mode,options,specs}){
  const ref=useRef(null),[unavailable,setUnavailable]=useState(false);
  const labels={
    input:['01 / 入力','ピントの合った点光源'],
    aperture:['02 / 開口形状','中心に拡大表示したモデル'],
    result:['03 / 焦点外の点像','同じ位置で広がる明るい形']
  };
  useEffect(()=>{
    let ctx;try{ctx=ref.current?.getContext('2d',{alpha:false});}catch{ctx=null;}
    if(!ctx){setUnavailable(true);return;}
    ctx.clearRect(0,0,BOKEH_WIDTH,BOKEH_HEIGHT);
    if(mode==='aperture'){
      ctx.fillStyle='#101925';ctx.fillRect(0,0,BOKEH_WIDTH,BOKEH_HEIGHT);
      // Canvas context styles persist across redraws; reset guide width before each aperture paint.
      ctx.strokeStyle='#4a5361';ctx.lineWidth=1;ctx.setLineDash([4,5]);ctx.beginPath();
      ctx.moveTo(180,25);ctx.lineTo(180,155);ctx.moveTo(100,90);ctx.lineTo(260,90);ctx.stroke();
      ctx.setLineDash([]);
      fillShape(ctx,bokehVertices(180,90,Math.min(options.radius*2.2,66),options.blades,options.oval),'#d7ebee',options.edge);
    }else{
      drawBackdrop(ctx);
      if(mode==='input')drawSourceLights(ctx);
      else for(const disc of specs)fillShape(ctx,disc.vertices,disc.color,options.edge*disc.gain);
    }
  },[mode,options,specs]);
  return <figure className="vp-bokeh__panel" data-vp-bokeh-panel={mode}>
    <figcaption><strong>{labels[mode][0]}</strong><span>{labels[mode][1]}</span></figcaption>
    <canvas ref={ref} width={BOKEH_WIDTH} height={BOKEH_HEIGHT} role="img"
      aria-label={labels[mode][0]+'：ページ内で生成したボケ形状の比較'}/>
    {unavailable&&<p>Canvasが利用できないため描画できません。</p>}
  </figure>;
}
export default function BokehShapePlayground(){
  const id=useId();
  const [radius,setRadius]=useState(BOKEH_INITIAL.radius);
  const [blades,setBlades]=useState(BOKEH_INITIAL.blades);
  const [oval,setOval]=useState(BOKEH_INITIAL.oval);
  const [edge,setEdge]=useState(BOKEH_INITIAL.edge);
  const options=useMemo(()=>({radius,blades,oval,edge}),[radius,blades,oval,edge]);
  const specs=useMemo(()=>layoutBokeh(options),[options]);
  const reset=()=>{setRadius(BOKEH_INITIAL.radius);setBlades(BOKEH_INITIAL.blades);
    setOval(BOKEH_INITIAL.oval);setEdge(BOKEH_INITIAL.edge);};
  return <section className="vp-bokeh" data-vp-bokeh="ready"
    data-vp-bokeh-blades={blades} data-vp-bokeh-radius={radius}
    aria-labelledby={id+'-heading'}>
    <h3 id={id+'-heading'}>焦点外の点光源と開口形状を比べる</h3>
    <p>点光源の位置を変えずに、ぼけの大きさ・絞りの輪郭・横への伸び・縁の明るさを変えます。</p>
    <div className="vp-bokeh__previews">
      <BokehPreview mode="input" options={options} specs={specs}/>
      <BokehPreview mode="aperture" options={options} specs={specs}/>
      <BokehPreview mode="result" options={options} specs={specs}/>
    </div>
    <p className="vp-bokeh__note">ボケ円の形状だけを抽出した教育用描画です。実レンズの開口、色収差、輝度保存、被写界深度を再現しません。</p>
    <div className="vp-bokeh__controls">
      <label><span>ぼけ半径：<output htmlFor={id+'-radius'}>{radius} px</output></span>
        <input id={id+'-radius'} aria-label="ぼけ半径" type="range" min="3" max="30" step="1" value={radius}
          onChange={e=>setRadius(Number(e.target.value))}/></label>
      <label><span>絞りの形</span>
        <select aria-label="絞りの形" value={blades} onChange={e=>setBlades(Number(e.target.value))}>
          <option value={0}>円形</option><option value={5}>五角形</option>
          <option value={6}>六角形</option><option value={8}>八角形</option>
        </select></label>
      <label><span>横方向の倍率：<output htmlFor={id+'-oval'}>{oval.toFixed(2)}</output></span>
        <input id={id+'-oval'} aria-label="横方向の倍率" type="range" min="0.6" max="1.4" step="0.05" value={oval}
          onChange={e=>setOval(Number(e.target.value))}/></label>
      <label><span>縁の強さ：<output htmlFor={id+'-edge'}>{edge.toFixed(2)}</output></span>
        <input id={id+'-edge'} aria-label="縁の強さ" type="range" min="0" max="1" step="0.05" value={edge}
          onChange={e=>setEdge(Number(e.target.value))}/></label>
    </div>
    <button type="button" className="vp-bokeh__reset" onClick={reset}>初期値に戻す</button>
  </section>;
}
