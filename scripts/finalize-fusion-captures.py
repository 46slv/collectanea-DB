"""Finalize portable exports and manifests after source screenshots were reviewed."""
import pathlib,re,json,hashlib,datetime
root=pathlib.Path(__file__).resolve().parents[1]
captures=root/'static/img/fusion/captures'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def portable(value):
 normalized=value.replace('\\','/')
 normalized=re.sub('/+','/',normalized)
 if '/_fixtures/' in normalized:return 'Comp:/../_fixtures/'+normalized.split('/_fixtures/',1)[1]
 return value
for folder in sorted(captures.glob('S[0-9][0-9]')):
 fixture=folder/'fixture.comp'
 if not (folder/'capture.json').exists():continue
 text=fixture.read_text(encoding='utf-8')
 text=re.sub(r'^.*(?:\["ResolveCaches:"\]|LastFile =).*$\n?','',text,flags=re.M)
 text=re.sub(r'Filename = "([^"]+)"',lambda m:'Filename = "'+portable(m[1])+'"',text)
 fixture.write_text(text.rstrip('\r\n')+'\n',encoding='utf-8',newline='\n')
 rp=folder/'readback.json';rb=json.loads(rp.read_text(encoding='utf-8'))
 for tool in rb['tools'].values():
  for key,value in tool['inputs'].items():
   if isinstance(value,str):tool['inputs'][key]=portable(value)
 rp.write_text(json.dumps(rb,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 mp=folder/'capture.json';m=json.loads(mp.read_text(encoding='utf-8'))
 m['reproduction']={'fixture_sha256':sha(fixture),'readback_sha256':sha(rp),'paths':'Comp:/../_fixtures/ for bundled synthetic fixtures','reimport':'NOT_RUN: accepted GUI evidence precedes export path normalization'}
 m['unverified'].append('Exported portable composition reimport') if 'Exported portable composition reimport' not in m['unverified'] else None
 if folder.name=='S12':m['unverified'].append('Depth, cameraDepth, primId, Neye output fidelity; only Color output accepted')
 if folder.name=='S10':
  records={}
  for line in text.splitlines():
   match=re.search(r'\[(\d+)\] = .*?ToRef = \{ \[0\] = ([^}]+)',line)
   if match:
    numbers=[float(v.strip()) for v in match[2].split(',') if v.strip()]
    records[int(match[1])]=numbers
  assert len(records)==120 and set(records)==set(range(120))
  errors=[abs(records[f][12]+f*3/1920)*1920 for f in records]
  assert max(errors)<.25,max(errors)
  m['tracking_validation']={'fixture_motion':'3 source pixels right per frame','frames':[0,119],'samples':120,'max_x_error_pixels':max(errors),'frame60_x_pixels':-records[60][12]*1920,'expected_frame60_x_pixels':180,'method':'Compare native Planar Track ToRef translation against known PNG sequence; visual composite checked at frames 0 and 60.'}
 mp.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print('Portable exports finalized; S10 tracking error <0.25px over 120 samples.')
