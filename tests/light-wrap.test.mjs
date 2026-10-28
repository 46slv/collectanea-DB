import test from 'node:test';
import assert from 'node:assert/strict';
import {WRAP_WIDTH,WRAP_HEIGHT,WRAP_DEFAULTS,validateWrapOptions,insideDistance,
  makeWrapScene,makeWrapMatte,renderLightWrap,countChangedPixels}
from '../src/components/LightWrapPlayground/wrap-core.mjs';

test('validated defaults and dimensions',()=>{
  assert.equal(WRAP_WIDTH,320);assert.equal(WRAP_HEIGHT,180);
  assert.deepEqual(validateWrapOptions(),WRAP_DEFAULTS);
});
test('both scenes and matte shapes are deterministic and distinct',()=>{
  assert.deepEqual(makeWrapScene(),makeWrapScene());
  assert.notDeepEqual(makeWrapScene('sunset').background,makeWrapScene('neon').background);
  assert.notDeepEqual(makeWrapMatte(makeWrapScene('sunset','ellipse')),makeWrapMatte(makeWrapScene('sunset','card')));
});
test('signed interior distances and matte are coherent',()=>{
  assert.ok(insideDistance(160,92,'ellipse')>20);
  assert.ok(insideDistance(0,0,'ellipse')<0);
  assert.equal(insideDistance(112,80,'card'),0);
  const frame=makeWrapScene();
  const matte=makeWrapMatte(frame);
  assert.equal(matte[(92*WRAP_WIDTH+160)*4],255);
  assert.equal(matte[0],0);assert.equal(matte[3],255);
});
test('zero width and zero strength both preserve the base composite exactly',()=>{
  const frame=makeWrapScene(),base=renderLightWrap(frame,{radius:0});
  assert.deepEqual(renderLightWrap(frame,{strength:0}),base);
  assert.deepEqual(renderLightWrap(frame,{radius:0,strength:1.5}),base);
  assert.equal(countChangedPixels(base,base),0);
});
test('wrap changes visible foreground edges but does not paint the matte exterior',()=>{
  const frame=makeWrapScene(),base=renderLightWrap(frame,{radius:0});
  const out=renderLightWrap(frame);
  let changed=0;
  for(let i=0;i<out.length;i+=4){
    if(frame.foreground[i+3]===0)assert.deepEqual([...out.subarray(i,i+4)],[...base.subarray(i,i+4)]);
    if(out[i]!==base[i]||out[i+1]!==base[i+1]||out[i+2]!==base[i+2])changed++;
    assert.equal(out[i+3],255);
  }
  assert.ok(changed>200);
  assert.equal(countChangedPixels(base,out),changed);
});
test('greater width reaches deeper into the silhouette',()=>{
  const frame=makeWrapScene('neon'),base=renderLightWrap(frame,{radius:0});
  const narrow=renderLightWrap(frame,{scene:'neon',radius:3});
  const wide=renderLightWrap(frame,{scene:'neon',radius:18});
  assert.ok(countChangedPixels(base,wide)>countChangedPixels(base,narrow));
});
test('background selection alters wrap color while preserving source-over baseline',()=>{
  const a=makeWrapScene('sunset'),b=makeWrapScene('neon');
  const outA=renderLightWrap(a),outB=renderLightWrap(b,{scene:'neon'});
  assert.notDeepEqual(outA,outB);
  const baseline=renderLightWrap(a,{strength:0});
  assert.notDeepEqual(outA,baseline);
});
test('invalid option and frame inputs are rejected',()=>{
  for(const x of [null,[],{scene:'bad'},{shape:'other'},{radius:-1},{radius:19},{radius:2.5},{strength:-.1},{strength:2},{strength:NaN}])
    assert.throws(()=>validateWrapOptions(x),RangeError);
  assert.throws(()=>insideDistance(2,3,'unknown'),RangeError);
  assert.throws(()=>makeWrapScene('bad'),RangeError);
  assert.throws(()=>makeWrapMatte(null),RangeError);
  assert.throws(()=>renderLightWrap({}),RangeError);
  assert.throws(()=>countChangedPixels([],[]),RangeError);
});
