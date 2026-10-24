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
 'S45':{'graph': (580, 1300, 2280, 1450), 'inspector': (2830, 120, 3352, 390), 'compare': (1146, 65, 2830, 815), 'metadata': (2034, 96, 2830, 190), 'frame24': (1146, 65, 2830, 815), 'fps25-inspector': (2830, 120, 3352, 390), 'fps25': (1146, 65, 2830, 815), 'zero-metadata': (2034, 96, 2830, 190)},
 'S46':{'graph': (240, 1060, 2600, 1660), 'inspector': (2830, 120, 3352, 300), 'compare': (1146, 65, 2830, 705), 'gold-inspector': (2830, 120, 3352, 300), 'gold': (1146, 65, 2830, 705), 'config-inspector': (2830, 120, 3352, 330)},
 'S47':{'graph': (240, 1300, 2600, 1450), 'inspector': (2830, 120, 3352, 300), 'compare': (1146, 65, 2830, 705), 'updated': (1146, 65, 2830, 705)},
 'S48':{'graph': (580, 1300, 2280, 1450), 'inspector': (2830, 120, 3352, 310), 'compare': (1146, 65, 2830, 705), 'depth-menu': (0, 0, 271, 120), 'int8-inspector': (2830, 120, 3352, 310), 'int8': (1146, 65, 2830, 705), 'keep-inspector': (2830, 120, 3352, 310), 'keep': (1146, 65, 2830, 705), 'error-inspector': (2830, 120, 3352, 310), 'noise-inspector': (2830, 120, 3352, 310)},
 'S49':{'graph': (240, 1060, 2600, 1660), 'inspector': (2830, 120, 3352, 515), 'compare': (1146, 65, 2830, 815), 'unmasked0': (1146, 65, 2830, 815), 'unmasked24': (1146, 65, 2830, 815), 'masked24': (1146, 65, 2830, 815), 'map-inspector': (2830, 120, 3352, 600), 'map': (1146, 65, 2830, 705), 'mask-inspector': (2830, 120, 3352, 515)},
 'S50':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 330), 'compare': (1146, 65, 2830, 705), 'right-plus-inspector': (2830, 120, 3352, 330), 'right-plus': (1146, 65, 2830, 705), 'right-minus-inspector': (2830, 120, 3352, 330), 'right-minus': (1146, 65, 2830, 705), 'top-plus-inspector': (2830, 120, 3352, 330), 'top-plus': (1146, 65, 2830, 705), 'top-minus-inspector': (2830, 120, 3352, 330), 'top-minus': (1146, 65, 2830, 705)},
 'S51':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 390), 'compare': (1146, 65, 2830, 705), 'adjust-plus-inspector': (2830, 120, 3352, 390), 'adjust-plus': (1146, 65, 2830, 705), 'adjust-minus-inspector': (2830, 120, 3352, 390), 'adjust-minus': (1146, 65, 2830, 705), 'left-bottom-plus-inspector': (2830, 120, 3352, 390), 'left-bottom-plus': (1146, 65, 2830, 705), 'left-bottom-minus-inspector': (2830, 120, 3352, 390), 'left-bottom-minus': (1146, 65, 2830, 705), 'set-full-inspector': (2830, 120, 3352, 390), 'set-full': (1146, 65, 2830, 705), 'set-half-inspector': (2830, 120, 3352, 390), 'set-half': (1146, 65, 2830, 705)},
 'S52':{'graph': (480, 1130, 2380, 1555), 'inspector': (2830, 120, 3352, 390), 'compare': (1146, 65, 2830, 705), 'default-inspector': (2830, 120, 3352, 390), 'default': (1146, 65, 2830, 705), 'alpha0-inspector': (2830, 120, 3352, 390), 'alpha0': (1146, 65, 2830, 705), 'dod': (1146, 65, 2830, 705), 'reference-graph': (480, 1130, 2380, 1555), 'reference-inspector': (2830, 120, 3352, 390), 'reference': (1146, 65, 2830, 705), 'source-inspector': (2830, 120, 3352, 390)},
 'S53':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 465), 'compare': (1146, 65, 2830, 705), 'before-inspector': (2830, 120, 3352, 465), 'before': (1146, 65, 2830, 705), 'left-inspector': (2830, 120, 3352, 465), 'left': (1146, 65, 2830, 705), 'reset-inspector': (2830, 120, 3352, 465), 'reset': (1146, 65, 2830, 705)},
 'S54':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 465), 'compare': (1146, 65, 2830, 705), 'pan-inspector': (2830, 120, 3352, 465), 'pan': (1146, 65, 2830, 705), 'pan-offset-inspector': (2830, 120, 3352, 465), 'pan-offset': (1146, 65, 2830, 705), 'envelope-offset-inspector': (2830, 120, 3352, 465), 'envelope-offset': (1146, 65, 2830, 705), 'alpha': (1146, 65, 2830, 705)},
 'S55':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 610), 'compare': (1146, 65, 2830, 705), 'perspective-inspector': (2830, 120, 3352, 610), 'perspective': (1146, 65, 2830, 705), 'zmove2-inspector': (2830, 120, 3352, 610), 'zmove2': (1146, 65, 2830, 705)},
 'S56':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 550), 'compare': (1146, 65, 2830, 805), 'frame24': (1146, 65, 2830, 805), 'square24-inspector': (2830, 120, 3352, 550), 'square24': (1146, 65, 2830, 805), 'strength0-inspector': (2830, 120, 3352, 550), 'strength0': (1146, 65, 2830, 805)},
 'S57':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 550), 'compare': (1146, 65, 2830, 805), 'setup': (2830, 120, 3352, 760), 'intermediate': (2830, 120, 3352, 760), 'channels': (2830, 120, 3352, 530), 'config': (2830, 120, 3352, 780), 'gain1-inspector': (2830, 120, 3352, 550), 'gain1': (1146, 65, 2830, 805)},
 'S58':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 410), 'compare': (1146, 65, 2830, 705), 'negative-inspector': (2830, 120, 3352, 410), 'negative': (1146, 65, 2830, 705), 'zoom-inspector': (2830, 120, 3352, 410), 'zoom': (1146, 65, 2830, 705)},
 'S59':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 510), 'compare': (1146, 65, 2830, 705), 'gaussian-inspector': (2830, 120, 3352, 510), 'gaussian': (1146, 65, 2830, 705), 'bloom-inspector': (2830, 120, 3352, 510), 'bloom': (1146, 65, 2830, 705)},
 'S60':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 570), 'compare': (1146, 65, 2830, 705), 'gain05-inspector': (2830, 120, 3352, 570), 'gain05': (1146, 65, 2830, 705), 'saturation0-inspector': (2830, 120, 3352, 570), 'saturation0': (1146, 65, 2830, 705)},
 'S61':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 720), 'compare': (1146, 65, 2830, 705), 'gainred05-inspector': (2830, 120, 3352, 720), 'gainred05': (1146, 65, 2830, 705), 'liftred02-inspector': (2830, 120, 3352, 720), 'liftred02': (1146, 65, 2830, 705)},
 'S62':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 385), 'compare': (1146, 65, 2830, 725), 'detail1': (1146, 65, 2830, 725), 'strong-inspector': (2830, 120, 3352, 385), 'detail3': (1146, 65, 2830, 725), 'blend0-inspector': (2830, 120, 3352, 385), 'blend0': (1146, 65, 2830, 725)},
 'S63':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 390), 'compare': (1146, 65, 2830, 725), 'detail0': (1146, 65, 2830, 725), 'threshold02-inspector': (2830, 120, 3352, 390), 'threshold02': (1146, 65, 2830, 725), 'detail02': (1146, 65, 2830, 725)},
 'S64':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 385), 'compare': (1146, 65, 2830, 725), 'negative-inspector': (2830, 120, 3352, 385), 'negative': (1146, 65, 2830, 725), 'zero-inspector': (2830, 120, 3352, 385), 'zero': (1146, 65, 2830, 725)},
 'S65':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 310), 'compare': (1146, 65, 2830, 725), 'rank0-inspector': (2830, 120, 3352, 310), 'rank0': (1146, 65, 2830, 725), 'rank1-inspector': (2830, 120, 3352, 310), 'rank1': (1146, 65, 2830, 725)},
 'S66':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 330), 'compare': (1146, 65, 2830, 725), 'alpha1-inspector': (2830, 120, 3352, 330), 'alpha1': (1146, 65, 2830, 725), 'laplacian-inspector': (2830, 120, 3352, 330), 'laplacian': (1146, 65, 2830, 725), 'filter-menu': (0, 0, 271, 164)},
 'S67':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 465), 'compare': (1146, 65, 2830, 725), 'threshold09-inspector': (2830, 120, 3352, 465), 'threshold09': (1146, 65, 2830, 725), 'blend0-inspector': (2830, 120, 3352, 465), 'blend0': (1146, 65, 2830, 725), 'default-inspector': (2830, 120, 3352, 465)},
 'S68':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 390), 'compare': (1146, 65, 2830, 725), 'height5-inspector': (2830, 120, 3352, 390), 'height5': (1146, 65, 2830, 725), 'height-low-inspector': (2830, 120, 3352, 390), 'height-low': (1146, 65, 2830, 725)},
 'S69':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 535), 'compare': (1146, 65, 2830, 725), 'floor025-inspector': (2830, 120, 3352, 535), 'floor025': (1146, 65, 2830, 725), 'normalize05-inspector': (2830, 120, 3352, 535), 'normalize05': (1146, 65, 2830, 725), 'detail': (1146, 65, 2830, 725)},
 'S70':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 325), 'compare': (1146, 65, 2830, 725), 'base-inspector': (2830, 120, 3352, 325), 'base': (1146, 65, 2830, 725), 'low02-inspector': (2830, 120, 3352, 325), 'low02': (1146, 65, 2830, 725)},
 'S71':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 405), 'compare': (1146, 65, 2830, 725), 'identity-inspector': (2830, 120, 3352, 405), 'identity': (1146, 65, 2830, 725), 'add02-inspector': (2830, 120, 3352, 405), 'add02': (1146, 65, 2830, 725)},
 'S72':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 300), 'compare': (1146, 65, 2830, 725), 'converted-inspector': (2830, 120, 3352, 300), 'converted': (1146, 65, 2830, 725)},
 'S73':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 395), 'compare': (1146, 65, 2830, 725), 'inverse-inspector': (2830, 120, 3352, 395), 'inverse': (1146, 65, 2830, 725), 'neutral-inspector': (2830, 120, 3352, 395), 'neutral': (1146, 65, 2830, 725)},
 'S74':{'graph': (20, 1045, 2830, 1680), 'inspector': (2830, 120, 3352, 520), 'compare': (1146, 65, 2830, 725), 'correct-inspector': (2830, 120, 3352, 625), 'direct-inspector': (2830, 120, 3352, 625), 'multiply-inspector': (2830, 120, 3352, 520), 'source-inspector': (2830, 120, 3352, 485), 'source': (1146, 65, 2830, 725), 'baseline': (1146, 65, 2830, 725), 'builtin-options': (2830, 120, 3352, 350), 'builtin': (1146, 65, 2830, 725), 'direct-options': (2830, 120, 3352, 350)},
 'S75':{'graph': (500, 1155, 2330, 1590), 'inspector': (2830, 120, 3352, 675), 'compare': (1146, 65, 2830, 725), 'default-inspector': (2830, 120, 3352, 675), 'copy-inspector': (2830, 120, 3352, 675), 'copy': (1146, 65, 2830, 725), 'source': (1146, 65, 2830, 725), 'inverse-inspector': (2830, 120, 3352, 675), 'inverse': (1146, 65, 2830, 725), 'post-off-inspector': (2830, 120, 3352, 675), 'post-off': (1146, 65, 2830, 725), 'garbage-inspector': (2830, 120, 3352, 550), 'garbage': (1146, 65, 2830, 725), 'solid-inspector': (2830, 120, 3352, 550), 'solid': (1146, 65, 2830, 725)},
 'S76':{'graph': (480, 1300, 2380, 1450), 'inspector': (2830, 120, 3352, 585), 'compare': (1146, 65, 2830, 725), 'default-inspector': (2830, 120, 3352, 585), 'default': (1146, 65, 2830, 725), 'inverse-inspector': (2830, 120, 3352, 585), 'inverse': (1146, 65, 2830, 725), 'blue-inspector': (2830, 120, 3352, 585), 'blue': (1146, 65, 2830, 725), 'alpha': (1146, 65, 2830, 725)},
 'S77':{'graph': (500, 1210, 2330, 1530), 'inspector': (2830, 120, 3352, 600), 'compare': (1146, 65, 2830, 725), 'default-inspector': (2830, 120, 3352, 600), 'default': (1146, 65, 2830, 725), 'luminance-inspector': (2830, 120, 3352, 600), 'luminance': (1146, 65, 2830, 725), 'inverse-inspector': (2830, 120, 3352, 600), 'inverse': (1146, 65, 2830, 725), 'mask': (1146, 65, 2830, 725)},
 'S78':{'graph': (500, 1210, 2330, 1530), 'inspector': (2830, 120, 3352, 690), 'compare': (1146, 65, 2830, 725), 'shadows-inspector': (2830, 120, 3352, 690), 'shadows': (1146, 65, 2830, 725), 'midtones-inspector': (2830, 120, 3352, 690), 'midtones': (1146, 65, 2830, 725), 'highlights': (1146, 65, 2830, 725), 'mask': (1146, 65, 2830, 725)},
 'S79':{'graph': (500, 1210, 2330, 1530), 'inspector': (2830, 120, 3352, 520), 'compare': (1146, 65, 2830, 725), 'default-inspector': (2830, 120, 3352, 520), 'default': (1146, 65, 2830, 725), 'left': (1146, 65, 2830, 725), 'right-inspector': (2830, 120, 3352, 520), 'right': (1146, 65, 2830, 725), 'inverse-inspector': (2830, 120, 3352, 520), 'inverse': (1146, 65, 2830, 725), 'mask': (1146, 65, 2830, 725)},
 'S80':{'graph': (770, 1205, 2050, 1530), 'inspector': (2830, 120, 3352, 565), 'compare': (1146, 65, 2830, 725), 'default-inspector': (2830, 120, 3352, 565), 'default': (1146, 65, 2830, 725), 'outline-inspector': (2830, 120, 3352, 565), 'outline': (1146, 65, 2830, 725), 'soft-inspector': (2830, 120, 3352, 565), 'soft': (1146, 65, 2830, 725)},
 'S81':{'graph': (770, 1205, 2050, 1530), 'controls-inspector': (2830, 120, 3352, 550), 'compare': (1146, 65, 2830, 725), 'image-default-inspector': (2830, 120, 3352, 450), 'image-custom-inspector': (2830, 120, 3352, 450), 'image960-inspector': (2830, 120, 3352, 450), 'custom960': (1146, 65, 2830, 725), 'settings-off-inspector': (2830, 120, 3352, 450), 'settings-on-inspector': (2830, 120, 3352, 550)},
 'S82':{'graph': (770, 1205, 2050, 1530), 'inspector': (2830, 120, 3352, 610), 'compare': (1146, 65, 2830, 725), 'guides': (1146, 65, 2830, 725), 'size-inspector': (2830, 120, 3352, 610), 'size': (1146, 65, 2830, 725), 'rotate-inspector': (2830, 120, 3352, 610), 'rotate': (1146, 65, 2830, 725)},
 'S83':{'graph': (770, 1205, 2050, 1530), 'inspector': (2830, 120, 3352, 610), 'compare': (1146, 65, 2830, 725), 'guides': (1146, 65, 2830, 725), 'outline-inspector': (2830, 120, 3352, 610), 'outline': (1146, 65, 2830, 725)},
 'S84':{'graph': (770, 1205, 2050, 1530), 'inspector': (2830, 120, 3352, 705), 'compare': (1146, 65, 2830, 725), 'mask-inspector': (2830, 120, 3352, 410), 'inverse-inspector': (2830, 120, 3352, 410), 'inverse': (1146, 65, 2830, 725), 'frame1': (1146, 65, 2830, 725)},
 'S85':{'graph': (770, 1205, 2050, 1530), 'inspector': (2830, 120, 3352, 830), 'compare': (1146, 65, 2830, 725), 'guides': (1146, 65, 2830, 725), 'off-inspector': (2830, 120, 3352, 830), 'off': (1146, 65, 2830, 725)},
 'S86':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 675), 'compare': (1146, 65, 2830, 725), 'frame1': (1146, 65, 2830, 725)},
 'S87':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 790), 'compare': (1146, 65, 2830, 725), 'editable': (2830, 120, 3352, 790), 'frame1': (1146, 65, 2830, 725), 'frame119': (1146, 65, 2830, 725)},
 'S88':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 790), 'compare': (1146, 65, 2830, 725), 'guides': (1146, 65, 2830, 725), 'frame119': (1146, 65, 2830, 725)},
 'S89':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 550), 'compare': (1146, 65, 2830, 725), 'frame119': (1146, 65, 2830, 725)},
 'S90':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 550), 'compare': (1146, 65, 2830, 725), 'frame119': (1146, 65, 2830, 725)},
 'S91':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 900), 'compare': (1146, 65, 2830, 725), 'frame1': (1146, 65, 2830, 725)},
 'S92':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 590), 'compare': (1146, 65, 2830, 725), 'frame119': (1146, 65, 2830, 725)},
 'S93':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 590), 'compare': (1146, 65, 2830, 725), 'frame119': (1146, 65, 2830, 725), 'source-guides': (1146, 65, 2830, 725)},
 'S94':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 590), 'compare': (1146, 65, 2830, 725), 'frame119': (1146, 65, 2830, 725)},
 'S95':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 600), 'compare': (1146, 65, 2830, 725), 'frame119': (1146, 65, 2830, 725), 'yellow': (1146, 65, 2830, 725)},
 'S96':{'graph': (770, 1300, 2050, 1450), 'inspector': (2830, 120, 3352, 420), 'compare': (1146, 65, 2830, 725), 'frame119': (1146, 65, 2830, 725), 'before': (1146, 65, 2830, 725)},
 'S97':{'graph': (260, 1200, 2560, 1560), 'inspector': (2830, 120, 3352, 375), 'compare': (1146, 65, 2830, 725), 'raw': (1146, 65, 2830, 725), 'alpha-source': (1146, 65, 2830, 725)},
 'S98':{'graph': (600, 1300, 2250, 1450), 'inspector': (2830, 120, 3352, 590), 'compare': (1146, 65, 2830, 725), 'off-inspector': (2830, 120, 3352, 590), 'off': (1146, 65, 2830, 725)},
 'S99':{'graph': (600, 1200, 2250, 1560), 'inspector': (2830, 120, 3352, 635), 'compare': (1146, 65, 2830, 725), 'chart': (1146, 65, 2830, 725)},
 'S100':{'graph': (770, 1200, 2070, 1530), 'inspector': (2830, 120, 3352, 300), 'compare': (1146, 65, 2830, 725), 'before': (1146, 65, 2830, 725)},
 'S101':{'graph': (770, 1200, 2070, 1530), 'inspector': (2830, 120, 3352, 590), 'compare': (1146, 65, 2830, 725), 'before': (1146, 65, 2830, 725), 'chart': (1146, 65, 2830, 725)},
 'S102':{'graph': (770, 1150, 2070, 1580), 'inspector': (2830, 120, 3352, 300), 'compare': (1146, 65, 2830, 725), 'before': (1146, 65, 2830, 725), 'layers': (0, 0, 155, 117)},
 'S103':{'graph': (930, 1320, 1920, 1425), 'inspector': (2830, 120, 3352, 500), 'compare': (1146, 65, 2830, 725), 'matched-inspector': (2830, 120, 3352, 500), 'matched': (1146, 65, 2830, 725)},
 'S104':{'graph': (930, 1320, 1920, 1425), 'inspector': (2830, 120, 3352, 550), 'compare': (1146, 65, 2830, 725), 'default-inspector': (2830, 120, 3352, 550), 'default': (1146, 65, 2830, 725)},
 'S105':{'graph': (930, 1320, 1920, 1425), 'inspector': (2830, 120, 3352, 640), 'compare': (1146, 65, 2830, 725), 'baseline': (1146, 65, 2830, 725), 'file-inspector': (2830, 120, 3352, 370), 'file': (1146, 65, 2830, 725)},
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
  if case=='S45':extra.update({(case,'frame24'):'screen-frame24.png',(case,'fps25-inspector'):'screen-fps25.png',(case,'fps25'):'screen-fps25.png',(case,'zero-metadata'):'screen-zero.png'})
  if case=='S46':extra.update({(case,'gold-inspector'):'screen-gold.png',(case,'gold'):'screen-gold.png',(case,'config-inspector'):'screen-config.png'})
  if case=='S47':extra[(case,'updated')]='screen-updated.png'
  if case=='S48':
   for variant in ['int8','keep']:
    for suffix in ['', '-inspector']:extra[(case,variant+suffix)]='screen-'+variant+'.png'
   extra.update({(case,'depth-menu'):'screen-menu.png',(case,'error-inspector'):'screen-error.png',(case,'noise-inspector'):'screen-noise.png'})
  if case=='S49':extra.update({(case,'unmasked0'):'screen-unmasked0.png',(case,'unmasked24'):'screen-unmasked24.png',(case,'masked24'):'screen-masked24.png',(case,'map-inspector'):'screen-map.png',(case,'map'):'screen-map.png',(case,'mask-inspector'):'screen-mask.png'})
  if case=='S50':extra.update({('S50', 'right-plus-inspector'): 'screen-right-plus.png', ('S50', 'right-plus'): 'screen-right-plus.png', ('S50', 'right-minus-inspector'): 'screen-right-minus.png', ('S50', 'right-minus'): 'screen-right-minus.png', ('S50', 'top-plus-inspector'): 'screen-top-plus.png', ('S50', 'top-plus'): 'screen-top-plus.png', ('S50', 'top-minus-inspector'): 'screen-top-minus.png', ('S50', 'top-minus'): 'screen-top-minus.png'})
  if case=='S51':extra.update({('S51', 'adjust-plus-inspector'): 'screen-adjust-plus.png', ('S51', 'adjust-plus'): 'screen-adjust-plus.png', ('S51', 'adjust-minus-inspector'): 'screen-adjust-minus.png', ('S51', 'adjust-minus'): 'screen-adjust-minus.png', ('S51', 'left-bottom-plus-inspector'): 'screen-left-bottom-plus.png', ('S51', 'left-bottom-plus'): 'screen-left-bottom-plus.png', ('S51', 'left-bottom-minus-inspector'): 'screen-left-bottom-minus.png', ('S51', 'left-bottom-minus'): 'screen-left-bottom-minus.png', ('S51', 'set-full-inspector'): 'screen-set-full.png', ('S51', 'set-full'): 'screen-set-full-image.png', ('S51', 'set-half-inspector'): 'screen-set-half.png', ('S51', 'set-half'): 'screen-set-half-image.png'})
  if case=='S52':extra.update({('S52', 'default-inspector'): 'screen-default.png', ('S52', 'default'): 'screen-default.png', ('S52', 'alpha0-inspector'): 'screen-alpha0.png', ('S52', 'alpha0'): 'screen-alpha0.png', ('S52', 'dod'): 'screen-dod.png', ('S52', 'reference-graph'): 'screen-reference.png', ('S52', 'reference-inspector'): 'screen-reference.png', ('S52', 'reference'): 'screen-reference.png', ('S52', 'source-inspector'): 'screen-reference-source.png'})
  if case=='S53':extra.update({('S53', 'before'): 'screen-before.png', ('S53', 'before-inspector'): 'screen-before.png', ('S53', 'left'): 'screen-left.png', ('S53', 'left-inspector'): 'screen-left.png', ('S53', 'reset'): 'screen-reset.png', ('S53', 'reset-inspector'): 'screen-reset.png'})
  if case=='S54':extra.update({('S54', 'compare'): 'screen-image.png', ('S54', 'pan-inspector'): 'screen-pan.png', ('S54', 'pan'): 'screen-pan-image.png', ('S54', 'pan-offset-inspector'): 'screen-pan-offset.png', ('S54', 'pan-offset'): 'screen-pan-offset-image.png', ('S54', 'envelope-offset-inspector'): 'screen-envelope-offset.png', ('S54', 'envelope-offset'): 'screen-envelope-offset-image.png', ('S54', 'alpha'): 'screen-alpha.png'})
  if case=='S55':extra.update({('S55', 'compare'): 'screen-image.png', ('S55', 'perspective-inspector'): 'screen-perspective.png', ('S55', 'perspective'): 'screen-perspective-image.png', ('S55', 'zmove2-inspector'): 'screen-zmove2.png', ('S55', 'zmove2'): 'screen-zmove2-image.png'})
  if case=='S56':extra.update({('S56', 'frame24'): 'screen-frame24.png', ('S56', 'square24-inspector'): 'screen-square24.png', ('S56', 'square24'): 'screen-square24.png', ('S56', 'strength0-inspector'): 'screen-strength0.png', ('S56', 'strength0'): 'screen-strength0.png'})
  if case=='S57':extra.update({('S57', 'setup'): 'screen-setup.png', ('S57', 'intermediate'): 'screen-intermediate.png', ('S57', 'channels'): 'screen-channels.png', ('S57', 'config'): 'screen-config.png', ('S57', 'gain1-inspector'): 'screen-gain1.png', ('S57', 'gain1'): 'screen-gain1.png'})
  if case=='S58':extra.update({('S58', 'compare'): 'screen-image.png', ('S58', 'negative-inspector'): 'screen-negative.png', ('S58', 'negative'): 'screen-negative-image.png', ('S58', 'zoom-inspector'): 'screen-zoom.png', ('S58', 'zoom'): 'screen-zoom-image.png'})
  if case=='S59':extra.update({('S59', 'gaussian-inspector'): 'screen-gaussian.png', ('S59', 'gaussian'): 'screen-gaussian.png', ('S59', 'bloom-inspector'): 'screen-bloom.png', ('S59', 'bloom'): 'screen-bloom.png'})
  if case=='S60':extra.update({('S60', 'gain05-inspector'): 'screen-gain05.png', ('S60', 'gain05'): 'screen-gain05.png', ('S60', 'saturation0-inspector'): 'screen-saturation0.png', ('S60', 'saturation0'): 'screen-saturation0.png'})
  if case=='S61':extra.update({('S61', 'gainred05-inspector'): 'screen-gainred05.png', ('S61', 'gainred05'): 'screen-gainred05.png', ('S61', 'liftred02-inspector'): 'screen-liftred02.png', ('S61', 'liftred02'): 'screen-liftred02.png'})
  if case=='S62':extra.update({('S62', 'detail1'): 'screen-detail1.png', ('S62', 'strong-inspector'): 'screen-detail3.png', ('S62', 'detail3'): 'screen-detail3.png', ('S62', 'blend0-inspector'): 'screen-blend0.png', ('S62', 'blend0'): 'screen-blend0.png'})
  if case=='S63':extra.update({('S63', 'detail0'): 'screen-detail0.png', ('S63', 'threshold02-inspector'): 'screen-threshold02.png', ('S63', 'threshold02'): 'screen-threshold02.png', ('S63', 'detail02'): 'screen-detail02.png'})
  if case=='S64':extra.update({('S64', 'negative-inspector'): 'screen-negative.png', ('S64', 'negative'): 'screen-negative.png', ('S64', 'zero-inspector'): 'screen-zero.png', ('S64', 'zero'): 'screen-zero.png'})
  if case=='S65':extra.update({('S65', 'rank0-inspector'): 'screen-rank0.png', ('S65', 'rank0'): 'screen-rank0.png', ('S65', 'rank1-inspector'): 'screen-rank1.png', ('S65', 'rank1'): 'screen-rank1.png'})
  if case=='S66':extra.update({('S66', 'alpha1-inspector'): 'screen-alpha1.png', ('S66', 'alpha1'): 'screen-alpha1.png', ('S66', 'laplacian-inspector'): 'screen-laplacian.png', ('S66', 'laplacian'): 'screen-laplacian.png', ('S66', 'filter-menu'): 'screen-menu.png'})
  if case=='S67':extra.update({('S67', 'threshold09-inspector'): 'screen-threshold09.png', ('S67', 'threshold09'): 'screen-threshold09.png', ('S67', 'blend0-inspector'): 'screen-blend0.png', ('S67', 'blend0'): 'screen-blend0.png', ('S67', 'default-inspector'): 'screen-default.png'})
  if case=='S68':extra.update({('S68', 'height5-inspector'): 'screen-height5.png', ('S68', 'height5'): 'screen-height5.png', ('S68', 'height-low-inspector'): 'screen-height-low.png', ('S68', 'height-low'): 'screen-height-low.png'})
  if case=='S69':extra.update({('S69', 'floor025-inspector'): 'screen-floor025.png', ('S69', 'floor025'): 'screen-floor025.png', ('S69', 'normalize05-inspector'): 'screen-normalize05.png', ('S69', 'normalize05'): 'screen-normalize05.png', ('S69', 'detail'): 'screen-detail.png'})
  if case=='S70':extra.update({('S70', 'base-inspector'): 'screen-base.png', ('S70', 'base'): 'screen-base.png', ('S70', 'low02-inspector'): 'screen-low02.png', ('S70', 'low02'): 'screen-low02.png'})
  if case=='S71':extra.update({('S71', 'identity-inspector'): 'screen-identity.png', ('S71', 'identity'): 'screen-identity.png', ('S71', 'add02-inspector'): 'screen-add02.png', ('S71', 'add02'): 'screen-add02.png'})
  if case=='S72':extra.update({('S72', 'converted-inspector'): 'screen-converted.png', ('S72', 'converted'): 'screen-converted.png'})
  if case=='S73':extra.update({('S73', 'inverse-inspector'): 'screen-inverse.png', ('S73', 'inverse'): 'screen-inverse.png', ('S73', 'neutral-inspector'): 'screen-neutral.png', ('S73', 'neutral'): 'screen-neutral.png'})
  if case=='S74':extra.update({('S74', 'correct-inspector'): 'screen-correct.png', ('S74', 'direct-inspector'): 'screen-direct.png', ('S74', 'multiply-inspector'): 'screen-multiply.png', ('S74', 'source-inspector'): 'screen-source.png', ('S74', 'source'): 'screen-source.png', ('S74', 'baseline'): 'screen-baseline.png', ('S74', 'builtin-options'): 'screen-builtin.png', ('S74', 'builtin'): 'screen-builtin.png', ('S74', 'direct-options'): 'screen-direct-options.png'})
  if case=='S75':extra.update({('S75', 'default-inspector'): 'screen-default.png', ('S75', 'copy-inspector'): 'screen-copy.png', ('S75', 'copy'): 'screen-copy.png', ('S75', 'source'): 'screen-source.png', ('S75', 'inverse-inspector'): 'screen-inverse.png', ('S75', 'inverse'): 'screen-inverse.png', ('S75', 'post-off-inspector'): 'screen-post-off.png', ('S75', 'post-off'): 'screen-post-off.png', ('S75', 'garbage-inspector'): 'screen-garbage-inspector.png', ('S75', 'garbage'): 'screen-garbage.png', ('S75', 'solid-inspector'): 'screen-solid-inspector.png', ('S75', 'solid'): 'screen-solid.png'})
  if case=='S76':extra.update({('S76', 'default-inspector'): 'screen-default.png', ('S76', 'default'): 'screen-default.png', ('S76', 'inverse-inspector'): 'screen-inverse.png', ('S76', 'inverse'): 'screen-inverse.png', ('S76', 'blue-inspector'): 'screen-blue.png', ('S76', 'blue'): 'screen-blue.png', ('S76', 'alpha'): 'screen-alpha.png'})
  if case=='S77':extra.update({('S77', 'default-inspector'): 'screen-default.png', ('S77', 'default'): 'screen-default.png', ('S77', 'luminance-inspector'): 'screen-luminance.png', ('S77', 'luminance'): 'screen-luminance.png', ('S77', 'inverse-inspector'): 'screen-inverse.png', ('S77', 'inverse'): 'screen-inverse.png', ('S77', 'mask'): 'screen-mask.png'})
  if case=='S78':extra.update({('S78', 'shadows-inspector'): 'screen-shadows.png', ('S78', 'shadows'): 'screen-shadows.png', ('S78', 'midtones-inspector'): 'screen-midtones.png', ('S78', 'midtones'): 'screen-midtones.png', ('S78', 'highlights'): 'screen-highlights.png', ('S78', 'mask'): 'screen-mask.png'})
  if case=='S79':extra.update({('S79', 'default-inspector'): 'screen-default.png', ('S79', 'default'): 'screen-default.png', ('S79', 'left'): 'screen-left.png', ('S79', 'right-inspector'): 'screen-right.png', ('S79', 'right'): 'screen-right.png', ('S79', 'inverse-inspector'): 'screen-inverse.png', ('S79', 'inverse'): 'screen-inverse.png', ('S79', 'mask'): 'screen-mask.png'})
  if case=='S80':extra.update({('S80', 'default-inspector'): 'screen-default.png', ('S80', 'default'): 'screen-default.png', ('S80', 'outline-inspector'): 'screen-outline.png', ('S80', 'outline'): 'screen-outline.png', ('S80', 'soft-inspector'): 'screen-soft.png', ('S80', 'soft'): 'screen-soft.png'})
  if case=='S81':extra.update({('S81', 'image-default-inspector'): 'screen-image.png', ('S81', 'image-custom-inspector'): 'screen-custom.png', ('S81', 'image960-inspector'): 'screen-custom960.png', ('S81', 'custom960'): 'screen-custom960.png', ('S81', 'settings-off-inspector'): 'screen-settings-off.png', ('S81', 'settings-on-inspector'): 'screen-settings-on.png'})
  if case=='S82':extra.update({('S82', 'guides'): 'screen-guides.png', ('S82', 'size-inspector'): 'screen-size.png', ('S82', 'size'): 'screen-size.png', ('S82', 'rotate-inspector'): 'screen-rotate.png', ('S82', 'rotate'): 'screen-rotate.png'})
  if case=='S83':extra.update({('S83', 'guides'): 'screen-guides.png', ('S83', 'outline-inspector'): 'screen-outline.png', ('S83', 'outline'): 'screen-outline.png'})
  if case=='S84':extra.update({('S84', 'mask-inspector'): 'screen-mask.png', ('S84', 'inverse-inspector'): 'screen-inverse.png', ('S84', 'inverse'): 'screen-inverse.png', ('S84', 'frame1'): 'screen-frame1.png'})
  if case=='S85':extra.update({('S85', 'compare'): 'screen-clean.png', ('S85', 'off-inspector'): 'screen-off.png', ('S85', 'off'): 'screen-off-clean.png'})
  if case=='S86' and slug=='frame1':extra[(case,slug)]='screen-frame1.png'
  if case=='S87':extra.update({(case,'inspector'):'screen-controls.png',(case,'editable'):'screen-editable.png',(case,'compare'):'screen-clean0.png',(case,'frame1'):'screen-clean1.png',(case,'frame119'):'screen-clean119.png'})
  if case in ['S88','S89','S90']:
   extra.update({(case,'compare'):'screen-clean0.png',(case,'frame119'):'screen-clean119.png'})
   if case=='S88':extra[(case,'inspector')]='screen-controls.png'
  if case in ['S91','S92','S93']:
   extra.update({(case,'compare'):'screen-clean0.png',(case,'frame1'):'screen-clean1.png',(case,'frame119'):'screen-clean119.png',(case,'source-guides'):'screen-source.png'})
  if case in ['S94','S95','S96']:
   extra.update({(case,'compare'):'screen-clean0.png',(case,'frame119'):'screen-clean119.png',(case,'yellow'):'screen-yellow.png',(case,'before'):'screen-before.png'})
  if case in ['S97','S98','S99']:
   extra.update({(case,'raw'):'screen-raw.png',(case,'alpha-source'):'screen-alpha-source.png',(case,'off-inspector'):'screen-off.png',(case,'off'):'screen-off.png',(case,'chart'):'screen-chart.png'})
  if case in ['S100','S101','S102']:
   extra[(case,'before')]='screen-before.png'
  if case=='S101':extra.update({(case,'compare'):'screen-warm.png'})
  if case=='S102':extra[(case,'layers')]='screen-layers.png'
  if case=='S103':extra.update({(case,'matched'):'screen-matched.png',(case,'matched-inspector'):'screen-matched.png'})
  if case=='S104':extra.update({(case,'default'):'screen-default.png',(case,'default-inspector'):'screen-default.png'})
  if case=='S105':extra.update({(case,'inspector'):'screen-controls.png',(case,'compare'):'screen-controls.png',(case,'baseline'):'screen-baseline.png'})
  src=folder/extra.get((case,slug),variants.get((case,slug),'screen.png'))
  assert 0<=box[0]<box[2]<=im.width and 0<=box[1]<box[3]<=im.height, (case,slug,box)
  path=folder/(slug+'.png');Image.open(src).crop(box).save(path)
  frame=60 if (case,slug)==('S10','result') else 0 if (case,slug)==('S09','frame0') else readback['frame']
  if case=='S35' and slug.startswith('frame0'):frame=0
  if case=='S36':frame=12 if slug=='peak-inspector' else 3
  if case=='S39':frame=0 if slug in ['frame0','hold-inspector','hold0-inspector','hold0'] else 24 if slug in ['frame24','hold24-inspector','hold24'] else 12
  if case=='S40':frame=0 if slug in ['freeze0','reverse0'] else 24
  if case=='S42':frame=0 if slug.startswith('edge-') else 12 if slug=='frame12' else 24
  if case=='S45':frame=24 if slug in ['frame24','fps25-inspector','fps25'] else 0
  if case=='S49':frame=24 if slug in ['unmasked24','masked24'] else 0
  if case=='S56' and slug.startswith(('frame24','square24')):frame=24
  shots.append({'file':path.name,'source':src.name,'source_sha256':sha(src),'frame':frame,'crop_xyxy':box,'resampled':False,'sha256':sha(path)})
  if case in ['S62','S63']:shots[-1]['viewer_zoom_percent']=100 if 'detail' in slug or slug=='strong-inspector' else 40
  if case=='S69':shots[-1]['viewer_zoom_percent']=100 if slug=='detail' else 40
  if case=='S54':shots[-1]['viewer_channels']='Left Color / Right Alpha' if slug=='alpha' else 'Color'
  if case in ['S25','S28','S31']:shots[-1]['viewer_channels']='Alpha' if slug=='alpha' else 'Color'
  if case=='S76':shots[-1]['viewer_channels']='Left Color / Right Alpha' if slug=='alpha' else 'Color'
  if case=='S77':shots[-1]['viewer_contents']='Left Bitmap Mask / Right masked Gold Color' if slug in ['compare','graph','inspector'] else 'Left source Color / Right Bitmap Mask' if slug=='mask' else 'Left source Color / Right masked Gold Color'
  if case=='S78':shots[-1]['viewer_contents']='Left Ranges Mask / Right masked Gold Color' if slug in ['compare','graph','inspector'] else 'Left source Color / Right Ranges Mask' if slug=='mask' else 'Left source Color / Right masked Gold Color'
  if case=='S79':shots[-1]['viewer_contents']='Left Wand Mask / Right masked Gold Color' if slug in ['graph','inspector','compare'] else 'Left source Color / Right Wand Mask' if slug=='mask' else 'Left source Color / Right masked Gold Color'
  if case=='S80':shots[-1]['viewer_contents']='Left Triangle Mask / Right masked Gold Color'
  if case=='S81':
   shots[-1]['viewer_contents']='Left Rectangle Mask960x540 / Right masked Gold1920x1080,both40%' if slug in ['custom960','image960-inspector'] else 'Left Rectangle Mask / Right masked Gold Color,both1920x1080/40%'
   shots[-1]['viewer_resolution']={'left':[960,540] if slug in ['custom960','image960-inspector'] else [1920,1080],'right':[1920,1080]}
  if case=='S82':
   shots[-1]['viewer_contents']='Left Polygon Mask / Right masked Gold Color,both1920x1080/40%'
   shots[-1]['show_view_controls']=1 if slug=='guides' else 0
  if case in ['S83','S84']:
   shots[-1]['viewer_contents']='Left Mask / Right masked Gold Color,both1920x1080/40%'
   shots[-1]['show_view_controls']=1 if case=='S83' and slug=='guides' else 0
   if case=='S84' and slug=='frame1':shots[-1]['frame']=1
  if case=='S85':
   shots[-1]['viewer_contents']='Left MultiPoly Mask / Right masked Gold,both1920x1080/40%'
   shots[-1]['viewer_guides']=slug not in ['compare','off']
   shots[-1]['active_tool']='MediaOut1' if slug in ['compare','off'] else 'MultiPoly1'
  if case=='S86':
   shots[-1]['viewer_contents']='Left input chart / Right Paint image,both1920x1080/40%'
   if slug=='frame1':shots[-1]['frame']=1
  if case=='S87':
   shots[-1]['viewer_contents']='Left input chart / Right Paint white Stroke,both1920x1080/40%'
   shots[-1]['frame']=1 if slug=='frame1' else 119 if slug=='frame119' else 0
   shots[-1]['active_tool']='MediaOut1' if slug in ['compare','frame1','frame119'] else 'Stroke1' if slug in ['inspector','editable'] else 'Paint1'
   shots[-1]['viewer_guides']=slug not in ['compare','frame1','frame119']
  if case in ['S88','S89','S90']:
   shots[-1]['viewer_contents']='Left input chart / Right Paint image,both1920x1080/40%'
   shots[-1]['frame']=119 if slug=='frame119' else 0
   shots[-1]['viewer_guides']=slug not in ['compare','frame119']
   shots[-1]['active_tool']='MediaOut1' if slug in ['compare','frame119'] else 'Paint1' if case=='S88' else 'Circle1' if case=='S89' else 'Rectangle1'
  if case in ['S91','S92','S93']:
   shots[-1]['viewer_contents']='Left input chart / Right Paint copy result,both1920x1080/40%'
   shots[-1]['frame']=1 if slug=='frame1' else 119 if slug=='frame119' else 0
   shots[-1]['viewer_guides']=slug not in ['compare','frame1','frame119']
   shots[-1]['active_tool']='MediaOut1' if case!='S92' and slug in ['compare','frame1','frame119'] else 'Paint1'
   shots[-1]['show_source']=1 if slug=='source-guides' else 0 if case=='S93' else None
  if case in ['S94','S95','S96']:
   shots[-1]['frame']=119 if slug=='frame119' else 0
   shots[-1]['viewer_contents']='Left input chart / Right Paint result,both1920x1080/40%'
   shots[-1]['viewer_guides']=slug not in ['compare','frame119']
   shots[-1]['active_tool']='MediaOut1' if slug in ['compare','frame119'] else 'Fill1' if case=='S95' and slug in ['graph','inspector'] else 'Paint1'
  if case in ['S97','S98','S99']:
   shots[-1]['frame']=0
   shots[-1]['viewer_contents']='Left AlphaSource circle / Right AlphaMultiply cutout' if case=='S97' and slug=='alpha-source' else 'Left chart / Right raw ChannelBooleans output before AlphaMultiply' if case=='S97' and slug=='raw' else 'Left chart / Right AlphaMultiply cutout' if case=='S97' else 'Left chart / Right Gamut RemoveGamma OFF' if case=='S98' and slug.startswith('off') else 'Left chart / Right Gamut RemoveGamma ON' if case=='S98' else 'Left chart / Right Swizzler Chart layer' if slug=='chart' else 'Left chart / Right Swizzler Gold layer'
   shots[-1]['viewer_guides']=False
  if case in ['S100','S101','S102']:
   shots[-1]['frame']=0
   shots[-1]['viewer_guides']=False
   shots[-1]['viewer_contents']='Left Swizzler Gold / Right same Gold before removal' if case=='S100' and slug=='before' else 'Left Swizzler Gold / Right retained Chart' if case=='S100' else 'Left Swizzler Gold / Right original Gold before rename' if case=='S101' and slug=='before' else 'Left Swizzler Gold / Right renamed Warm,same orange pixels' if case=='S101' and slug=='compare' else 'Left Swizzler Gold / Right retained Chart' if case=='S101' else 'Native popup only:Default,Gold,Chart,Blue,Reference' if slug=='layers' else 'Left SwizzlerA Gold / Right LayerMuxer Gold' if slug=='before' else 'Left SwizzlerA Gold / Right LayerMuxer selected Blue'
  if case in ['S103','S104','S105']:
   shots[-1]['frame']=0
   shots[-1]['viewer_guides']=False
   shots[-1]['viewer_contents']='Left chart / Right CST InputGamma2.4 OutputGamma2.4' if case=='S103' and slug.startswith('matched') else 'Left chart / Right CST InputGamma2.4 OutputLinear' if case=='S103' else 'Left chart / Right CAT02 D65 to D65' if case=='S104' and slug.startswith('default') else 'Left chart / Right CAT02 D65 to D50' if case=='S104' else 'Left chart / Right identity Controls' if slug=='baseline' else 'Left chart / Right Controls RedSlope0.5' if slug in ['inspector','compare'] else 'Left chart / Right native CDL File RedSlope0.5,Controls reset1'
 candidate=next(x for x in candidates['candidates'] if x['id']==case)
 manifest={'schema_version':1,'case':case,'article':candidate['article'],'manual':candidate['manual'],'runtime':{'version':readback['resolve'],'edition':'Studio','os':readback['os'],'ui_language':'ja-JP (some Shape controls remain English)'},'captured_at':datetime.datetime.fromtimestamp(source.stat().st_mtime,datetime.timezone.utc).isoformat(),'project':readback['project'],'timeline':readback['timeline'],'frame':readback['frame'],'resolution':[1920,1080],'color_management':readback['project_settings'],'viewer':{'zoom_percent':40,'channel':'Color','background':'checkerboard for transparent pixels','note':'Viewer screenshots are display evidence, not colorimetric exports.'},'graph':'fixture.comp','settings':'readback.json','source':{'file':'screen.png','size':im.size,'sha256':sha(source)},'shots':shots,'acceptance':{'gui':'PASS: owner visually inspected node connections, selected Inspector, and output','article_display':'NOT_RUN'},'unverified':['Free edition and other platforms','All parameter ranges and performance','S03 optional Glow Mask / Effect Mask comparison is deferred'] if case=='S03' else ['Free edition and other platforms','All parameter ranges and performance']}
 (folder/'capture.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print('Prepared',', '.join(args.cases))
