"""Generate the S39 numbered input sequence into a new directory, not UI images."""
from pathlib import Path
import argparse
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output-dir',type=Path,default=root/'static/img/fusion/captures/_fixtures/timeplate')
out=parser.parse_args().output_dir
assert not out.exists(), 'Choose a new output directory; accepted fixtures are preserved'
out.mkdir(parents=True)
chart=Image.open(root/'static/img/fusion/captures/_fixtures/chart.png').convert('RGB')
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',138)
for frame in range(100):
 im=chart.copy();draw=ImageDraw.Draw(im)
 draw.rectangle((440,270,1500,590),fill='#eeeeee')
 draw.text((485,355),f'SOURCE {frame:03d}',font=font,fill='#101014')
 x=200+frame*14;draw.rectangle((x,885,x+22,1030),fill='#44ff88')
 im.save(out/f'frame{frame:04d}.png')
print('Created100 numbered1920x1080 input PNGs:',out)
