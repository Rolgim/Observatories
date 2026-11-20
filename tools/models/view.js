// node view.js in.glb out.png [mode=tex|cls] [up=y]  — six vues (texturées ou colorées par nœud), Playwright + three r128 du dossier vendor
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const [src, out, mode='tex'] = process.argv.slice(2);
const V = '/home/claude/work/vendor/flat/';
const html = `<html><body style="margin:0;background:#0e121c"><canvas id=c width=1500 height=1000></canvas>
<script>${fs.readFileSync(V+'three.min.js','utf8')}</script><script>${fs.readFileSync(V+'GLTFLoader.js','utf8')}</script>
<script>
const R=new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true,preserveDrawingBuffer:true}); R.setScissorTest(true); R.outputEncoding=THREE.sRGBEncoding;
const S=new THREE.Scene(); S.add(new THREE.AmbientLight(0xffffff,0.55)); const L=new THREE.DirectionalLight(0xffffff,0.9); S.add(L);
const PAL=[0xE6194B,0x3CB44B,0xFFE119,0x4363D8,0xF58231,0x911EB4,0x46F0F0,0xF032E6,0xBCF60C,0xFABEBE,0x008080,0xE6BEFF];
window.go=(b64,mode)=>new Promise(res=>{const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)).buffer;
 new THREE.GLTFLoader().parse(bin,'',g=>{const root=g.scene; S.add(root); const names=[];
  root.traverse(o=>{ if(o.isMesh){ o.material.side=THREE.DoubleSide; if(mode==='cls'){ let n=o.name||o.parent.name; n=n.replace(/_\\d+$/,'').split('__')[0]; let i=names.indexOf(n); if(i<0){names.push(n);i=names.length-1;} o.material=new THREE.MeshLambertMaterial({color:PAL[i%PAL.length],side:THREE.DoubleSide}); } }});
  const box=new THREE.Box3().setFromObject(root), c=box.getCenter(new THREE.Vector3()), r=box.getSize(new THREE.Vector3()).length()/2;
  const views=[[0,0,1],[1,0,0],[0,0,-1],[-1,0,0],[0,1,0.001],[0.7,0.45,0.75]];
  views.forEach((d,k)=>{ const x=(k%3)*500,y=(k<3?500:0); R.setViewport(x,y,500,500); R.setScissor(x,y,500,500);
   const cam=new THREE.OrthographicCamera(-r,r,r,-r,0.01,r*10); const v=new THREE.Vector3(...d).normalize(); cam.position.copy(c).addScaledVector(v,r*3); cam.lookAt(c);
   L.position.copy(cam.position); R.setClearColor(0x0e121c); R.clear(); R.render(S,cam); });
  res(names);
 },e=>res('ERR '+e));});
</script></body></html>`;
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const p=await b.newPage({viewport:{width:1500,height:1000}});
 await p.setContent(html); const names=await p.evaluate(([b64,m])=>window.go(b64,m),[fs.readFileSync(src).toString('base64'),mode]);
 console.log('nodes', JSON.stringify(names)); await p.screenshot({path:out}); await b.close(); })();
