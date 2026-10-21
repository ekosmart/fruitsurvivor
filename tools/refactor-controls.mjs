// One-time migration from the preserved art edition to maintainable sources.
import fs from 'node:fs';
let s=fs.readFileSync('src/game.js','utf8');
function cut(a,b,withText=''){const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<0)throw Error(a);s=s.slice(0,start)+withText+s.slice(end);}
function replace(a,b){if(!s.includes(a))throw Error('Missing: '+a.slice(0,100));s=s.replace(a,b);}
cut("        window.addEventListener('keydown', (e) => {","        // Fruit system");
cut('            // castSkill: dispatch by key code','            takeDamage(amount)');
cut('            fruitSkill() {','            checkInteractions()',`            getAttackCooldown() { return 450; }
            fruitSkill() { return Voyage.castUltimate(this); }

`);
cut('        // Thunder God skill implementations','        // Enemy class');
cut('        // Sabertooth: helper methods and skill implementations','        // Start game');
cut('        // --- Skill dispatcher, auto-bind, fruit normalization, cooldown UI ---', '        })();', '');
// Remove the tail of that dispatcher as a whole (the marker cut above ends at its closure).
s=s.slice(0,s.indexOf('        // Start game'))+'        // Application shell and controls are initialized by voyage.js.\n';
// Remove the obsolete empty prototype poller.
cut('        // Quetzalcoatl skill implementations','        // Game constants');
replace('const vw = Math.max(800, Math.floor(window.innerWidth));','const vw = Math.max(320, Math.floor(window.innerWidth));');
replace('const vh = Math.max(600, Math.floor(window.innerHeight));','const vh = Math.max(260, Math.floor(window.innerHeight));');
replace('            paused: false,','            paused: true,');
// Discard the previous movement / attack control path, keep interaction and passives.
cut('                // Movement\n','                // Interactions\n',`                Voyage.movePlayer(this);
                Voyage.processCombatInput(this);

`);
// Transform timers no longer apply: the player has only one special action.
cut('                // Update dragon transform timer','            basicAttack()',`            }

`);
s=s.replace(/if \([^\n]*\) (?:this|player)\.startDragonTransform\(\);/g,'');
// Make the health bar unconditional, not only in the PvP arena.
replace("if (typeof ArenaManager !== 'undefined' && ArenaManager.active) {\n                        const hpPct","if (true) {\n                        const hpPct");
replace("ctx.fillText(`Lv${this.level}`, this.x, by - 6);","ctx.fillText(`${Math.ceil(this.hp)} / ${this.maxHp}`, this.x, by - 6);");
// The old first takeDamage was shadowed by a second class method. Guard both.
s=s.replace(/            takeDamage\(amount\) \{\n/g,'            takeDamage(amount) {\n                if (gameState.paused) return;\n');
// World fruit graphics and labels are shared with inventory/menu/catalog.
const fruitStart=s.indexOf('        class Fruit {');
const drawStart=s.indexOf('            draw() {',fruitStart);
const fruitEnd=s.indexOf('        // Dropped Item class',drawStart);
s=s.slice(0,drawStart)+`            draw() {
                FruitArt.draw(ctx, this.type, this.x, this.y + Math.sin(this.bobOffset) * 4, 46, true);
            }
        }

`+s.slice(fruitEnd);
const dropStart=s.indexOf('        class DroppedItem');
const dropDraw=s.indexOf('            draw() {',dropStart);
s=s.slice(0,dropDraw)+s.slice(dropDraw).replace('            draw() {',`            draw() {
                if(this.type === 'fruit') {
                    ctx.save();ctx.globalAlpha=this.fadeAlpha ?? 1;
                    FruitArt.draw(ctx,this.value,this.x,this.y+Math.sin(this.bobOffset)*4,42,true);
                    ctx.restore();return;
                }`);
// Remove all old keyboard and mouse registrations; the new shell owns input.
cut('        // Shop input handling','        // Render background');
cut("        window.addEventListener('keydown', (e) => {\n            if (e.code === 'KeyP')",'        // Main game loop');
replace('        function gameLoop() {\n            PirateArt.tick(gameState.paused);',`        function gameLoop() {
            Voyage.tick();
            if(gameState.paused) { requestAnimationFrame(gameLoop); return; }
            PirateArt.tick(false);`);
replace('            player.draw();','            player.draw();\n            Voyage.drawUltimateEffects(ctx);');
// All AI special attacks use the same single-ultimate contract.
const aiStart=s.indexOf('        class AIPlayer');
if(aiStart>=0){
    const start=s.indexOf('                // use fruit skill',aiStart);
    const end=s.indexOf('\n            draw() {',start);
    if(start>=0&&end>=0)s=s.slice(0,start)+`                if(this.fruit) Voyage.castUltimate(this);
            }
`+s.slice(end);
}
// Remove obsolete key cooldown metadata and replace outdated multi-skill descriptions.
s=s.replace(/^\s*skill[TZXC]Cooldown:[^\n]*\n/gm,'\n');
s=s.replace(/^\s*description: '[^\n]*(?:Z\/X\/C\/V|T: |transform \(T\)|Right-click skill removed)[^\n]*\n/gm,"                description: 'Satu Ultimate sesuai kekuatan buah.',\n");
// Inventory cards now show the themed fruit drawing and complete readable name.
replace("el.textContent = FRUITS[item.value].name.split(' ')[0];",`const icon = document.createElement('img');
                            icon.src=FruitArt.uri(item.value);icon.alt=FruitArt.name(item.value);
                            icon.width=38;icon.height=38;el.appendChild(icon);
                            const label=document.createElement('div');label.textContent=FruitArt.name(item.value);el.appendChild(label);`);
fs.writeFileSync('src/game.js',s);
console.log('Removed legacy player skills and input dispatchers.');
