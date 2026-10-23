"""Crop reviewed native screenshots without resampling or painting UI.
Coordinates are native source pixels; manifests retain hashes and crop bounds.
"""
import pathlib, json, hashlib, datetime, argparse
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
CONFIG={
 'S01':{'graph':(590,1320,2250,1440),'node':(1100,1320,1410,1430),'inspector':(2840,90,3360,350),'result':(2054,194,2822,626)},
 'S02':{'graph':(590,1220,2250,1550),'node':(1100,1430,1410,1550),'inspector':(2840,90,3360,700),'result':(2054,194,2822,626)},
 'S03':{'graph':(590,1320,2250,1440),'inspector':(2840,90,3360,465),'compare':(1147,65,2840,650)},
 'S04':{'graph':(590,1320,2250,1440),'inspector':(2840,90,3360,545),'result':(2054,194,2822,626)},
 'S05':{'graph':(500,1200,2350,1550),'inspector':(2840,90,3360,295),'compare':(1147,65,2840,650)},
 'S06':{'graph':(590,1320,2250,1440),'inspector':(2840,90,3360,565),'compare':(1147,65,2840,650)},
 'S07':{'graph':(740,1150,2110,1600),'inspector':(2840,90,3360,510),'compare':(1147,65,2840,650)},
 'S08':{'graph':(590,1320,2250,1440),'node':(600,1320,920,1430),'inspector':(2840,90,3360,940),'result':(2054,194,2822,626),'shading':(2840,240,3360,860)},
 'S09':{'graph':(420,1320,2420,1440),'inspector':(2840,90,3360,780),'result':(2054,194,2822,626),'region':(2840,90,3360,650),'frame0':(2054,194,2822,626)},
 'S10':{'graph':(500,1140,2340,1580),'region':(2038,65,2840,800),'inspector':(2840,90,3360,590),'reference':(2038,65,2840,800),'result':(2038,65,2840,800)},
 'S11':{'graph':(500,1080,2350,1660),'inspector':(2840,90,3360,590),'compare':(1147,65,2840,730)},
 'S12':{'graph':(590,1320,2250,1440),'inspector':(2840,90,3360,610),'result':(2054,194,2822,626)},
 'S13':{'graph':(590,1320,2250,1440),'inspector':(2840,90,3360,390),'compare':(1147,65,2840,650)},
 'S14':{'graph':(590,1320,2250,1440),'inspector':(2840,90,3360,800),'compare':(1147,65,2840,650)},
 'S15':{'graph':(900,1190,1940,1555),'inspector':(2830,120,3352,650),'compare':(1146,65,2830,705)},
 'S16':{'graph':(900,1190,1940,1555),'inspector':(2830,120,3352,600),'compare':(1146,65,2830,705)},
 'S17':{'graph':(900,1190,1940,1555),'inspector':(2830,120,3352,560),'result':(2048,193,2816,625)},
 'S18':{'graph':(580,1190,2280,1555),'inspector':(2830,120,3352,540),'compare':(1146,65,2830,705)},
 'S19':{'graph':(580,1190,2280,1555),'inspector':(2830,120,3352,520),'compare':(1146,65,2830,705)},
 'S20':{'graph':(580,1190,2280,1555),'inspector':(2830,120,3352,520),'compare':(1146,65,2830,705)},
 'S21':{'graph':(580,1190,2280,1555),'inspector':(2830,120,3352,540),'compare':(1146,65,2830,705)},
 'S22':{'graph':(240,1190,2600,1555),'inspector':(2830,120,3352,450),'compare':(1146,65,2830,705)},
 'S23':{'graph':(240,1060,2600,1660),'inspector':(2830,120,3352,570),'compare':(1146,65,2830,705),'final':(1146,65,2830,705)},
 'S24':{'graph':(580,1060,2280,1660),'inspector':(2830,120,3352,460),'compare':(1146,65,2830,705),'scale-inspector':(2830,120,3352,500),'scale-compare':(1146,65,2830,705)},
 'S25':{'graph':(240,1190,2600,1555),'inspector':(2830,120,3352,510),'compare':(1146,65,2830,705),'alpha':(1146,65,2830,705)},
 'S26':{'graph':(900,1300,1940,1440),'inspector':(2830,120,3352,940),'dod':(1146,65,2830,705),'roi':(1146,65,2830,705)},
 'S27':{'graph':(240,1060,2600,1660),'inspector':(2830,120,3352,890),'compare':(1146,65,2830,705),'disabled-inspector':(2830,120,3352,460),'disabled':(1146,65,2830,705),'order-inspector':(2830,120,3352,460),'order':(1146,65,2830,705)},
 'S28':{'graph':(240,1030,2600,1710),'inspector':(2830,120,3352,510),'compare':(1146,65,2830,705),'alpha':(1146,65,2830,705)},
 'S29':{'graph':(580,1190,2280,1555),'inspector':(2830,120,3352,300),'compare':(1146,65,2830,705),'background':(1146,65,2830,705),'foreground':(1146,65,2830,705)},
 'S30':{'graph':(580,1190,2280,1555),'inspector':(2830,120,3352,470),'compare':(1146,65,2830,705),'map-inspector':(2830,120,3352,590),'map':(1146,65,2830,705)},
 'S31':{'graph':(240,1060,2600,1660),'inspector':(2830,120,3352,710),'compare':(1146,65,2830,705),'alpha':(1146,65,2830,705)},
 'S32':{'graph':(240,980,2600,1730),'inspector':(2830,120,3352,710),'compare':(1146,65,2830,705),'blend-inspector':(2830,120,3352,710),'blend':(1146,65,2830,705),'multiply-inspector':(2830,120,3352,600),'multiply':(1146,65,2830,705),'in-inspector':(2830,120,3352,710),'in':(1146,65,2830,705)},
 'S33':{'graph':(240,1060,2600,1660),'inspector':(2830,120,3352,540),'compare':(1146,65,2830,705)},
 'S34':{'graph':(580,1190,2280,1555),'inspector':(2830,120,3352,570),'compare':(1146,65,2830,705)},
 'S35':{'graph':(580,1300,2280,1450),'inspector':(2830,120,3352,570),'compare':(1146,65,2830,705),'frame0-inspector':(2830,120,3352,570),'frame0':(1146,65,2830,705),'spline':(1410,850,2830,1840),'modifiers':(2830,90,3352,470)},
 'S36':{'graph':(580,1060,2280,1660),'inspector':(2830,120,3352,570),'compare':(1146,65,2830,705),'step-inspector':(2830,120,3352,570),'step':(1146,65,2830,705),'linear-spline':(1410,850,2830,1840),'smooth-spline':(1410,850,2830,1840),'step-spline':(1410,850,2830,1840),'keyframes':(1410,850,2250,1090),'peak-inspector':(2830,120,3352,570)},
 'S37':{'graph':(240,1060,2600,1660),'master-inspector':(2830,120,3352,710),'inspector':(2830,120,3352,740),'compare':(1146,65,2830,705),'master-low-inspector':(2830,120,3352,710),'low-inspector':(2830,120,3352,740),'low':(1146,65,2830,705)},
 'S38':{'graph':(580,1300,2280,1450),'normalized-inspector':(2830,120,3352,660),'inspector':(2830,120,3352,660),'large-inspector':(2830,120,3352,660),'auto-inspector':(2830,120,3352,660),'compare':(1146,65,2830,705)},
 'S39':{'graph':(580,1060,2280,1660),'inspector':(2830,120,3352,340),'compare':(1146,65,2830,815),'frame0':(1146,65,2830,815),'frame24':(1146,65,2830,815),'spline':(1410,850,2830,1840),'hold-inspector':(2830,120,3352,340),'hold0-inspector':(2830,120,3352,570),'hold0':(1146,65,2830,815),'hold24-inspector':(2830,120,3352,570),'hold24':(1146,65,2830,815)},
 'S40':{'graph': (580, 1300, 2280, 1450), 'inspector': (2830, 120, 3352, 365), 'compare': (1146, 65, 2830, 815), 'fast-inspector': (2830, 120, 3352, 365), 'fast': (1146, 65, 2830, 815), 'delay-inspector': (2830, 120, 3352, 365), 'delay': (1146, 65, 2830, 815), 'advance-inspector': (2830, 120, 3352, 365), 'advance': (1146, 65, 2830, 815), 'freeze-inspector': (2830, 120, 3352, 365), 'freeze': (1146, 65, 2830, 815), 'freeze0': (1146, 65, 2830, 815), 'reverse-inspector': (2830, 120, 3352, 365), 'reverse0': (1146, 65, 2830, 815), 'reverse24': (1146, 65, 2830, 815)},
 'S41':{'graph': (580, 1060, 2280, 1660), 'inspector': (2830, 120, 3352, 570), 'published-inspector': (2830, 96, 3352, 310), 'before': (1146, 65, 2830, 705), 'compare': (1146, 65, 2830, 705), 'b-high-inspector': (2830, 120, 3352, 570), 'a-high-inspector': (2830, 120, 3352, 570), 'high': (1146, 65, 2830, 705), 'a-low-inspector': (2830, 120, 3352, 570), 'b-low-inspector': (2830, 120, 3352, 570), 'low': (1146, 65, 2830, 705), 'publish-menu': (0, 0, 141, 272)},
 'S42':{'graph': (580, 1300, 2280, 1450), 'inspector': (2830, 120, 3352, 350), 'compare': (1146, 65, 2830, 815), 'frame12': (1146, 65, 2830, 815), 'backward-inspector': (2830, 120, 3352, 350), 'backward': (1146, 65, 2830, 815), 'forward-inspector': (2830, 120, 3352, 350), 'forward': (1146, 65, 2830, 815), 'zero-inspector': (2830, 120, 3352, 350), 'zero': (1146, 65, 2830, 815), 'edge-duplicate-inspector': (2830, 120, 3352, 350), 'edge-duplicate': (1146, 65, 2830, 815), 'edge-blank-inspector': (2830, 120, 3352, 350), 'edge-blank': (1146, 65, 2830, 815)},
 'S43':{'graph': (580, 1300, 2280, 1450), 'inspector': (2830, 120, 3352, 300), 'compare': (1146, 65, 2830, 705), 'metadata': (2034, 96, 2830, 190), 'changed-inspector': (2830, 120, 3352, 300), 'changed-metadata': (2034, 96, 2830, 190)},
 'S44':{'graph': (240, 1060, 2600, 1660), 'inspector': (2830, 120, 3352, 300), 'compare': (1146, 65, 2830, 705), 'metadata': (2034, 96, 2830, 190), 'bg-inspector': (2830, 120, 3352, 300), 'fg-inspector': (2830, 120, 3352, 300), 'preserve-inspector': (2830, 120, 3352, 300), 'preserve-metadata': (2034, 96, 2830, 190), 'replace-inspector': (2830, 120, 3352, 300), 'replace-metadata': (2034, 96, 2830, 190), 'clear-inspector': (2830, 120, 3352, 300), 'clear-metadata': (2034, 96, 2830, 190)},
}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
candidates=json.loads((ROOT/'docs/fusion-screenshot-candidates.json').read_text(encoding='utf-8'))
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('cases',nargs='+',choices=sorted(CONFIG))
parser.add_argument('--replace',action='store_true',help='Explicitly replace a reviewed crop/manifest')
args=parser.parse_args()
for case in args.cases:
 regions=CONFIG[case]
 folder=ROOT/'static/img/fusion/captures'/case
 assert args.replace or not (folder/'capture.json').exists(), 'Accepted manifest exists; choose a new case or explicitly --replace'
 source=folder/'screen.png';im=Image.open(source)
 expected=(3352,1910) if int(case[1:])>=15 else (3360,1914)
 assert im.size==expected, 'Reobserve layout before using these crop coordinates'
 readback=json.loads((folder/'readback.json').read_text(encoding='utf-8'))
 keep=['colorScienceMode','colorSpaceTimeline','colorSpaceTimelineGamma','colorSpaceOutput','colorSpaceOutputGamma','separateColorSpaceAndGamma','isAutoColorManage','timelineResolutionWidth','timelineResolutionHeight','timelineFrameRate','timelinePlaybackFrameRate']
 readback['project_settings']={k:readback['project_settings'][k] for k in keep if k in readback['project_settings']}
 (folder/'readback.json').write_text(json.dumps(readback,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 shots=[]
 for slug,box in regions.items():
  variants={('S08','shading'):'screen-shading.png',('S09','region'):'screen-region.png',('S09','frame0'):'screen-frame0.png',('S10','region'):'screen-region.png',('S10','result'):'screen-result60.png'}
  variants.update({('S23','final'):'screen-final.png',('S24','scale-inspector'):'screen-scale.png',('S24','scale-compare'):'screen-scale.png',('S25','alpha'):'screen-alpha.png',('S26','inspector'):'screen-inspector.png',('S26','roi'):'screen-roi.png'})
  variants.update({('S27','disabled-inspector'):'screen-disabled.png',('S27','disabled'):'screen-disabled.png',('S27','order-inspector'):'screen-order.png',('S27','order'):'screen-order.png',('S28','alpha'):'screen-alpha.png',('S29','background'):'screen-background.png',('S29','foreground'):'screen-foreground.png',('S30','map-inspector'):'screen-map.png',('S30','map'):'screen-map.png'})
  extra={('S31','alpha'):'screen-alpha.png',('S35','frame0'):'screen-frame0.png',('S35','frame0-inspector'):'screen-frame0.png',('S35','spline'):'screen-spline.png',('S35','modifiers'):'screen-modifiers.png'}
  if case=='S32':
   for variant in ['blend','multiply','in']:
    for suffix in ['', '-inspector']:extra[(case,variant+suffix)]='screen-'+variant+'.png'
  if case=='S36':extra.update({(case,'step'):'screen-step.png',(case,'step-inspector'):'screen-step.png',(case,'linear-spline'):'screen-linear-spline.png',(case,'smooth-spline'):'screen-smooth-spline.png',(case,'step-spline'):'screen-step-spline.png',(case,'keyframes'):'screen-keyframes.png',(case,'peak-inspector'):'screen-peak.png'})
  if case=='S37':extra.update({(case,'master-inspector'):'screen-master.png',(case,'master-low-inspector'):'screen-master-low.png',(case,'low-inspector'):'screen-low.png',(case,'low'):'screen-low.png'})
  if case=='S38':extra.update({(case,'normalized-inspector'):'screen-normalized.png',(case,'large-inspector'):'screen-3840.png',(case,'auto-inspector'):'screen-auto.png'})
  if case=='S39':extra.update({(case,'frame0'):'screen-frame0.png',(case,'frame24'):'screen-frame24.png',(case,'spline'):'screen-spline.png',(case,'hold-inspector'):'screen-held-source.png',(case,'hold0-inspector'):'screen-hold0.png',(case,'hold0'):'screen-hold0.png',(case,'hold24-inspector'):'screen-hold24.png',(case,'hold24'):'screen-hold24.png'})
  if case=='S40':
   for variant in ['fast','delay','advance','freeze']:
    for suffix in ['', '-inspector']:extra[(case,variant+suffix)]='screen-'+variant+'.png'
   extra.update({(case,'freeze0'):'screen-freeze0.png',(case,'reverse-inspector'):'screen-reverse24.png',(case,'reverse0'):'screen-reverse0.png',(case,'reverse24'):'screen-reverse24.png'})
  if case=='S41':extra.update({(case,'published-inspector'):'screen-published.png',(case,'before'):'screen-before.png',(case,'b-high-inspector'):'screen-b-high.png',(case,'a-high-inspector'):'screen-a-high.png',(case,'high'):'screen-b-high.png',(case,'a-low-inspector'):'screen-a-low.png',(case,'b-low-inspector'):'screen-b-low.png',(case,'low'):'screen-a-low.png',(case,'publish-menu'):'screen-menu.png'})
  if case=='S42':
   for variant in ['backward','forward','zero','edge-duplicate','edge-blank']:
    for suffix in ['', '-inspector']:extra[(case,variant+suffix)]='screen-'+variant+'.png'
   extra[(case,'frame12')]='screen-frame12.png'
  if case=='S43':extra.update({(case,'changed-inspector'):'screen-value020.png',(case,'changed-metadata'):'screen-value020.png'})
  if case=='S44':
   for variant in ['preserve','replace','clear']:
    for suffix in ['-inspector','-metadata']:extra[(case,variant+suffix)]='screen-'+variant+'.png'
   extra.update({(case,'bg-inspector'):'screen-bg-source.png',(case,'fg-inspector'):'screen-fg-source.png'})
  src=folder/extra.get((case,slug),variants.get((case,slug),'screen.png'))
  assert 0<=box[0]<box[2]<=im.width and 0<=box[1]<box[3]<=im.height, (case,slug,box)
  path=folder/(slug+'.png');Image.open(src).crop(box).save(path)
  frame=60 if (case,slug)==('S10','result') else 0 if (case,slug)==('S09','frame0') else readback['frame']
  if case=='S35' and slug.startswith('frame0'):frame=0
  if case=='S36':frame=12 if slug=='peak-inspector' else 3
  if case=='S39':frame=0 if slug in ['frame0','hold-inspector','hold0-inspector','hold0'] else 24 if slug in ['frame24','hold24-inspector','hold24'] else 12
  if case=='S40':frame=0 if slug in ['freeze0','reverse0'] else 24
  if case=='S42':frame=0 if slug.startswith('edge-') else 12 if slug=='frame12' else 24
  shots.append({'file':path.name,'source':src.name,'source_sha256':sha(src),'frame':frame,'crop_xyxy':box,'resampled':False,'sha256':sha(path)})
  if case in ['S25','S28','S31']:shots[-1]['viewer_channels']='Alpha' if slug=='alpha' else 'Color'
 candidate=next(x for x in candidates['candidates'] if x['id']==case)
 manifest={'schema_version':1,'case':case,'article':candidate['article'],'manual':candidate['manual'],'runtime':{'version':readback['resolve'],'edition':'Studio','os':readback['os'],'ui_language':'ja-JP (some Shape controls remain English)'},'captured_at':datetime.datetime.fromtimestamp(source.stat().st_mtime,datetime.timezone.utc).isoformat(),'project':readback['project'],'timeline':readback['timeline'],'frame':readback['frame'],'resolution':[1920,1080],'color_management':readback['project_settings'],'viewer':{'zoom_percent':40,'channel':'Color','background':'checkerboard for transparent pixels','note':'Viewer screenshots are display evidence, not colorimetric exports.'},'graph':'fixture.comp','settings':'readback.json','source':{'file':'screen.png','size':im.size,'sha256':sha(source)},'shots':shots,'acceptance':{'gui':'PASS: owner visually inspected node connections, selected Inspector, and output','article_display':'NOT_RUN'},'unverified':['Free edition and other platforms','All parameter ranges and performance','S03 optional Glow Mask / Effect Mask comparison is deferred'] if case=='S03' else ['Free edition and other platforms','All parameter ranges and performance']}
 (folder/'capture.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print('Prepared',', '.join(args.cases))
