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
  src=folder/variants.get((case,slug),'screen.png')
  assert 0<=box[0]<box[2]<=im.width and 0<=box[1]<box[3]<=im.height, (case,slug,box)
  path=folder/(slug+'.png');Image.open(src).crop(box).save(path)
  frame=60 if (case,slug)==('S10','result') else 0 if (case,slug)==('S09','frame0') else readback['frame']
  shots.append({'file':path.name,'source':src.name,'source_sha256':sha(src),'frame':frame,'crop_xyxy':box,'resampled':False,'sha256':sha(path)})
 candidate=next(x for x in candidates['candidates'] if x['id']==case)
 manifest={'schema_version':1,'case':case,'article':candidate['article'],'manual':candidate['manual'],'runtime':{'version':readback['resolve'],'edition':'Studio','os':readback['os'],'ui_language':'ja-JP (some Shape controls remain English)'},'captured_at':datetime.datetime.fromtimestamp(source.stat().st_mtime,datetime.timezone.utc).isoformat(),'project':readback['project'],'timeline':readback['timeline'],'frame':readback['frame'],'resolution':[1920,1080],'color_management':readback['project_settings'],'viewer':{'zoom_percent':40,'channel':'Color','background':'checkerboard for transparent pixels','note':'Viewer screenshots are display evidence, not colorimetric exports.'},'graph':'fixture.comp','settings':'readback.json','source':{'file':'screen.png','size':im.size,'sha256':sha(source)},'shots':shots,'acceptance':{'gui':'PASS: owner visually inspected node connections, selected Inspector, and output','article_display':'NOT_RUN'},'unverified':['Free edition and other platforms','All parameter ranges and performance','S03 optional Glow Mask / Effect Mask comparison is deferred'] if case=='S03' else ['Free edition and other platforms','All parameter ranges and performance']}
 (folder/'capture.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print('Prepared',', '.join(args.cases))
