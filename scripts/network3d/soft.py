import numpy as np, json
from PIL import Image
im=np.array(Image.open('src/assets/aurelia-network.png')).astype(float)
A=im[...,3]; H,W=A.shape
nodes=json.load(open('scripts/network3d/nodes.json'))['nodes']
def a(x,y):
  if x<0 or y<0 or x>W-1.001 or y>H-1.001: return np.nan
  x0,y0=int(x),int(y); fx,fy=x-x0,y-y0
  return A[y0,x0]*(1-fx)*(1-fy)+A[y0,x0+1]*fx*(1-fy)+A[y0+1,x0]*(1-fx)*fy+A[y0+1,x0+1]*fx*fy
res=[]
for i,n in enumerate(nodes):
  rs=np.arange(0,9,0.25); prof=[]
  for r in rs:
    v=[a(n['x']+r*np.cos(t),n['y']+r*np.sin(t)) for t in np.linspace(0,2*np.pi,32,endpoint=False)]
    v=[x for x in v if not np.isnan(x)]
    prof.append(np.median(v) if v else np.nan)
  prof=np.array(prof)
  peak=np.nanmax(prof[:4])
  def cross(level):
    for k in range(len(rs)):
      if prof[k]<level: return rs[k]
    return rs[-1]
  r50=cross(peak*0.5); r90=cross(peak*0.9); r10=cross(peak*0.1)
  res.append((i,round(n['x'],1),round(n['y'],1),round(r50,2),round(r10-r90,2),int(peak),n['rgba'][:3]))
  print(res[-1])
json.dump(res,open('scripts/network3d/soft.json','w'))
