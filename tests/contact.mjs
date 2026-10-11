import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({...(process.env.TEST_CHROMIUM_PATH?{executablePath:process.env.TEST_CHROMIUM_PATH}:{}),args:JSON.parse(process.env.TEST_CHROMIUM_ARGS||'[]')});
const results=[];
try {
 for(const width of [390,1440,2560]) {
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.abort());
  await page.goto(new URL('../dist/index.html',import.meta.url).href);
  const bird=page.locator('.contact-bird'), email=page.locator('#contact input'), message=page.locator('#contact textarea');
  const state=()=>bird.getAttribute('data-bird-state');
  const waitState=name=>page.waitForFunction(name=>document.querySelector('.contact-bird').getAttribute('data-bird-state')===name,name);
  await page.locator('#contact').scrollIntoViewIfNeeded();await email.focus();await waitState('looking');
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1));
  await page.evaluate(()=>{window.birdMutations=0;new MutationObserver(records=>window.birdMutations+=records.length).observe(document.querySelector('.contact-bird'),{attributes:true,subtree:true});});
  await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.birdMutations),0,'Bird must do no idle rendering');
  await message.focus();assert.equal(await state(),'looking');
  await page.mouse.move(0,0);await message.evaluate(e=>e.blur());await waitState('parked');
  await email.fill('test@example.com');await message.fill('No real message is sent.');
  let calls=0;
  await page.route('https://formspree.io/f/mkjwvbqa',async r=>{calls++;await r.fulfill({status:200,contentType:'application/json',body:'{}'});});
  await page.locator('#contact button').click();await waitState('celebrating');
  await page.waitForTimeout(700);
  const wink=await page.locator('.chat-eye-near-outline').getAttribute('d');
  assert(wink.includes('144'),'Near eye should close completely');
  await waitState('parked');assert.equal(calls,1);assert.equal(await email.inputValue(),'');
  assert((await page.locator('.contact-status').textContent()).includes('has been sent'));
  await page.evaluate(()=>window.birdMutations=0);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.birdMutations),0,'Celebration must finish');
  await email.fill('test@example.com');await message.fill('Preserve this draft.');
  await page.route('https://formspree.io/f/mkjwvbqa',r=>r.fulfill({status:500,body:'{}'}));
  await page.locator('#contact button').click();await page.waitForFunction(()=>document.querySelector('.contact-status').textContent.includes('Could not send'));
  assert.equal(await message.inputValue(),'Preserve this draft.');assert.notEqual(await state(),'celebrating');
  // Rapid enter/exit during a movement must cancel the old frame chain.
  for(let i=0;i<20;i++) {
   await email.focus();await page.waitForTimeout(25);await email.evaluate(e=>e.blur());
   await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(35);await waitState('parked');
   assert(!await bird.evaluate(e=>e.classList.contains('is-visible')));
   await page.locator('#contact').scrollIntoViewIfNeeded();
  }
  await email.focus();await page.emulateMedia({reducedMotion:'reduce'});await waitState('looking');
  await page.evaluate(()=>window.birdMutations=0);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.birdMutations),0);
  assert.deepEqual(errors,[]);results.push({width,cycles:20,zeroIdleMutations:true,success:true,failure:true,reducedMotion:true,errors});
  await page.close();
 }
 writeFileSync(new URL('../docs/contact-tests.json',import.meta.url),JSON.stringify({browser:browser.version(),results},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
