// Inverse remapping for education, not lens calibration.
export const LENS_WIDTH=384,LENS_HEIGHT=192;
export const LENS_INITIAL=Object.freeze({pattern:'grid',strength:0.22,centerX:50});
const valid=(w,h)=>Number.isInteger(w)&&Number.isInteger(h)&&w>=2&&h>=2&&w*h<=1048576;
export function makeLensPattern(w,h,pattern='grid'){
  if(!valid(w,h)||!['grid','frames'].includes(pattern))throw new RangeError('Invalid image');
  const out=new Uint8ClampedArray(w*h),cx=(w-1)/2,cy=(h-1)/2;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    let lit;
    if(pattern==='grid')lit=x%32<2||y%32<2;
    else {
      const dx=Math.abs(x-cx),dy=Math.abs(y-cy);
      lit=(Math.abs(dx-w*.38)<2&&dy<=h*.4)||(Math.abs(dy-h*.4)<2&&dx<=w*.38)||
        (Math.abs(dx-w*.22)<2&&dy<=h*.25)||(Math.abs(dy-h*.25)<2&&dx<=w*.22)||
        Math.abs(y-x*h/w)<1.5;
    }
    out[y*w+x]=lit?245:38;
  }
  return out;
}
function bilinear(a,w,h,x,y){
  const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(w-1,x0+1),y1=Math.min(h-1,y0+1);
  const fx=x-x0,fy=y-y0;
  return (a[y0*w+x0]*(1-fx)+a[y0*w+x1]*fx)*(1-fy)+
    (a[y1*w+x0]*(1-fx)+a[y1*w+x1]*fx)*fy;
}
/** Output->input: q = center + (pixel-center)*(1 + sign*strength*r²).
 * This inverse-sampling coefficient is NOT OpenCV's forward camera k1. */
export function warpLensPattern(input,w,h,{strength=0.22,centerX=50,mode='barrel'}={}){
  if(!valid(w,h)||!(input instanceof Uint8ClampedArray)||input.length!==w*h)
    throw new RangeError('Invalid input');
  if(!Number.isFinite(strength)||strength<0||strength>0.30||
     !Number.isInteger(centerX)||centerX<25||centerX>75||
     !['original','barrel','pincushion'].includes(mode))
    throw new RangeError('Invalid controls');
  const out=new Uint8ClampedArray(w*h*4),cx=(w-1)*centerX/100,cy=(h-1)/2;
  const radius=Math.hypot(Math.max(cx,w-1-cx),Math.max(cy,h-1-cy));
  const sign=mode==='barrel'?1:-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x,j=i*4;let v=input[i];
    if(mode!=='original'&&strength!==0){
      const dx=x-cx,dy=y-cy,r2=(dx*dx+dy*dy)/(radius*radius);
      const s=1+sign*strength*r2,sx=cx+dx*s,sy=cy+dy*s;
      v=sx<0||sy<0||sx>w-1||sy>h-1?16:bilinear(input,w,h,sx,sy);
    }
    out[j]=out[j+1]=out[j+2]=v;out[j+3]=255;
  }
  return out;
}
