"""Configure the owned S04-S14 probes; idempotent values, no rebuild or foreign edits."""
import sys,pathlib
sys.path.insert(0,r'C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Modules')
import DaVinciResolveScript as d
r=d.scriptapp('Resolve');p=r.GetProjectManager().GetCurrentProject()
assert p and p.GetName()=='Collectanea_Captures_20261023_Sol' and r.GetCurrentPage()
root=pathlib.Path(__file__).resolve().parents[1]
chart=str(root/'static/img/fusion/captures/_fixtures/chart.png')
def setv(a,**kv):
 for key,value in kv.items():
  assert any(z.GetAttrs()['INPS_ID']==key for z in a.GetInputList().values()),(a.GetAttrs()['TOOLS_Name'],key)
  a.SetInput(key,value)
  actual=a.GetInput(key,0)
  if isinstance(value,(str,int,float)):
   assert actual==value,(a.GetAttrs()['TOOLS_Name'],key,value,actual)
def con(a,key,b):assert a.ConnectInput(key,b),key
for case in sys.argv[1:]:
 assert not (root/'static/img/fusion/captures'/case/'capture.json').exists(), 'Reviewed case: use its saved composition; do not overwrite accepted settings'
 t=next(p.GetTimelineByIndex(i) for i in range(1,p.GetTimelineCount()+1) if p.GetTimelineByIndex(i).GetName().startswith(case+'_'))
 p.SetCurrentTimeline(t);assert p.GetCurrentTimeline().GetName()==t.GetName()
 t.SetCurrentTimecode('01:00:00:00');r.OpenPage('fusion')
 c=t.GetItemListInTrack('video',1)[0].GetFusionCompByIndex(1)
 tools={a.GetAttrs()['TOOLS_Name']:a for a in c.GetToolList().values()}
 def add(reg,name):
  if name in tools:return tools[name]
  c.Lock()
  try:
   a=c.AddTool(reg,-32768,-32768);assert a,reg;a.SetAttrs({'TOOLS_Name':name});tools[name]=a
   if reg=='Loader':setv(a,Clip=chart)
  finally:c.Unlock()
  return a
 mo=tools['MediaOut1']
 if 'Loader1' in tools:setv(tools['Loader1'],Clip=chart)
 if case=='S04':
  setv(tools['sEllipse1'],Width=.5,Height=.28)
  con(tools['sRender1'],'Input',tools['sEllipse1']);con(mo,'Input',tools['sRender1'])
 elif case=='S05':
  e=tools['sEllipse1'];s=tools['sStar1'];b=tools['sBoolean1'];sr=tools['sRender1']
  setv(e,Width=.5,Height=.5,**{'Translate.X':-.10});setv(s,Width=.40,Height=.40,Points=5,**{'Translate.X':.16})
  setv(b,Operation='Subtract');con(b,'Input1',e);con(b,'Input2',s);con(sr,'Input',b);con(mo,'Input',sr)
  u=add('sBoolean','Union1');ur=add('sRender','UnionRender1');setv(u,Operation='Union');con(u,'Input1',e);con(u,'Input2',s);con(ur,'Input',u)
 elif case=='S06':
  a=tools['Transform1'];setv(a,Center={1:.65,2:.55},Pivot={1:.5,2:.5},Size=1.25,Angle=12,Blend=1)
  con(a,'Input',tools['Loader1']);con(mo,'Input',a)
 elif case=='S07':
  a=tools['Blur1'];m=tools['Ellipse1'];setv(a,XBlurSize=20,Blend=1);setv(m,Width=.55,Height=.5,SoftEdge=.02)
  con(a,'Input',tools['Loader1']);con(a,'EffectMask',m);con(mo,'Input',a)
  full=add('Blur','BlurFull');setv(full,XBlurSize=20,Blend=1);con(full,'Input',tools['Loader1'])
 elif case=='S08':
  a=tools['Text1'];setv(a,StyledText='COLLECTANEA\nFUSION 21.1',Font='Arial',Style='Bold',Size=.10,Enabled2=1)
  con(mo,'Input',a)
 elif case=='S09':
  e=tools['pEmitter1'];pr=tools['pRender1'];setv(e,Style='ParticleStyleBlob',Number=3,Lifespan=80,Velocity=.002,RandomSeed=7,**{'SphereRgn.Size':.55,'ParticleStyle.Size':3})
  setv(pr,OutputMode='TwoD');con(pr,'Input',e);con(mo,'Input',pr);c.CurrentTime=48
 elif case=='S10':
  a=add('Dimension.PlanarTracker','PlanarTracker1');con(a,'Background',tools['Loader1']);con(mo,'Input',a)
 elif case=='S11':
  shape=tools['Shape3D1'];cam=tools['Camera3D1'];light=tools['PointLight1'];merge=tools['Merge3D1'];ren=tools['Renderer3D1']
  setv(shape,Shape='SurfaceSphereInputs');setv(cam,**{'Transform3DOp.Translate.Z':7})
  setv(light,**{'Transform3DOp.Translate.X':2,'Transform3DOp.Translate.Y':2,'Transform3DOp.Translate.Z':3})
  con(merge,'SceneInput1',shape);con(merge,'SceneInput2',cam);con(merge,'SceneInput3',light)
  con(ren,'SceneInput',merge);setv(ren,**{'RendererSoftware.LightingEnabled':1});con(mo,'Input',ren)
 elif case=='S12':
  con(tools['uMerge1'],'SceneInput1',tools['uShape1']);con(tools['uRenderer1'],'SceneInput',tools['uMerge1']);con(mo,'Input',tools['uRenderer1'])
 elif case=='S13':
  a=tools['Blur1'];setv(a,XBlurSize=10,Blend=1);con(a,'Input',tools['Loader1']);con(mo,'Input',a)
 elif case=='S14':
  a=tools['ColorCorrector1'];setv(a,Saturation1=.3,MasterRGBGain=1.15,Blend=1);con(a,'Input',tools['Loader1']);con(mo,'Input',a)
 assert r.GetProjectManager().SaveProject()
 print(case,'configured',flush=True)
