"""Owned Resolve capture fixtures. Requires local Resolve scripting; never changes preferences.

Usage: python scripts/fusion-capture.py S01 [build|show|readback]
Only modifies the exact named scratch project. Existing cases are never rebuilt.
Actual GUI capture and visual acceptance are separate from this helper.
"""
import sys, json, pathlib, platform, datetime, re, time
sys.path.insert(0, r'C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Modules')
import DaVinciResolveScript as d
ROOT=pathlib.Path(__file__).resolve().parents[1]
REPO=ROOT
PROJECT='Collectanea_Captures_20261023_Sol'
TARGETS={'S01':'sGrid1','S02':'Merge1','S03':'Glow1','S04':'sRender1','S05':'sBoolean1','S06':'Transform1','S07':'Ellipse1','S08':'Text1','S09':'pEmitter1','S10':'PlanarTracker1','S11':'Renderer3D1','S12':'uRenderer1','S13':'Blur1','S14':'ColorCorrector1','S15':'Gradient1','S16':'NoiseDetail1','S17':'Rectangle1','S18':'EllipseArc1'}
RIGHT={'S01':'sRender1','S05':'sRender1','S07':'Blur1','S09':'pRender1','S10':'Composite1','S15':'Gradient1','S16':'NoiseDetail1','S17':'Background1','S18':'RenderArc1'}
LEFT={'S03':'Text1','S05':'UnionRender1','S06':'Loader1','S07':'BlurFull','S11':'Merge3D1','S13':'Loader1','S14':'Loader1','S15':'Solid1','S16':'NoiseDefault1','S18':'RenderSolid1'}
TARGETS.update({'S19':'ShapeChanged1','S20':'ShapeChanged1','S21':'ShapeChanged1','S22':'Transform1'})
RIGHT.update({key:'RenderChanged1' for key in ['S19','S20','S21','S22']})
LEFT.update({key:'RenderBase1' for key in ['S19','S20','S21','S22']})
TARGETS.update({'S23':'Transform1','S24':'Resize1','S25':'Ellipse1','S26':'Text1'})
RIGHT.update({'S23':'Transform1','S24':'Resize1','S25':'LoaderCutout','S26':'Text1'})
LEFT.update({'S23':'SourceB','S24':'Transform1','S25':'BlurMask','S26':'Text1'})
TARGETS.update({'S27':'MultiMerge1','S28':'Ellipse1','S29':'Dissolve1','S30':'Displace1'})
RIGHT.update({'S27':'MultiMerge1','S28':'MergeMasked','S29':'Dissolve1','S30':'Displace1'})
LEFT.update({'S27':'Red1','S28':'MergeFull','S29':'Loader1','S30':'Loader1'})
TARGETS.update({'S31':'Merge1','S32':'MergeChanged','S33':'EllipseSubtract','S34':'TransformPivot'})
TARGETS['S35']='TransformAnimated';RIGHT['S35']='TransformAnimated';LEFT['S35']='Text1'
RIGHT.update({'S31':'Merge1','S32':'MergeChanged','S33':'GoldSubtract','S34':'TransformPivot'})
LEFT.update({'S31':'Cutout1','S32':'MergeBase','S33':'GoldBase','S34':'TransformBase'})
TARGETS['S36']='TransformSmooth';LEFT['S36']='TransformLinear';RIGHT['S36']='TransformSmooth'
TARGETS['S37']='MergeDerived';LEFT['S37']='MergeMaster';RIGHT['S37']='MergeDerived'
TARGETS['S38']='TransformReference';LEFT['S38']='Loader1';RIGHT['S38']='TransformReference'
TARGETS['S39']='TimeDynamic';LEFT['S39']='Loader1';RIGHT['S39']='TimeDynamic'
TARGETS['S40']='TimeSpeed1';LEFT['S40']='Loader1';RIGHT['S40']='TimeSpeed1'
TARGETS['S41']='TransformA';LEFT['S41']='TransformA';RIGHT['S41']='TransformB'
TARGETS['S42']='FrameAverage1';LEFT['S42']='Loader1';RIGHT['S42']='FrameAverage1'
TARGETS['S43']='SetMetadata1';LEFT['S43']='Background1';RIGHT['S43']='SetMetadata1'
TARGETS['S44']='CopyMetadata1';LEFT['S44']='MetaFGExtra';RIGHT['S44']='CopyMetadata1'
TARGETS['S45']='SetTimecode1';LEFT['S45']='Background1';RIGHT['S45']='SetTimecode1'
TARGETS['S46']='Switch1';LEFT['S46']='Blue1';RIGHT['S46']='Switch1'
TARGETS['S47']='Wireless1';LEFT['S47']='Text1';RIGHT['S47']='Wireless1'
TARGETS['S48']='ChangeDepth1';LEFT['S48']='Gradient1';RIGHT['S48']='ChangeDepth1'
TARGETS['S49']='Displace1';LEFT['S49']='Loader1';RIGHT['S49']='Displace1'
TARGETS['S50']='AutoDomain1';LEFT['S50']='Loader1';RIGHT['S50']='AutoDomain1'
TARGETS['S51']='SetDomain1';LEFT['S51']='AutoDomain1';RIGHT['S51']='SetDomain1'
TARGETS['S52']='SetCanvasColor1';LEFT['S52']='Transform1';RIGHT['S52']='SetCanvasColor1'
TARGETS['S53']='Crop1';LEFT['S53']='Loader1';RIGHT['S53']='Crop1'
TARGETS['S54']='Letterbox1';LEFT['S54']='Loader1';RIGHT['S54']='Letterbox1'
TARGETS['S55']='DVE1';LEFT['S55']='Loader1';RIGHT['S55']='DVE1'
TARGETS['S56']='CameraShake1';LEFT['S56']='Loader1';RIGHT['S56']='CameraShake1'
TARGETS['S57']='CustomTool1';LEFT['S57']='Loader1';RIGHT['S57']='CustomTool1'
TARGETS['S58']='DirectionalBlur1';LEFT['S58']='Loader1';RIGHT['S58']='DirectionalBlur1'
TARGETS['S59']='Defocus1';LEFT['S59']='Loader1';RIGHT['S59']='Defocus1'
TARGETS['S60']='BrightnessContrast1';LEFT['S60']='Loader1';RIGHT['S60']='BrightnessContrast1'
TARGETS['S61']='ColorGain1';LEFT['S61']='Loader1';RIGHT['S61']='ColorGain1'
TARGETS['S62']='Sharpen1';LEFT['S62']='Loader1';RIGHT['S62']='Sharpen1'
TARGETS['S63']='UnsharpMask1';LEFT['S63']='Loader1';RIGHT['S63']='UnsharpMask1'
TARGETS['S64']='ErodeDilate1';LEFT['S64']='Loader1';RIGHT['S64']='ErodeDilate1'
TARGETS['S65']='RankFilter1';LEFT['S65']='Loader1';RIGHT['S65']='RankFilter1'
TARGETS['S66']='Filter1';LEFT['S66']='Loader1';RIGHT['S66']='Filter1'
TARGETS['S67']='SoftGlow1';LEFT['S67']='Loader1';RIGHT['S67']='SoftGlow1'
TARGETS['S68']='CreateBumpMap1';LEFT['S68']='Loader1';RIGHT['S68']='CreateBumpMap1'
TARGETS['S69']='CustomFilter1';LEFT['S69']='Loader1';RIGHT['S69']='CustomFilter1'
TARGETS['S70']='AutoGain1';LEFT['S70']='Loader1';RIGHT['S70']='AutoGain1'
TARGETS['S71']='ColorMatrix1';LEFT['S71']='Loader1';RIGHT['S71']='ColorMatrix1'
TARGETS['S72']='ColorSpace1';LEFT['S72']='Loader1';RIGHT['S72']='ColorSpace1'
TARGETS['S73']='WhiteBalance1';LEFT['S73']='Loader1';RIGHT['S73']='WhiteBalance1'
TARGETS['S74']='AlphaDivide1';LEFT['S74']='MergeNaive';RIGHT['S74']='MergeCorrect'
TARGETS['S75']='MatteControl1';LEFT['S75']='Loader1';RIGHT['S75']='MatteControl1'
TARGETS['S76']='LumaKeyer1';LEFT['S76']='Loader1';RIGHT['S76']='LumaKeyer1'
TARGETS['S77']='BitmapMask1';LEFT['S77']='Loader1';RIGHT['S77']='Gold1'
TARGETS['S78']='RangesMask1';LEFT['S78']='Loader1';RIGHT['S78']='Gold1'
TARGETS['S79']='WandMask1';LEFT['S79']='Loader1';RIGHT['S79']='Gold1'
TARGETS['S80']='Triangle1';LEFT['S80']='Triangle1';RIGHT['S80']='Gold1'
TARGETS['S81']='Rectangle1';LEFT['S81']='Rectangle1';RIGHT['S81']='Gold1'
TARGETS['S82']='Polygon1';LEFT['S82']='Polygon1';RIGHT['S82']='Gold1'
TARGETS['S83']='BSpline1';LEFT['S83']='BSpline1';RIGHT['S83']='Gold1'
TARGETS['S84']='MaskPaint1';LEFT['S84']='MaskPaint1';RIGHT['S84']='Gold1'
TARGETS['S85']='MultiPoly1';LEFT['S85']='MultiPoly1';RIGHT['S85']='Gold1'
TARGETS['S86']='Paint1';LEFT['S86']='Loader1';RIGHT['S86']='Paint1'
TARGETS['S87']='Paint1';LEFT['S87']='Loader1';RIGHT['S87']='Paint1'
TARGETS['S88']='Paint1';LEFT['S88']='Loader1';RIGHT['S88']='Paint1'
TARGETS['S89']='Paint1';LEFT['S89']='Loader1';RIGHT['S89']='Paint1'
TARGETS['S90']='Paint1';LEFT['S90']='Loader1';RIGHT['S90']='Paint1'
TARGETS['S91']='Paint1';LEFT['S91']='Loader1';RIGHT['S91']='Paint1'
TARGETS['S92']='Paint1';LEFT['S92']='Loader1';RIGHT['S92']='Paint1'
TARGETS['S93']='Paint1';LEFT['S93']='Loader1';RIGHT['S93']='Paint1'
TARGETS['S94']='Paint1';LEFT['S94']='Loader1';RIGHT['S94']='Paint1'
TARGETS['S95']='Paint1';LEFT['S95']='Loader1';RIGHT['S95']='Paint1'
TARGETS['S96']='Paint1';LEFT['S96']='Loader1';RIGHT['S96']='Paint1'
TARGETS['S97']='ChannelBooleans1';LEFT['S97']='Loader1';RIGHT['S97']='ChannelBooleans1'
TARGETS['S98']='Gamut1';LEFT['S98']='Loader1';RIGHT['S98']='Gamut1'
TARGETS['S99']='Swizzler1';LEFT['S99']='Loader1';RIGHT['S99']='Swizzler1'
TARGETS.update({'S100':'LayerRemover1','S101':'LayerRegex1','S102':'LayerMuxer1'})
LEFT.update({'S100':'Swizzler1','S101':'Swizzler1','S102':'SwizzlerA1'})
r=d.scriptapp('Resolve')
assert r, 'Resolve scripting unavailable; do not change preferences automatically'
pm=r.GetProjectManager(); p=pm.GetCurrentProject()
assert p and p.GetName()==PROJECT, 'Refusing to mutate a foreign project'
assert r.GetCurrentPage(), 'Resolve has a modal dialog; reconcile the GUI first'
case=sys.argv[1]; action=sys.argv[2] if len(sys.argv)>2 else 'readback'
save_export=action!='preview'
detail_view=action=='detail'
if detail_view:assert case in ['S62','S63','S69'];action='show'
requested_frame=int(sys.argv[3]) if action=='frame' else 24 if case in ['S40','S42'] else 0
if action=='channel_source':
 assert case=='S97';LEFT[case]='AlphaSource1';action='show'
