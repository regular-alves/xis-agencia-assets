const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const dir = process.argv[2]; const mode = process.argv[3] || 'stills';
(async () => {
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace('__QR__', fs.readFileSync(path.join(dir, 'qr.json'), 'utf8'));
  fs.writeFileSync(path.join(dir, 'build.html'), html);
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => console.error('PAGEERR', e.message));
  await pg.goto('file://' + path.join(dir, 'build.html'));
  await pg.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(()=>{}))); });
  await pg.evaluate(() => window.ready); await pg.waitForTimeout(800);
  const D = await pg.evaluate(() => window.DURATION);
  if (mode === 'stills') {
    const ts = (process.argv[4] || '1,3,6,10,12.8,14.5,16.5,17.2,20.5,22,24.8,28').split(',').map(Number);
    for (const t of ts) { await pg.evaluate(t => render(t), t); await pg.screenshot({ path: path.join(dir, `still-${t}.jpg`), type: 'jpeg', quality: 80 }); }
  } else {
    const fps = 30, n = Math.round(D * fps);
    const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', path.join(dir, 'out.mp4')], { stdio: ['pipe', 'ignore', 'inherit'] });
    for (let i = 0; i < n; i++) {
      await pg.evaluate(t => render(t), i / fps);
      const buf = await pg.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 90 === 0) console.log('frame', i, '/', n);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
