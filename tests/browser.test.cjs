// Optional UI checks: npm install --no-save playwright && npx playwright install chromium
// CHROMIUM_PATH can select an existing Chromium executable. No user browser is used.
const {chromium}=require('playwright');
const {createServer}=require('node:http');
const {readFile}=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
(async()=>{
 const server=createServer(async(req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const filename=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{const body=await readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'text/plain'});res.end(body);}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:')&&!r.url().startsWith('blob:'))external.push(r.url());});
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  assert.equal(await page.locator('tbody tr').count(),12);
  assert.match(await page.locator('#metrics').innerText(),/\$350k/);
  await page.locator('#owner').selectOption('Avery');assert.equal(await page.locator('tbody tr').count(),4);
  await page.locator('#search').fill('no matches');assert.match(await page.locator('#pipeline-content').innerText(),/No opportunities/);assert.equal(await page.locator('#export').isDisabled(),true);
  await page.locator('#clear').click();await page.locator('#period').selectOption('week');assert.equal(await page.locator('tbody tr').count(),3);
  await page.locator('#clear').click();await page.locator('#card-view').click();assert.equal(await page.locator('.opportunity-card').count(),12);await page.locator('#table-view').click();
  await page.locator('#pipeline [data-open="D01"]').click();await page.locator('#detail-next').fill('Unsaved edit');await page.locator('#cancel-detail').click();await page.locator('#pipeline [data-open="D01"]').click();assert.equal(await page.locator('#detail-next').inputValue(),'Confirm evaluation criteria');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#detail').isVisible(),false);
  await page.locator('#pipeline [data-open="D01"]').click();await page.locator('#detail-next').fill('');await page.locator('#detail-form button[type="submit"]').click();assert.match(await page.locator('#detail-error').innerText(),/both/);
  await page.locator('#detail-next').fill('<img src=x onerror=alert(1)>');await page.locator('#detail-due').fill('2026-11-06');await page.locator('#detail-form button[type="submit"]').click();assert.equal(await page.locator('#pipeline img').count(),0);assert.match(await page.locator('#pipeline').innerText(),/<img src=x/);
  assert.match(await page.locator('#activity-feed').innerText(),/Updated the demo follow-up plan/);
  await page.locator('#pipeline [data-open="D01"]').click();await page.locator('#detail-stage').selectOption('Won');assert.equal(await page.locator('#detail-next').isDisabled(),true);await page.locator('#detail-form button[type="submit"]').click();assert.match(await page.locator('#metrics').innerText(),/\$308k/);
  const download=page.waitForEvent('download');await page.locator('#export').click();assert.equal((await download).suggestedFilename(),'synthetic-sales-pipeline.csv');
  await page.locator('#reset').click();await page.locator('#cancel-reset').click();assert.match(await page.locator('#metrics').innerText(),/\$308k/);
  await page.locator('#reset').click();await page.locator('#confirm-reset').click();assert.match(await page.locator('#metrics').innerText(),/\$350k/);
  await page.locator('#activity-period').selectOption('week');assert.match(await page.locator('.activity-summary').innerText(),/7 demo activities/);
  await page.reload();assert.equal(await page.locator('tbody tr').count(),12);assert.equal(await page.evaluate(()=>localStorage.length),0);
  await page.locator('#reset').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#reset-dialog').isVisible(),false);
  for(const width of [1440,1024,768,390,320]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);}
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('PASS: filters, empty state, list/cards, cancel/Escape, validation, safe text, edits, metrics, activity, CSV, reset, refresh, 5 viewport widths, no external requests or page errors.');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
