import fs from 'node:fs';
let shell=fs.readFileSync('src/shell.html','utf8');
const replacements={
    ART:fs.readFileSync('assets/illustrated/art-pack.json','utf8'),
    HERO:fs.readFileSync('src/hero.json','utf8'),
    ART_RUNTIME:fs.readFileSync('tools/art-runtime.js','utf8'),
    GAME:fs.readFileSync('src/combat-timeline.js','utf8')+'\n'+fs.readFileSync('src/reference-fruit-data.js','utf8')+'\n'+fs.readFileSync('src/game.js','utf8')+'\n'+fs.readFileSync('src/reference-ultimates.js','utf8')+'\n'+fs.readFileSync('src/reworked-ultimates.js','utf8')+'\n'+fs.readFileSync('src/fruit-art.js','utf8')+'\n'+fs.readFileSync('src/voyage.js','utf8'),
    VOYAGE_CSS:fs.readFileSync('src/voyage.css','utf8'),
    VOYAGE_UI:fs.readFileSync('src/voyage-ui.html','utf8')
};
for(const [key,value] of Object.entries(replacements)){
    const token='@@'+key+'@@';
    if(!shell.includes(token))throw Error('Missing build placeholder: '+key);
    shell=shell.replace(token,()=>value);
}
if(/@@[A-Z_]+@@/.test(shell))throw Error('Unresolved build placeholder');
fs.writeFileSync('Pirate Fruite Adventure V3_1.html',shell);
console.log('Built offline touch edition.');
