import assert from 'node:assert/strict';
import {chromium,firefox,webkit} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const url=new URL('../dist/index.html',import.meta.url).href;
const engines={chromium,firefox,webkit};
const selected=(process.env.TEST_ENGINES||'chromium,firefox,webkit').split(',');
const report=[];
const widths=[390,1440,2560];
for(const name of selected) {
 for(const width of widths) {
  const options={headless:true};
  if(name==='chromium' && process.env.TEST_CHROMIUM_PATH) {
   options.executablePath=process.env.TEST_CHROMIUM_PATH;
   if(process.env.TEST_CHROMIUM_ARGS) options.args=JSON.parse(process.env.TEST_CHROMIUM_ARGS);
  }
  const browser=await engines[name].launch(options);
  try {
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   // Remote integrations cannot determine whether the local page regression passes.
   await page.route('https://**/*',r=>r.abort());
   await page.goto(url); await page.waitForTimeout(100);
   assert(!await page.locator('.intro-shortcuts').isVisible(),'First visit must only offer scrolling');
   const crew=await page.locator('.carbon-owl').evaluate(el=>({width:el.getBoundingClientRect().width,margin:getComputedStyle(el).marginTop}));
   assert.equal(crew.margin,'60px'); assert(crew.width<=400 && crew.width<=width*0.8+1,'Crew size cap');
   assert((await page.locator('#pj-pco .body').allTextContents()).join(' ').includes('Help Scout'),'Student support must be in visible summary');
   assert(!(await page.locator('#pj-pco .story').textContent()).includes('Help Scout'),'Support copy must not repeat in details');
   assert.equal((await page.locator('.carbon-average').textContent()).trim(),'Global average','Benchmark must remain unnumbered');
   await page.evaluate(()=>scrollTo(0,250));await page.waitForTimeout(60);
   await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(60);
   assert(!await page.locator('.intro-shortcuts').isVisible(),'Scroll must not reveal first-visit links');
   await page.reload();await page.waitForTimeout(100);
   assert(await page.locator('.intro-shortcuts').isVisible(),'Returning visit links missing');
   const arrow=await page.locator('.depth-arrow').boundingBox();
   for(const item of await page.locator('.intro-shortcuts a').all()) {
    const box=await item.boundingBox();
    assert(box.x>=0&&box.x+box.width<=width,'Returning link clipped');
    assert(!(box.x<arrow.x+arrow.width&&box.x+box.width>arrow.x&&box.y<arrow.y+arrow.height&&box.y+box.height>arrow.y),'Returning link overlaps arrow');
   }
   await page.evaluate(()=>scrollTo(0,10));
   await page.waitForFunction(()=>parseFloat(document.querySelector('[data-quick-work]').style.transform.slice(11))<0);
   assert(await page.locator('.intro-cv').evaluate(e=>parseFloat(e.style.transform.slice(11)))>0,'Right link must immediately exit right');
   await page.evaluate(()=>scrollTo(0,60));
   await page.waitForFunction(()=>document.querySelector('.intro-shortcuts').hidden);
   await page.evaluate(()=>scrollTo(0,0));
   await page.waitForFunction(()=>!document.querySelector('.intro-shortcuts').hidden);
   assert(await page.locator('.intro-cv').getAttribute('target')==='_blank','CV must open in new tab');
   assert(await page.locator('.intro-cv path').getAttribute('d')==='M11 3h2v10l3.3-3.3 1.4 1.4L12 17l-5.7-5.9 1.4-1.4L11 13V3zM4 17h2v3h12v-3h2v5H4z','CV icon differs');
   await page.locator('[data-quick-work]').click();
   await page.waitForFunction(()=>document.activeElement.id==='projects');
   await page.waitForFunction(()=>!document.querySelector('.project-skip-cover'));
   assert(await page.evaluate(()=>document.activeElement.id)==='projects','Work jump did not move focus');
   const position=await page.locator('#projects').boundingBox();
   assert(position.y>=0 && position.y<100,'Work jump lands behind content');
   await page.locator('#pj-mirror summary').click();
   assert(await page.locator('#pj-mirror details').getAttribute('open')!==null,'Case study cannot open');
   assert((await page.locator('#pj-mirror details').innerText()).includes('fourth character'));
   const stageHeight=await page.locator('.stage').evaluate(e=>e.offsetHeight);
   let reference;
   for(let round=0;round<20;round++) {
    for(const fraction of [0,0.13,0.25,0.4,0.6,0.95,0.6,0.4,0.25,0.13,0]) {
     await page.evaluate(y=>window.scrollTo(0,y),Math.round(stageHeight*fraction));
     await page.waitForTimeout(20);
    }
    await page.waitForFunction(()=>window.scrollY===0 && document.querySelector('.depth-cover')?.style.opacity==='1', null, {timeout:3000});
    const state=await page.evaluate(()=>({
     title:document.querySelector('.depth-title')?.style.transform,
     cover:document.querySelector('.depth-cover')?.style.opacity,
     overflow:document.documentElement.scrollWidth>innerWidth+1,
     shortcuts:document.querySelector('.intro-shortcuts').hidden
    }));
    assert(!state.overflow,'Horizontal overflow after repeated scroll');
    assert(!state.shortcuts,'Quick access does not return at top');
    if(reference) assert.deepEqual(state,reference,'Intro state drifts after repeat scroll');
    reference=state;
   }
   await page.locator('#ai').scrollIntoViewIfNeeded();
   assert((await page.locator('#ai .ai-tools-text').textContent()).includes('Claude and ChatGPT'),'Plain text tool names missing');
   assert.equal(await page.locator('#ai svg').count(),0,'AI logos must be removed');
   assert(await page.locator('#ai .ai-notes p').count()===3,'AI copy count');
   assert(await page.locator('#ai .head').evaluate(e=>Array.from(e.children).every(span=>{const r=document.createRange();r.selectNodeContents(span);const b=r.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth;})),'AI heading clips');
   assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'AI layout overflows');
   if(process.env.QA_SCREENSHOTS) {
    mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});
    await page.screenshot({path:`${process.env.QA_SCREENSHOTS}/${name}-${width}-ai.png`});
    await page.locator('#pj-mirror').scrollIntoViewIfNeeded();
    await page.screenshot({path:`${process.env.QA_SCREENSHOTS}/${name}-${width}-case.png`});
    await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(60);
    await page.screenshot({path:`${process.env.QA_SCREENSHOTS}/${name}-${width}-start.png`});
   }
   assert.deepEqual(errors,[],'Browser JavaScript errors');
   report.push({engine:name,width,scrollCycles:20,result:'PASS'});
   console.log(`${name} ${width}px: PASS (first/return visits, fade jump, 20 cycles, layout)`);
  } finally {await browser.close();}
 }
 for(const mode of ['no-js','reduced-motion','blocked-storage']) {
  const options={headless:true};
  if(name==='chromium'&&process.env.TEST_CHROMIUM_PATH){options.executablePath=process.env.TEST_CHROMIUM_PATH;if(process.env.TEST_CHROMIUM_ARGS)options.args=JSON.parse(process.env.TEST_CHROMIUM_ARGS);}
  const browser=await engines[name].launch(options);
  try {
   const page=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced-motion'?'reduce':'no-preference'});
   if(mode==='blocked-storage') await page.addInitScript(()=>{Storage.prototype.getItem=function(){throw new Error('blocked');};Storage.prototype.setItem=function(){throw new Error('blocked');};});
   await page.route('https://**/*',r=>r.abort());await page.goto(url);
   assert(!await page.locator('[data-quick-work]').isVisible(),'Initial shortcuts must be hidden');
   if(mode==='reduced-motion') {
    await page.reload();assert(await page.locator('[data-quick-work]').isVisible());
    await page.locator('[data-quick-work]').click();
    assert(await page.evaluate(()=>document.activeElement.id)==='projects');
    assert(await page.locator('.project-skip-cover').count()===0,'Reduced motion must skip the fade');
   }
   await page.locator('#ai').scrollIntoViewIfNeeded();assert(await page.locator('#ai .ai-notes').isVisible());
   assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1));
   report.push({engine:name,mode,result:'PASS'});console.log(`${name} ${mode}: PASS`);
  }finally{await browser.close();}
 }
}
if(process.env.QA_REPORT)writeFileSync(process.env.QA_REPORT,JSON.stringify(report,null,2));
