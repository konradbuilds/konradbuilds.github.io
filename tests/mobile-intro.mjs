import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({...(process.env.TEST_CHROMIUM_PATH?{executablePath:process.env.TEST_CHROMIUM_PATH}:{}),args:JSON.parse(process.env.TEST_CHROMIUM_ARGS||'[]')});
const results=[];
try {
 const cases = [{version:'3.3.18',url:new URL('../dist/index.html',import.meta.url).href}];
 if(process.env.TEST_BASELINE_HTML) { cases.unshift({version:'3.3.05',url:new URL('file://' + process.env.TEST_BASELINE_HTML).href}); }
 for (const {version,url} of cases) {
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.addInitScript(()=>{
   window.testVisibleHeight=760;
   Object.defineProperty(window,'innerHeight',{get:()=>window.testVisibleHeight,configurable:true});
   localStorage.setItem('konrad-portfolio-visited','1');
  });
  await page.route('https://**/*',r=>r.abort());
  await page.goto(url);
  await page.waitForTimeout(200);
  const nav=await page.locator('.intro-shortcuts').boundingBox();
  if(version==='3.3.06') {
   assert(nav.y+nav.height<=700.1,'Returning links must clear visible browser controls by 60px');
   await page.screenshot({path:new URL('../docs/mobile-start.png',import.meta.url).pathname});
  }
  await page.evaluate(()=>scrollTo(0,300));await page.waitForTimeout(300);
  const snapshot=()=>page.evaluate(()=>({matrix:document.querySelector('.depth-vector g').getAttribute('transform'),title:document.querySelector('.depth-title').style.transform,viewBox:document.querySelector('.depth-vector').getAttribute('viewBox'),scroll:scrollY}));
  const before=await snapshot();
  // Simulate browser chrome collapsing: visible height changes, CSS 100vh does not.
  await page.evaluate(()=>{window.testVisibleHeight=844;dispatchEvent(new Event('resize'));});
  await page.waitForTimeout(250);const after=await snapshot();
  if(version==='3.3.06') {
   assert.deepEqual(after,before,'Address-bar height must not change the zoom');
   assert((await page.locator('.hero-bird').boundingBox()).y+(await page.locator('.hero-bird').boundingBox()).height<0,'Top bird fully retracts');
   await page.evaluate(()=>scrollTo(0,20));await page.waitForTimeout(120);
   const angle=await page.locator('.opening-identity').evaluate(e=>parseFloat(e.style.getPropertyValue('--blob-angle')));
   assert(angle < 0 && angle > -5,'Restored bubble should bend gently at 20px');
   await page.setViewportSize({width:844,height:390});await page.waitForTimeout(200);
   assert((await snapshot()).viewBox.startsWith('0 0 844 '),'Orientation must still remeasure width');
   assert(!await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1));
   await page.locator('.more-toggle').evaluate(e=>e.open=true);
   assert.equal(await page.locator('#pj-pco p.body').count(),2);
   assert((await page.locator('#pj-pco p.body').nth(1).textContent()).includes('Help Scout'));
   assert.equal(await page.locator('#projects .chips,.more-grid .chips').count(),8);
  }else { assert.notEqual(before.matrix,after.matrix,'Control must reproduce the old bounce'); }
  results.push({version,addressBarChangesZoom:before.matrix!==after.matrix,linkBottom:nav.y+nav.height});await page.close();
 }
 writeFileSync(new URL('../docs/mobile-intro-tests.json',import.meta.url),JSON.stringify({browser:browser.version(),results,method:'Visible-height simulation with unchanged CSS layout height; not a physical Android test.'},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
