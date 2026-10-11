import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const b=await chromium.launch({...(process.env.TEST_CHROMIUM_PATH?{executablePath:process.env.TEST_CHROMIUM_PATH}:{}),args:JSON.parse(process.env.TEST_CHROMIUM_ARGS||'[]')});
for(const width of [390,1440,2560])for(const returning of [false,true]){
 const p=await b.newPage({viewport:{width,height:900}});await p.route('https://**/*',r=>r.abort());if(returning)await p.addInitScript(()=>localStorage.setItem('konrad-portfolio-visited','1'));
 await p.goto(new URL('../dist/index.html',import.meta.url).href);await p.waitForTimeout(120);
 const hits=await p.locator('.depth-arrow').evaluate(e=>{const r=e.getBoundingClientRect();return [.03,.5,.97].flatMap(x=>[.03,.5,.97].map(y=>e.contains(document.elementFromPoint(r.left+r.width*x,r.top+r.height*y))));});assert(hits.every(Boolean),'Full arrow area must hit the button');
 assert.equal(await p.locator('.opening-identity .avatar').evaluate(e=>getComputedStyle(e).borderTopWidth),'2px');
 await p.locator('.depth-arrow').click({position:{x:3,y:3}});await p.waitForFunction(()=>scrollY>100);await p.waitForTimeout(250);assert(await p.locator('.depth-arrow').evaluate(e=>e.hidden));
 assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1));console.log(width,returning?'return':'first','PASS 9 hit points, edge click, 2px border');await p.close();
}await b.close();
