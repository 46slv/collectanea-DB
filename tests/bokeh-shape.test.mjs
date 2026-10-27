import test from 'node:test';
import assert from 'node:assert/strict';
import {BOKEH_INITIAL,BOKEH_LIGHTS,validateBokehOptions,bokehVertices,layoutBokeh}
  from '../src/components/BokehShapePlayground/bokeh-core.mjs';
const near=(a,b)=>Math.abs(a-b)<1e-8;
test('default layout is stable and preserves six light centers',()=>{
  const a=layoutBokeh();assert.deepEqual(a,layoutBokeh());
  assert.equal(a.length,6);assert.equal(a[0].vertices.length,6);
  a.forEach((d,i)=>{assert.equal(d.x,BOKEH_LIGHTS[i].x);assert.equal(d.y,BOKEH_LIGHTS[i].y);});
});
test('circle and polygon blade count generate distinct shape vertices',()=>{
  assert.equal(layoutBokeh({blades:0})[0].vertices.length,64);
  for(const n of [5,6,8])assert.equal(layoutBokeh({blades:n})[0].vertices.length,n);
});
test('radius modifies shape extent without moving the source light',()=>{
  const small=layoutBokeh({radius:3})[0],big=layoutBokeh({radius:30})[0];
  assert.equal(small.x,big.x);assert.equal(small.y,big.y);
  assert.ok(big.vertices[0].y<small.vertices[0].y);
});
test('oval aspect only stretches the horizontal axis',()=>{
  const a=bokehVertices(0,0,10,0,.6),b=bokehVertices(0,0,10,0,1.4);
  assert.ok(Math.max(...b.map(p=>p.x))>Math.max(...a.map(p=>p.x)));
  assert.ok(near(Math.min(...a.map(p=>p.y)),Math.min(...b.map(p=>p.y))));
});
test('ring strength is a rendering-only control and does not move vertices',()=>{
  assert.deepEqual(layoutBokeh({edge:0}),layoutBokeh({edge:1}));
});
test('validated defaults are not mutated',()=>{
  assert.deepEqual(validateBokehOptions(),BOKEH_INITIAL);
  layoutBokeh({radius:30,blades:0,edge:1});
  assert.deepEqual(BOKEH_INITIAL,{radius:14,blades:6,oval:1,edge:.35});
});
test('invalid parameters and bad geometry are rejected',()=>{
  for(const o of [{radius:2},{radius:31},{radius:2.5},{blades:3},{oval:.5},{oval:NaN},
    {oval:Infinity},{edge:-.01},{edge:1.01},null,[]])
    assert.throws(()=>validateBokehOptions(o),RangeError);
  for(const args of [[NaN,0,10,6,1],[0,0,0,6,1],[0,0,10,7,1],[0,0,10,6,1.5]])
    assert.throws(()=>bokehVertices(...args),RangeError);
});
