const { load, collect } = require('./seg_lib.js'); const fs = require('fs');
(async () => { const { doc } = await load(process.argv[2]); const prims = collect(doc); const out = [];
  prims.forEach(p => { const tri = new Map();
    for (let t = 0; t < p.T; t += 3) { const a = p.ia?p.ia[t]:t, b = p.ia?p.ia[t+1]:t+1, c = p.ia?p.ia[t+2]:t+2; const r = p.find(a);
      if (!tri.has(r)) tri.set(r, []); tri.get(r).push(...p.W[a], ...p.W[b], ...p.W[c]); }
    for (const [r, c] of p.comp) out.push({ node:p.node, mat:p.mat?p.mat.getName():'', ctr:c.ctr, min:c.min, max:c.max, tris:c.tris, v: tri.get(r).map(x=>+x.toFixed(4)) }); });
  fs.writeFileSync(process.argv[3], JSON.stringify(out)); console.log('islands', out.length); })();
