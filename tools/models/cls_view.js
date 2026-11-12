// node cls_view.js <islands.json> <classifier.js> <out.json>  -> adds .cls to each island
const fs=require('fs'); const isl=JSON.parse(fs.readFileSync(process.argv[2])); const f=require(require('path').resolve(process.argv[3]));
const cnt={}; isl.forEach(i=>{ i.cls=f(i,i.node,i.mat||''); cnt[i.cls]=(cnt[i.cls]||0)+i.tris; });
fs.writeFileSync(process.argv[4], JSON.stringify(isl)); console.log(JSON.stringify(cnt));
