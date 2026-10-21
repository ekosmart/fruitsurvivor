// Exercise actual game code in a browser-like VM, including every art variant.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'Pirate Fruite Adventure V3_1.html'),'utf8');
const blocks=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
const json={};
for(const [,attrs,body] of blocks) if(attrs.includes('application/json'))
    json[attrs.match(/id="([^"]+)"/)[1]]=body;
const calls={images:0,frames:0,raf:0};
const ctx=new Proxy({
    createLinearGradient:()=>({addColorStop(){}}),
    createRadialGradient:()=>({addColorStop(){}}),
    measureText:text=>({width:String(text).length*7}),
    drawImage:(...args)=>{
        calls.images++;
        for(const n of args.slice(1)) assert.ok(Number.isFinite(n),`Non-finite image coordinate: ${n}`);
        if(args.length===9) {
            calls.frames++;
            const [img,x,y,w,h]=args;
            assert.ok(x>=0&&y>=0&&w>0&&h>0);
            if(img.src.includes('image/png')) assert.ok(x+w<=768&&y+h<=384,'Atlas rectangle out of bounds');
        }
    },
}, {get:(o,k)=>k in o?o[k]:()=>{}});
const elements=new Map();
function element(id='') {
    if(elements.has(id)) return elements.get(id);
    const e={style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}},
        hidden:true,setAttribute(){},replaceChildren(){},setPointerCapture(){},handlers:{},children:[],innerHTML:'',textContent:json[id]||'',value:'',width:1366,height:768,
        appendChild(c){this.children.push(c);return c;},append(){},remove(){},addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)},
        querySelector:()=>element(),querySelectorAll:()=>[],getContext:()=>ctx,
        getBoundingClientRect:()=>({left:0,top:0,width:1366,height:768})};
    elements.set(id,e);return e;
}
let now=1000;
const windowHandlers={};
const sandbox={
    handlers:windowHandlers,console,Math,JSON,Date,HTMLInputElement:class{},HTMLTextAreaElement:class{},Map,Set,WeakMap,Promise,Number,String,Object,Array,
    Image:class{complete=true;naturalWidth=768;naturalHeight=384;src='';},
    document:{handlers:{},getElementById:element,createElement:()=>element(Math.random().toString()),querySelector:()=>element(),querySelectorAll:()=>[],body:element('body'),handlers:{},addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)}},
    performance:{now:()=>now},innerWidth:1366,innerHeight:768,
    addEventListener(type,fn){(windowHandlers[type]??=[]).push(fn)},setTimeout:()=>0,setInterval:()=>0,clearTimeout(){},clearInterval(){},
    requestAnimationFrame:()=>{calls.raf++;},cancelAnimationFrame(){},alert(){},confirm:()=>false,
    localStorage:{getItem:()=>null,setItem(){},removeItem(){}},
};
sandbox.window=sandbox;
const context=vm.createContext(sandbox);
let parsed=0;
for(const [,attrs,body] of blocks) if(!attrs.includes('application/json')) {
    new vm.Script(body).runInContext(context);
    parsed++;
}
const run=s=>vm.runInContext(s,context);
assert.equal(run('gameState.islands.length'),29);
assert.equal(run('PirateArt.islandCount'),29);
assert.equal(run('player.hp'),100);
const baseline=run('JSON.stringify({damage:player.damage,speed:player.speed,radius:player.radius})');
run(`gameState.paused=true;
for(let i=0;i<29;i++){
    gameState.currentIsland=i;
    drawBackground();
    new Enemy(400,300,i).draw();
    const elite=new Enemy(500,300,i);elite.isElite=true;elite.draw();
    new Boss(600,300,i).draw();
    new LavaEnemy(700,300,i).draw();
}
gameState.currentIsland=0;
player.draw();
player.x+=4; PirateArt.tick(false);player.draw();
player.angle=Math.PI;player.x-=4;PirateArt.tick(false);player.draw();
player.isDragon=true;player.draw();player.isDragon=false;
player.isZoan=true;player.draw();player.isZoan=false;
for(const [w,h] of [[1600,1200],[3840,2160],[800,600]]){
    GAME_WIDTH=w;GAME_HEIGHT=h;drawBackground();
}
player.changeIsland(7);player.draw();drawBackground();
player.changeIsland(28);player.draw();drawBackground();`);
assert.equal(run('JSON.stringify({damage:player.damage,speed:player.speed,radius:player.radius})'),baseline,'Art changed gameplay stats');
assert.ok(calls.images>140);
assert.ok(calls.frames>0,'The game must use the animated atlas, not a static fallback');
assert.equal(run('gameState.paused'),true);
run('Voyage.start()');
assert.equal(run('gameState.paused'),false,'Starting must unpause');
assert.equal(run('Voyage.castBasic()'),true);
assert.equal(run('Voyage.castBasic()'),false,'Basic attack cooldown blocks spam');
for(let i=0;i<10;i++){now+=50;run('Voyage.tick()');}
assert.equal(run('Voyage.castBasic()'),true,'Basic cooldown expires');
assert.equal(run('Voyage.castUltimate()'),true);
assert.equal(run('Voyage.castUltimate()'),false,'Ultimate cooldown blocks spam');
run("player.fruit='ICE'");
assert.equal(run('Voyage.castUltimate()'),false,'Changing fruit must not bypass cooldown');
const clockBefore=run('Voyage.clock');run('Voyage.menu()');now+=5000;run('Voyage.tick()');
assert.equal(run('Voyage.clock'),clockBefore,'Cooldown pauses with menu');
assert.equal(run('Voyage.castBasic()'),false,'Menu blocks combat');
const hpBefore=run('player.hp');run('player.takeDamage(20)');assert.equal(run('player.hp'),hpBefore,'Paused damage blocked');
run('Voyage.start()');
const event=(id,type,values={})=>{const e=element(id);for(const fn of e.handlers[type]||[])fn({preventDefault(){},currentTarget:e,pointerType:'touch',...values});};
event('joystick','pointerdown',{pointerId:1,clientX:1366,clientY:384});
event('attackButton','pointerdown',{pointerId:2});
assert.equal(run('Voyage.input.stickId'),1);assert.equal(run('Voyage.input.attackId'),2);
assert.ok(run('Voyage.input.x')>.9,'Joystick produces direction');
event('attackButton','pointercancel',{pointerId:2});assert.equal(run('Voyage.input.attackHeld'),false);
assert.equal(run('Voyage.input.stickId'),1,'Attack release does not reset joystick');
event('joystick','lostpointercapture',{pointerId:1});assert.equal(run('Voyage.input.x'),0);
run('player.x=500;player.y=500;keys.KeyD=true;keys.KeyS=true;Voyage.movePlayer(player)');
assert.ok(run('Math.hypot(player.x-500,player.y-500)')<=run('player.speed*3.01'),'Diagonal speed normalized');
run('Voyage.clearInput()');assert.equal(run('keys.KeyD'),false);
assert.ok(!/Key[TZXCV]/.test(blocks.filter(b=>!b[1].includes("application/json")).map(b=>b[2]).join("")),'Legacy skill keybindings removed');
const fruitCount=run('Object.keys(FRUITS).length');
assert.equal(run('new Set(Object.keys(FRUITS).map(k=>FruitArt.uri(k))).size'),fruitCount,'Every fruit has distinct SVG');
run('for(const k of Object.keys(FRUITS)){ReworkedUltimates.cancel(player);player.fruit=k;player._ultimateReadyAt=0;if(!Voyage.castUltimate())throw new Error(k);FruitArt.draw(ctx,k,100,100,46,true);Voyage.drawUltimateEffects(ctx)}');
for(let i=0;i<20;i++){now+=16;run('gameLoop()');}
console.log('Controls: basic/ultimate cooldowns, pause, fruit-swap protection, multi-pointer release, movement, '+fruitCount+' fruit ultimates passed.');
const result={ok:true,parsedScripts:parsed,islands:29,enemyRenderVariants:116,
    imageDraws:calls.images,animatedFrameDraws:calls.frames,resizeSizes:3,
    legacyRendererForms:['normal','dragon','zoan'],transitions:[7,28],
    fruits:fruitCount,controls:['basic cooldown','ultimate cooldown','fruit swap cooldown protection','pause freezes cooldown','paused damage blocked','independent multi-touch release','normalized movement','all fruit ultimates'],
    browserVisualQA:'Not performed: local file URL blocked by browser policy',
    note:'VM smoke test checks renderer integration and finite atlas rectangles; visual browser QA is separate.'};
fs.mkdirSync(path.join(root,'qa'),{recursive:true});
fs.writeFileSync(path.join(root,'qa','integration-check.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));

export {run};
export function advance(ms){now+=ms;run('Voyage.tick()');}

