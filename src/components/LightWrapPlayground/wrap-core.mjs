export const WRAP_WIDTH=320;
export const WRAP_HEIGHT=180;
export const WRAP_DEFAULTS=Object.freeze({scene:'sunset',shape:'ellipse',radius:12,strength:1});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

export function validateWrapOptions(options={}){
  if(!options||typeof options!=='object'||Array.isArray(options))throw new RangeError('Invalid wrap options');
  const o={...WRAP_DEFAULTS,...options};
  if(!['sunset','neon'].includes(o.scene)||!['ellipse','card'].includes(o.shape)||
    !Number.isInteger(o.radius)||o.radius<0||o.radius>18||
    !Number.isFinite(o.strength)||o.strength<0||o.strength>1.5)
    throw new RangeError('Invalid wrap parameter');
  return o;
}
export function insideDistance(x,y,shape){
  if(shape==='ellipse'){
    const dx=(x-160)/57,dy=(y-92)/64;
    return (1-Math.sqrt(dx*dx+dy*dy))*57;
  }
  if(shape==='card')return Math.min(x-112,208-x,y-39,149-y);
  throw new RangeError('Invalid matte shape');
}
export function makeWrapScene(scene='sunset',shape='ellipse'){
  validateWrapOptions({scene,shape});
  const background=new Uint8ClampedArray(WRAP_WIDTH*WRAP_HEIGHT*4);
  const foreground=new Uint8ClampedArray(background.length);
  for(let y=0;y<WRAP_HEIGHT;y++)for(let x=0;x<WRAP_WIDTH;x++){
    const i=(y*WRAP_WIDTH+x)*4;
    const flare=Math.exp(-((x-(scene==='sunset'?67:257))**2+(y-79)**2)/1900);
    const bands=((Math.floor(x/24)+Math.floor(y/26))%5===0&&y>105)?25:0;
    const t=y/WRAP_HEIGHT;
    if(scene==='sunset'){
      background[i]=clamp(Math.round(52+130*(1-t)+92*flare+bands),0,255);
      background[i+1]=clamp(Math.round(33+51*t+62*flare+bands),0,255);
      background[i+2]=clamp(Math.round(71+77*t+14*flare+bands),0,255);
    }else{
      background[i]=clamp(Math.round(18+38*t+15*flare+bands),0,255);
      background[i+1]=clamp(Math.round(48+60*(1-t)+124*flare+bands),0,255);
      background[i+2]=clamp(Math.round(95+65*t+110*flare+bands),0,255);
    }
    background[i+3]=255;
    const d=insideDistance(x,y,shape);
    const a=clamp(d+.5,0,1);
    const stripe=(y%27<3)?20:0;
    foreground[i]=42+stripe+Math.floor((x/WRAP_WIDTH)*14);
    foreground[i+1]=58+stripe+Math.floor(y/12)%13;
    foreground[i+2]=70+stripe;
    foreground[i+3]=Math.round(a*255);
  }
  return {background,foreground};
}
export function makeWrapMatte(frame){
  validateFrame(frame);
  const mask=new Uint8ClampedArray(frame.foreground.length);
  for(let i=0;i<mask.length;i+=4){
    mask[i]=mask[i+1]=mask[i+2]=frame.foreground[i+3];
    mask[i+3]=255;
  }
  return mask;
}
function validateFrame(frame){
  const n=WRAP_WIDTH*WRAP_HEIGHT*4;
  if(!frame||!(frame.background instanceof Uint8ClampedArray)||
    !(frame.foreground instanceof Uint8ClampedArray)||
    frame.background.length!==n||frame.foreground.length!==n)
    throw new RangeError('Expected matching RGBA frames');
}
function sampleBackground(frame,x,y,delta,c){
  const offsets=[-delta,0,delta];
  let total=0;
  for(const dy of offsets)for(const dx of offsets){
    const sx=clamp(x+dx,0,WRAP_WIDTH-1),sy=clamp(y+dy,0,WRAP_HEIGHT-1);
    total+=frame.background[(sy*WRAP_WIDTH+sx)*4+c];
  }
  return total/9;
}
export function renderLightWrap(frame,options={}){
  const o=validateWrapOptions(options);validateFrame(frame);
  const out=new Uint8ClampedArray(frame.background.length);
  const delta=Math.max(1,Math.round(o.radius/2));
  for(let y=0;y<WRAP_HEIGHT;y++)for(let x=0;x<WRAP_WIDTH;x++){
    const i=(y*WRAP_WIDTH+x)*4,a=frame.foreground[i+3]/255;
    const d=Math.max(0,insideDistance(x,y,o.shape));
    const wrap=(a>0&&o.radius>0&&o.strength>0)?clamp(o.strength*Math.max(0,1-d/o.radius),0,1):0;
    for(let c=0;c<3;c++){
      const b=frame.background[i+c],f=frame.foreground[i+c];
      const w=wrap>0?sampleBackground(frame,x,y,delta,c):0;
      out[i+c]=Math.round(a*(f*(1-wrap)+w*wrap)+(1-a)*b);
    }
    out[i+3]=255;
  }
  return out;
}
export function countChangedPixels(a,b){
  if(!(a instanceof Uint8ClampedArray)||!(b instanceof Uint8ClampedArray)||a.length!==b.length||a.length!==WRAP_WIDTH*WRAP_HEIGHT*4)throw new RangeError('Invalid RGBA comparison');
  let n=0;
  for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;
  return n;
}
