export const GHOST_WIDTH=360;
export const GHOST_HEIGHT=180;
export const GHOST_INITIAL=Object.freeze({"sourceX":74,"sourceY":32,"strength":0.65,"count":3,"blades":6});

function validateGhostSettings(width,height,options={}){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<80||height<60||width>1600||height>900)throw new RangeError("Invalid canvas dimensions");
  if(options===null||typeof options!=="object"||Array.isArray(options))throw new RangeError("Invalid ghost settings");
  const s={...GHOST_INITIAL,...options};
  if(!Number.isInteger(s.sourceX)||s.sourceX<15||s.sourceX>85||!Number.isInteger(s.sourceY)||s.sourceY<20||s.sourceY>80||
     typeof s.strength!=="number"||!Number.isFinite(s.strength)||s.strength<0||s.strength>1||
     !Number.isInteger(s.count)||s.count<1||s.count>5||![5,6,8].includes(s.blades))throw new RangeError("Invalid ghost parameter");
  return s;
}

function layoutGhosts(width,height,options={}){
  const s=validateGhostSettings(width,height,options);
  const cx=(width-1)/2,cy=(height-1)/2;
  const lightX=(width-1)*s.sourceX/100,lightY=(height-1)*s.sourceY/100;
  const colors=["#67d9e4","#f4a4ca","#c3abf4","#89d4bb","#fac37d"];
  return Array.from({length:s.count},(_,i)=>{
    const opposite=0.27+i*0.195;
    return {x:cx+(cx-lightX)*opposite,y:cy+(cy-lightY)*opposite,
      radius:10+(i*7)%19,opacity:s.strength*0.54/(1+i*0.48),
      color:colors[i],blades:s.blades,opposite};
  });
}

function apertureVertices(x,y,radius,blades){
  if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(radius)||radius<=0||![5,6,8].includes(blades))throw new RangeError("Invalid aperture");
  return Array.from({length:blades},(_,i)=>{
    const a=-Math.PI/2+2*Math.PI*i/blades;
    return {x:x+radius*Math.cos(a),y:y+radius*Math.sin(a)};
  });
}

export {validateGhostSettings,layoutGhosts,apertureVertices};
