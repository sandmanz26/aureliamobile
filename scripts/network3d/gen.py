import numpy as np, json
from PIL import Image
im=np.array(Image.open('src/assets/aurelia-network.png')).astype(float); A=im[...,3]; H,W=A.shape
soft=json.load(open('scripts/network3d/soft.json'))
N=json.load(open('scripts/network3d/nodes.json'))['nodes']
P=[(n['x'],n['y']) for n in N]
def pt(e): return P[e] if isinstance(e,int) else e
def rad(e): return (N[e]['r']+(3 if N[e]['r']>6 else 1.2)) if isinstance(e,int) else 0.5
def measure(a,b):
  p,q=pt(a),pt(b); d=np.hypot(q[0]-p[0],q[1]-p[1]); nx,ny=-(q[1]-p[1])/d,(q[0]-p[0])/d; vals=[]
  for t in np.linspace(0,1,int(d*3)):
    if t*d<rad(a) or (1-t)*d<rad(b): continue
    x=p[0]+t*(q[0]-p[0]); y=p[1]+t*(q[1]-p[1])
    vals.append(max(A[min(H-1,max(0,int(round(y+ny*o)))),min(W-1,max(0,int(round(x+nx*o))))] for o in (-0.8,0,0.8)))
  v=np.array(vals); on=v[v>12]
  return float(np.percentile(on,85))/255 if len(on)>3 else 0.15
H_=('head',)
D=[(0,1),(4,0),(0,(205,87.5)),(3,1),(1,(205.5,55.8)),(2,3),(2,7),(4,2),(2,(135.3,75)),(2,(140.2,87.1)),((157,33.3),1)]
S=[(0,26),(0,8),(0,11),(1,27),(27,29),(1,29),(29,(205,69)),((57.5,54),(124,58.8)),((151.8,0),6),((161,0),7),(4,7),(2,16),(16,(0,36.5)),(2,25),(2,28),(2,(35,102)),(28,18),(28,24),(18,24),(24,15),(3,30),(30,13),(13,(36,0)),(19,25),(25,12),(25,21),(21,12),(9,10),(9,11),(10,11),(10,(321.5,0)),(17,22),(17,(362,33.2)),(22,(362,37.5)),((296,3),17),(14,26),(26,23),(26,20),(20,23)]
headpts={(205,87.5),(205.5,55.8),(135.3,75),(140.2,87.1),(205,69),(157,33.3)}
def hexs(c): return '#%02X%02X%02X'%tuple(c)
lines=[]
lines.append("// GENERATED from src/assets/aurelia-network.png by measuring it (U035) —")
lines.append("// positions in the artwork's own 362×155 pixel space, colours sampled.")
lines.append("// Regenerate rather than hand-edit if the artwork changes.")
lines.append("")
lines.append("export type NodeKind = 'hub' | 'bokeh' | 'dot'")
lines.append("export interface NetNode { x: number; y: number; r: number; soft: number; color: string; kind: NodeKind }")
lines.append("/** An edge end: a node index, or a point (frame edge, head outline, a line that fades out). */")
lines.append("export type End = number | readonly [number, number]")
lines.append("export interface NetEdge { a: End; b: End; dashed: boolean; opacity: number; head?: boolean }")
lines.append("")
lines.append("export const ART = { width: 362, height: 155 } as const")
lines.append("")
lines.append("export const NODES: NetNode[] = [")
for (i,x,y,r50,sw,peak,rgb) in soft:
  kind='hub' if i<5 else 'bokeh' if i<9 else 'dot'
  r = 6.5 if kind=='hub' else r50
  s = 1.0 if kind=='hub' else max(0.8,sw)
  lines.append(f"  {{ x: {x}, y: {y}, r: {round(r,2)}, soft: {round(s,2)}, color: '{hexs(rgb)}', kind: '{kind}' }}, // {i}")
lines.append("]")
lines.append("")
lines.append("export const EDGES: NetEdge[] = [")
def endstr(e): return str(e) if isinstance(e,int) else f"[{e[0]}, {e[1]}]"
for dashed,L in ((True,D),(False,S)):
  for a,b in L:
    o=measure(a,b)
    head = (not isinstance(b,int) and tuple(b) in headpts) or (not isinstance(a,int) and tuple(a) in headpts)
    lines.append(f"  {{ a: {endstr(a)}, b: {endstr(b)}, dashed: {str(dashed).lower()}, opacity: {round(o,2)}{', head: true' if head else ''} }},")
lines.append("]")
open('src/components/network3d/networkData.ts','w').write('\n'.join(lines)+'\n')
print('wrote src/components/network3d/networkData.ts')
