export const BOKEH_WIDTH=360;
export const BOKEH_HEIGHT=180;
export const BOKEH_INITIAL=Object.freeze({"radius":14,"blades":6,"oval":1,"edge":0.35});
export const BOKEH_LIGHTS=Object.freeze([{"x":36,"y":48,"color":"#fbe4ad","gain":1},{"x":89,"y":78,"color":"#c5d8ff","gain":0.85},{"x":142,"y":35,"color":"#ffd2a8","gain":0.9},{"x":226,"y":58,"color":"#a1e8e1","gain":0.75},{"x":277,"y":31,"color":"#f4c2ec","gain":1},{"x":318,"y":84,"color":"#fce0aa","gain":0.8}].map(p=>Object.freeze(p)));

export function validateBokehOptions(options={}){
  if(options===null||typeof options!=="object"||Array.isArray(options))throw new RangeError("Invalid bokeh options");
  const o={...BOKEH_INITIAL,...options};
  if(!Number.isInteger(o.radius)||o.radius<3||o.radius>30||
    ![0,5,6,8].includes(o.blades)||
    typeof o.oval!=="number"||!Number.isFinite(o.oval)||o.oval<0.6||o.oval>1.4||
    typeof o.edge!=="number"||!Number.isFinite(o.edge)||o.edge<0||o.edge>1)throw new RangeError("Invalid bokeh parameter");
  return o;
}

export function bokehVertices(x,y,radius,blades,oval=1){
  if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(radius)||radius<=0||radius>120||
    ![0,5,6,8].includes(blades)||!Number.isFinite(oval)||oval<0.6||oval>1.4)throw new RangeError("Invalid bokeh geometry");
  const count=blades||64;
  return Array.from({length:count},(_,i)=>{
    const angle=-Math.PI/2+i*2*Math.PI/count;
    return {x:x+Math.cos(angle)*radius*oval,y:y+Math.sin(angle)*radius};
  });
}

export function layoutBokeh(options={}){
  const o=validateBokehOptions(options);
  return BOKEH_LIGHTS.map((light,i)=>({
    ...light,id:i+1,radius:o.radius,vertices:bokehVertices(light.x,light.y,o.radius,o.blades,o.oval)
  }));
}
