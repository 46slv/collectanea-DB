"""Owned Resolve capture fixtures. Requires local Resolve scripting; never changes preferences.

Usage: python scripts/fusion-capture.py S01 [build|show|readback]
Only modifies the exact named scratch project. Existing cases are never rebuilt.
Actual GUI capture and visual acceptance are separate from this helper.
"""
import sys, json, pathlib, platform, datetime, re, time
sys.path.insert(0, r'C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Modules')
import DaVinciResolveScript as d
ROOT=pathlib.Path(__file__).resolve().parents[1]
PROJECT='Collectanea_Captures_20261023_Sol'
TARGETS={'S01':'sGrid1','S02':'Merge1','S03':'Glow1','S04':'sRender1','S05':'sBoolean1','S06':'Transform1','S07':'Ellipse1','S08':'Text1','S09':'pEmitter1','S10':'PlanarTracker1','S11':'Renderer3D1','S12':'uRenderer1','S13':'Blur1','S14':'ColorCorrector1','S15':'Gradient1','S16':'NoiseDetail1','S17':'Rectangle1','S18':'EllipseArc1'}
RIGHT={'S01':'sRender1','S05':'sRender1','S07':'Blur1','S09':'pRender1','S10':'Composite1','S15':'Gradient1','S16':'NoiseDetail1','S17':'Background1','S18':'RenderArc1'}
LEFT={'S03':'Text1','S05':'UnionRender1','S06':'Loader1','S07':'BlurFull','S11':'Merge3D1','S13':'Loader1','S14':'Loader1','S15':'Solid1','S16':'NoiseDefault1','S18':'RenderSolid1'}
r=d.scriptapp('Resolve')
assert r, 'Resolve scripting unavailable; do not change preferences automatically'
pm=r.GetProjectManager(); p=pm.GetCurrentProject()
assert p and p.GetName()==PROJECT, 'Refusing to mutate a foreign project'
assert r.GetCurrentPage(), 'Resolve has a modal dialog; reconcile the GUI first'
case=sys.argv[1]; action=sys.argv[2] if len(sys.argv)>2 else 'readback'
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
c.CurrentTime=48 if case=='S09' else 0
time.sleep(.3)
tools={x.GetAttrs()['TOOLS_Name']:x for x in c.GetToolList().values()}
mo=next(x for x in tools.values() if x.GetAttrs()['TOOLS_RegID']=='MediaOut')
def add(reg,name,x,y,**values):
 a=c.AddTool(reg,x,y); assert a,reg
 a.SetAttrs({'TOOLS_Name':name})
 for k,v in values.items():
  assert any(z.GetAttrs()['INPS_ID']==k for z in a.GetInputList().values()),(reg,k)
  a.SetInput(k,v)
 tools[name]=a
 return a
def connect(dst,key,src):
 assert dst.ConnectInput(key,src), (dst.GetAttrs()['TOOLS_Name'],key)
def text(name,x,y,value='FUSION',size=.13):
 return add('TextPlus',name,x,y,StyledText=value,Font='Arial',Style='Bold',Size=size)
def select(target,left=None):
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
 for n,pos in layouts.get(case,{}).items():
  if n in tools:flow.SetPos(tools[n],*pos)
 flow.FrameAll()
 c.SetActiveTool(target)
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
elif action in ('show','readback','set'):
 target=tools.get(TARGETS.get(case,''))
assert target
if action=='set':
 for name,values in json.loads(sys.argv[3]).items():
  assert name in tools
  for key,value in values.items():
   assert any(z.GetAttrs()['INPS_ID']==key for z in tools[name].GetInputList().values()),key
   tools[name].SetInput(key,value)
 action='show'
if action in ('build','show'):
 select(target,tools.get('Text1') if case=='S03' else None)
 folder=ROOT/'static/img/fusion/captures'/case;folder.mkdir(parents=True,exist_ok=True)
 c.Save(str(folder/'fixture.comp'))
 fixture=folder/'fixture.comp'
 # Exported compositions can inherit unrelated last-file/cache paths. Strip only
 # these export metadata lines; never modify Resolve's saved preferences.
 fixture.write_text(re.sub(r'^.*(?:\["ResolveCaches:"\]|LastFile =).*$\n?', '', fixture.read_text(encoding='utf-8'), flags=re.M),encoding='utf-8')
 pm.SaveProject()
inputs={}
for n,a in tools.items():
 inputs[n]={'regid':a.GetAttrs()['TOOLS_RegID'],'inputs':{}}
 for z in a.GetInputList().values():
  k=z.GetAttrs()['INPS_ID'];v=a.GetInput(k,0)
  if isinstance(v,(str,int,float,bool,dict)) and not k.endswith('Script'):
   inputs[n]['inputs'][k]=v
keep=['colorScienceMode','colorSpaceTimeline','colorSpaceTimelineGamma','colorSpaceOutput','colorSpaceOutputGamma','separateColorSpaceAndGamma','isAutoColorManage','timelineResolutionWidth','timelineResolutionHeight','timelineFrameRate','timelinePlaybackFrameRate']
settings=p.GetSetting()
report={'project':p.GetName(),'timeline':t.GetName(),'resolve':r.GetVersionString(),'edition':r.GetProductName(),'os':platform.platform(),'time':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frame':c.CurrentTime,'project_settings':{k:settings[k] for k in keep if k in settings},'tools':inputs}
folder=ROOT/'static/img/fusion/captures'/case;folder.mkdir(parents=True,exist_ok=True)
(folder/'readback.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'case':case,'project':p.GetName(),'timeline':t.GetName(),'target':target.GetAttrs()['TOOLS_Name'],'tools':{k:v['regid'] for k,v in inputs.items()}},ensure_ascii=False))
