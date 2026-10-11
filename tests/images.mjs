import { chromium, firefox, webkit } from 'playwright';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '');
const html = readFileSync(root + '/dist/index.html', 'utf8');
const results = [];
for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
 const options = { headless: true };
 if (name === 'chromium' && process.env.TEST_CHROMIUM_PATH) {
  options.executablePath = process.env.TEST_CHROMIUM_PATH;
  if (process.env.TEST_CHROMIUM_ARGS) options.args = JSON.parse(process.env.TEST_CHROMIUM_ARGS);
 }
 const browser = await engine.launch(options);
 for (const jpegOnly of [false, true]) {
  for (const width of [390, 1440, 2560]) {
   const page = await browser.newPage({ viewport: { width, height: 900 } });
   const errors = [];
   page.on('pageerror', error => errors.push(error.message));
   const requests = [];
   await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'portfolio.test') {
     return route.fulfill({ contentType: 'text/html', body: jpegOnly ? html.replaceAll('type="image/webp"', 'type="image/x-unsupported"') : html });
    }
    if (url.hostname === 'konradbuilds.github.io' && url.pathname.startsWith('/assets/img/')) {
     const path = root + url.pathname;
     if (existsSync(path)) {
      requests.push(url.pathname);
      return route.fulfill({ contentType: path.endsWith('.jpg') ? 'image/jpeg' : 'image/webp', body: readFileSync(path) });
     }
    }
    return route.abort();
   });
   await page.goto('https://portfolio.test/');
   await page.locator('picture img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
   await page.waitForFunction(() => Array.from(document.querySelectorAll('picture img')).length === 10 && Array.from(document.querySelectorAll('picture img')).every(image => image.complete && image.naturalWidth > 0));
   const images = await page.locator('picture img').evaluateAll(images => images.map(image => ({ src: image.currentSrc, alt: image.getAttribute('alt'), width: image.getAttribute('width'), height: image.getAttribute('height') })));
   assert(images.every(image => image.src.endsWith(jpegOnly ? '.jpg' : '.webp')));
   assert(images.every(image => typeof image.alt === 'string' && image.width && image.height));
   assert(requests.every(path => path.endsWith(jpegOnly ? '.jpg' : '.webp')), 'Both formats requested');
   await page.locator('#pj-pco').scrollIntoViewIfNeeded();
   assert(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth));
   assert.deepEqual(errors, []);
   // Images are verified by decoding and source selection; screenshots are optional in local QA.
   results.push({ engine: name, width, format: jpegOnly ? 'JPEG fallback (unsupported source type)' : 'WebP', images: 10, result: 'PASS' });
   console.log(name, width, jpegOnly ? 'JPEG' : 'WebP', '10 decoded images, one selected format, layout PASS');
   await page.close();
  }
 }
 await browser.close();
}
writeFileSync(root + '/docs/image-tests.json', JSON.stringify(results, null, 2) + '\n');
