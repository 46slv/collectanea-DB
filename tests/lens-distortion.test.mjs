import test from 'node:test';
import assert from 'node:assert/strict';
import {makeLensPattern,warpLensPattern} from '../src/components/LensDistortionPlayground/lens-core.mjs';
const px=(a,w,x,y)=>[...a.slice((y*w+x)*4,(y*w+x+1)*4)];
test('zero and original preserve opaque grayscale and input',()=>{
 const a=Uint8ClampedArray.from([0,35,150,255]);
 for(const mode of ['original','barrel','pincushion']){
  const b=warpLensPattern(a,2,2,{mode,strength:0});
  assert.deepEqual(px(b,2,1,0),[35,35,35,255]);assert.deepEqual(px(b,2,1,1),[255,255,255,255]);
  b[0]=99;assert.equal(a[0],0);
 }
 assert.deepEqual(px(warpLensPattern(a,2,2,{mode:'original',strength:.3}),2,0,0),[0,0,0,255]);
});
test('optical center unchanged',()=>{
 const a=Uint8ClampedArray.from(Array.from({length:81},(_,i)=>i*7%256));
 for(const mode of ['barrel','pincushion'])
  assert.deepEqual(px(warpLensPattern(a,9,9,{mode,strength:.3}),9,4,4),[a[40],a[40],a[40],255]);
});
test('barrel samples outward and pincushion inward',()=>{
 const a=Uint8ClampedArray.from(Array.from({length:169},(_,i)=>i%13*20));
 const original=warpLensPattern(a,13,13,{mode:'original'});
 const barrel=warpLensPattern(a,13,13,{mode:'barrel',strength:.3});
 const pin=warpLensPattern(a,13,13,{mode:'pincushion',strength:.3});
 assert.ok(px(barrel,13,10,6)[0]>px(original,13,10,6)[0]);
 assert.ok(px(pin,13,10,6)[0]<px(original,13,10,6)[0]);
});
test('outside matte is opaque; constant inward field stays constant',()=>{
 const a=new Uint8ClampedArray(81).fill(185);
 const barrel=warpLensPattern(a,9,9,{mode:'barrel',strength:.3});
 assert.deepEqual(px(barrel,9,0,0),[16,16,16,255]);
 assert.deepEqual(px(barrel,9,4,4),[185,185,185,255]);
 const pin=warpLensPattern(a,9,9,{mode:'pincushion',strength:.3});
 for(let i=0;i<pin.length;i+=4)assert.deepEqual([...pin.slice(i,i+4)],[185,185,185,255]);
});
test('center movement affects warp but not original',()=>{
 const a=makeLensPattern(40,24);
 assert.notDeepEqual(warpLensPattern(a,40,24,{centerX:25,strength:.3}),warpLensPattern(a,40,24,{centerX:75,strength:.3}));
 assert.deepEqual(warpLensPattern(a,40,24,{mode:'original',centerX:25}),warpLensPattern(a,40,24,{mode:'original',centerX:75}));
});
test('patterns differ and source is never mutated',()=>{
 const a=makeLensPattern(64,32),copy=a.slice();
 assert.notDeepEqual(a,makeLensPattern(64,32,'frames'));
 const b=warpLensPattern(a,64,32);
 assert.equal(b.length,64*32*4);assert.deepEqual(a,copy);
 assert.ok(b.some((v,i)=>i%4===0&&v!==a[i/4]));
});
test('invalid sizes, type and settings reject',()=>{
 const a=new Uint8ClampedArray(16);
 assert.throws(()=>makeLensPattern(1,3),RangeError);
 assert.throws(()=>makeLensPattern(2048,2048),RangeError);
 assert.throws(()=>makeLensPattern(4,4,'other'),RangeError);
 assert.throws(()=>warpLensPattern(a,3,3),RangeError);
 assert.throws(()=>warpLensPattern(new Uint8Array(16),4,4),RangeError);
 for(const opts of [{strength:-.01},{strength:.31},{strength:NaN},{strength:Infinity},{centerX:24},{centerX:76},{centerX:50.5},{mode:'other'}])
  assert.throws(()=>warpLensPattern(a,4,4,opts),RangeError);
});
