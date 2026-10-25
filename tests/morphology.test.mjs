import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMorphologyMask,morphologyBinary} from '../src/components/MorphologyPlayground/morphology-core.mjs';
function oracle(data,w,h,r){
  const d=new Uint8ClampedArray(data.length),e=new Uint8ClampedArray(data.length);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const a=[];
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      const xx=x+dx,yy=y+dy;
      a.push(xx>=0&&xx<w&&yy>=0&&yy<h&&data[yy*w+xx]>=128);
    }
    d[y*w+x]=a.some(Boolean)?255:0;
    e[y*w+x]=a.every(Boolean)?255:0;
  }
  return {d,e};
}
test('radius zero is binary identity',()=>{
  const src=Uint8ClampedArray.from([0,127,128,255]);
  const out=morphologyBinary(src,2,2,{radius:0});
  assert.deepEqual([...out.dilated],[0,0,255,255]);
  assert.deepEqual(out.dilated,out.eroded);
  assert.equal(out.whiteBefore,2);
});
test('isolated impulse dilates to 3x3 and erodes away',()=>{
  const src=new Uint8ClampedArray(25);src[12]=255;
  const out=morphologyBinary(src,5,5,{radius:1});
  assert.equal(out.whiteDilated,9);assert.equal(out.whiteEroded,0);
  assert.equal(out.dilated[6],255);assert.equal(out.dilated[0],0);
});
test('solid 3x3 block shrinks to center and grows to 5x5',()=>{
  const src=new Uint8ClampedArray(49);
  for(let y=2;y<=4;y++)for(let x=2;x<=4;x++)src[y*7+x]=255;
  const out=morphologyBinary(src,7,7,{radius:1});
  assert.equal(out.whiteDilated,25);assert.equal(out.whiteEroded,1);
  assert.equal(out.eroded[24],255);
});
test('outside pixels are black during erosion',()=>{
  const out=morphologyBinary(new Uint8ClampedArray(9).fill(255),3,3,{radius:1});
  assert.equal(out.whiteDilated,9);assert.equal(out.whiteEroded,1);
  assert.equal(out.eroded[0],0);assert.equal(out.eroded[4],255);
});
test('irregular masks match independent square-neighborhood oracle',()=>{
  const src=Uint8ClampedArray.from(Array.from({length:88},(_,i)=>(i*19+(i%7)*11)%5===0?255:0));
  for(const r of [0,1,2,3]){
    const out=morphologyBinary(src,11,8,{radius:r}),expected=oracle(src,11,8,r);
    assert.deepEqual(out.dilated,expected.d);
    assert.deepEqual(out.eroded,expected.e);
  }
});
test('radius increases dilation and decreases erosion; input is immutable',()=>{
  const src=makeMorphologyMask(60,40,'shapes'),copy=src.slice();
  const a=morphologyBinary(src,60,40,{radius:1}),b=morphologyBinary(src,60,40,{radius:4});
  assert.ok(b.whiteDilated>=a.whiteDilated);
  assert.ok(b.whiteEroded<=a.whiteEroded);
  assert.deepEqual(src,copy);
});
test('scenes differ, invalid dimensions and radii fail',()=>{
  assert.notDeepEqual(makeMorphologyMask(100,50,'shapes'),makeMorphologyMask(100,50,'lines'));
  assert.throws(()=>makeMorphologyMask(0,2),RangeError);
  assert.throws(()=>makeMorphologyMask(3,3,'bad'),RangeError);
  assert.throws(()=>morphologyBinary(new Uint8Array(9),3,3),RangeError);
  assert.throws(()=>morphologyBinary(new Uint8ClampedArray(8),3,3),RangeError);
  for(const r of [-1,1.1,9])assert.throws(()=>morphologyBinary(new Uint8ClampedArray(9),3,3,{radius:r}),RangeError);
});
