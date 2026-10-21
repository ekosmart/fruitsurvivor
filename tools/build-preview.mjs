import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const game=fs.readFileSync(path.join(root,'Pirate Fruite Adventure V3_1.html'),'utf8');
const art=game.match(/<script id="pirate-art-data"[^>]*>([\s\S]*?)<\/script>/)[1];
const hero=game.match(/<script id="pirate-hero-data"[^>]*>([\s\S]*?)<\/script>/)[1];
const pack=JSON.parse(art);
const runtime=fs.readFileSync(path.join(root,'tools/art-runtime.js'),'utf8');
const options=pack.islands.map(a=>`<option value="${a.id}">${String(a.id+1).padStart(2,'0')} · ${a.name}</option>`).join('');
const html=`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pirate Fruit — Art Preview</title><style>
*{box-sizing:border-box}body{margin:0;background:#101e2b;color:#f1e5ce;font:15px system-ui,sans-serif}
header{padding:28px 36px 20px;border-bottom:1px solid #34414d;display:flex;align-items:center;justify-content:space-between;gap:20px}
.eyebrow{color:#dfb979;font-size:11px;letter-spacing:3px;font-weight:700}h1{font:700 28px Georgia,serif;margin:9px 0 0}header a{color:#f4ddac;text-decoration:none;padding:12px 18px;border:1px solid #7a6a4c;border-radius:8px}
main{display:grid;grid-template-columns:260px minmax(0,1fr);gap:28px;padding:28px 36px}
aside{background:#1b2c3b;border:1px solid #354652;border-radius:14px;overflow:hidden}.portrait{height:290px;padding:20px 26px;background:radial-gradient(ellipse,#3c4b52,#172835)}
.portrait img{width:100%;height:100%;object-fit:contain}aside section{padding:20px}h2{font:700 22px Georgia,serif;margin:0 0 10px}p{color:#a6b9c3;line-height:1.6;margin:8px 0}.chip{color:#e6c78d;font-size:11px;border:1px solid #776c53;padding:5px 9px;border-radius:20px;display:inline-block;margin-bottom:8px}
.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px}select,button{font:inherit;color:#eee1c8;background:#233847;border:1px solid #4b6170;border-radius:8px;padding:10px 14px}select{flex:1;min-width:210px}button{cursor:pointer}button[aria-pressed="true"]{background:#d6b477;color:#1c2936;border-color:#d6b477}
.scene{border:1px solid #576d72;border-radius:14px;overflow:hidden;position:relative;background:#7d9b80}canvas{display:block;width:100%;aspect-ratio:16/10}.caption{display:flex;justify-content:space-between;gap:12px;margin-top:12px;color:#9eb4c1;font-size:12px}
#status{color:#9ebfad}.legend{display:flex;gap:20px;margin-top:20px;flex-wrap:wrap}.legend span{font-size:11px;color:#b3c6cc;letter-spacing:1px}
footer{padding:0 36px 25px;color:#879eac;font-size:12px}@media(max-width:900px){main{grid-template-columns:1fr;padding:20px}aside{display:flex}.portrait{width:180px;height:200px;flex-shrink:0}header{padding:20px}h1{font-size:23px}.caption{flex-direction:column}}
</style></head><body><header><div><div class="eyebrow">PIRATE FRUIT ADVENTURE / ART EDITION</div><h1>The Grand Archipelago</h1></div><a href="Pirate%20Fruite%20Adventure%20V3_1.html">Mainkan game ↗</a></header>
<main><aside><div class="portrait"><img id="portrait" alt="Kapten bajak laut chibi dengan mantel merah dan topi navy"></div><section><span class="chip">KARAKTER UTAMA</span><h2>The Captain</h2><p>Sprite GPT dengan animasi idle dan berjalan. Mantel merah, selempang teal, dan pedang melengkung.</p><p>29 pulau<br>87 sprite musuh vektor<br>8 frame karakter</p></section></aside>
<section><div class="toolbar"><label for="island">Pulau</label><select id="island">${options}</select><button id="previous" aria-label="Pulau sebelumnya">←</button><button id="next" aria-label="Pulau berikutnya">→</button><button id="idle" aria-pressed="true">Idle</button><button id="walk" aria-pressed="false">Jalan</button></div>
<div class="scene"><canvas id="preview" width="1600" height="1000" aria-label="Preview background pulau, karakter utama, musuh normal, elite, dan boss"></canvas></div>
<div class="caption"><span id="caption">Pulau Pemula</span><span id="status">Memeriksa aset…</span></div><div class="legend"><span>01 / CAPTAIN</span><span>02 / NORMAL</span><span>03 / ELITE</span><span>04 / BOSS</span></div>
</section></main><footer>Artwork terpasang langsung di HTML game · Preview memakai renderer yang sama dengan game · Semua aset tersedia offline</footer>
<script id="pirate-art-data" type="application/json">${art}</script><script id="pirate-hero-data" type="application/json">${hero}</script><script>${runtime}</script>
<script>
const art=JSON.parse(document.getElementById('pirate-art-data').textContent);
const hero=JSON.parse(document.getElementById('pirate-hero-data').textContent);
document.getElementById('portrait').src=hero.base;
const canvas=document.getElementById('preview'),ctx=canvas.getContext('2d');
const select=document.getElementById('island');
let walking=false,index=0,last=performance.now(),elapsed=0;
const captain={x:425,y:550,radius:32,angle:0,lastAttack:0};
const mobs=[{x:700,y:550,radius:27},{x:955,y:550,radius:30,isElite:true},{x:1210,y:550,radius:38,isBoss:true}];
function change(value){index=(Number(value)+29)%29;select.value=String(index);document.getElementById('caption').textContent=art.islands[index].name+' / '+art.islands[index].theme;}
select.addEventListener('change',()=>change(select.value));
document.getElementById('next').onclick=()=>change(index+1);
document.getElementById('previous').onclick=()=>change(index-1);
function setMotion(v){walking=v;document.getElementById('idle').setAttribute('aria-pressed',String(!v));document.getElementById('walk').setAttribute('aria-pressed',String(v));}
document.getElementById('idle').onclick=()=>setMotion(false);document.getElementById('walk').onclick=()=>setMotion(true);
function loop(now){
const dt=Math.min(now-last,50);last=now;elapsed+=dt;
PirateArt.tick(false);PirateArt.drawBackground(ctx,index,1600,1000);
captain.x=walking?425+Math.sin(elapsed/850)*40:425;
captain.angle=walking&&Math.cos(elapsed/850)<0?Math.PI:0;
ctx.save();ctx.translate(captain.x,captain.y);PirateArt.drawHero(ctx,captain);ctx.restore();
for(const m of mobs){m.islandType=index;ctx.save();ctx.translate(m.x,m.y);PirateArt.drawEnemy(ctx,m);ctx.restore();}
ctx.textAlign='center';ctx.font='600 18px system-ui';ctx.fillStyle=['void','verth','lightning'].includes(art.islands[index].theme)?'#e4d7ef':'#263f49';
for(const [x,label] of [[425,'CAPTAIN'],[700,'NORMAL'],[955,'ELITE'],[1210,'BOSS']])ctx.fillText(label,x,620);
requestAnimationFrame(loop);}
requestAnimationFrame(loop);
const sources=art.islands.flatMap(a=>[a.background,...Object.values(a.enemies)]).concat(hero.atlas||hero.base);
Promise.all(sources.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=reject;im.src=src;}))).then(()=>{document.getElementById('status').textContent=sources.length+' aset siap · tidak ada gambar gagal';}).catch(()=>{document.getElementById('status').textContent='Ada aset yang gagal dimuat';});
</script></body></html>`;
fs.writeFileSync(path.join(root,'Art Preview.html'),html);
console.log('Built offline Art Preview.html using the live game renderer.');
