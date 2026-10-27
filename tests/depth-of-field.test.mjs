import test from 'node:test';
import assert from 'node:assert/strict';
import {DOF_WIDTH,DOF_HEIGHT,DOF_PLANES,DOF_DEFAULTS,validateDofOptions,
  planeBlurRadii,makeDofScene,makeDofDepthMap,applyDofDefocus}
  from '../src/components/DepthOfFieldPlayground/dof-core.mjs';

test('stable dimensions, planes and validated defaults',()=>{
  assert.equal(DOF_WIDTH,360);assert.equal(DOF_HEIGHT,180);
  assert.deepEqual(DOF_PLANES,[1.5,3,9]);
  assert.deepEqual(validateDofOptions(),DOF_DEFAULTS);
});
test('in-focus plane remains sharp; smaller aperture reduces defocus',()=>{
  const a=planeBlurRadii({focus:3,aperture:1.8}),b=planeBlurRadii({focus:3,aperture:11});
  assert.equal(a[1],0);assert.equal(b[1],0);
  assert.ok(a[0]>b[0]);assert.ok(a[2]>b[2]);
});
test('focus travels between all depth planes',()=>{
  for(let i=0;i<DOF_PLANES.length;i++){
    const radii=planeBlurRadii({focus:DOF_PLANES[i]});
    assert.equal(radii[i],0);
    assert.ok(radii.some((r,j)=>i!==j&&r>0));
  }
});
test('zero strength recovers the original frame exactly',()=>{
  const source=makeDofScene();
  assert.deepEqual(applyDofDefocus(source,{strength:0}),source);
});
test('out-of-focus planes soften while focus plane preserves pixels',()=>{
  const source=makeDofScene('edges'),result=applyDofDefocus(source,{focus:3,aperture:2.8});
  let changedNear=0,changedFar=0;
  for(let y=0;y<DOF_HEIGHT;y++)for(let x=0;x<DOF_WIDTH;x++){
    const idx=(y*DOF_WIDTH+x)*4;
    if(x>=120&&x<240)assert.deepEqual([...result.slice(idx,idx+4)],[...source.slice(idx,idx+4)]);
    if(x<120&&result[idx]!==source[idx])changedNear++;
    if(x>=240&&result[idx]!==source[idx])changedFar++;
    assert.equal(result[idx+3],255);
  }
  assert.ok(changedNear>100);assert.ok(changedFar>100);
});
test('scenes and depth maps are deterministic',()=>{
  assert.deepEqual(makeDofScene(),makeDofScene());
  assert.notDeepEqual(makeDofScene('lights'),makeDofScene('edges'));
  assert.notDeepEqual(makeDofDepthMap(3),makeDofDepthMap(9));
  assert.deepEqual(DOF_DEFAULTS,{focus:3,aperture:2.8,strength:1,pattern:'lights'});
});
test('bad parameters and frames fail without silently clamping',()=>{
  for(const o of [null,[],{focus:4},{aperture:4},{strength:-1},{strength:3},
    {strength:NaN},{strength:Infinity},{pattern:'unknown'}])
    assert.throws(()=>validateDofOptions(o),RangeError);
  assert.throws(()=>makeDofScene('unknown'),RangeError);
  assert.throws(()=>makeDofDepthMap(2),RangeError);
  assert.throws(()=>applyDofDefocus([]),RangeError);
});
