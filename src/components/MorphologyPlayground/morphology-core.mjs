export const MORPH_WIDTH = 384;
export const MORPH_HEIGHT = 160;
export const MORPH_INITIAL = Object.freeze({scene: 'shapes', radius: 3});
function validateSize(w,h) {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w*h > 1000000)
    throw new RangeError('Invalid image size');
}
export function makeMorphologyMask(w,h,scene='shapes') {
  validateSize(w,h);
  if (!['shapes','lines'].includes(scene)) throw new RangeError('Invalid scene');
  const data=new Uint8ClampedArray(w*h);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    let white=false;
    if(scene==='shapes'){
      const oval=((x-w*.34)/(w*.2))**2+((y-h*.5)/(h*.32))**2<=1;
      const hole=Math.abs(x-w*.34)<3&&Math.abs(y-h*.5)<3;
      const bar=Math.abs(x-w*.73)<=4&&y>h*.18&&y<h*.82;
      const dot=Math.abs(x-w*.87)<1&&Math.abs(y-h*.31)<1;
      white=(oval&&!hole)||bar||dot;
    }else{
      const line=Math.abs(y-h*.48)<=2&&x>w*.1&&x<w*.9&&!(x>w*.47&&x<w*.50);
      const stem=Math.abs(x-w*.27)<=2&&y>h*.16&&y<h*.84;
      white=line||stem||(x%29===0&&y%19===0);
    }
    data[y*w+x]=white?255:0;
  }
  return data;
}
export function morphologyBinary(data,w,h,{radius=3}={}){
  validateSize(w,h);
  if(!(data instanceof Uint8ClampedArray)||data.length!==w*h)
    throw new RangeError('Expected one-channel Uint8ClampedArray');
  if(!Number.isInteger(radius)||radius<0||radius>8)
    throw new RangeError('Radius must be an integer from 0 to 8');
  const dilated=new Uint8ClampedArray(data.length);
  const eroded=new Uint8ClampedArray(data.length);
  let whiteBefore=0,whiteDilated=0,whiteEroded=0;
  for(const v of data) if(v>=128)whiteBefore++;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    let any=false,all=true;
    for(let dy=-radius;dy<=radius;dy++){
      for(let dx=-radius;dx<=radius;dx++){
        const xx=x+dx,yy=y+dy;
        const white=xx>=0&&xx<w&&yy>=0&&yy<h&&data[yy*w+xx]>=128;
        any ||= white;
        all &&= white;
        if(any&&!all)break;
      }
      if(any&&!all)break;
    }
    const i=y*w+x;
    if(any){dilated[i]=255;whiteDilated++;}
    if(all){eroded[i]=255;whiteEroded++;}
  }
  return {dilated,eroded,whiteBefore,whiteDilated,whiteEroded};
}
