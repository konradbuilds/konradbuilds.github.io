import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch({...(process.env.TEST_CHROMIUM_PATH?{executablePath:process.env.TEST_CHROMIUM_PATH}:{}),args:JSON.parse(process.env.TEST_CHROMIUM_ARGS||'[]')});
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),results=[];
try {
 for(const width of [360,390,412]) {
  const context=await browser.newContext({viewport:{width,height:823},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  await page.addInitScript(()=>{window.startupShifts=[];new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)startupShifts.push({value:e.value,nodes:e.sources.map(s=>s.node?.className)});}).observe({type:'layout-shift',buffered:true});});
  await page.route('https://**/*',r=>r.request().url()==='https://portfolio.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
  const client=await context.newCDPSession(page);await client.send('Emulation.setCPUThrottlingRate',{rate:6});
  await page.goto('https://portfolio.test/');await page.waitForTimeout(2500);
  assert(await page.locator('.opening-identity').isVisible(),'Aligned identity must be visible');
  const shifts=await page.evaluate(()=>startupShifts);assert.equal(shifts.reduce((sum,s)=>sum+s.value,0),0,'No startup layout shifts');
  results.push({width,cpuSlowdown:6,cls:0});await context.close();
 }
 for(const setting of [{javaScriptEnabled:false},{reducedMotion:'reduce'}]) {
  const page=await browser.newPage({viewport:{width:390,height:823},...setting});
  await page.route('https://**/*',r=>r.request().url()==='https://portfolio.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
  await page.goto('https://portfolio.test/');assert(await page.locator('.opening-identity').isVisible());await page.close();
 }
 writeFileSync(new URL('../docs/startup-tests.json',import.meta.url),JSON.stringify({browser:browser.version(),results,noJavaScript:true,reducedMotion:true},null,2));
 console.log(JSON.stringify(results));
}finally{await browser.close();}