if action=='paint_clean':
 assert case in ['S87','S88','S89','S90','S91','S92','S93','S94','S95','S96'];requested_frame=int(sys.argv[3]);assert requested_frame in [0,1,119]
 TARGETS[case]='MediaOut1';action='show'
if action=='preview':
 assert case=='S49';requested_frame=int(sys.argv[3]) if len(sys.argv)>3 else 0;assert requested_frame in [0,24];action='show'
if action=='paint_frame':
 assert case in ['S84','S86','S87','S88','S89','S90','S91','S92','S93','S94','S95','S96'];requested_frame=int(sys.argv[3]);assert requested_frame in ([0,1,119] if case in ['S87','S88','S89','S90','S91','S92','S93','S94','S95','S96'] else [0,1]);action='show'
if action=='frame':
 assert case in ['S35','S36','S39','S40','S42','S45','S49','S56'] and requested_frame in ([0,48] if case=='S35' else [0,3,6,9,12,18,24]);action='show'
if action=='hold':
 assert case=='S39';requested_frame=int(sys.argv[3]);assert requested_frame in [0,24]
 TARGETS[case]='TransformHold';LEFT[case]='TimeHold';RIGHT[case]='TransformHold';action='show'
if action=='hold_source':
 assert case=='S39';TARGETS[case]='TimeHold';LEFT[case]='TimeHold';RIGHT[case]='TransformHold';action='show'
if action in ['bg_source','fg_source']:
 assert case=='S44';TARGETS[case]='MetaBGShot' if action=='bg_source' else 'MetaFGShot';action='show'
if action=='second':
 assert case=='S41';TARGETS[case]='TransformB';action='show'
if action=='master':
 assert case=='S37';TARGETS[case]='MergeMaster';action='show'
if action=='step':
 assert case=='S36';TARGETS[case]='TransformStep';RIGHT[case]='TransformStep';requested_frame=3;action='show'
if action=='final':
 assert case=='S23';RIGHT[case]='Merge1';LEFT[case]='SourceA';action='show'
if action=='scale':
 assert case=='S24';TARGETS[case]='Scale1';LEFT[case]='Scale1';action='show'
if action=='mask_inspector':
 assert case=='S49';TARGETS[case]='Ellipse1';action='show'
if action=='image':
 assert case in ['S50','S51','S54','S55','S57','S58','S59','S60','S61'];TARGETS[case]='MediaOut1';action='show'
if action in ['premult_naive','premult_correct','premult_multiply','premult_source']:
 assert case=='S74'
 TARGETS[case]={'premult_naive':'ColorDirect','premult_correct':'ColorStraight','premult_multiply':'AlphaMultiply1','premult_source':'Foreground1'}[action]
 if action=='premult_source':LEFT[case]='Foreground1';RIGHT[case]='AlphaDivide1'
 action='show'
if action in ['matte_garbage','matte_solid']:
 assert case=='S75';TARGETS[case]='Garbage1' if action=='matte_garbage' else 'Solid1';action='show'
if action=='wand_mask':
 assert case=='S79';RIGHT[case]='WandMask1';action='show'
if action=='wand_result':
 assert case=='S79';LEFT[case]='WandMask1';action='show'
if action=='ranges_mask':
 assert case=='S78';RIGHT[case]='RangesMask1';action='show'
if action=='ranges_result':
 assert case=='S78';LEFT[case]='RangesMask1';action='show'
if action=='bitmap_mask':
 assert case=='S77';RIGHT[case]='BitmapMask1';action='show'
if action=='bitmap_result':
 assert case=='S77';LEFT[case]='BitmapMask1';action='show'
if action=='matte_source':
 assert case=='S75';LEFT[case]='MatteSource1';action='show'
if action=='roundtrip_result':
 assert case=='S72';TARGETS[case]='RGBBack1';LEFT[case]='ColorSpace1';RIGHT[case]='RGBBack1';action='show'
if action=='canvas_source':
 assert case=='S52';TARGETS[case]='GoldCanvas1';action='show'
if action=='map':
 assert case in ['S30','S49'];TARGETS[case]='NoiseMap1';LEFT[case]='NoiseMap1';action='show'
if case in ['S100','S101','S102']:
 assert action!='build', 'Layer cases use accepted fixture.comp;never rebuild existing authored examples'
 assert r.GetCurrentPage() is not None,'Resolve has no active page;inspect child modal dialogs first'
timelines={p.GetTimelineByIndex(i).GetName().split('_')[0]:p.GetTimelineByIndex(i) for i in range(1,p.GetTimelineCount()+1)}
if case not in timelines:
 assert action=='build'
 t=p.GetMediaPool().CreateEmptyTimeline(case+'_capture')
 assert p.SetCurrentTimeline(t)
 r.OpenPage('edit'); item=t.InsertFusionCompositionIntoTimeline()
 assert item
 c=item.GetFusionCompByIndex(1) or item.AddFusionComp()
else:
 t=timelines[case]
 if p.GetCurrentTimeline().GetName()!=t.GetName(): p.SetCurrentTimeline(t)
 assert p.GetCurrentTimeline().GetName()==t.GetName(), 'Timeline switch did not land'
 item=t.GetItemListInTrack('video',1)[0]; c=item.GetFusionCompByIndex(1)
assert c
c.SetData('CollectaneaCaptureCase',case)
r.OpenPage('fusion')
for _ in range(50):
 current=r.Fusion().GetCurrentComp()
 if current and current.GetData('CollectaneaCaptureCase')==case:break
 time.sleep(.1)
