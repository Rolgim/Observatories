const { load, collect } = require('./seg_lib.js');
(async () => { const { doc } = await load(process.argv[2]); const prims = collect(doc);
  let all = []; prims.forEach(p => { for (const c of p.comp.values()) all.push({ node:p.node, mat:p.mat&&p.mat.getName(), tris:c.tris, min:c.min, max:c.max, ctr:c.ctr }); });
  const mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; all.forEach(c=>{for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],c.min[k]);mx[k]=Math.max(mx[k],c.max[k]);}});
  console.log('prims', prims.length, 'islands', all.length, 'tris', all.reduce((s,c)=>s+c.tris,0), 'bbox', mn.map(v=>v.toFixed(2)), mx.map(v=>v.toFixed(2)));
  all.sort((a,b)=>b.tris-a.tris).slice(0, +process.argv[3]||25).forEach(c => console.log(String(c.tris).padStart(6), 'min', c.min.map(v=>v.toFixed(2)).join(','), 'max', c.max.map(v=>v.toFixed(2)).join(',')));
})();
