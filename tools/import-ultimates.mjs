// One-time import from the user-supplied reference, never executes the HTML.
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const source=fs.readFileSync('references/ultimate-source.html','utf8').replace(/\r\n/g,'\n');
let methods=source.slice(source.indexOf('            fruitSkill() {'),source.indexOf('            checkInteractions() {'));
methods=methods.replace('fruitSkill() {','castReferenceSkill() {')
  .replace('this.fruit && bossFruitMap[this.fruit]','this.fruit && bossFruitMap[this.fruit] !== undefined')
  .replace('executeBossFruitSkill(this.fruit, mouse.x, mouse.y)','executeBossFruitSkill(this.fruit, mouse.x, mouse.y, this)')
  .replace('this.lightningSkill();','this.judgmentBolt();');
// Recasting a temporary form refreshes its duration without stacking buffs.
methods=methods.replace('this.isZoan = true;', 'if(this.isZoan){this.zoanTimer=durationFrames;return;}\n                this.isZoan = true;');
methods=methods.replace('this.isDragon = true;', 'if(this.isDragon){this.transformTimer=durationFrames;return;}\n                this.isDragon = true;');
let bolt=source.slice(source.indexOf('        Player.prototype.judgmentBolt = function() {'),source.indexOf('\n        };',source.indexOf('        Player.prototype.judgmentBolt = function() {'))+11);
bolt=bolt.replace('Player.prototype.judgmentBolt = function() {','classBoltPlaceholder() {').replace(/const now = Date.now\(\);\s*if \(\(this\._lastV[\s\S]*?this\._lastV = now;/,'// Cooldown is owned by Voyage.').replace(/};\s*$/,'}');
bolt=bolt.replace('classBoltPlaceholder','judgmentBolt');
const rubberStart=source.indexOf('    class RubberKongOrgan {');
const rubberEnd=source.indexOf('                const droppedItems = [];',rubberStart);
let rubber=source.slice(rubberStart,rubberEnd);
// Lexically scoped target and timers preserve aim even after the player moves.
const header=`// Imported from user reference SHA256 ${crypto.createHash('sha256').update(source).digest('hex')}\n// Changes: single-button dispatch, pause-aware timers, stable target, non-stacking forms.\nconst ReferenceUltimates=(()=>{\n let current=null;\n const Date={now:()=>Voyage.clock};\n const mouse=new Proxy({}, {get:(_,key)=>current?.target[key]});\n const setTimeout=(fn,delay)=>schedule(fn,delay,0);\n const setInterval=(fn,delay)=>schedule(fn,delay,delay);\n const clearInterval=id=>CombatTimeline.cancel(id);\n function schedule(fn,delay,repeat){const context=current;return CombatTimeline.schedule(()=>{const previous=current;current=context;try{fn();}finally{current=previous;}},delay,repeat);}\n`;
const tail=`\n for(const name of Object.getOwnPropertyNames(ImportedSkills.prototype)){if(name!=='constructor')Player.prototype[name]=ImportedSkills.prototype[name];}\n return {cast(owner,target){const previous=current;current={target};try{owner.castReferenceSkill();}finally{current=previous;}}};\n})();\n`;
fs.writeFileSync('src/reference-ultimates.js',header+rubber+'\nclass ImportedSkills {\n'+methods+'\n'+bolt+'\n}\n'+tail);
const raw=source.match(/const FRUITS = (\{[\s\S]*?\n        \});/)[1];
const data=vm.runInNewContext('('+raw+')');
const extras=[...source.matchAll(/FRUITS\.(\w+)\s*=\s*(\{[\s\S]*?\n\s*\});/g)];
for(const [,key,value] of extras){try{data[key]=vm.runInNewContext('('+value+')');}catch{}}
fs.writeFileSync('src/reference-fruit-data.js','const ReferenceFruitData='+JSON.stringify(data,null,2)+';\n');
console.log('Imported reference methods and fruit data.');
