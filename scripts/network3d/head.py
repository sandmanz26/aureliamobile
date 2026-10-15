import numpy as np
from PIL import Image
from scipy import ndimage
src=Image.open('src/assets/aurelia-network.png')
im=np.array(src).astype(float); A=im[...,3]
lab,n=ndimage.label(A>100); sizes=ndimage.sum(np.ones_like(A),lab,range(1,n+1)); head=lab==(np.argmax(sizes)+1)
# soft mask: the head plus its blurred rim (4px), nothing else
dist_out=ndimage.distance_transform_edt(~head)
keep=np.clip(1-(dist_out-2)/3,0,1)
x0,x1,y0,y1=114,256,30,155
out=im.copy(); out[...,3]=A*keep
crop=out[y0:y1,x0:x1].astype(np.uint8)
Image.fromarray(crop,'RGBA').save('src/components/network3d/head.png',optimize=True)
# depth: inflate the silhouette — distance to the edge, eased, smoothed
d=ndimage.distance_transform_edt(head)
d=ndimage.gaussian_filter(d,2.0)
h=np.sqrt(np.clip(d/ d.max(),0,1))
# the cut at the bottom edge is not a real edge: keep the body thick there
dep=(h*255)[y0:y1,x0:x1].astype(np.uint8)
Image.fromarray(dep,'L').save('src/components/network3d/head-depth.png',optimize=True)
print('crop',x1-x0,y1-y0,'centre',(x0+x1)/2,(y0+y1)/2)
