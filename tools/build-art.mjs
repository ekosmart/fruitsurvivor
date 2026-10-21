// Reproducible, original SVG artwork. No network or third-party assets.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'assets', 'illustrated');
fs.mkdirSync(out, { recursive: true });
// One art direction per island, including islands with the same gameplay theme.
const islands = [
  ['Pulau Pemula','starter','palm','pirate','#287d78','#91b886','#e3ca95','#b84b40'],
  ['Pulau Es','ice','crystal','frost','#335b80','#b0d5dc','#e3f2e8','#5d96bf'],
  ['Pulau Petir','lightning','obelisk','storm','#252c51','#646a94','#a7a0b5','#c7a653'],
  ['Pulau Naga','fire','volcano','dragon','#332e3d','#79615d','#b18b70','#cf6745'],
  ['Ascent Peak','rock','mountain','golem','#314c60','#8d9691','#c3bba1','#6f8391'],
  ['Cactus Town','sand','cactus','outlaw','#77634f','#d9b87c','#edd4a0','#ba744a'],
  ['Duo Isle','giant','twin','viking','#315f67','#8baf92','#c2c79b','#6d8790'],
  ['Snowy Citadel','ice','icecastle','knight','#384f79','#b9cddb','#e6eaf2','#7294bb'],
  ['Sand Empire','sand','pyramid','pharaoh','#79624d','#d4ad70','#f0cf8b','#c08d44'],
  ['Knock-Up Reef','water','coral','shark','#225e80','#88c4c4','#d2e5c5','#37979d'],
  ['Cloud Haven','sky','cloudtemple','angel','#507b9b','#cedcdd','#f2ecdc','#b3a270'],
  ['Canal City','water','canal','mech','#355c70','#9bb9b5','#d2d1b1','#9a785f'],
  ['Judgement Gate','fortress','gate','knight','#343e52','#8d989d','#bac3bd','#777faf'],
  ['Mangrove Grove','swamp','mangrove','bog','#244c4b','#668d72','#a0ad7f','#6e934e'],
  ["Warrior's Island",'army','camp','warrior','#48504d','#a5a27f','#cec49a','#a15f4a'],
  ['Maximum Security','fortress','prison','warden','#273746','#778589','#a4adab','#697887'],
  ['Justice Square','city','courthouse','knight','#475774','#abb9c5','#d8dcca','#668aaa'],
  ['Ocean Palace','water','palace','merfolk','#174860','#72a8b7','#b9d7cf','#438eaa'],
  ['Elemental Forge','forge','forge','golem','#322f39','#776e68','#b69c7c','#d2854b'],
  ['Toy Kingdom','toy','toys','toy','#607a8f','#c5bbaf','#e3d9bd','#b57383'],
  ['Elephant Fortress','beast','elephant','beast','#3b5c57','#98a68c','#c8c3a0','#8e8c7c'],
  ['Candy Land','candy','candy','candy','#867398','#d6b4bb','#f0d7c0','#bd729c'],
  ['Samurai Nation','samurai','pagoda','samurai','#4d5b6a','#aeb69d','#dcd3b6','#ad5658'],
  ['Future Isle','future','future','robot','#1f344f','#6d959f','#a8c6c5','#49afbb'],
  ["Giant's Homeland",'giant','longhouse','viking','#304d59','#859d85','#c3bf9b','#8e795d'],
  ['LaughTale','laugh','treasure','pirate','#337d83','#b3c798','#f0d5a0','#cb9659'],
  ['Verth','verth','moon','alien','#111c37','#5c6382','#9593aa','#8796ba'],
  ['Void Temple','void','void','wraith','#101126','#3a355b','#726685','#936ac5'],
  ['Great Kingdom of Dream','dream','dream','royal','#675683','#b9a8c5','#e4cfd3','#aa83c3'],
].map(([name,theme,motif,enemy,sea,ground,pathColor,accent], id) =>
  ({id,name,theme,motif,enemy,sea,ground,path:pathColor,accent}));

