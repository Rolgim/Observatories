import json, numpy as np, sys
sys.path.insert(0,'/home/claude/work')
from render import render
isl=json.load(open('euclid_isl.json'))
# per-island area-weighted normal stats
best=None
for i in isl:
    v=np.array(i['v']).reshape(-1,3,3); n=np.cross(v[:,1]-v[:,0],v[:,2]-v[:,0]); a=np.linalg.norm(n,axis=1)/2
    i['area']=float(a.sum())
    nn=n/np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12)
    # dominant axis: eigvec of sum a*nn nn^T
    M=(nn*a[:,None]).T@nn; w,V=np.linalg.eigh(M); i['nrm']=V[:,-1]; i['flat']=float(w[-1]/max(w.sum(),1e-12))
    pts=v.reshape(-1,3); i['pmin']=pts.min(0); i['pmax']=pts.max(0); i['pts']=pts
big=sorted(isl,key=lambda i:-i['area'])[:12]
for i in big: print('area %.3f flat %.2f nrm %s y[%.2f,%.2f] ctr %s'%(i['area'],i['flat'],np.round(i['nrm'],2),i['pmin'][1],i['pmax'][1],np.round(i['ctr'],2)))
n=np.array([-0.44,0,0.9]); n/=np.linalg.norm(n)
def classify(i):
    c=np.array(i['ctr']); d=i['pts']@n; r=np.hypot(c[0],c[2]); y0,y1=i['pmin'][1],i['pmax'][1]
    if d.max()>0.21 and y1>0.05 and c@n>0.10: return 'sunshield'
    if c[1]<-0.365:
        if r<0.09: return 'adapter'
        if r>0.22: return 'hga' if (y1-y0)>0.06 else 'svm'
        return 'svm'
    if c[1]<-0.205: return 'svm'
    if c[1]<-0.03: return 'instr'
    return 'baffle'
COL={'sunshield':(230,180,70),'baffle':(120,190,240),'instr':(190,110,230),'svm':(110,210,120),'hga':(240,90,90),'adapter':(240,240,240)}
cnt={}
for i in isl:
    i['cls']=classify(i); cnt[i['cls']]=cnt.get(i['cls'],0)+i['tris']
print(cnt)
for i in isl:
    if i['cls'] in('hga','adapter') or (i['ctr'][1]<-0.3 and np.hypot(i['ctr'][0],i['ctr'][2])>0.2): print(i['cls'],i['tris'],np.round(i['ctr'],2),np.round(i['pmin'],2),np.round(i['pmax'],2))
render(isl,lambda i:COL[i['cls']],'euclid_cls.png',legend=list(COL.items()))
