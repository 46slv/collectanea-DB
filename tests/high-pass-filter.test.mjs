import test from 'node:test';
import assert from 'node:assert/strict';
import {HP_WIDTH,HP_HEIGHT,makeHighPassPattern,gaussianLowPass,composeHighPass} from '../src/components/HighPassPlayground/high-pass-core.mjs';
const calculate=(source,w,h,sigma=2,gain=2)=>composeHighPass(source,gaussianLowPass(source,w,h,sigma),w,h,{gain});

test('constant image has neutral high-pass and stable reconstruction',()=>{
  const source=new Uint8ClampedArray(90).fill(144);
  const result=calculate(source,10,9,3,2);
  assert.ok(result.detail.every(value=>value===128));
  assert.ok(result.recomposed.every(value=>value===144));
  assert.equal(result.clippedCount,0);
});

test('gain=1 recovers source and gain=0 gives low pass',()=>{
  const source=makeHighPassPattern(48,26,'texture');
  const low=gaussianLowPass(source,48,26,3);
  const identity=composeHighPass(source,low,48,26,{gain:1});
  assert.deepEqual(identity.recomposed,source);
  const smooth=composeHighPass(source,low,48,26,{gain:0});
  assert.ok(smooth.detail.every(value=>value===128));
  assert.ok(smooth.recomposed.some((value,i)=>value!==source[i]));
});

test('signed high-pass has dark and bright sides at a step',()=>{
  const w=13,h=5,source=new Uint8ClampedArray(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)source[y*w+x]=x<6?0:255;
  const result=calculate(source,w,h,1.5,2);
  assert.ok(result.detail[2*w+5]<128);
  assert.ok(result.detail[2*w+6]>128);
  assert.ok(result.clippedCount>0);
});

test('blur radius changes detail but maintains dimensions',()=>{
  const source=makeHighPassPattern(40,20);
  const small=gaussianLowPass(source,40,20,.5);
  const large=gaussianLowPass(source,40,20,6);
  assert.equal(large.length,source.length);
  assert.ok(large.some((value,i)=>Math.abs(value-small[i])>1));
  assert.equal(composeHighPass(source,small,40,20).original.length,source.length);
});

test('patterns differ, output and source are independent',()=>{
  const source=makeHighPassPattern(32,16,'edges'),copy=source.slice();
  const texture=makeHighPassPattern(32,16,'texture');
  assert.notDeepEqual(source,texture);
  const result=calculate(source,32,16);
  result.original[0]=99;result.detail[0]=0;result.recomposed[0]=0;
  assert.deepEqual(source,copy);
});

test('invalid dimensions, types, parameters and blur values reject',()=>{
  assert.throws(()=>makeHighPassPattern(1,4),RangeError);
  assert.throws(()=>makeHighPassPattern(4096,4096),RangeError);
  assert.throws(()=>makeHighPassPattern(3,3,'unknown'),RangeError);
  const source=new Uint8ClampedArray(9);
  assert.throws(()=>gaussianLowPass(new Uint8Array(9),3,3),RangeError);
  assert.throws(()=>gaussianLowPass(source,3,3,NaN),RangeError);
  assert.throws(()=>gaussianLowPass(source,3,3,8.1),RangeError);
  const low=gaussianLowPass(source,3,3,1);
  assert.throws(()=>composeHighPass(source,low,3,3,{gain:Infinity}),RangeError);
  assert.throws(()=>composeHighPass(source,low,3,3,{gain:-1}),RangeError);
  assert.throws(()=>composeHighPass(source,low,3,3,{gain:3.1}),RangeError);
  assert.throws(()=>composeHighPass(source,new Float64Array(8),3,3),RangeError);
  low[0]=NaN;
  assert.throws(()=>composeHighPass(source,low,3,3),RangeError);
});

test('default UI dimensions and controls remain in supported range',()=>{
  const source=makeHighPassPattern(HP_WIDTH,HP_HEIGHT);
  const low=gaussianLowPass(source,HP_WIDTH,HP_HEIGHT);
  assert.equal(composeHighPass(source,low,HP_WIDTH,HP_HEIGHT).detail.length,HP_WIDTH*HP_HEIGHT);
});
