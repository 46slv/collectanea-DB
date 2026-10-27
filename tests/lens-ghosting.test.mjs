import test from 'node:test';
import assert from 'node:assert/strict';
import {GHOST_WIDTH,GHOST_HEIGHT,GHOST_INITIAL,validateGhostSettings,layoutGhosts,apertureVertices}
  from '../src/components/LensGhostPlayground/ghost-core.mjs';
const near=(a,b)=>Math.abs(a-b)<1e-8;
test('initial preview is deterministic, finite and opposite to source',()=>{
  const a=layoutGhosts(GHOST_WIDTH,GHOST_HEIGHT),b=layoutGhosts(GHOST_WIDTH,GHOST_HEIGHT);
  assert.deepEqual(a,b);assert.equal(a.length,3);
  assert.ok(a.every(g=>Number.isFinite(g.x)&&Number.isFinite(g.y)&&g.radius>0&&g.opacity>0));
  assert.ok(a[0].x<(GHOST_WIDTH-1)/2&&a[0].y>(GHOST_HEIGHT-1)/2);
});
test('light moved across frame reverses horizontal ghost direction',()=>{
  const left=layoutGhosts(360,180,{sourceX:25}),right=layoutGhosts(360,180,{sourceX:75});
  assert.ok(left.every(g=>g.x>179.5));assert.ok(right.every(g=>g.x<179.5));
});
test('optical center maps to center and remains aligned for any blades',()=>{
  const g=layoutGhosts(101,101,{sourceX:50,sourceY:50,blades:8});
  assert.ok(g.every(v=>near(v.x,50)&&near(v.y,50)));
  assert.ok(g.every(v=>v.blades===8));
});
test('zero strength removes all ghost contribution without changing positions',()=>{
  const a=layoutGhosts(360,180,{strength:0}),b=layoutGhosts(360,180,{strength:1});
  assert.equal(a.length,b.length);assert.ok(a.every((v,i)=>v.opacity===0&&near(v.x,b[i].x)&&near(v.y,b[i].y)));
});
test('count and strength vary outputs without altering immutable defaults',()=>{
  assert.equal(layoutGhosts(360,180,{count:5}).length,5);
  assert.equal(layoutGhosts(360,180,{count:1}).length,1);
  assert.ok(layoutGhosts(360,180,{strength:.3})[0].opacity<layoutGhosts(360,180,{strength:.9})[0].opacity);
  assert.deepEqual(GHOST_INITIAL,{sourceX:74,sourceY:32,strength:.65,count:3,blades:6});
});
test('aperture polygons retain intended radius and count',()=>{
  for(const blades of [5,6,8]){
    const vertices=apertureVertices(10,20,7,blades);
    assert.equal(vertices.length,blades);
    for(const p of vertices)assert.ok(near(Math.hypot(p.x-10,p.y-20),7));
  }
});
test('reject dimensions and invalid parameters without accepting NaN',()=>{
  for(const [w,h] of [[79,180],[360,59],[1601,180],[360,901],[NaN,180],[320.5,180]])
    assert.throws(()=>layoutGhosts(w,h),RangeError);
  for(const options of [{sourceX:14},{sourceY:81},{count:0},{count:6},{blades:7},{strength:-.01},
    {strength:1.1},{strength:NaN},{strength:Infinity},{sourceX:50.5},null,[]])
    assert.throws(()=>layoutGhosts(360,180,options),RangeError);
  for(const args of [[0,0,0,6],[0,0,10,7],[NaN,0,10,6]])
    assert.throws(()=>apertureVertices(...args),RangeError);
  assert.deepEqual(validateGhostSettings(360,180),GHOST_INITIAL);
});