else:raise RuntimeError('Requested composition did not become the active GUI composition')
t.SetCurrentTimecode('01:00:02:00' if case=='S09' else '01:00:00:00')
c.CurrentTime=requested_frame if case in ['S35','S36','S39','S40','S42','S45','S49','S56','S84','S86','S87','S88','S89','S90','S91','S92','S93','S94','S95','S96'] else 48 if case=='S09' else 0
if case in ['S36','S39','S40','S42','S45','S49','S56','S84','S86','S87','S88','S89','S90','S91','S92','S93','S94','S95','S96']:t.SetCurrentTimecode(f'01:00:{requested_frame//24:02d}:{requested_frame%24:02d}')
if case=='S35':t.SetCurrentTimecode('01:00:02:00' if requested_frame==48 else '01:00:00:00')
time.sleep(.3)
tools={x.GetAttrs()['TOOLS_Name']:x for x in c.GetToolList().values()}
mo=next(x for x in tools.values() if x.GetAttrs()['TOOLS_RegID']=='MediaOut')
def add(reg,name,x,y,**values):
 c.Lock()
 try:
  a=c.AddTool(reg,x,y); assert a,reg
  a.SetAttrs({'TOOLS_Name':name})
  for k,v in values.items():
   assert any(z.GetAttrs()['INPS_ID']==k for z in a.GetInputList().values()),(reg,k)
   a.SetInput(k,v)
  tools[name]=a
  return a
 finally:c.Unlock()
def connect(dst,key,src):
 assert dst.ConnectInput(key,src), (dst.GetAttrs()['TOOLS_Name'],key)
def text(name,x,y,value='FUSION',size=.13):
 return add('TextPlus',name,x,y,StyledText=value,Font='Arial',Style='Bold',Size=size)
def select(target,left=None):
 if case=='S97' and 'AlphaMultiply1' in tools:RIGHT['S97']='AlphaMultiply1'
 c.SetActiveTool(target)
 previews=c.GetPreviewList()
 previews['RightView'].ViewOn(tools[RIGHT.get(case,TARGETS[case])])
 if case in LEFT: previews['LeftView'].ViewOn(tools[LEFT[case]])
 time.sleep(.25)
 for name in ['LeftView','RightView']:
  previews[name].View.SetScale(.4)
 c.CurrentFrame.FlowView.Select()
 c.CurrentFrame.FlowView.Select(target)
 flow=c.CurrentFrame.FlowView
 flow.SetScale(1.5)
 for i,a in enumerate(x for x in tools.values() if x.GetAttrs()['TOOLS_RegID']!='MediaOut' and x.GetAttrs().get('TOOLB_Visible',True)):
  flow.SetPos(a,i*1.25,0)
 if case=='S02':
  flow.SetPos(tools['Background1'],0,1)
  flow.SetPos(tools['Text1'],0,-1)
  flow.SetPos(tools['Merge1'],1.5,1)
 flow.SetPos(mo,max(3.75,(len(tools)-1)*1.25),1 if case=='S02' else 0)
 layouts={
 'S05':{'sEllipse1':(0,1),'sStar1':(0,-1),'sBoolean1':(1.5,1),'Union1':(1.5,-1),'sRender1':(3,1),'UnionRender1':(3,-1),'MediaOut1':(4.5,1)},
 'S07':{'Loader1':(0,0),'Ellipse1':(1.5,-1.5),'Blur1':(1.5,0),'BlurFull':(1.5,1.5),'MediaOut1':(3,0)},
 'S11':{'Shape3D1':(0,-2),'Camera3D1':(0,0),'PointLight1':(0,2),'Merge3D1':(1.5,0),'Renderer3D1':(3,0),'MediaOut1':(4.5,0)},
 'S10':{'Loader1':(0,1),'PlanarTracker1':(1.5,2.5),'TrackedLabel':(0,-1),'PlanarTransform1':(1.5,-1),'Composite1':(3,1),'MediaOut1':(4.5,1)},
 'S15':{'Solid1':(0,-1),'Gradient1':(0,1),'MediaOut1':(2,1)},
 'S16':{'NoiseDefault1':(0,-1),'NoiseDetail1':(0,1),'MediaOut1':(2,1)},
 'S17':{'Rectangle1':(0,-1),'Background1':(0,1),'MediaOut1':(2,1)},
 'S18':{'EllipseSolid1':(0,-1),'RenderSolid1':(2,-1),'EllipseArc1':(0,1),'RenderArc1':(2,1),'MediaOut1':(4,1)}}
 for key in ['S19','S20','S21']:
  layouts[key]={'ShapeBase1':(0,-1),'RenderBase1':(2,-1),'ShapeChanged1':(0,1),'RenderChanged1':(2,1),'MediaOut1':(4,1)}
 layouts['S22']={'ShapeBase1':(0,-1),'RenderBase1':(4,-1),'Transform1':(2,1),'RenderChanged1':(4,1),'MediaOut1':(6,1)}
 layouts['S23']={'SourceA':(0,2),'SourceB':(0,-2),'Transform1':(2,-2),'Merge1':(4,2),'MediaOut1':(6,2)}
 layouts['S24']={'Loader1':(0,0),'Transform1':(2,-2),'Scale1':(2,0),'Resize1':(2,2),'MediaOut1':(4,2)}
 layouts['S25']={'LoaderOpaque':(0,0),'BlurMask':(2,0),'Ellipse1':(2,-2),'LoaderCutout':(4,-2),'MediaOut1':(6,-2)}
 layouts['S26']={'Text1':(0,0),'MediaOut1':(2,0)}
 layouts['S27']={'Base1':(0,2),'Rectangle1':(0,-2),'Red1':(1.5,-2),'Ellipse1':(1.5,0),'Gold1':(3,0),'MultiMerge1':(4.5,2),'MediaOut1':(6,2)}
 layouts['S28']={'Base1':(0,2),'Red1':(0,0),'Ellipse1':(2,-2),'MergeFull':(2,3.5),'MergeMasked':(4,2),'MediaOut1':(6,2)}
 layouts['S29']={'Loader1':(0,0),'Gold1':(0,-2),'Dissolve1':(2,0),'MediaOut1':(4,0)}
 layouts['S30']={'Loader1':(0,0),'NoiseMap1':(0,-2),'Displace1':(2,0),'MediaOut1':(4,0)}
 layouts['S31']={'Ellipse1':(0,-2),'Cutout1':(1.5,-2),'Base1':(0,1),'Merge1':(3,1),'MediaOut1':(4.5,1)}
 layouts['S32']={'Loader1':(0,2),'Ellipse1':(0,-2),'Foreground1':(1.5,-2),'MergeBase':(3,3.5),'MergeChanged':(3,1),'MediaOut1':(4.5,1)}
 layouts['S33']={'Rectangle1':(0,-1.5),'EllipseSubtract':(1.5,-1.5),'GoldBase':(1.5,1.5),'GoldSubtract':(3,0),'MediaOut1':(4.5,0)}
 layouts['S34']={'Loader1':(0,0),'TransformBase':(1.5,-1),'TransformPivot':(1.5,1),'MediaOut1':(3,1)}
 layouts['S36']={'Text1':(0,0),'TransformLinear':(1.5,-2),'TransformSmooth':(1.5,0),'TransformStep':(1.5,2),'MediaOut1':(3,0)}
 layouts['S37']={'Base1':(0,0),'Rectangle1':(0,-2),'Red1':(1.5,-2),'Ellipse1':(1.5,2),'Gold1':(3,2),'MergeMaster':(3,-1),'MergeDerived':(4.5,1),'MediaOut1':(6,1)}
 layouts['S38']={'Loader1':(0,0),'TransformReference':(1.5,0),'MediaOut1':(3,0)}
 layouts['S50']={'Loader1':(0,0),'AutoDomain1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S54']={'Loader1':(0,0),'Letterbox1':(1.5,0),'MediaOut1':(3,0)}
 for cid in ['S58','S59','S60','S61']:layouts[cid]={'Loader1':(0,0),TARGETS[cid]:(1.5,0),'MediaOut1':(3,0)}
 for cid in ['S70','S71','S72','S73']:layouts[cid]={'Loader1':(0,0),TARGETS[cid]:(1.5,0),'MediaOut1':(3,0)}
 for cid in ['S66','S67','S68','S69']:layouts[cid]={'Loader1':(0,0),TARGETS[cid]:(1.5,0),'MediaOut1':(3,0)}
 for cid in ['S62','S63','S64','S65']:layouts[cid]={'Loader1':(0,0),TARGETS[cid]:(1.5,0),'MediaOut1':(3,0)}
 if case in ['S62','S63'] and 'BlurSource1' in tools:layouts[case]={'Loader1':(0,0),'BlurSource1':(1.5,0),TARGETS[case]:(3,0),'MediaOut1':(4.5,0)}
 if case=='S72' and 'RGBBack1' in tools:layouts[case]={'Loader1':(0,0),'ColorSpace1':(1.5,0),'RGBBack1':(3,0),'MediaOut1':(4.5,0)}
 for cid in ['S88','S89','S90','S91','S92','S93','S94','S95','S96']:layouts[cid]={'Loader1':(0,0),'Paint1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S87']={'Loader1':(0,0),'Paint1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S86']={'Loader1':(0,0),'Paint1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S85']={'MultiPoly1':(0,-1),'Gold1':(1.5,1),'MediaOut1':(3,1)}
 layouts['S84']={'MaskPaint1':(0,-1),'Gold1':(1.5,1),'MediaOut1':(3,1)}
 layouts['S83']={'BSpline1':(0,-1),'Gold1':(1.5,1),'MediaOut1':(3,1)}
 layouts['S82']={'Polygon1':(0,-1),'Gold1':(1.5,1),'MediaOut1':(3,1)}
 layouts['S81']={'Rectangle1':(0,-1),'Gold1':(1.5,1),'MediaOut1':(3,1)}
 layouts['S80']={'Triangle1':(0,-1),'Gold1':(1.5,1),'MediaOut1':(3,1)}
 layouts['S79']={'Loader1':(0,-1),'WandMask1':(1.5,-1),'Gold1':(3,1),'MediaOut1':(4.5,1)}
 layouts['S78']={'Loader1':(0,-1),'RangesMask1':(1.5,-1),'Gold1':(3,1),'MediaOut1':(4.5,1)}
 layouts['S77']={'Loader1':(0,-1),'BitmapMask1':(1.5,-1),'Gold1':(3,1),'MediaOut1':(4.5,1)}
 layouts['S76']={'Loader1':(0,0),'LumaKeyer1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S75']={'Loader1':(0,1),'EllipseMatte1':(0,-2),'MatteSource1':(1.5,-2),'MatteControl1':(3,1),'MediaOut1':(4.5,1)}
 if case=='S75' and 'Garbage1' in tools:layouts['S75'].update({'Garbage1':(3,-2),'Solid1':(4.5,-2),'MediaOut1':(4.5,1)})
 layouts['S74']={'Ellipse1':(0,-2),'Foreground1':(0,0),'ColorDirect':(2,-2),'MergeNaive':(6,-2),'AlphaDivide1':(1.5,1),'ColorStraight':(3,1),'AlphaMultiply1':(4.5,1),'MergeCorrect':(6,1),'Base1':(0,3),'MediaOut1':(7.5,1)}
 layouts['S57']={'Loader1':(0,0),'CustomTool1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S56']={'Loader1':(0,0),'CameraShake1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S55']={'Loader1':(0,0),'DVE1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S53']={'Loader1':(0,0),'Crop1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S52']={'Loader1':(0,1),'Transform1':(1.5,1),'Gold1':(0,-1),'GoldCanvas1':(1.5,-1),'SetCanvasColor1':(3,1),'MediaOut1':(4.5,1)}
 layouts['S51']={'Loader1':(0,0),'AutoDomain1':(1.5,0),'SetDomain1':(3,0),'MediaOut1':(4.5,0)}
 layouts['S49']={'Loader1':(0,1),'NoiseMap1':(0,-1),'Ellipse1':(2,-2),'Displace1':(2,1),'MediaOut1':(4,1)}
 layouts['S48']={'Gradient1':(0,0),'ChangeDepth1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S47']={'Text1':(0,0),'Wireless1':(3,0),'MediaOut1':(4.5,0)}
 layouts['S46']={'Blue1':(0,-1.5),'Gold1':(0,1.5),'Switch1':(2,0),'MediaOut1':(4,0)}
 layouts['S45']={'Background1':(0,0),'SetTimecode1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S44']={'Blue1':(0,1.5),'MetaBGShot':(1.5,1.5),'MetaBGExtra':(3,1.5),'Red1':(0,-1.5),'MetaFGShot':(1.5,-1.5),'MetaFGExtra':(3,-1.5),'CopyMetadata1':(4.5,1.5),'MediaOut1':(6,1.5)}
 layouts['S43']={'Background1':(0,0),'SetMetadata1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S42']={'Loader1':(0,0),'FrameAverage1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S41']={'TextA':(0,-1.5),'TransformA':(1.5,-1.5),'TextB':(0,1.5),'TransformB':(1.5,1.5),'MediaOut1':(3,1.5)}
 layouts['S40']={'Loader1':(0,0),'TimeSpeed1':(1.5,0),'MediaOut1':(3,0)}
 layouts['S39']={'Loader1':(0,0),'TimeDynamic':(1.5,-1.5),'TimeHold':(1.5,1.5),'TransformHold':(3,1.5),'MediaOut1':(3,-1.5)}
 layouts['S35']={'Text1':(0,0),'TransformAnimated':(1.5,0),'MediaOut1':(3,0)}
 layouts['S97']={'Loader1':(0,0),'Ellipse1':(0,-2),'AlphaSource1':(1.5,-2),'ChannelBooleans1':(3,0),'MediaOut1':(4.5,0)}
 if case=='S97' and 'AlphaMultiply1' in tools:
  layouts['S97'].update({'AlphaMultiply1':(4.5,0),'MediaOut1':(6,0)});RIGHT['S97']='AlphaMultiply1'
 layouts['S99']={'Loader1':(0,0),'Gold1':(0,-2),'Swizzler1':(2,0),'MediaOut1':(4,0)}
 for cid in ['S100','S101']:
  layouts[cid]={'ChartSource1' if cid=='S100' else 'Loader1':(0,0),'Gold1':(0,-1.5),'Swizzler1':(1,0),TARGETS[cid]:(2,0),'MediaOut1':(3,0)}
 layouts['S102']={'Loader1':(0,0),'Gold1':(0,-1.5),'Blue1':(0,1.5),'SwizzlerA1':(1,-.75),'SwizzlerB1':(1,.75),'LayerMuxer1':(2,0),'MediaOut1':(3,0)}
 for n,pos in layouts.get(case,{}).items():
  if n in tools:flow.SetPos(tools[n],*pos)
 if case=='S27':flow.SetScale(1.0)
 flow.FrameAll()
 c.SetActiveTool(target)
 # A newly rendered branch can return a Viewer to Fit after tool selection.
 for name in ['LeftView','RightView']:previews[name].View.SetScale(.4)
