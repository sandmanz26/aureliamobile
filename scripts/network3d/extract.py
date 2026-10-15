import numpy as np, json
from PIL import Image
from scipy import ndimage
from skimage import measure
im=np.array(Image.open('src/assets/aurelia-network.png')).astype(float)
A=im[...,3]; H,W=A.shape
# silhouette: big component of alpha>100
lab,n=ndimage.label(A>100)
sizes=ndimage.sum(np.ones_like(A),lab,range(1,n+1))
head=lab==(np.argmax(sizes)+1)
print('head px',head.sum())
ys,xs=np.nonzero(head); print('head bbox',xs.min(),xs.max(),ys.min(),ys.max())
# blobs: everything else alpha>150
rest=(A>150)&~ndimage.binary_dilation(head,iterations=1)
lab2,n2=ndimage.label(rest)
nodes=[]
for i in range(1,n2+1):
  m=lab2==i; area=m.sum()
  if area<2: continue
  ys,xs=np.nonzero(m)
  cx,cy=xs.mean(),ys.mean(); r=np.sqrt(area/np.pi)
  # colour at centre (premultiplied by alpha)
  c=im[int(round(cy)),int(round(cx))]
  nodes.append(dict(x=round(cx,1),y=round(cy,1),r=round(r,2),area=int(area),rgba=[int(v) for v in c]))
nodes.sort(key=lambda n:-n['area'])
for nd in nodes: print(nd)
json.dump(dict(nodes=nodes),open('scripts/network3d/nodes.json','w'))
