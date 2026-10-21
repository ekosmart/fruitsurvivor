import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import './build-game.mjs';
import './make-icons.mjs';

const output = path.resolve('dist');
fs.mkdirSync(output, {recursive:true});
fs.cpSync('pwa/icons', path.join(output, 'icons'), {recursive:true});
fs.copyFileSync('pwa/manifest.webmanifest', path.join(output, 'manifest.webmanifest'));
fs.copyFileSync('pwa/register.js', path.join(output, 'register.js'));
const tags = `<meta name="theme-color" content="#0b1c29">
<meta name="description" content="Jelajahi 29 pulau dan temukan kekuatan buah iblis. Game petualangan offline.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Pirate Fruit">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" type="image/png" href="/icons/icon-192.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`;
let html = fs.readFileSync('Pirate Fruite Adventure V3_1.html', 'utf8');
html = html.replace('</head>', tags + '\n</head>');
html = html.replace('<div class="menu-footnote">', '<button id="installButton" class="primary-button" style="margin-top:14px" hidden>Pasang game</button><p id="pwaStatus" role="status" style="font-size:11px;max-width:400px;color:#94acb6">Menyiapkan mode offline…</p><div class="menu-footnote">');
html = html.replace('</body>', '<script src="/register.js" defer></script>\n</body>');
fs.writeFileSync(path.join(output, 'index.html'), html);
const files = ['/index.html', '/register.js', '/manifest.webmanifest', ...fs.readdirSync('pwa/icons').sort().map(f=>'/icons/'+f)];
const hash = crypto.createHash('sha256');
for (const file of files) hash.update(file).update(fs.readFileSync(path.join(output,file)));
const template = fs.readFileSync('pwa/sw.js', 'utf8');
hash.update(template);
const version = hash.digest('hex').slice(0,16);
fs.writeFileSync(path.join(output,'sw.js'),template.replace('@@VERSION@@',version).replace('@@FILES@@',JSON.stringify(files)));
console.log(`PWA ${version} built in dist (${files.length} offline resources).`);
