"""Case-bound Viewer display only; never changes user preferences or foreign projects.
API reference: official Fusion8 Scripting Guide, GLImageViewer pp.127-130.
Actual Resolve21.1 support and visible result must be checked separately.
"""
import sys,json
sys.path.insert(0,r'C:\ProgramData\Blackmagic Design\DaVinci Resolve\Support\Developer\Scripting\Modules')
import DaVinciResolveScript as d
r=d.scriptapp('Resolve');p=r.GetProjectManager().GetCurrentProject()
assert p and p.GetName()=='Collectanea_Captures_20261023_Sol' and p.GetCurrentTimeline().GetName()=='S26_capture' and r.GetCurrentPage()
c=r.Fusion().GetCurrentComp();assert c and c.GetData('CollectaneaCaptureCase')=='S26'
# Leave Text+'s in-view editing controls before inspecting the image viewer.
mediaout=next(t for t in c.GetToolList().values() if t.GetAttrs()['TOOLS_RegID']=='MediaOut')
c.SetActiveTool(mediaout)
v=c.GetPreviewList()['RightView'].View.CurrentViewer
assert v,'Current GLImageViewer unavailable; do not invent another receiver'
action=sys.argv[1]
if action=='dod':v.ShowDoD(True)
elif action=='roi':
 v.ShowRoI(True);v.EnableRoI(True);v.DragRoI()
elif action=='restore':
 v.ShowDoD(False);v.ShowRoI(False);v.EnableRoI(False)
else:raise ValueError(action)
print(json.dumps(dict(case='S26',action=action,project=p.GetName(),timeline=p.GetCurrentTimeline().GetName(),acceptance='NOT_RUN: inspect fresh GUI result')))
