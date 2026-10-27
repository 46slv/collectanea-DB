export const DOF_WIDTH=360;
export const DOF_HEIGHT=180;
export const DOF_PLANES=Object.freeze([1.5,3,9]);
export const DOF_DEFAULTS=Object.freeze({focus:3,aperture:2.8,strength:1,pattern:'lights'});
export function validateDofOptions(options={}){
  if(options===null||typeof options!=='object'||Array.isArray(options))throw new RangeError('Invalid DOF options');
  const o={...DOF_DEFAULTS,...options};
  if(!DOF_PLANES.includes(o.focus)||![1.8,2.8,5.6,11].includes(o.aperture)||
    !Number.isFinite(o.strength)||o.strength<0||o.strength>2||
    !['lights','edges'].includes(o.pattern))throw new RangeError('Invalid DOF parameter');
  return o;
}
export function planeBlurRadii(options={}){
  const o=validateDofOptions(options);
  return DOF_PLANES.map(z=>Math.min(14,Math.round(52*(2.8/o.aperture)*Math.abs(1/z-1/o.focus)*o.strength)));
}
export function makeDofScene(pattern='lights'){
  if(!['lights','edges'].includes(pattern))throw new RangeError('Invalid scene');
  const data=new Uint8ClampedArray(DOF_WIDTH*DOF_HEIGHT*4);
  const palette=[[248,198,108],[111,224,245],[248,140,197]];
  for(let y=0;y<DOF_HEIGHT;y++)for(let x=0;x<DOF_WIDTH;x++){
    const z=Math.floor(x/120),u=x%120,i=(y*DOF_WIDTH+x)*4;
    let r,g,b;
    if(pattern==='lights'){
      r=17+Math.floor(y/28)+z*3;g=25+Math.floor(y/23);b=47+Math.floor(y/17);
      if(y>116&&u>10&&u<109){r=27;g=37;b=49;}
      if(y>145&&u%23<2){r=72;g=76;b=83;}
      if(y>78+z*8&&u>58&&u<90){r=20;g=27;b=39;}
      if(y>91+z*8&&u>65&&u<87&&Math.floor(y/13)%2===0){r=80;g=74;b=62;}
      const lamps=[[28,38,4,0],[82,70,5,1],[42,113,3,2],[101,49,3,0]];
      for(const [cx,cy,rad,color] of lamps){
        if((u-cx)**2+(y-cy)**2<=rad*rad)[r,g,b]=palette[(color+z)%3];
      }
      if(u>16&&u<105&&Math.abs(y-(137-u/5))<1.2){r=167;g=181;b=194;}
    }else{
      const tile=(Math.floor(u/15)+Math.floor(y/15))%2;
      r=tile?181:57;g=tile?195:69;b=tile?201:82;
      if(Math.abs(y-(25+u*.8))<2||Math.abs(y-(142-u*.45))<2){r=249;g=203;b=68;}
      if(u>33&&u<79&&y>65&&y<107){r=31;g=42;b=53;}
      if((u-56)**2+(y-86)**2<100){r=243;g=130;b=83;}
    }
    if(u<2||u>=118){r=36;g=42;b=51;}
    data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=255;
  }
  return data;
}
export function makeDofDepthMap(focus=3){
  if(!DOF_PLANES.includes(focus))throw new RangeError('Invalid focus');
  const colors=[[54,104,126],[111,86,138],[143,103,66]];
  const data=new Uint8ClampedArray(DOF_WIDTH*DOF_HEIGHT*4);
  for(let y=0;y<DOF_HEIGHT;y++)for(let x=0;x<DOF_WIDTH;x++){
    const z=Math.floor(x/120),u=x%120,i=(y*DOF_WIDTH+x)*4;
    const gain=DOF_PLANES[z]===focus?1.33:.7;
    for(let c=0;c<3;c++)data[i+c]=(u<2||u>=118)?32:Math.min(255,Math.round(colors[z][c]*gain+(y%25===0?18:0)));
    data[i+3]=255;
  }
  return data;
}
export function applyDofDefocus(source,options={}){
  const radii=planeBlurRadii(options);
  if(!(source instanceof Uint8ClampedArray)||source.length!==DOF_WIDTH*DOF_HEIGHT*4)throw new RangeError('Invalid RGBA frame');
  const out=new Uint8ClampedArray(source.length),tmp=new Float64Array(DOF_WIDTH*DOF_HEIGHT*3);
  for(let zone=0;zone<3;zone++){
    const left=zone*120,right=left+119,r=radii[zone],n=2*r+1;
    if(r===0){
      for(let y=0;y<DOF_HEIGHT;y++)for(let x=left;x<=right;x++){
        const i=(y*DOF_WIDTH+x)*4;out.set(source.subarray(i,i+4),i);
      }
      continue;
    }
    for(let y=0;y<DOF_HEIGHT;y++)for(let x=left;x<=right;x++)
      for(let c=0;c<3;c++){
        let s=0;
        for(let d=-r;d<=r;d++)s+=source[(y*DOF_WIDTH+Math.max(left,Math.min(right,x+d)))*4+c];
        tmp[(y*DOF_WIDTH+x)*3+c]=s/n;
      }
    for(let y=0;y<DOF_HEIGHT;y++)for(let x=left;x<=right;x++){
      const i=(y*DOF_WIDTH+x)*4;
      for(let c=0;c<3;c++){
        let s=0;
        for(let d=-r;d<=r;d++)s+=tmp[(Math.max(0,Math.min(DOF_HEIGHT-1,y+d))*DOF_WIDTH+x)*3+c];
        out[i+c]=Math.round(s/n);
      }
      out[i+3]=255;
    }
  }
  return out;
}
