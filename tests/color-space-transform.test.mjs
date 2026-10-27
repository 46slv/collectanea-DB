import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CST_WIDTH, CST_HEIGHT, CST_DEFAULTS, srgbDecode, srgbEncode,
  toXYZ, fromXYZLinear, convertRgb, targetLinear, isOutOfGamut,
  displayBytes, makeCstPattern, renderCst,
} from '../src/components/ColorSpaceTransformPlayground/cst-core.mjs';
const near = (a,b,e=1e-5) => assert.ok(Math.abs(a-b)<e, `${a} not close to ${b}`);

test('sRGB transfer endpoints, known gray and signed extensions', () => {
  near(srgbDecode(0), 0); near(srgbDecode(1), 1);
  near(srgbDecode(0.5), 0.21404114048223255, 1e-12);
  near(srgbEncode(0.21404114048223255), 0.5, 1e-12);
  near(srgbDecode(-0.5), -srgbDecode(0.5), 1e-12);
  near(srgbEncode(-0.5), -srgbEncode(0.5), 1e-12);
});
test('D65 white and black are preserved between sRGB and Display P3', () => {
  for (const space of ['srgb','display-p3']) {
    const white = toXYZ([1,1,1],space);
    near(white[0],0.9504559270516716); near(white[1],1); near(white[2],1.0890577507598784);
    assert.ok(convertRgb([0,0,0],space, 'srgb').every(x=>Math.abs(x)<1e-10));
    assert.ok(convertRgb([1,1,1],space, 'srgb').every(x=>Math.abs(x-1)<1e-5));
  }
});
test('sRGB encoded triplet round-trips via P3 without clipping', () => {
  for (const rgb of [[1,0,0],[0.3,0.7,0.1],[0,0.4,1],[0.5,0.5,0.5]]) {
    const p3 = convertRgb(rgb,'srgb','display-p3');
    assert.ok(p3.every(x=>x>=-1e-6 && x<=1+1e-6));
    const back = convertRgb(p3,'display-p3','srgb');
    for(let k=0;k<3;k++) near(back[k],rgb[k]);
  }
});
test('P3 red exceeds sRGB gamut; sRGB primaries fit inside P3 gamut', () => {
  assert.ok(isOutOfGamut(targetLinear([1,0,0],'display-p3','srgb')));
  assert.ok(!isOutOfGamut(targetLinear([1,0,0],'srgb','display-p3')));
  assert.ok(targetLinear([1,0,0],'display-p3','srgb')[0] > 1);
});
test('source and target equal keeps normalized code values', () => {
  for (const space of ['srgb','display-p3']) {
    const code = [0.33, 0.74, 0.06];
    const result = convertRgb(code,space,space);
    result.forEach((v,k)=>near(v,code[k]));
  }
});
test('pattern deterministic, gamut mask nonzero for saturated P3 to sRGB', () => {
  const input = makeCstPattern(36,24,'bands',1);
  assert.deepEqual(input,makeCstPattern(36,24,'bands',1));
  assert.notDeepEqual(input,makeCstPattern(36,24,'gradient',1));
  const high = renderCst(input,36,24,'display-p3','srgb');
  const low = renderCst(makeCstPattern(36,24,'bands',0.2),36,24,'display-p3','srgb');
  assert.ok(high.outside>0 && high.outside<high.total);
  assert.ok(low.outside<high.outside);
  const srgbToP3 = renderCst(input,36,24,'srgb','display-p3');
  assert.equal(srgbToP3.outside,0);
});
test('three opaque previews, correct conversion and no source mutation', () => {
  const src = makeCstPattern(32,12);
  const before = src.slice();
  const result = renderCst(src,32,12);
  assert.deepEqual(src,before);
  for(const pixels of [result.raw,result.corrected,result.mask]) {
    assert.equal(pixels.length,32*12*4);
    for(let i=3;i<pixels.length;i+=4) assert.equal(pixels[i],255);
  }
  assert.ok(result.raw.some((v,i)=>v!==result.corrected[i]));
});
test('validation rejects non-finite input, unsupported space and dimension mismatch', () => {
  assert.throws(()=>toXYZ([0,1,NaN],'srgb'),RangeError);
  assert.throws(()=>convertRgb([0,1,0],'rec2020','srgb'),RangeError);
  assert.throws(()=>fromXYZLinear([0,1,0],'xyz'),RangeError);
  assert.throws(()=>makeCstPattern(0,10),RangeError);
  assert.throws(()=>makeCstPattern(10,10,'bad'),RangeError);
  assert.throws(()=>makeCstPattern(10,10,'bands',2),RangeError);
  assert.throws(()=>renderCst(new Float32Array(2),1,1),RangeError);
  assert.throws(()=>renderCst(new Float32Array([1.2,0,0]),1,1),RangeError);
  assert.throws(()=>srgbEncode(Infinity),RangeError);
  assert.throws(()=>isOutOfGamut([0,1]),RangeError);
});
test('fixed reset and sRGB 8-bit preview values are explicit', () => {
  assert.equal(CST_WIDTH,320); assert.equal(CST_HEIGHT,144);
  assert.deepEqual({...CST_DEFAULTS},{source:'display-p3',target:'srgb',pattern:'bands',chroma:1,zoom:1});
  assert.deepEqual(displayBytes([0,0.5,1]),[0,188,255]);
});
