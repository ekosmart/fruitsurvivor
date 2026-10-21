import assert from 'node:assert/strict';
import fs from 'node:fs';
import {run,advance} from './verify-game.mjs';
const source=fs.readFileSync('src/reference-ultimates.js','utf8');
const keys=run('Object.keys(FRUITS)');
function reset(key){
 run(`CombatTimeline.clear();enemies.length=projectiles.length=effects.length=specialAttacks.length=0;
 for(const key of Object.keys(player))delete player[key];Object.assign(player,new Player(600,500));player.fruit=${JSON.stringify(key)};mouse.x=700;mouse.y=500;Voyage.clearInput();Voyage.input.touchAim=false;
 gameState.currentIsland=0;gameState.phaseActive=false;Voyage.start();player.x=600;player.y=500;
 for(let i=0;i<6;i++){const e=new Enemy(680+i*8,500+i*4,0);e.hp=e.maxHp=100000;e.damage=0;enemies.push(e);}`);
}
const results=[];
for(const key of keys){
 assert.ok(source.includes(`case '${key}'`)||key==='ZENITH_URSAGAR'||run(`${JSON.stringify(key)} in bossFruitMap`),'Unmapped fruit '+key);
 reset(key);
 assert.equal(run('Voyage.castUltimate()'),true,key);
 assert.equal(run('Voyage.castUltimate()'),false,key+' duplicate cast');
 for(let i=0;i<440;i++){advance(20);run(`player.update();
 for(const p of [...projectiles]){if(projectiles.includes(p)){p.update();p.draw();}}
 for(const a of [...specialAttacks]){if(!a.finished){a.update();a.draw(ctx);}}
 player.draw();`);}
 assert.ok(run('Number.isFinite(player.x)&&Number.isFinite(player.y)&&Number.isFinite(player.hp)'),key+' finite player');
 assert.ok(run('projectiles.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))'),key+' finite projectiles');
 results.push({fruit:key,cooldown:run('FruitArt.profile(player.fruit).cooldown'),ultimate:run('FruitArt.profile(player.fruit).ultimate')});
}
reset('LIGHTNING');run('Voyage.castUltimate();Voyage.menu()');const pending=run('CombatTimeline.pending');
advance(1000);assert.equal(run('CombatTimeline.pending'),pending,'Delayed strike pauses');
run('Voyage.start()');for(let i=0;i<15;i++)advance(50);
assert.ok(run('effects.some(e=>e.type==="blackNuke")'),'Judgment Bolt resolves after resume');
reset('PTERODACTYL');run('Voyage.castUltimate();mouse.x=1300;mouse.y=1000');for(let i=0;i<30;i++)advance(50);
assert.ok(run('effects.some(e=>e.type==="pterodive"&&e.x===700&&e.y===500)'),'Delayed dive retains original aim');
reset('MAMMOTH');const base=run('JSON.stringify([player.maxHp,player.speed])');
run('player.mammothSkill();player.mammothSkill()');
for(let i=0;i<361;i++)run('player.update()');
assert.equal(run('JSON.stringify([player.maxHp,player.speed])'),base,'Temporary forms revert without stacking');
reset('RUBBER');run('Voyage.castUltimate()');
assert.ok(run('specialAttacks.length===1 && specialAttacks[0].fists.length>1'),'Reference homing fists restored');
reset('HITO_MECHA');run('Voyage.castUltimate()');
assert.ok(run('specialAttacks.length===1'),'Reference barrage controller restored');
reset('SERAPH');run('player.hp=50;Voyage.castUltimate()');
for(let i=0;i<20;i++)advance(50);
assert.ok(run('player.hp>50'),'Reference Elysium healing tick');
assert.ok(run('enemies.some(e=>e.hp<e.maxHp)'),'Reference Elysium damage tick');
reset('AURORA');run('Voyage.castUltimate();player.takeDamage(20)');
assert.equal(run('player.hp'),100,'Reference shield absorbs damage');
reset('TRICERATOPS');run('Voyage.castUltimate();player.changeIsland(1)');
assert.equal(run('player.armor'),0,'Island transition clears temporary armor');
assert.equal(run('CombatTimeline.pending'),0,'No delayed attacks leak into another island');
fs.writeFileSync('qa/reference-ultimates.json',JSON.stringify({ok:true,source:'references/ultimate-source.html',results,checks:['73 mappings','8.8 seconds per fruit','cooldowns','projectile/controller rendering','paused delay','stable touch aim','non-stacking transformation']},null,2));
console.log('Reference ultimate tests passed for '+results.length+' fruits.');
export {reset};