target=None
if action=='build':
 assert case=='S01' or len(tools)==1, 'Refusing to rebuild an existing case'
 if case=='S01':
  # The initial probe already created these three nodes; repair only this owned probe.
  e=tools.get('sEllipse1') or add('sEllipse','sEllipse1',0,0)
  g=tools.get('sGrid1') or add('sGrid','sGrid1',3,0)
  sr=tools.get('sRender1') or add('sRender','sRender1',6,0)
  e.SetInput('Width',.055); e.SetInput('Height',.055)
  g.SetInput('CellsX',5); g.SetInput('CellsY',3); g.SetInput('XOffset',.16); g.SetInput('YOffset',.18)
  connect(g,'Input',e); connect(sr,'Input',g); connect(mo,'Input',sr)
  target=g; c.CurrentFrame.ViewOn(sr,2)
 elif case=='S02':
  bg=add('Background','Background1',0,1,TopLeftRed=.025,TopLeftGreen=.075,TopLeftBlue=.13)
  tx=text('Text1',0,-1,'COLLECTANEA',.10)
  m=add('Merge','Merge1',3,1,Blend=1); connect(m,'Background',bg); connect(m,'Foreground',tx); connect(mo,'Input',m);target=m
 elif case=='S03':
  tx=text('Text1',0,0,'GLOW',.17)
  g=add('Glow','Glow1',3,0,XGlowSize=30,Glow=.18,Blend=1)
  connect(g,'Input',tx); connect(mo,'Input',g);target=g
 elif case in ('S19','S20','S21'):
  reg={'S19':'sRectangle','S20':'sNGon','S21':'sStar'}[case]
  base=add(reg,'ShapeBase1',0,-1)
  rb=add('sRender','RenderBase1',2,-1);connect(rb,'Input',base)
  target=add(reg,'ShapeChanged1',0,1)
  rr=add('sRender','RenderChanged1',2,1);connect(rr,'Input',target);connect(mo,'Input',rr)
 elif case=='S22':
  base=add('sStar','ShapeBase1',0,-1)
  rb=add('sRender','RenderBase1',4,-1);connect(rb,'Input',base)
  target=add('sTransform','Transform1',2,1);connect(target,'Input',base)
  rr=add('sRender','RenderChanged1',4,1);connect(rr,'Input',target);connect(mo,'Input',rr)
 elif case=='S99':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  gold=add('Background','Gold1',0,-2,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1)
  target=add('Swizzler','Swizzler1',2,0)
  ids={z.GetAttrs().get('INPS_ID') for z in target.GetInputList().values() if z is not None and callable(z.GetAttrs) and z.GetAttrs().get('INPS_DataType')=='Image'}
  assert 'Input1' in ids,ids
  connect(target,'Input1',loader)
  ids={z.GetAttrs().get('INPS_ID') for z in target.GetInputList().values() if z is not None and callable(z.GetAttrs) and z.GetAttrs().get('INPS_DataType')=='Image'}
  assert 'Input2' in ids,ids
  connect(target,'Input2',gold);connect(mo,'Input',target)
 elif case=='S98':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('GamutConvert','Gamut1',1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case=='S97':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  mask=add('EllipseMask','Ellipse1',0,-2,ShowViewControls=0)
  alpha=add('Background','AlphaSource1',1.5,-2,TopLeftRed=1,TopLeftGreen=1,TopLeftBlue=1,TopLeftAlpha=1);connect(alpha,'EffectMask',mask)
  target=add('ChannelBoolean','ChannelBooleans1',3,0);connect(target,'Background',loader);connect(target,'Foreground',alpha);connect(mo,'Input',target)
 # S88-96 create empty Paint scaffolds;native style selection and authoring required.
 elif case in ['S88','S89','S90','S91','S92','S93','S94','S95','S96']:
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('Paint','Paint1',1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 # S87 creates an empty Paint scaffold;native Stroke selection/drawing/editability are required.
 elif case=='S87':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('Paint','Paint1',1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 # S86 creates an empty Paint scaffold;native stroke creation and duration comparison are required.
 elif case=='S86':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('Paint','Paint1',1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 # S85 creates an empty MultiPoly;native list/shape creation and closing are required.
 elif case=='S85':
  target=add('MultiPoly','MultiPoly1',0,-1)
  gold=add('Background','Gold1',1.5,1,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1);connect(gold,'EffectMask',target);connect(mo,'Input',gold)
 # S84 creates an empty PaintMask;native stroke creation and duration readback are required.
 elif case=='S84':
  target=add('PaintMask','MaskPaint1',0,-1)
  gold=add('Background','Gold1',1.5,1,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1);connect(gold,'EffectMask',target);connect(mo,'Input',gold)
 # S83 creates an empty B-Spline;draw and close it in the native Viewer before acceptance.
 elif case=='S83':
  target=add('BSplineMask','BSpline1',0,-1,ShowViewControls=1)
  gold=add('Background','Gold1',1.5,1,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1);connect(gold,'EffectMask',target);connect(mo,'Input',gold)
 # S82 creates an empty polygon;draw and close it in the native Viewer before acceptance.
 elif case=='S82':
  target=add('PolylineMask','Polygon1',0,-1,ShowViewControls=1)
  gold=add('Background','Gold1',1.5,1,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1);connect(gold,'EffectMask',target);connect(mo,'Input',gold)
 elif case=='S81':
  target=add('RectangleMask','Rectangle1',0,-1,ShowViewControls=0)
  gold=add('Background','Gold1',1.5,1,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1);connect(gold,'EffectMask',target);connect(mo,'Input',gold)
 elif case=='S80':
  target=add('TriangleMask','Triangle1',0,-1,ShowViewControls=0)
  gold=add('Background','Gold1',1.5,1,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1);connect(gold,'EffectMask',target);connect(mo,'Input',gold)
 elif case=='S79':
  loader=add('Loader','Loader1',0,-1,Clip=str(ROOT/'static/img/fusion/captures/_fixtures/wand-patches.png'))
  target=add('WandMask','WandMask1',1.5,-1,ShowViewControls=0)
  image_keys=[z.GetAttrs()['INPS_ID'] for z in target.GetInputList().values() if z.GetAttrs().get('INPS_DataType')=='Image'];assert len(image_keys)==1,image_keys
  connect(target,image_keys[0],loader)
  gold=add('Background','Gold1',3,1,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1);connect(gold,'EffectMask',target);connect(mo,'Input',gold)
 elif case=='S78':
  loader=add('Loader','Loader1',0,-1,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('RangesMask','RangesMask1',1.5,-1,ShowViewControls=0)
  image_keys=[z.GetAttrs()['INPS_ID'] for z in target.GetInputList().values() if z.GetAttrs().get('INPS_DataType')=='Image']
  assert len(image_keys)==1,image_keys
  connect(target,image_keys[0],loader)
  gold=add('Background','Gold1',3,1,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1);connect(gold,'EffectMask',target);connect(mo,'Input',gold)
 elif case=='S77':
  loader=add('Loader','Loader1',0,-1,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('BitmapMask','BitmapMask1',1.5,-1,ShowViewControls=0)
  image_keys=[z.GetAttrs()['INPS_ID'] for z in target.GetInputList().values() if z.GetAttrs().get('INPS_DataType')=='Image']
  assert len(image_keys)==1,image_keys
  connect(target,image_keys[0],loader)
  gold=add('Background','Gold1',3,1,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05,TopLeftAlpha=1);connect(gold,'EffectMask',target);connect(mo,'Input',gold)
 elif case=='S76':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('LumaKeyer','LumaKeyer1',1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case=='S75':
  loader=add('Loader','Loader1',0,1,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  ell=add('EllipseMask','EllipseMatte1',0,-2,Width=.5,Height=.65,SoftEdge=.025)
  matte=add('Background','MatteSource1',1.5,-2,TopLeftRed=1,TopLeftGreen=1,TopLeftBlue=1,TopLeftAlpha=1);connect(matte,'EffectMask',ell)
  target=add('MatteControl','MatteControl1',3,1);connect(target,'Background',loader);connect(target,'Foreground',matte);connect(mo,'Input',target)
 elif case=='S74':
  ell=add('EllipseMask','Ellipse1',0,-2,Width=.4,Height=.65,SoftEdge=.08)
  fg=add('Background','Foreground1',0,0,TopLeftRed=.2,TopLeftGreen=.55,TopLeftBlue=.9,TopLeftAlpha=1);connect(fg,'EffectMask',ell)
  bg=add('Background','Base1',0,3,TopLeftRed=.025,TopLeftGreen=.025,TopLeftBlue=.025,TopLeftAlpha=1)
  naive=add('ColorCorrector','ColorDirect',2,-2,MasterRGBOutputLow=.2,PreDividePostMultiply=0,ProcessAlpha=0,Menu=1);connect(naive,'Input',fg)
  target=add('AlphaDivide','AlphaDivide1',1.5,1);connect(target,'Input',fg)
  correct=add('ColorCorrector','ColorStraight',3,1,MasterRGBOutputLow=.2,PreDividePostMultiply=0,ProcessAlpha=0,Menu=1);connect(correct,'Input',target)
  multiply=add('AlphaMultiply','AlphaMultiply1',4.5,1);connect(multiply,'Input',correct)
  for name,source,y in [('MergeNaive',naive,-2),('MergeCorrect',multiply,1)]:
   merge=add('Merge',name,6,y);connect(merge,'Background',bg);connect(merge,'Foreground',source)
  connect(mo,'Input',tools['MergeCorrect'])
 # S71 matrix edits require native GUI commit and exported FilterTable readback.
 elif case in ['S70','S71','S72','S73']:
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  reg={'S70':'AutoGain','S71':'CustomColorMatrix','S72':'ColorSpace','S73':'WhiteBalance'}[case]
  target=add(reg,TARGETS[case],1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 # S69 matrix edits require native GUI commit and exported FilterTable readback.
 elif case in ['S66','S67','S68','S69']:
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  reg={'S66':'Filter','S67':'SoftGlow','S68':'CreateBumpMap','S69':'CustomFilter'}[case]
  target=add(reg,TARGETS[case],1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case in ['S62','S63','S64','S65']:
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  reg={'S62':'Sharpen','S63':'UnsharpMask','S64':'ErodeDilate','S65':'RankFilter'}[case]
  target=add(reg,TARGETS[case],1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case in ['S58','S59','S60','S61']:
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  reg={'S58':'DirectionalBlur','S59':'Defocus','S60':'BrightnessContrast','S61':'ColorGain'}[case]
  target=add(reg,TARGETS[case],1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case=='S57':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('Custom','CustomTool1',1.5,0);connect(target,'Image1',loader);connect(mo,'Input',target)
 elif case=='S56':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('CameraShake','CameraShake1',1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case in ['S54','S55']:
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  reg='Letterbox' if case=='S54' else 'DVE'
  target=add(reg,TARGETS[case],1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case=='S53':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('Crop','Crop1',1.5,0);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case=='S52':
  loader=add('Loader','Loader1',0,1,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  xf=add('Transform','Transform1',1.5,1,Size=.5);connect(xf,'Input',loader)
  add('Background','Gold1',1.5,-1,TopLeftRed=.85,TopLeftGreen=.42,TopLeftBlue=.03)
  target=add('SetCanvasColor','SetCanvasColor1',3,1);connect(target,'Input',xf);connect(mo,'Input',target)
 elif case in ['S50','S51']:
  loader=add('Loader','Loader1',0,0,Clip=str(ROOT/'static/img/fusion/captures/_fixtures/domain-rectangle.png'))
  auto=add('AutoDomain','AutoDomain1',1.5,0);connect(auto,'Input',loader)
  target=auto
  if case=='S51':
   target=add('SetDomain','SetDomain1',3,0);connect(target,'Input',auto)
  connect(mo,'Input',target)
 elif case=='S49':
  loader=add('Loader','Loader1',0,1,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  noise=add('FastNoise','NoiseMap1',0,-1,Detail=4,Contrast=1.4,XScale=8,YScale=8,SeetheRate=.4)
  add('EllipseMask','Ellipse1',2,-2,Width=.45,Height=.6,SoftEdge=.04)
  target=add('Displace','Displace1',2,1,Type=1,XChannel=4,YChannel=4,XRefraction=.015,YRefraction=0)
  connect(target,'Input',loader);connect(target,'Foreground',noise);connect(mo,'Input',target)
 elif case=='S48':
  bg=add('Background','Gradient1',0,0,Type='Horizontal',TopLeftRed=0,TopLeftGreen=0,TopLeftBlue=0,TopRightRed=1,TopRightGreen=1,TopRightBlue=1)
  target=add('ChangeDepth','ChangeDepth1',1.5,0);connect(target,'Input',bg);connect(mo,'Input',target)
 # S47 build creates the scaffold; finish Wireless Input node reference in the native GUI.
 elif case=='S47':
  text('Text1',0,0,'WIRELESS',.12)
  target=add('Fuse.Wireless','Wireless1',3,0);connect(mo,'Input',target)
 # S46 build creates the scaffold; finish Switch input/output wiring and Config names in the native GUI.
 elif case=='S46':
  blue=add('Background','Blue1',0,-1.5,TopLeftRed=.03,TopLeftGreen=.12,TopLeftBlue=.3)
  gold=add('Background','Gold1',0,1.5,TopLeftRed=.85,TopLeftGreen=.42,TopLeftBlue=.03)
  target=add('Switch','Switch1',2,0)
  print('Switch scaffold: inspect native inputs before connecting candidates')
 elif case=='S45':
  bg=add('Background','Background1',0,0,TopLeftRed=.03,TopLeftGreen=.12,TopLeftBlue=.3)
  target=add('Fuse.SetMetaDataTC','SetTimecode1',1.5,0);connect(target,'Input',bg);connect(mo,'Input',target)
 elif case=='S44':
  blue=add('Background','Blue1',0,1.5,TopLeftRed=.03,TopLeftGreen=.12,TopLeftBlue=.3)
  red=add('Background','Red1',0,-1.5,TopLeftRed=.8,TopLeftGreen=.04,TopLeftBlue=.02)
  mb=add('Fuse.SetMetaData','MetaBGShot',1.5,1.5,FieldName='ShotName',FieldValue='BG001');connect(mb,'Input',blue)
  be=add('Fuse.SetMetaData','MetaBGExtra',3,1.5,FieldName='BGOnly',FieldValue='keepBG');connect(be,'Input',mb)
  mf=add('Fuse.SetMetaData','MetaFGShot',1.5,-1.5,FieldName='ShotName',FieldValue='FG002');connect(mf,'Input',red)
  fe=add('Fuse.SetMetaData','MetaFGExtra',3,-1.5,FieldName='FGOnly',FieldValue='keepFG');connect(fe,'Input',mf)
  target=add('Fuse.FLS_CopyMetadata','CopyMetadata1',4.5,1.5)
  image_inputs={z.GetAttrs()['INPS_ID']:z.GetAttrs().get('INPS_Name') for z in target.GetInputList().values() if z.GetAttrs().get('INPS_DataType')=='Image'}
  print('Observed CopyMetadata image inputs:',image_inputs)
  assert 'Background' in image_inputs and 'Metadata' in image_inputs,image_inputs
  connect(target,'Background',be);connect(target,'Metadata',fe);connect(mo,'Input',target)
 elif case=='S43':
  bg=add('Background','Background1',0,0,TopLeftRed=.03,TopLeftGreen=.12,TopLeftBlue=.3)
  target=add('Fuse.SetMetaData','SetMetadata1',1.5,0);connect(target,'Input',bg);connect(mo,'Input',target)
 elif case=='S42':
  loader=add('Loader','Loader1',0,0,Clip=str(ROOT/'static/img/fusion/captures/_fixtures/timeplate/frame0000.png'))
  target=add('Fuse.FrameAverage','FrameAverage1',1.5,0,Frames=12,SampleDirection=1);connect(target,'Input',loader);connect(mo,'Input',target)
 # S41 build creates the scaffold; finish Publish/Connect To in the native GUI.
 elif case=='S41':
  a=text('TextA',0,-1.5,'PUBLISH A',.1);b=text('TextB',0,1.5,'PUBLISH B',.1)
  target=add('Transform','TransformA',1.5,-1.5,Size=.5);connect(target,'Input',a)
  second=add('Transform','TransformB',1.5,1.5,Size=1);connect(second,'Input',b);connect(mo,'Input',second)
 elif case=='S40':
  loader=add('Loader','Loader1',0,0,Clip=str(ROOT/'static/img/fusion/captures/_fixtures/timeplate/frame0000.png'))
  target=add('TimeSpeed','TimeSpeed1',1.5,0,Speed=.5,Delay=0,InterpolateBetweenFrames=1);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case=='S39':
  loader=add('Loader','Loader1',0,0,Clip=str(ROOT/'static/img/fusion/captures/_fixtures/timeplate/frame0000.png'))
  target=add('TimeStretcher','TimeDynamic',1.5,-1.5);connect(target,'Input',loader)
  out=target.SourceTime.GetConnectedOutput()
  if not out:target.SourceTime=c.BezierSpline();out=target.SourceTime.GetConnectedOutput()
  out.GetTool().SetKeyFrames({0:{1:0,'Flags':{'Linear':True}},24:{1:99,'Flags':{'Linear':True}}},True)
  hold=add('TimeStretcher','TimeHold',1.5,1.5);connect(hold,'Input',loader)
  hold.SourceTime.GetConnectedOutput().GetTool().SetKeyFrames({0:{1:12}},True)
  xf=add('Transform','TransformHold',3,1.5);connect(xf,'Input',hold);xf.Size=c.BezierSpline()
  xf.Size.GetConnectedOutput().GetTool().SetKeyFrames({0:{1:.8,'Flags':{'Linear':True}},24:{1:1.2,'Flags':{'Linear':True}}},True)
  connect(mo,'Input',target)
  assert abs(target.GetInput('SourceTime',12)-49.5)<.00001
  assert hold.GetInput('SourceTime',0)==hold.GetInput('SourceTime',24)==12
 elif case=='S38':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('Transform','TransformReference',1.5,0,Center={1:.525,2:.5},Width=1920,Height=1080,UseFrameFormatSettings=0);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case=='S37':
  bg=add('Background','Base1',0,0,TopLeftRed=.025,TopLeftGreen=.075,TopLeftBlue=.13)
  rect=add('RectangleMask','Rectangle1',0,-2,Width=.5,Height=.4)
  red=add('Background','Red1',1.5,-2,TopLeftRed=.8,TopLeftGreen=.06,TopLeftBlue=.05);connect(red,'EffectMask',rect)
  ell=add('EllipseMask','Ellipse1',1.5,2,Width=.4,Height=.5)
  gold=add('Background','Gold1',3,2,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05);connect(gold,'EffectMask',ell)
  master=add('Merge','MergeMaster',3,-1,Blend=.8);connect(master,'Background',bg);connect(master,'Foreground',red)
  target=add('Merge','MergeDerived',4.5,1);connect(target,'Background',bg);connect(target,'Foreground',gold);connect(mo,'Input',target)
  target.Blend.SetExpression('MergeMaster.Blend')
  assert abs(target.GetInput('Blend',0)-.8)<.00001
 elif case=='S36':
  tx=text('Text1',0,0,'SPLINE',.12)
  nodes={}
  for name in ['TransformLinear','TransformSmooth','TransformStep']:
   a=add('Transform',name,1.5,0);connect(a,'Input',tx);a.Size=c.BezierSpline();nodes[name]=a
  keysets={
   'TransformLinear':{0:{1:.7,'Flags':{'Linear':True}},12:{1:1.1,'Flags':{'Linear':True}},24:{1:1.0,'Flags':{'Linear':True}}},
   'TransformSmooth':{0:{1:.7,'RH':{1:4,2:0}},12:{1:1.1,'LH':{1:-4,2:0},'RH':{1:4,2:0}},24:{1:1.,'LH':{1:-4,2:0}}},
   'TransformStep':{0:{1:.7,'Flags':{'StepIn':True}},12:{1:1.1,'Flags':{'StepIn':True}},24:{1:1.,'Flags':{'StepIn':True}}}}
  for name,keys in keysets.items():
   spline=nodes[name].Size.GetConnectedOutput().GetTool();spline.SetKeyFrames(keys,True)
  target=nodes['TransformSmooth'];connect(mo,'Input',target)
 elif case=='S35':
  tx=text('Text1',0,0,'KEYFRAME',.09)
  target=add('Transform','TransformAnimated',1.5,0,Center={1:.25,2:.5});connect(target,'Input',tx);connect(mo,'Input',target)
 elif case=='S31':
  mask=add('EllipseMask','Ellipse1',0,-2,Width=.4,Height=.55,SoftEdge=.02)
  fg=add('Background','Cutout1',1.5,-2,TopLeftRed=.8,TopLeftGreen=.06,TopLeftBlue=.05);connect(fg,'EffectMask',mask)
  bg=add('Background','Base1',0,1,TopLeftRed=.025,TopLeftGreen=.075,TopLeftBlue=.13)
  target=add('Merge','Merge1',3,1);connect(target,'Background',bg);connect(target,'Foreground',fg);connect(mo,'Input',target)
 elif case=='S32':
  bg=add('Loader','Loader1',0,2,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  mask=add('EllipseMask','Ellipse1',0,-2,Width=.5,Height=.55,SoftEdge=.02)
  fg=add('Background','Foreground1',1.5,-2,TopLeftRed=.8,TopLeftGreen=.06,TopLeftBlue=.05);connect(fg,'EffectMask',mask)
  base=add('Merge','MergeBase',3,3.5);connect(base,'Background',bg);connect(base,'Foreground',fg)
  target=add('Merge','MergeChanged',3,1);connect(target,'Background',bg);connect(target,'Foreground',fg);connect(mo,'Input',target)
 elif case=='S33':
  rect=add('RectangleMask','Rectangle1',0,-1.5,Width=.6,Height=.35)
  target=add('EllipseMask','EllipseSubtract',1.5,-1.5,Width=.25,Height=.5,Center={1:.6,2:.5},PaintMode='Subtract');connect(target,'EffectMask',rect)
  base=add('Background','GoldBase',1.5,1.5,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05);connect(base,'EffectMask',rect)
  out=add('Background','GoldSubtract',3,0,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05);connect(out,'EffectMask',target);connect(mo,'Input',out)
 elif case=='S34':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  base=add('Transform','TransformBase',1.5,-1,Center={1:.5,2:.5},Pivot={1:.5,2:.5},Angle=30);connect(base,'Input',loader)
  target=add('Transform','TransformPivot',1.5,1,Center={1:.5,2:.5},Pivot={1:.2,2:.5},Angle=30);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case=='S27':
  bg=add('Background','Base1',0,2,TopLeftRed=.025,TopLeftGreen=.075,TopLeftBlue=.13)
  rect=add('RectangleMask','Rectangle1',0,-2,Width=.5,Height=.35,Center={1:.43,2:.5})
  red=add('Background','Red1',2,-2,TopLeftRed=.8,TopLeftGreen=.06,TopLeftBlue=.05);connect(red,'EffectMask',rect)
  ell=add('EllipseMask','Ellipse1',2,0,Width=.35,Height=.5,Center={1:.6,2:.5})
  gold=add('Background','Gold1',4,0,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05);connect(gold,'EffectMask',ell)
  target=add('MultiMerge','MultiMerge1',6,2);connect(target,'Background',bg);connect(target,'Layer1.Foreground',red);connect(target,'Layer2.Foreground',gold);connect(mo,'Input',target)
 elif case=='S28':
  bg=add('Background','Base1',0,2,TopLeftRed=.025,TopLeftGreen=.075,TopLeftBlue=.13)
  red=add('Background','Red1',0,0,TopLeftRed=.8,TopLeftGreen=.06,TopLeftBlue=.05)
  target=add('EllipseMask','Ellipse1',2,-2,Width=.5,Height=.55,SoftEdge=.02)
  full=add('Merge','MergeFull',2,2);connect(full,'Background',bg);connect(full,'Foreground',red)
  masked=add('Merge','MergeMasked',4,2);connect(masked,'Background',bg);connect(masked,'Foreground',red);connect(masked,'EffectMask',target);connect(mo,'Input',masked)
 elif case=='S29':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  gold=add('Background','Gold1',0,-2,TopLeftRed=1,TopLeftGreen=.5,TopLeftBlue=.05)
  target=add('Dissolve','Dissolve1',2,0,Mix=.5);connect(target,'Background',loader);connect(target,'Foreground',gold);connect(mo,'Input',target)
 elif case=='S30':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  noise=add('FastNoise','NoiseMap1',0,-2,Detail=4,Contrast=2,XScale=6,YScale=6)
  target=add('Displace','Displace1',2,0,RefractionStrength=.06);connect(target,'Input',loader);connect(target,'Foreground',noise);connect(mo,'Input',target)
 elif case=='S23':
  bg=add('Background','SourceA',0,2,TopLeftRed=.025,TopLeftGreen=.075,TopLeftBlue=.13)
  tx=text('SourceB',0,-2,'FUSION',.14)
  target=add('Transform','Transform1',2,-2,Center={1:.65,2:.60});connect(target,'Input',tx)
  m=add('Merge','Merge1',4,2);connect(m,'Background',bg);connect(m,'Foreground',target);connect(mo,'Input',m)
 elif case=='S24':
  loader=add('Loader','Loader1',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  xf=add('Transform','Transform1',2,-2,Size=.5);connect(xf,'Input',loader)
  sc=add('Scale','Scale1',2,0,XSize=.5,YSize=.5,LockXY=1);connect(sc,'Input',loader)
  target=add('BetterResize','Resize1',2,2,Width=960,Height=540);connect(target,'Input',loader);connect(mo,'Input',target)
 elif case=='S25':
  loader=add('Loader','LoaderOpaque',0,0,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'))
  target=add('EllipseMask','Ellipse1',2,-2,Width=.55,Height=.5,SoftEdge=.02)
  blur=add('Blur','BlurMask',2,0,XBlurSize=20);connect(blur,'Input',loader);connect(blur,'EffectMask',target)
  cut=add('Loader','LoaderCutout',4,-2,Clip=str(REPO/'static/img/fusion/captures/_fixtures/chart.png'));connect(cut,'EffectMask',target);connect(mo,'Input',cut)
 elif case=='S26':
  target=text('Text1',0,0,'DoD',.18);connect(mo,'Input',target)
 elif case=='S15':
  add('Background','Solid1',0,-1,TopLeftRed=.025,TopLeftGreen=.075,TopLeftBlue=.13)
  target=add('Background','Gradient1',0,1,TopLeftRed=.025,TopLeftGreen=.075,TopLeftBlue=.13,TopRightRed=1,TopRightGreen=.35,TopRightBlue=.06)
  connect(mo,'Input',target)
 elif case=='S16':
  add('FastNoise','NoiseDefault1',0,-1)
  target=add('FastNoise','NoiseDetail1',0,1)
  connect(mo,'Input',target)
 elif case=='S17':
  target=add('RectangleMask','Rectangle1',0,-1,Width=.6,Height=.25)
  bg=add('Background','Background1',0,1,TopLeftRed=.8,TopLeftGreen=.15,TopLeftBlue=.07)
  connect(bg,'EffectMask',target);connect(mo,'Input',bg)
 elif case=='S18':
  solid=add('sEllipse','EllipseSolid1',0,-1,Width=.45,Height=.28,Solid=1)
  sr=add('sRender','RenderSolid1',2,-1);connect(sr,'Input',solid)
  target=add('sEllipse','EllipseArc1',0,1,Width=.45,Height=.28,Solid=0,BorderWidth=.012,WritePosition=.08,WriteLength=.7)
  ar=add('sRender','RenderArc1',2,1);connect(ar,'Input',target);connect(mo,'Input',ar)
 else: raise ValueError('No fixture defined: '+case)
 c.CurrentFrame.FlowView.SetPos(mo,9,1 if case=='S02' else 0)
 assert pm.SaveProject()
elif action in ('show','readback','set','masked','canvas_fg','canvas_manual','canvas_reference','soft_source','roundtrip','matte_masks'):
 target=tools.get(TARGETS.get(case,''))
assert target
if action in ['canvas_fg','canvas_manual','canvas_reference']:
 assert case=='S52'
 ins={z.GetAttrs()['INPS_ID']:z for z in target.GetInputList().values()}
 previous=ins['Foreground'].GetConnectedOutput()
 if previous:assert previous.GetTool().GetAttrs()['TOOLS_Name'] in ['Gold1','GoldCanvas1']
 if action=='canvas_reference':
  assert not previous and 'GoldCanvas1' not in tools, 'Reference probe already exists; reconcile before repeat'
  gold_canvas=add('SetCanvasColor','GoldCanvas1',1.5,-1,Red=.85,Green=.42,Blue=.03,Alpha=1)
  connect(gold_canvas,'Input',tools['Gold1']);connect(target,'Foreground',gold_canvas)
 if action=='canvas_fg' and not previous:connect(target,'Foreground',tools.get('GoldCanvas1') or tools['Gold1'])
 if action=='canvas_manual' and previous:assert target.ConnectInput('Foreground',None)
 result=ins['Foreground'].GetConnectedOutput()
 assert (result is not None)==(action!='canvas_manual')
 action='show'
if action=='masked':
 assert case=='S49'
 ins={z.GetAttrs()['INPS_ID']:z for z in target.GetInputList().values()}
 previous=ins['EffectMask'].GetConnectedOutput()
 if previous:assert previous.GetTool().GetAttrs()['TOOLS_Name']=='Ellipse1'
 else:connect(target,'EffectMask',tools['Ellipse1'])
 action='show'
if action=='roundtrip':
 assert case=='S72' and 'RGBBack1' not in tools,'one-shot roundtrip already exists'
 back=add('ColorSpace','RGBBack1',3,0,ColorSpaceConversion=2,ColorType=1)
 connect(back,'Input',tools['ColorSpace1']);connect(mo,'Input',back);action='show'
if action=='matte_masks':
 assert case=='S75' and 'Garbage1' not in tools and 'Solid1' not in tools, 'Owned mask extension is one-shot;inspect before retry'
 ports={z.GetAttrs()['INPS_ID'] for z in target.GetInputList().values()}
 assert {'Garbage.Matte','Solid.Matte'}<=ports
 garbage=add('RectangleMask','Garbage1',3,-2,Width=.14,Height=.4,Center={1:.55,2:.5})
 solid=add('RectangleMask','Solid1',4.5,-2,Width=.15,Height=.2,Center={1:.15,2:.3})
 connect(target,'Garbage.Matte',garbage);connect(target,'Solid.Matte',solid);action='show'
if action=='soft_source':
 assert case in ['S62','S63'] and 'BlurSource1' not in tools, 'Owned input preparation is one-shot; inspect before retry'
 src=add('Blur','BlurSource1',1.5,0,XBlurSize=2,YBlurSize=2,LockXY=1)
 connect(src,'Input',tools['Loader1']);connect(target,'Input',src)
 LEFT[case]='BlurSource1';action='show'
if case in ['S62','S63'] and 'BlurSource1' in tools:LEFT[case]='BlurSource1'
if action=='set':
 for name,values in json.loads(sys.argv[3]).items():
  assert name in tools
  for key,value in values.items():
   entry=next((z for z in tools[name].GetInputList().values() if z.GetAttrs()['INPS_ID']==key),None)
   assert entry,key
   if entry.GetAttrs().get('INPS_DataType')=='Point':
    assert isinstance(value,dict) and all(str(k).isdigit() for k in value), 'Point requires numeric component keys'
    value={int(k):v for k,v in value.items()}
   tools[name].SetInput(key,value)
 action='show'
if action in ('build','show'):
 select(target,tools.get('Text1') if case=='S03' else None)
 if detail_view:
  for preview_name in ['LeftView','RightView']:c.GetPreviewList()[preview_name].View.SetScale(1)
 folder=ROOT/'static/img/fusion/captures'/case;folder.mkdir(parents=True,exist_ok=True)
 if save_export:
  c.Save(str(folder/'fixture.comp'))
  fixture=folder/'fixture.comp'
  # Strip only export metadata; never modify saved preferences.
  fixture.write_text(re.sub(r'^.*(?:\["ResolveCaches:"\]|LastFile =).*$\n?', '', fixture.read_text(encoding='utf-8'), flags=re.M),encoding='utf-8')
  pm.SaveProject()
inputs={}
for n,a in tools.items():
 inputs[n]={'regid':a.GetAttrs()['TOOLS_RegID'],'inputs':{}}
 # The first Paint scaffold saved successfully, then broad scalar introspection coincided
 # with host exit. For S86 onward use native Inspector and exported text; do not retry that probe.
 if int(case[1:])>=86:
  inputs[n]['readback_scope']='NOT_RUN: broad input enumeration avoided after observed host exit;native GUI/export required'
  continue
 for z in a.GetInputList().values():
  attrs=z.GetAttrs()
  # Read parameter values, never request Image/Mask/3D payload evaluation.
  # Graph export and native GUI establish connections and output evidence.
  if attrs.get('INPS_DataType') not in ['Number','Text','Point','FuID','Clip']:continue
  k=attrs['INPS_ID'];v=a.GetInput(k,c.CurrentTime)
  if isinstance(v,(str,int,float,bool,dict)) and not k.endswith('Script'):
   inputs[n]['inputs'][k]=v
keep=['colorScienceMode','colorSpaceTimeline','colorSpaceTimelineGamma','colorSpaceOutput','colorSpaceOutputGamma','separateColorSpaceAndGamma','isAutoColorManage','timelineResolutionWidth','timelineResolutionHeight','timelineFrameRate','timelinePlaybackFrameRate']
settings=p.GetSetting()
report={'project':p.GetName(),'timeline':t.GetName(),'resolve':r.GetVersionString(),'edition':r.GetProductName(),'os':platform.platform(),'time':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frame':c.CurrentTime,'sampled_frame':c.CurrentTime,'project_settings':{k:settings[k] for k in keep if k in settings},'tools':inputs}
if case=='S79':
 report['input_ports']=[{k:z.GetAttrs().get(k) for k in ['INPS_ID','INPS_Name','INPS_DataType']} for z in tools['WandMask1'].GetInputList().values() if z.GetAttrs().get('INPS_DataType') in ['Image','Mask']]
if case=='S78':
 report['input_ports']=[{k:z.GetAttrs().get(k) for k in ['INPS_ID','INPS_Name','INPS_DataType']} for z in tools['RangesMask1'].GetInputList().values() if z.GetAttrs().get('INPS_DataType') in ['Image','Mask']]
if case=='S77':
 report['input_ports']=[{k:z.GetAttrs().get(k) for k in ['INPS_ID','INPS_Name','INPS_DataType']} for z in tools['BitmapMask1'].GetInputList().values() if z.GetAttrs().get('INPS_DataType') in ['Image','Mask']]
if case in ['S75','S76']:
 report['input_ports']=[{k:z.GetAttrs().get(k) for k in ['INPS_ID','INPS_Name','INPS_DataType']} for z in tools['MatteControl1' if case=='S75' else 'LumaKeyer1'].GetInputList().values() if z.GetAttrs().get('INPS_DataType') in ['Image','Mask']]
if case=='S39':
 report['time_samples']=[{'frame':f,'dynamic_source_time':tools['TimeDynamic'].GetInput('SourceTime',f),'held_source_time':tools['TimeHold'].GetInput('SourceTime',f),'transform_size':tools['TransformHold'].GetInput('Size',f)} for f in [0,12,24]]
if case=='S37':
 report['parameter_link']={'master':tools['MergeMaster'].GetInput('Blend',c.CurrentTime),'derived':tools['MergeDerived'].GetInput('Blend',c.CurrentTime),'expression':tools['MergeDerived'].Blend.GetExpression(),'expression_exported_in':'fixture.comp'}
if case=='S36':
 report['animation_samples']=[{'frame':f,**{n:tools[n].GetInput('Size',f) for n in ['TransformLinear','TransformSmooth','TransformStep']}} for f in [0,3,6,9,12,18,24]]
if case=='S35':
 report['animation_samples']=[{'frame':f,'Center':tools['TransformAnimated'].GetInput('Center',f)} for f in [0,24,48]]
folder=ROOT/'static/img/fusion/captures'/case;folder.mkdir(parents=True,exist_ok=True)
(folder/'readback.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'case':case,'project':p.GetName(),'timeline':t.GetName(),'target':target.GetAttrs()['TOOLS_Name'],'tools':{k:v['regid'] for k,v in inputs.items()}},ensure_ascii=False))
