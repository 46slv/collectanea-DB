export const HP_WIDTH=320, HP_HEIGHT=160;
export const HP_INITIAL=Object.freeze({pattern:'edges',sigma:3,gain:2});
const validSize=(w,h)=>Number.isInteger(w)&&Number.isInteger(h)&&w>=2&&h>=2&&w*h<=1048576;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

export function makeHighPassPattern(w,h,pattern='edges'){
  if(!validSize(w,h)||!['edges','texture'].includes(pattern))throw new RangeError('Invalid image');
  const result=new Uint8ClampedArray(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let value;
    if(pattern==='edges'){
      value=x<w/2?60:186;
      if(x%29<2&&y>h*.2&&y<h*.8)value=245;
      const cx=w*.69,cy=h*.52,r=Math.hypot(x-cx,y-cy);
      if(r<Math.min(w,h)*.16)value=245;
      if(r>Math.min(w,h)*.16&&r<Math.min(w,h)*.19)value=25;
    }else{
      value=116+42*Math.sin(x/23)+18*Math.cos(y/15)+
        ((((x>>2)+(y>>2))%2)===0?26:-26);
      if(Math.abs(y-x*h/w)<2)value=240;
    }
    result[y*w+x]=clamp(value,0,255);
  }
  return result;
}

export function gaussianLowPass(input,w,h,sigma=3){
  if(!validSize(w,h)||!(input instanceof Uint8ClampedArray)||input.length!==w*h)
    throw new RangeError('Invalid image');
  if(!Number.isFinite(sigma)||sigma<0.5||sigma>8)throw new RangeError('Invalid sigma');
  const radius=Math.ceil(3*sigma),kernel=new Float64Array(2*radius+1);
  let sum=0;
  for(let i=-radius;i<=radius;i++){
    const weight=Math.exp(-0.5*(i/sigma)**2);
    kernel[i+radius]=weight;sum+=weight;
  }
  for(let i=0;i<kernel.length;i++)kernel[i]/=sum;
  const temp=new Float64Array(w*h),out=new Float64Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let accum=0;
    for(let k=-radius;k<=radius;k++)
      accum+=input[y*w+clamp(x+k,0,w-1)]*kernel[k+radius];
    temp[y*w+x]=accum;
  }
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let accum=0;
    for(let k=-radius;k<=radius;k++)
      accum+=temp[clamp(y+k,0,h-1)*w+x]*kernel[k+radius];
    out[y*w+x]=accum;
  }
  return out;
}

/** Signed high pass: detail = source - Gaussian(source).
 * The preview adds 128 only for display. Reconstruction is low + gain * detail.
 * All computations before display quantization use floating-point values. */
export function composeHighPass(input,low,w,h,{gain=2}={}){
  if(!validSize(w,h)||!(input instanceof Uint8ClampedArray)||input.length!==w*h||
     !(low instanceof Float64Array)||low.length!==w*h)
    throw new RangeError('Invalid image');
  if(!Number.isFinite(gain)||gain<0||gain>3)throw new RangeError('Invalid gain');
  const original=input.slice(),detail=new Uint8ClampedArray(w*h),
    recomposed=new Uint8ClampedArray(w*h);
  let clippedCount=0;
  for(let i=0;i<input.length;i++){
    const blurred=low[i];
    if(!Number.isFinite(blurred)||blurred<0||blurred>255)throw new RangeError('Invalid blurred pixel');
    const diff=input[i]-blurred;
    detail[i]=clamp(128+diff*gain,0,255);
    const combined=blurred+gain*diff;
    if(combined<0||combined>255)clippedCount++;
    recomposed[i]=clamp(combined,0,255);
  }
  return {original,detail,recomposed,clippedCount};
}
