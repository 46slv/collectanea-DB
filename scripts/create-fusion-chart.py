"""Synthetic image fixture, never a simulated Resolve screenshot."""
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'static/img/fusion/captures/_fixtures'
out.mkdir(parents=True,exist_ok=True)
im=Image.new('RGB',(1920,1080),'#181c24');d=ImageDraw.Draw(im)
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',68)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',36)
for x in range(0,1920,120):d.line((x,0,x,1080),fill='#515968',width=3)
for y in range(0,1080,120):d.line((0,y,1920,y),fill='#515968',width=3)
for i,color in enumerate(['#e45050','#e4bb50','#54b57f','#5294d6','#a177c8','#d8d8d8']):
 d.rectangle((120+i*280,640,360+i*280,850),fill=color)
for i in range(12):
 value=round(i*255/11);d.rectangle((120+i*140,900,260+i*140,1000),fill=(value,value,value))
d.rectangle((20,20,1899,1059),outline='white',width=10)
d.rectangle((650,320,1270,570),fill='#eeeeee')
d.text((690,380),'FUSION 21.1',font=font,fill='#101014')
for xy,label in [((55,55),'TL'),((1740,55),'TR'),((55,960),'BL'),((1740,960),'BR')]:d.text(xy,label,font=font,fill='white')
for x in range(130,1800,70):d.ellipse((x,180,x+24,204),fill='white')
d.text((690,260),'1920 x 1080 / TEST CHART',font=small,fill='white')
im.save(out/'chart.png')
print(out/'chart.png')
if '--sequence' in __import__('sys').argv:
 sequence=out/'plate';sequence.mkdir(exist_ok=True)
 for frame in range(120):
  plate=Image.new('RGB',im.size,'#181c24');plate.paste(im,(frame*3,0))
  plate.save(sequence/f'frame{frame:04d}.png')
 print('120-frame plate: +3 source pixels per frame')
