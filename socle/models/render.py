import json, sys, numpy as np
from PIL import Image, ImageDraw
def rot(ax,deg):
    a=np.radians(deg); c,s=np.cos(a),np.sin(a)
    return {'x':np.array([[1,0,0],[0,c,-s],[0,s,c]]),'y':np.array([[c,0,s],[0,1,0],[-s,0,c]])}[ax]
VIEWS=[('+Z vers -Z (face)',np.eye(3)),('depuis +X',rot('y',-90)),('depuis -Z (dos)',rot('y',180)),('depuis -X',rot('y',90)),('dessus',rot('x',90)),('iso',rot('x',25)@rot('y',-35))]
def render(isl, colorof, out, W=420, legend=None):
    allv=np.concatenate([np.array(i['v']).reshape(-1,3) for i in isl]); mn,mx=allv.min(0),allv.max(0); ctr=(mn+mx)/2; ext=(mx-mn).max()
    sheet=Image.new('RGB',(W*3,W*2+ (24*((len(legend)+2)//3)+8 if legend else 0)),(14,18,28))
    for vi,(lab,R) in enumerate(VIEWS):
        img=Image.new('RGB',(W,W),(14,18,28)); d=ImageDraw.Draw(img); polys=[]
        for i in isl:
            col=colorof(i); v=(np.array(i['v']).reshape(-1,3,3)-ctr)@R.T
            n=np.cross(v[:,1]-v[:,0],v[:,2]-v[:,0]); nn=np.linalg.norm(n,axis=1); sh=0.5+0.5*np.abs(n[:,2])/np.maximum(nn,1e-12)
            z=v[:,:,2].mean(1)
            for k in range(len(v)):
                polys.append((z[k],[(W/2+p[0]/ext*W*0.9,W/2-p[1]/ext*W*0.9) for p in v[k]],tuple(int(c*sh[k]) for c in col)))
        polys.sort(key=lambda x:x[0])
        for z,pts,col in polys: d.polygon(pts,fill=col)
        d.text((6,4),lab,fill=(255,255,255)); sheet.paste(img,((vi%3)*W,(vi//3)*W))
    if legend:
        d=ImageDraw.Draw(sheet)
        for k,(name,col) in enumerate(legend):
            x=(k%3)*W+10; y=W*2+6+(k//3)*24; d.rectangle([x,y,x+14,y+14],fill=col); d.text((x+22,y),name,fill=(235,235,235))
    sheet.save(out); print('saved',out,sheet.size)
if __name__=='__main__':
    isl=json.load(open(sys.argv[1]))
    def col(i):
        t=(i['ctr'][1]+0.5); return (int(60+190*t), int(200-120*abs(t-0.5)*2), int(250-190*t))
    render(isl,col,sys.argv[2])
