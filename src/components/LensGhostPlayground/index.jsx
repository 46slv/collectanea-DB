import React, {useEffect,useId,useMemo,useRef,useState} from 'react';
import {GHOST_WIDTH,GHOST_HEIGHT,GHOST_INITIAL,layoutGhosts,apertureVertices} from './ghost-core.mjs';
import './playground.css';

function drawScene(ctx,x,y){
  const w=GHOST_WIDTH,h=GHOST_HEIGHT;
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#0e1426');sky.addColorStop(1,'#302b37');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#121b28';
  for(let i=0;i<8;i++){const bw=35+(i%3)*9,bh=48+(i*31)%65;
    ctx.fillRect(i*52-7,h-bh,bw,bh);}
  ctx.fillStyle='#917a57';
  for(let i=0;i<18;i++){const wx=(i*37+11)%w,wy=105+(i*19)%46;
    ctx.fillRect(wx,wy,3,5);}
  const glow=ctx.createRadialGradient(x,y,2,x,y,35);
  glow.addColorStop(0,'rgba(255,246,194,0.9)');
  glow.addColorStop(.2,'rgba(255,220,153,0.50)');
  glow.addColorStop(1,'rgba(255,218,153,0)');
  ctx.fillStyle=glow;ctx.fillRect(x-35,y-35,70,70);
  ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle='#fff3db';ctx.fill();
}
function drawGhosts(ctx,ghosts){
  for(const g of ghosts){
    if(g.opacity===0)continue;
    const points=apertureVertices(g.x,g.y,g.radius,g.blades);
    ctx.save();ctx.globalAlpha=g.opacity;
    ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
    ctx.closePath();ctx.fillStyle=g.color;ctx.fill();
    ctx.globalAlpha=Math.min(1,g.opacity*.85);
    ctx.lineWidth=2;ctx.strokeStyle='#f2ffff';ctx.stroke();
    ctx.globalAlpha=g.opacity*.65;
    ctx.beginPath();ctx.arc(g.x,g.y,g.radius*.34,0,Math.PI*2);
    ctx.fillStyle='#172535';ctx.fill();
    ctx.restore();
  }
}
function Preview({mode,title,detail,lightX,lightY,ghosts}){
  const ref=useRef(null),[unavailable,setUnavailable]=useState(false);
  useEffect(()=>{
    let ctx;try{ctx=ref.current?.getContext('2d',{alpha:false});}catch{ctx=null;}
    if(!ctx){setUnavailable(true);return;}
    ctx.clearRect(0,0,GHOST_WIDTH,GHOST_HEIGHT);
    if(mode==='ghosts'){
      ctx.fillStyle='#141923';ctx.fillRect(0,0,GHOST_WIDTH,GHOST_HEIGHT);
      ctx.save();ctx.strokeStyle='#8a929d';ctx.setLineDash([5,5]);
      ctx.beginPath();ctx.moveTo(lightX,lightY);ctx.lineTo((GHOST_WIDTH-1)/2,(GHOST_HEIGHT-1)/2);
      ctx.stroke();ctx.restore();
      ctx.beginPath();ctx.arc(lightX,lightY,3,0,Math.PI*2);ctx.fillStyle='#fff3db';ctx.fill();
    }else drawScene(ctx,lightX,lightY);
    if(mode!=='source')drawGhosts(ctx,ghosts);
  },[mode,lightX,lightY,ghosts]);
  return <figure className="vp-lg__panel" data-vp-lg-panel={mode}>
    <figcaption><strong>{title}</strong><span>{detail}</span></figcaption>
    <canvas ref={ref} width={GHOST_WIDTH} height={GHOST_HEIGHT}
      role="img" aria-label={title+'：ページ内で生成した光源と反射像の実験'}/>
    {unavailable&&<p>この端末ではCanvasを利用できません。</p>}
  </figure>;
}
export default function LensGhostPlayground(){
  const id=useId();
  const [sourceX,setSourceX]=useState(GHOST_INITIAL.sourceX);
  const [sourceY,setSourceY]=useState(GHOST_INITIAL.sourceY);
  const [strength,setStrength]=useState(GHOST_INITIAL.strength);
  const [count,setCount]=useState(GHOST_INITIAL.count);
  const [blades,setBlades]=useState(GHOST_INITIAL.blades);
  const ghosts=useMemo(()=>layoutGhosts(GHOST_WIDTH,GHOST_HEIGHT,
    {sourceX,sourceY,strength,count,blades}),[sourceX,sourceY,strength,count,blades]);
  const lightX=(GHOST_WIDTH-1)*sourceX/100,lightY=(GHOST_HEIGHT-1)*sourceY/100;
  const reset=()=>{setSourceX(GHOST_INITIAL.sourceX);setSourceY(GHOST_INITIAL.sourceY);
    setStrength(GHOST_INITIAL.strength);setCount(GHOST_INITIAL.count);setBlades(GHOST_INITIAL.blades);};
  return <section className="vp-lg" data-vp-lens-ghost="ready"
    data-vp-lg-count={count} data-vp-lg-strength={strength}
    aria-labelledby={id+'-title'}>
    <h3 id={id+'-title'}>光源と反射像の並びを操作する</h3>
    <p>光源を動かし、画面中心の反対側に並ぶ多角形の反射像を比べます。</p>
    <div className="vp-lg__previews">
      <Preview mode="source" title="01 / 入力" detail="点光源と夜景" lightX={lightX} lightY={lightY} ghosts={ghosts}/>
      <Preview mode="ghosts" title="02 / ゴースト成分" detail="中心への点線は配置の目安" lightX={lightX} lightY={lightY} ghosts={ghosts}/>
      <Preview mode="combined" title="03 / 合成結果" detail="画面に重なる半透明の像" lightX={lightX} lightY={lightY} ghosts={ghosts}/>
    </div>
    <p className="vp-lg__note">これは光線追跡ではなく、反射像の位置・形・強さを分けて観察する模式図です。</p>
    <div className="vp-lg__controls">
      <label><span>光源の横位置：<output htmlFor={id+'-x'}>{sourceX}%</output></span>
        <input id={id+'-x'} type="range" min="15" max="85" step="1" value={sourceX}
          aria-label="光源の横位置" onChange={e=>setSourceX(Number(e.target.value))}/></label>
      <label><span>光源の縦位置：<output htmlFor={id+'-y'}>{sourceY}%</output></span>
        <input id={id+'-y'} type="range" min="20" max="80" step="1" value={sourceY}
          aria-label="光源の縦位置" onChange={e=>setSourceY(Number(e.target.value))}/></label>
      <label><span>ゴーストの強さ：<output htmlFor={id+'-strength'}>{strength.toFixed(2)}</output></span>
        <input id={id+'-strength'} type="range" min="0" max="1" step="0.05" value={strength}
          aria-label="ゴーストの強さ" onChange={e=>setStrength(Number(e.target.value))}/></label>
      <label><span>反射像の数：<output htmlFor={id+'-count'}>{count}</output></span>
        <input id={id+'-count'} type="range" min="1" max="5" step="1" value={count}
          aria-label="反射像の数" onChange={e=>setCount(Number(e.target.value))}/></label>
      <label><span>絞り形状（辺の数）</span>
        <select aria-label="絞り形状" value={blades} onChange={e=>setBlades(Number(e.target.value))}>
          <option value={5}>五角形</option><option value={6}>六角形</option><option value={8}>八角形</option>
        </select></label>
    </div>
    <button type="button" className="vp-lg__reset" onClick={reset}>初期値に戻す</button>
  </section>;
}
