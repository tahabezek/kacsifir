// Bir motor sayfasının ekran görüntüsü (poz kâğıtları vb.):  node tools/snap.mjs engine/yol_sheet.html out.png [w h]
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
import { findChrome, staticServer } from './render.mjs';
const [page0, out, w = '1600', h = '1200'] = process.argv.slice(2);
const srv = await staticServer();
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('sayfa hatası:', e.message));
await page.goto(`http://127.0.0.1:${srv.address().port}/${page0}`);
await page.waitForFunction('window.__ready === true', { timeout: 30000 });
fs.writeFileSync(out, await page.screenshot({ type: 'png' }));
await browser.close(); srv.close();
console.log('→', out);
