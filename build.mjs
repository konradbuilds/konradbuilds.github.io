import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
let html = readFileSync(new URL('./src/index.html',import.meta.url),'utf8');
html = html.replace(/<!-- BUILD: ([^>]+) -->/g,(_,path)=>readFileSync(new URL('./'+path.trim(),import.meta.url),'utf8'));
// Keep the visible size estimate aligned with the self-contained file.
for(let pass=0;pass<3;pass++) { html=html.replace(/\b\d+ KB\b/g,Math.round(Buffer.byteLength(html)/1024)+' KB'); }
mkdirSync(new URL('./dist/',import.meta.url),{recursive:true});
writeFileSync(new URL('./dist/index.html',import.meta.url),html);
writeFileSync(new URL('./dist/portfolio-v3.3.21.html',import.meta.url),html);
console.log('Built standalone HTML: '+Buffer.byteLength(html)+' bytes');