const P = (d, fill, stroke = '#243744', width = 3, extra = '') =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const E = (x,y,rx,ry,fill,extra='') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const R = (x,y,w,h,fill,rx=0,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const C = (x,y,r,fill,extra='') => E(x,y,r,r,fill,extra);
const group = (x,y,scale,body,extra='') => `<g transform="translate(${x} ${y}) scale(${scale})" ${extra}>${body}</g>`;
const svg = (w,h,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
function rng(seed) { return () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }; }

function palm(c = '#32665b') {
  return E(5,17,65,16,'#163a3c', 'opacity=".22"')+
    P('M-12 12 Q12-39-5-93 L10-94 Q31-36 7 14Z','#957457')+
    P('M3-86 Q-65-141-87-84 Q-35-102 3-86 M3-86 Q-12-152 41-139 Q13-118 3-86 M3-86 Q67-143 88-99 Q38-106 3-86 M3-86 Q67-84 52-44 Q38-72 3-86 M3-86 Q-50-90-60-45 Q-34-76 3-86',c,'#254d48',3)+
    C(-1,-84,7,'#bc9862')+C(10,-80,6,'#99724d');
}
function crystal(c='#a6e3e6') {
  return E(0,14,57,14,'#203a52','opacity=".23"')+
    P('M-20 4 L-25-80 L-5-120 L17-83 L22 4Z',c)+
    P('M-5-120 L-1-8 L22 4 L17-83Z','#71a9bf')+
    P('M-40 7 L-62-45 L-50-69 L-30-50 L-15 5Z','#bfebdf')+
    P('M23 12 L23-46 L46-73 L55-39 L45 13Z',c)+
    P('M-18-77 L-7-100 M31-40 L43-57','none','#f4fff5',4);
}
function building(kind,c,roof) {
  let body = E(0,22,125,32,'#192e3f','opacity=".23"')+
    P('M-95-4 L-95-111 L75-111 L101-88 L101 5 L-69 17Z',c)+
    P('M75-111 L101-88 L101 5 L75-13Z','#596b77')+
    R(-27,-64,38,72,'#344754',16)+R(-75,-73,24,31,'#587c8c',9)+R(33,-73,24,31,'#587c8c',9)+
    P('M-109-108 L-25-171 L97-119 L75-100Z',roof)+
    P('M-25-171 L103-148 L122-104 L97-119Z',roof)+
    P('M-96 7 L79-7 L108 9 L-69 28Z','#c4bda7');
  if (['gate','prison','icecastle','palace','dream','courthouse','cloudtemple','void'].includes(kind)) {
    body = E(0,23,150,33,'#192e3f','opacity=".23"')+
      R(-112,-135,224,150,c,5)+R(-39,-80,78,102,'#324252',38)+
      R(-132,-160,57,186,c,6)+R(75,-160,57,186,c,6)+
      P('M-141-160 L-103-205 L-67-160Z',roof)+P('M67-160 L103-205 L141-160Z',roof)+
      R(-111,-138,16,36,'#3d657c',8)+R(94,-138,16,36,'#3d657c',8)+
      R(-71,-130,142,21,roof,3)+P('M-151 18 L145 18 L160 38 L-162 38Z','#b6b7ac')+
      P('M-63-145 L0-185 L63-145Z',roof);
    if (kind==='prison') for (let x=-27;x<35;x+=13) body+=R(x,-69,5,90,'#8b9ca2');
    if (kind==='palace'||kind==='dream') body+=P('M0-202 L12-186 L0-169 L-12-186Z','#f5d888');
    if (kind==='void') body+=E(0,-34,29,51,'#a17be8')+E(0,-34,19,43,'#19112d');
  }
  return body;
}
function motif(a) {
  const c=a.path, ac=a.accent;
  switch(a.motif) {
    case 'palm': return palm();
    case 'crystal': return crystal();
    case 'obelisk': return E(0,20,65,17,'#232c48')+P('M-24 5 L-18-132 L0-164 L23-134 L32 7Z','#555775')+P('M3-132 L-12-89 L9-91 L-4-45 L28-98 L9-96Z','#f0d993')+C(2,10,35,'none','stroke="#d8c883" stroke-width="3"');
    case 'volcano': return E(0,12,150,25,'#392f3a')+P('M-137 8 L-47-122 L22-136 L137 8Z','#625059')+P('M-47-122 Q-8-151 22-136 L65-77 L26-89 L24-32 L5-71 L-22-92 L-45-56 L-57-90Z','#ed9763')+E(-11,-125,40,12,'#552f3c')+P('M-8-144 Q-41-191-4-220 M12-150 Q46-191 22-239','none','#ae9a98',16,'opacity=".5"');
    case 'mountain': return P('M-115 16 L-12-168 L126 17Z','#687e87')+P('M-12-168 L126 17 L26-4Z','#42596b')+P('M-12-168 L-57-89 L-22-107 L2-87 L13-111 L46-91Z','#e1e6de');
    case 'cactus': return E(0,12,63,15,'#9d835b','opacity=".3"')+P('M-13 6 L-13-61 L-40-61 Q-55-61-55-78 L-55-105 Q-55-119-42-119 Q-29-119-29-105 L-29-84 L-13-84 L-13-136 Q-13-153 4-153 Q20-153 20-136 L20-53 L39-53 L39-91 Q39-106 52-106 Q65-106 65-91 L65-48 Q65-30 47-30 L20-30 L20 6Z','#618c64')+P('M3-131 L3-2 M-43-103 L-43-79 M51-89 L51-49','none','#a9bb7a',3)+C(3,-150,9,'#de8c7e');
    case 'twin': return group(-61,0,.8,motif({...a,motif:'mountain'}))+group(55,5,.95,motif({...a,motif:'mountain'}));
    case 'pyramid': return E(0,18,147,22,'#ac8755','opacity=".5"')+P('M-138 13 L-12-161 L135 12 L18 41Z','#e0bb77')+P('M-12-161 L18 41 L135 12Z','#b58c51')+P('M-82-53 L0-43 M-105-23 L8-10 M-57-87 L-5-82','none','#c89f5f',3)+P('M-9 20 L-12-13 L13-11 L18 27Z','#7d674a');
    case 'coral': return E(0,20,85,20,'#4d979c','opacity=".35"')+P('M-10 15 L-10-51 M-10-16 Q-63-21-63-65 M-62-47 L-83-63 M-10-38 Q29-38 38-85 M33-63 L59-71 M-10-51 L-25-77','none','#cf9194',14)+group(50,17,.45,crystal('#b0d4bd'));
    case 'mangrove': return P('M-22 6 Q-47 15-54 36 M-17-15 Q-8 15 27 36 M-3-30 Q35 8 57 23 M-18-54 L-22 8','none','#5c6952',11)+E(-5,-62,71,39,'#355e53')+E(-22,-83,57,36,'#547e5c')+E(26,-73,42,29,'#658965');
    case 'camp': return E(0,20,123,20,'#575e47','opacity=".3"')+P('M-113 9 L-35-113 L51-113 L112 12Z','#a19769')+P('M-35-113 L37 12 L112 12 L51-113Z','#6f7657')+P('M-78 10 L-34-69 L10 10Z','#3f4b43')+P('M53-113 L53-179 L94-160 L53-147Z',ac);
    case 'forge': return building('house','#92908a','#716b68')+group(101,16,.55,motif({...a,motif:'volcano'}))+R(-100,-184,33,85,'#697078')+P('M-100-184 L-67-184','none','#ebbb7f',6);
    case 'toys': return E(0,23,95,24,'#907b83','opacity=".3"')+R(-75,-50,67,70,'#c18f78',6)+R(-8,-50,75,70,'#7ea7b7',6)+R(-42,-119,73,70,'#d7bd7d',6)+C(-41,-14,15,'#ecd7ae')+P('M6-17 L26-38 L47-17 L26 4Z','#d2dfd5')+P('M-7-107 L-24-77 L10-77Z','#c4898c');
    case 'elephant': return E(0,22,137,30,'#50665c','opacity=".3"')+E(0,-48,98,77,'#8d9b8e')+E(-78,-57,46,61,'#778b81')+E(79,-57,46,61,'#778b81')+P('M-21-52 Q-27 14-4 49 Q18 66 38 36 L21 26 Q8 35 9 11 L21-52Z','#a4ad9a')+P('M-46-27 Q-64 25-30 26 M45-27 Q64 25 30 26','none','#e1d6b0',13)+C(-38,-68,6,'#384c4e')+C(38,-68,6,'#384c4e')+group(0,-111,.6,building('gate','#c4bea5','#758b78'));
    case 'candy': return E(0,16,97,21,'#a988a7','opacity=".3"')+P('M-45 4 L-45-100 M48 6 L48-66','none','#f0e1d1',12)+C(-45,-118,43,'#d78eac')+P('M-45-150 Q-10-133-39-111 Q-70-95-67-126 Q-63-145-45-131 Q-33-119-45-116','none','#f1d9c7',10)+C(48,-81,34,'#a8b8ce')+P('M26-102 L68-60 M21-78 L49-50 M46-113 L77-82','none','#e5e7da',9);
    case 'pagoda': return E(0,24,130,26,'#58695f','opacity=".3"')+R(-68,-130,136,147,'#d0bdae')+R(-20,-61,40,79,'#564c50')+P('M-121-67 Q-64-72-53-108 L53-108 Q64-72 121-67 L87-49 L-87-49Z','#6a5960')+P('M-94-135 Q-39-140 0-188 Q39-140 94-135 L70-119 L-70-119Z','#7b555c')+P('M-113-67 L110-67 M-88-135 L87-135','none','#d69b78',4)+P('M0-188 L0-208','none','#ba9c72',5);
    case 'future': return E(0,22,123,30,'#163c55','opacity=".4"')+P('M-86 12 L-86-141 L-54-172 L37-172 L87-130 L87 12Z','#718d9c')+P('M37-172 L87-130 L87 12 L37-11Z','#476778')+R(-62,-133,72,14,'#9ae1dc',3)+R(-62,-102,72,14,'#7dc7d0',3)+R(-62,-70,72,14,'#9ae1dc',3)+R(-34,-29,27,46,'#283b58',8)+E(0,-180,103,17,'none','stroke="#80d5df" stroke-width="5"');
    case 'longhouse': return building('house','#9d9c80','#6a7d70')+P('M-110-112 L-130-143 M106-120 L129-150','none','#bfbb94',8)+R(-87,-101,8,110,'#677365')+R(62,-101,8,110,'#677365');
    case 'treasure': return E(0,17,100,22,'#a28b59','opacity=".3"')+P('M-84 9 L-84-68 Q-84-101-50-101 L54-101 Q83-101 83-68 L83 9Z','#a9774d')+P('M-84-44 L83-44 M-58-100 L-58 8 M55-101 L55 8','none','#e6c27c',11)+R(-15,-55,30,33,'#e6c27c',5)+C(0,-39,5,'#735d49')+group(91,18,.45,palm());
    case 'moon': return E(0,3,114,46,'#515b7e')+E(0,-5,94,34,'#747b99')+E(0,-2,75,25,'#464e70')+E(-19,-12,35,10,'#383f61')+group(77,-16,.45,crystal('#a4a8c9'));
    case 'canal': return building('house','#c1bd9e','#9c7b66')+P('M-150 42 Q0-12 150 42 L150 68 Q0 14-150 68Z','#d6caaa')+P('M-146 35 Q0-22 146 35','none','#b1b4a5',9);
    default: return building(a.motif,c,ac);
  }
}

function background(a) {
  const rand=rng(761+a.id*97);
  let body = `<defs><pattern id="grain" width="88" height="74" patternUnits="userSpaceOnUse">${P('M12 16 L23 13 M62 49 L73 51 M35 62 L39 59','none','#ffffff',2,'opacity=".08"')}${C(53,20,2,'#112c37','opacity=".09"')}</pattern><radialGradient id="light"><stop stop-color="#fff4d0" stop-opacity=".15"/><stop offset="1" stop-color="#07152b" stop-opacity=".2"/></radialGradient></defs>`;
  body += R(0,0,1600,1000,a.sea);
  // Multiple shoreline bands provide depth without covering the arena.
  for(let n=0;n<4;n++) {
    const m=12+n*16;
    body += `<rect x="${m}" y="${m}" width="${1600-m*2}" height="${1000-m*2}" rx="${99-n*12}" fill="${[a.sea,a.path,a.path,a.ground][n]}" opacity="${n===1?.3:n===2?.7:1}"/>`;
  }
  body += P('M110 488 Q400 552 720 490 T1490 488 M785 95 Q726 319 796 514 T808 909','none',a.path,74,'opacity=".25"');
  // Broad, quiet terrain marks: each biome has its own ground language.
  if(['sand','candy'].includes(a.theme)) {
    for(let j=0;j<8;j++) {
      const x=110+rand()*1300,y=160+rand()*680;
      body+=P(`M${x} ${y} q85 -36 176 0 m-160 10 q70 -23 140 0`,'none',a.path,5,'opacity=".22"');
    }
  } else if(['ice','sky','dream'].includes(a.theme)) {
    for(let j=0;j<13;j++) body+=E(120+rand()*1340,130+rand()*740,38+rand()*85,11+rand()*18,a.path,'opacity=".17"');
  } else if(['fire','forge','lightning','void'].includes(a.theme)) {
    for(let j=0;j<12;j++) {
      const x=130+rand()*1300,y=160+rand()*680;
      body+=P(`M${x} ${y} l25 -15 -8 -20 34 -18 m-26 38 l23 16 29 -7`,'none',a.accent,3,'opacity=".24"');
    }
  } else if(['water','swamp','verth'].includes(a.theme)) {
    for(let j=0;j<8;j++) {
      const x=130+rand()*1320,y=145+rand()*710;
      body+=E(x,y,34+rand()*40,13+rand()*18,a.sea,'opacity=".12"');
      body+=P(`M${x-20} ${y} q22 6 43 0`,'none',a.path,2,'opacity=".3"');
    }
  }
  // Subtle tile or circuit fields retain ample contrast for combat effects.
  if (['city','fortress','future','forge','samurai','dream','void'].includes(a.theme)) {
    for(let x=175;x<1500;x+=110) body+=P(`M${x} 180 L${x} 838`,'none','#203543',2,'opacity=".09"');
    for(let y=194;y<870;y+=95) body+=P(`M153 ${y} L1449 ${y}`,'none','#203543',2,'opacity=".09"');
  }
  // Atmospheric perimeter props are illustrations, never collision geometry.
  const placements = [
    [188,246,.93],[440,190,.74],[792,234,1.12],[1147,204,.8],[1400,285,.88],
    [170,595,.72],[1431,596,.73],[222,895,.9],[520,899,.7],[1110,902,.73],[1402,909,.86]
  ];
  const smallProp=(type)=>{
    const rock=P('M-38 9 L-43-12 L-18-40 L13-35 L38-7 L30 14Z',a.accent,'#344854',2)+P('M-18-40 L-10-8 L30 14 L38-7 L13-35Z',a.path,'none',0,'opacity=".35"');
    const shrub=E(0,15,56,14,'#24464b','opacity=".16"')+E(-26,-3,30,24,'#496f5b')+E(12,-16,37,33,'#5b8062')+E(36,5,28,22,'#6a8a69')+P('M-24-10 L-14-15 M6-30 L20-32 M29-2 L40-4','none','#a0af80',3);
    const crate=E(0,15,47,13,'#344854','opacity=".2"')+P('M-35-38 L28-38 L38-24 L38 14 L-25 14 L-35 3Z','#a4865c')+P('M-27-32 L27 8 M26-32 L-26 8','none','#d0b27f',6)+P('M-35-38 L-25-24 L38-24 M-25-24 L-25 14','none','#705e49',3);
    if(['ice','sky','dream'].includes(type)) return group(0,8,.58,crystal(a.path));
    if(['sand','army','laugh','toy'].includes(type)) return crate+group(48,14,.48,rock);
    if(['city','fortress','future','samurai'].includes(type)) return group(0,12,.57,building('house',a.path,a.accent));
    if(['water','swamp'].includes(type)) return group(-16,13,.65,motif({...a,motif:type==='swamp'?'mangrove':'coral'}));
    if(['fire','forge','rock','verth','void','lightning'].includes(type)) return rock+group(48,15,.54,rock);
    if(type==='candy') return group(0,12,.58,motif(a));
    return shrub;
  };
  placements.forEach(([x,y,s],i)=>{
    let shape;
    if(i===2) {
      if(a.motif==='palm') shape=building('house','#d0c19c','#987258')+group(123,24,.65,palm());
      else if(a.motif==='cactus') shape=building('house','#c7a475','#a97c56')+group(135,14,.68,motif(a));
      else shape=motif(a);
    } else if(i===0||i===10||i===5) shape=motif(a);
    else shape=smallProp(a.theme);
    body+=group(x+(rand()-.5)*38,y+(rand()-.5)*23,s,shape);
  });
  // Small secondary scenery makes the map feel inhabited.
  for(let i=0;i<54;i++) {
    const x=95+rand()*1410,y=95+rand()*810;
    if(x>350&&x<1270&&y>270&&y<765) continue;
    if(a.theme==='ice') body+=group(x,y,.18+rand()*.12,crystal());
    else body+=E(x,y,8+rand()*14,3+rand()*5,a.path,'opacity=".35"')+
      P(`M${x-5} ${y} L${x} ${y-10} L${x+7} ${y}`,'none',a.accent,2,'opacity=".4"');
  }
  body += R(0,0,1600,1000,'url(#grain)')+R(0,0,1600,1000,'url(#light)');
  // Compass rose, like an old illustrated pirate chart, stays at the lower edge.
  body += group(802,897,.7,`<g opacity=".5">${C(0,0,48,'none',`stroke="${a.path}" stroke-width="2"`)}${P('M0-65 L10-10 L65 0 L10 10 L0 65 L-10 10 L-65 0 L-10-10Z',a.path,'none')}${C(0,0,10,a.ground)}</g>`);
  return svg(1600,1000,body);
}

function enemy(a,tier) {
  const boss=tier==='boss', elite=tier==='elite';
  const ink='#1c293b', light='#e9d8b2', ac=a.accent;
  let b='';
  const arms=P('M39 71 Q23 77 23 96 L33 101 L45 84 M89 71 Q104 77 104 97 L94 101 L83 85',ac,ink,4);
  const boots=P('M43 99 L40 119 L59 119 L60 101 M69 101 L70 119 L91 119 L86 98','#384451',ink,4);
  b+=boots;
  if(boss||elite) b+=P('M34 61 L22 112 L64 104 L105 112 L92 61Z',boss?'#813c58':'#566889',ink,4);
  b+=arms+P('M42 66 Q64 56 86 66 L91 101 Q64 113 37 101Z',ac,ink,4)+P('M41 91 L87 91 L88 101 L40 101Z','#403c49',ink,3)+R(59,91,12,10,'#e6bd6c',2);
  let head=E(64,49,26,26,'#d8aa85',`stroke="${ink}" stroke-width="4"`);
  switch(a.enemy) {
    case 'pirate':
    case 'outlaw':
      head+=P('M28 35 Q31 14 45 22 Q64-4 83 22 Q100 13 102 36 Q64 44 28 35Z',a.enemy==='pirate'?'#354155':'#886349',ink,4)+P('M36 33 Q64 39 94 32','none','#e1b76f',3)+P('M42 47 L87 47','none',ink,3)+E(76,48,9,8,ink)+C(53,48,3,ink)+P('M59 63 Q64 67 70 62','none',ink,2);
      b+=P('M102 94 Q124 76 118 52 Q109 73 96 81Z','#dce5de',ink,3)+P('M94 84 L107 94','none','#d4ab61',5);
      break;
    case 'frost':
    case 'golem':
      head=P('M37 33 L52 20 L79 23 L94 40 L89 66 L64 77 L39 64Z',a.enemy==='frost'?'#9ccddc':'#7f8e91',ink,4)+P('M52 20 L58 45 L39 64 M58 45 L82 43 L94 40','none',a.enemy==='frost'?'#d6f6f0':'#b6bca7',3)+P('M48 49 L57 49 M72 49 L81 49','none',a.enemy==='frost'?'#34699a':'#ffbf69',4);
      b+=group(33,84,.23,crystal(a.enemy==='frost'?'#b9e9ef':'#e5ab6c'));
      break;
    case 'dragon':
    case 'shark':
    case 'beast': {
      const skin=a.enemy==='dragon'?'#b46757':a.enemy==='shark'?'#749da5':'#9c9380';
      head=P('M35 36 L28 16 L52 26 Q65 18 80 27 L103 17 L94 40 L95 59 Q79 77 53 70 L34 58Z',skin,ink,4)+E(63,60,26,13,skin,`stroke="${ink}" stroke-width="3"`)+P('M42 42 L55 46 M75 46 L87 41','none',ink,4)+P('M49 61 L55 68 L61 61 M72 61 L78 68 L84 59','none',light,3);
      b=P('M87 97 Q124 103 117 67 L106 85 L91 80Z',skin,ink,4)+b;
      break;
    }
    case 'pharaoh':
      head=P('M34 30 Q64 8 94 30 L103 76 L83 81 L77 57 L51 57 L44 81 L25 76Z','#e2bd6d',ink,4)+E(64,49,23,25,'#c7a07b',`stroke="${ink}" stroke-width="3"`)+P('M35 37 L43 70 M29 53 L44 61 M88 36 L98 70 M85 53 L98 61','none','#4c8290',5)+P('M43 29 L85 29 L79 39 L49 39Z','#4c8290',ink,2);
      b+=P('M108 108 L108 40 M99 41 Q110 20 118 40','none','#e5c57f',5);
      break;
    case 'viking':
    case 'warrior':
    case 'knight':
    case 'warden':
    case 'royal':
      head+=P('M34 41 Q35 13 64 15 Q93 13 94 41Z',a.enemy==='royal'?'#aa83c3':'#7f94a3',ink,4)+P('M39 45 L89 45 L83 65 L45 65Z','#374b62',ink,3)+P('M49 51 L59 51 M69 51 L79 51','none','#d2e6de',3);
      if(a.enemy==='viking') head+=P('M36 29 Q15 29 18 10 L41 18 M92 29 Q113 29 110 10 L87 18',light,ink,3)+P('M41 60 Q64 97 87 60 L78 82 L51 82Z','#b18766',ink,3);
      b+=P('M19 75 L39 70 L43 94 L29 108 L15 94Z',ac,ink,3)+P('M29 79 L29 98 M21 87 L37 87','none',light,3)+P('M103 96 L107 45 L115 36 L117 47 L109 97Z','#c5d5dc',ink,3);
      break;
    case 'mech':
    case 'robot':
      head=R(35,23,59,49,'#91a6b2',12,`stroke="${ink}" stroke-width="4"`)+R(42,35,45,20,'#293e58',6)+R(48,41,12,7,'#7fe4d5',2)+R(69,41,12,7,'#7fe4d5',2)+R(51,60,28,6,'#486578',2)+P('M64 22 L64 10','none',ink,4)+C(64,9,5,'#e9b46d');
      b+=R(94,76,22,24,'#4b677b',5,`stroke="${ink}" stroke-width="3"`)+C(107,86,6,'#84d9da');
      break;
    case 'angel':
    case 'merfolk':
      b=P('M39 69 Q2 29 9 70 Q11 92 38 91 M89 69 Q126 29 119 70 Q117 92 90 91',a.enemy==='angel'?'#e7e7d4':'#8ac1c4',ink,3)+b;
      head+=P('M36 40 Q27 17 63 16 Q100 18 92 43 L81 27 L66 38 L50 28Z',a.enemy==='angel'?'#cdb87c':'#438eaa',ink,3)+E(64,9,23,5,'none','stroke="#e6cb81" stroke-width="4"');
      b+=P('M108 110 L108 47 M97 36 L97 51 L118 51 L118 36 M108 30 L108 50','none','#d6c792',4);
      break;
    case 'bog':
      head=E(64,48,29,26,'#84a06f',`stroke="${ink}" stroke-width="4"`)+C(46,30,13,'#a2b082',`stroke="${ink}" stroke-width="3"`)+C(82,30,13,'#a2b082',`stroke="${ink}" stroke-width="3"`)+C(46,29,4,ink)+C(82,29,4,ink)+P('M46 55 Q65 67 84 53','none',ink,3);
      break;
    case 'toy':
      head=R(39,29,51,43,'#e1bd97',9,`stroke="${ink}" stroke-width="4"`)+R(35,10,58,27,'#a95e69',4,`stroke="${ink}" stroke-width="4"`)+R(34,30,61,9,'#d9ba70',3)+R(50,60,29,10,light,1,`stroke="${ink}" stroke-width="2"`)+C(64,22,5,'#ecd392');
      break;
    case 'candy':
      head=P('M35 42 Q24 25 40 21 Q43 3 61 17 Q77-2 86 19 Q105 21 95 42Z','#c685a1',ink,4)+E(64,50,27,24,'#ecc4a5',`stroke="${ink}" stroke-width="4"`)+P('M41 35 Q49 49 58 37 Q65 51 73 36 Q84 48 91 35','#e2a5b8',ink,3);
      b+=P('M108 108 L108 55','none',light,5)+C(108,48,14,'#c4a5d1',`stroke="${ink}" stroke-width="3"`)+P('M102 43 Q116 38 113 50 Q109 58 104 51','none',light,3);
      break;
    case 'samurai':
      head=P('M33 48 Q30 16 64 16 Q98 16 95 48 L103 69 L82 72 L82 47 L46 47 L46 72 L25 69Z','#774e5c',ink,4)+P('M43 29 L27 9 L54 23 L64 13 L74 23 L101 9 L85 31','#d9b673',ink,3)+R(44,47,40,18,'#293b50',4)+P('M51 53 L59 53 M70 53 L78 53','none',light,3);
      b+=P('M103 102 Q123 69 116 36 Q111 65 96 94Z','#d9e2df',ink,3);
      break;
    case 'alien':
      head=E(64,43,31,32,'#a5abc3',`stroke="${ink}" stroke-width="4"`)+E(49,45,9,13,ink,'transform="rotate(-24 49 45)"')+E(79,45,9,13,ink,'transform="rotate(24 79 45)"')+P('M58 64 L69 64','none',ink,2);
      b+=P('M94 80 L115 77 L121 88 L99 92Z','#66849d',ink,3)+C(119,82,4,'#b6e0cd');
      break;
    case 'wraith':
      head=P('M29 61 Q28 22 64 9 Q102 25 99 63 L83 78 L44 78Z','#5d4b7b',ink,4)+P('M43 53 Q44 30 64 26 Q84 35 85 55 L76 70 L51 70Z','#202238',ink,3)+P('M47 49 L57 51 M72 51 L81 48','none','#d2b4ed',4);
      b+=P('M23 112 L30 46 M21 44 Q38 17 52 37 L30 39Z','#a8a5c9',ink,3);
      break;
    case 'storm':
      head+=P('M35 40 L42 15 L58 26 L68 6 L77 25 L94 18 L93 42Z','#c8b779',ink,4)+P('M45 47 L57 50 M71 50 L83 46','none',ink,4);
      b+=P('M109 54 L94 77 L106 77 L96 105 L121 69 L109 70 L121 54Z','#f1d992',ink,3);
      break;
  }
  if(!['pirate','outlaw','frost','golem','dragon','shark','beast','knight','viking','warrior','warden','royal','mech','robot','bog','samurai','alien','wraith','storm'].includes(a.enemy))
    head+=C(53,48,3.5,ink)+C(76,48,3.5,ink)+P('M58 61 Q64 65 70 60','none',ink,2);
  b+=head;
  if(boss) b+=P('M42 20 L36 1 L53 10 L64-1 L76 10 L94 1 L87 20Z','#e6bf70',ink,3)+C(64,12,4,'#d46c64')+P('M34 69 L43 60 L48 73 L39 82Z','#dfb96f',ink,3)+P('M80 73 L86 60 L97 69 L89 82Z','#dfb96f',ink,3);
  else if(elite) b+=P('M29 69 L39 60 L48 71 L40 81Z','#d0af71',ink,3)+P('M81 71 L90 60 L99 69 L89 81Z','#d0af71',ink,3);
  return svg(144,144,group(8,12,.9,b));
}

const pack={ version:1, islands:[] };
const dataURI=s=>'data:image/svg+xml;base64,'+Buffer.from(s).toString('base64');
for(const a of islands) {
  const bg=background(a), enemies={};
  fs.writeFileSync(path.join(out,`island-${String(a.id).padStart(2,'0')}.svg`),bg);
  for(const tier of ['normal','elite','boss']) {
    const image=enemy(a,tier);
    fs.writeFileSync(path.join(out,`enemy-${String(a.id).padStart(2,'0')}-${tier}.svg`),image);
    enemies[tier]=dataURI(image);
  }
  pack.islands.push({...a,background:dataURI(bg),enemies});
}
fs.writeFileSync(path.join(out,'art-pack.json'),JSON.stringify(pack));
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(islands,null,2));
const cards=islands.map(a=>`<article><img class="map" src="island-${String(a.id).padStart(2,'0')}.svg"><div><h2>${a.id+1}. ${a.name}</h2>${['normal','elite','boss'].map(t=>`<img class="enemy" src="enemy-${String(a.id).padStart(2,'0')}-${t}.svg" title="${t}">`).join('')}</div></article>`).join('');
fs.writeFileSync(path.join(out,'gallery.html'),`<!doctype html><html lang="id"><meta charset="utf-8"><title>Pirate Fruit — Island Art</title><style>body{margin:0;background:#101d2a;color:#f0dcc0;font:16px system-ui;padding:32px}h1{margin-bottom:4px}p{color:#93adbb}main{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}article{background:#203343;border-radius:16px;overflow:hidden}.map{width:100%;display:block}article div{padding:10px 18px}h2{font-size:17px;margin:4px 0}.enemy{width:84px;height:84px}@media(max-width:900px){main{grid-template-columns:repeat(2,1fr)}}</style><h1>The Grand Archipelago</h1><p>29 illustrated islands · normal / elite / boss · original procedural vector artwork</p><main>${cards}</main></html>`);
console.log(`Built ${islands.length} backgrounds and ${islands.length*3} enemy sprites.`);
