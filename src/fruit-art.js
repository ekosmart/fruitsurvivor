// Each fruit has a reproducible vector silhouette, power motif and full name.
const FruitArt = (() => {
    const themes = {
        thunder: {color:'#e8b947',light:'#fff2af',effect:'chain',title:'Judgment Storm'},
        fire: {color:'#db604c',light:'#ffd49a',effect:'burn',title:'Inferno Nova'},
        ice: {color:'#63bbd1',light:'#e0fcff',effect:'freeze',title:'Ice Age'},
        water: {color:'#329ba5',light:'#b6f5ea',effect:'wave',title:'Tidal Requiem'},
        void: {color:'#7960b5',light:'#d9b6ff',effect:'pull',title:'Event Horizon'},
        nature: {color:'#629d65',light:'#ddf1a6',effect:'root',title:'Eden Bloom'},
        light: {color:'#d7a95b',light:'#fff4cb',effect:'heal',title:'Celestial Dawn'},
        metal: {color:'#6c95a8',light:'#ceeff4',effect:'beam',title:'Omega Cannon'},
        beast: {color:'#b17a51',light:'#f5d5a2',effect:'claw',title:'Primal Cataclysm'},
        love: {color:'#cf78a5',light:'#ffe0ee',effect:'charm',title:'Divine Embrace'},
        rubber: {color:'#c25783',light:'#ffcada',effect:'slam',title:'King Kong Impact'},
        sound: {color:'#7194c9',light:'#dcddff',effect:'wave',title:'Resonance Break'},
        dream: {color:'#a180bf',light:'#f6d8ff',effect:'sleep',title:'Dream Eclipse'},
        sand: {color:'#c5a064',light:'#fff1be',effect:'pull',title:'Desert Dominion'},
        pirate: {color:'#c78c53',light:'#ffe4a8',effect:'claw',title:'Captain’s Reckoning'},
        toy: {color:'#c47f96',light:'#ffdbc8',effect:'slam',title:'Royal Revolt'},
    };
    const groups={
        thunder:['LIGHTNING','KIRIN','AZURE_DRAGON'],
        fire:['DRAGON','VOLCANO','HELLGOD','GARUDA'],
        ice:['ICE','AURORA'],
        water:['SIREN','TIDE','SEA_KING'],
        void:['BLACKHOLE','SHADOW','VOID_REAPER','GRAVITY','FENRIR'],
        nature:['BLOOM','ROSE_THORN','QUETZALCOATL'],
        light:['PHOENIX','CELESTIAL','SERAPH','ORIGIN'],
        metal:['MAGNETION','HITO_MECHA','SWORD_DEITY'],
        beast:['MAMMOTH','SABERTOOTH','PTERODACTYL','TRICERATOPS','VELOCIRAPTOR','GRIFFIN','COLOSSUS'],
        love:['HITO_HITO_DEWI'],rubber:['RUBBER'],sound:['ECHO'],
        dream:['MIRAGE','NEBULA','BAKU','QUASAR','ZENITH_URSAGAR','PRISM'],
        pirate:['CAPTAIN_HOOK','JACKPOT'],toy:['DOLL']
    };
    const titles={
  "LIGHTNING": "Judgment Bolt",
  "DRAGON": "Fire Breath",
  "ICE": "Ice Shard",
  "RUBBER": "Gear 4: Kong Organ",
  "BLACKHOLE": "Black Hole",
  "SHADOW": "Shadow Orbs",
  "VOID_REAPER": "Death Harvest",
  "PHOENIX": "Phoenix Burst",
  "SIREN": "Song of Lure",
  "TIDE": "Tidal Surge",
  "SEA_KING": "Tsunami Sweep",
  "JACKPOT": "777 Fever",
  "HELLGOD": "Inferno Field",
  "ROSE_THORN": "Thorn Orbit",
  "SWORD_DEITY": "Seven Heavenly Blades",
  "MAGNETION": "Magnetic Pull",
  "COLOSSUS": "Earth Slam",
  "MIRAGE": "Mirage Field",
  "VOLCANO": "Eruption Burst",
  "CELESTIAL": "Starfall",
  "DOLL": "Marionette Strings",
  "SINGULARITY": "Singularity",
  "AURORA": "Aurora Wave",
  "QUASAR": "Quasar Blast",
  "ORIGIN": "Origin Reset",
  "NEBULA": "Nebula Mist",
  "SERAPH": "Divine Intervention — Elysium Field",
  "PRISM": "Prismatic Chains",
  "HITO_HITO_DEWI": "Love Goddess",
  "HITO_MECHA": "Sky Barrage Protocol",
  "BLOOM": "Carnivorous Garden",
  "ECHO": "Echo Wave",
  "MAMMOTH": "Mammoth Charge",
  "SABERTOOTH": "Feral Slash",
  "PTERODACTYL": "Sky Dive",
  "TRICERATOPS": "Horn Barrage",
  "VELOCIRAPTOR": "Raptor Pack",
  "KIRIN": "Celestial Charge",
  "GRIFFIN": "Griffin Dive",
  "GARUDA": "Sky Cyclone",
  "FENRIR": "World-shaking Howl",
  "QUETZALCOATL": "Poison Feather Rain",
  "BAKU": "Nightmare Eater",
  "AZURE_DRAGON": "Tidal Surge",
  "GRAVITY": "Gravity Meteors",
  "ZENITH_URSAGAR": "Astral Maul",
  "CAPTAIN_HOOK": "Grapnel King"
};
    const cache=new Map(), images=new Map();
    const hash=k=>[...k].reduce((a,c)=>(Math.imul(a,31)+c.charCodeAt(0))>>>0,7);
    const name=k=>(FRUITS[k]?.name || k || 'Tanpa buah').replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu,'').trim();
    function profile(key) {
        let theme=Object.keys(groups).find(t=>groups[t].includes(key));
        if(!theme && typeof bossFruitMap!=='undefined' && key in bossFruitMap) {
            const island=gameState.islands[bossFruitMap[key]];
            theme=({starter:'pirate',ice:'ice',lightning:'thunder',fire:'fire',rock:'beast',sand:'sand',
                giant:'beast',water:'water',sky:'light',fortress:'metal',swamp:'nature',army:'metal',
                city:'metal',forge:'fire',toy:'toy',beast:'beast',candy:'love',samurai:'metal',
                future:'metal',laugh:'pirate',verth:'dream',void:'void',dream:'dream'})[island?.theme];
        }
        theme=theme||'dream';
        const data=themes[theme], seed=hash(key);
        return {...data,theme,seed,name:name(key),ultimate:ReworkedUltimates.specs[key]?.name||titles[key]||`${name(key)} — Boss Skill`,
            cooldown:ReworkedUltimates.specs[key]?.cooldown||(key==='LIGHTNING'?ReferenceFruitData.LIGHTNING.skillVCooldown:(ReferenceFruitData[key]?.cooldown||FRUITS[key]?.cooldown||4000))};
    }
    function uri(key) {
        if(cache.has(key))return cache.get(key);
        const p=profile(key),fill=p.color,shine=p.light;
        const path=(d,c=shine,w=3)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
        let shape=[
            'M64 34 C35 18 15 44 23 74 C27 97 49 111 64 102 C84 113 107 93 108 69 C111 42 89 22 64 34Z',
            'M62 30 C47 22 26 38 22 61 C17 83 33 104 62 107 C92 109 113 86 106 64 C100 44 87 28 62 30Z',
            'M63 31 C38 35 27 52 29 75 C31 104 53 111 72 105 C103 99 110 73 99 51 C92 37 76 34 63 31Z'
        ][p.seed%3];
        let motif='';
        switch(p.theme) {
            case 'thunder':motif='<path d="M72 43 L47 72 L62 72 L54 94 L82 62 L66 62Z" fill="'+shine+'"/>';break;
            case 'fire':motif='<path d="M63 94 C27 80 57 62 60 45 C72 61 72 67 82 62 C92 83 79 95 63 94Z" fill="'+shine+'"/>'+path('M63 88 Q54 79 65 67 Q76 85 63 88',fill,4);break;
            case 'ice':motif=path('M64 48 V91 M44 59 L84 81 M44 81 L84 59 M57 53 L64 59 L71 53 M57 86 L64 80 L71 86 M46 66 L55 65 L51 56 M77 85 L76 75 L86 74');break;
            case 'water':motif='<path d="M64 44 Q89 72 83 83 Q64 105 46 83 Q38 70 64 44Z" fill="'+shine+'"/>'+path('M54 78 Q62 86 73 77',fill,4);break;
            case 'void':motif='<ellipse cx="64" cy="72" rx="23" ry="18" fill="#211c39"/><ellipse cx="64" cy="72" rx="32" ry="10" fill="none" stroke="'+shine+'" stroke-width="4" transform="rotate(-28 64 72)"/>';break;
            case 'nature':motif=path('M46 90 Q78 68 82 47 M61 73 Q40 73 42 55 Q64 52 61 73 M69 63 Q71 42 88 44 Q89 63 69 63',shine,5);break;
            case 'light':motif='<circle cx="64" cy="71" r="13" fill="'+shine+'"/>'+path('M64 43 V51 M64 91 V99 M37 71 H44 M85 71 H93 M45 52 L50 57 M80 85 L85 90 M45 90 L50 85 M80 57 L85 52');break;
            case 'metal':motif='<path d="M46 49 H82 V89 H46Z" fill="#294757" stroke="'+shine+'" stroke-width="3"/>'+path('M54 60 H74 M54 70 H74 M54 80 H74 M39 56 H46 M82 83 H90');break;
            case 'beast':motif=path('M47 52 Q60 71 47 93 M62 47 Q75 69 62 89 M78 50 Q91 71 78 91',shine,6);break;
            case 'love':motif='<path d="M64 91 C26 69 43 45 64 60 C83 43 104 67 64 91Z" fill="'+shine+'"/>';break;
            case 'rubber':motif=path('M44 58 C87 32 98 83 63 85 C34 86 46 61 69 66 C85 71 63 81 59 71',shine,5);break;
            case 'sound':motif=path('M44 64 V80 M54 53 V91 M64 47 V96 M74 56 V87 M84 64 V80',shine,5);break;
            case 'pirate':motif=path('M64 48 V85 Q37 83 40 70 M64 85 Q92 83 88 70 M49 58 H79 M38 75 L40 68 L48 72 M81 72 L88 68 L90 75',shine,4);break;
            case 'sand':motif='<path d="M43 49 H85 L68 70 L85 92 H43 L60 70Z" fill="none" stroke="'+shine+'" stroke-width="4"/>';break;
            case 'toy':motif='<path d="M43 58 L64 46 L86 58 V84 L64 96 L43 84Z" fill="none" stroke="'+shine+'" stroke-width="4"/>'+path('M43 58 L64 71 L86 58 M64 71 V96');break;
            default:motif='<path d="M64 44 L71 62 L91 63 L76 76 L81 96 L64 86 L47 96 L52 76 L37 63 L57 62Z" fill="'+shine+'"/>';
        }
        let texture='';
        for(let i=0;i<5;i++){const a=(p.seed%360+i*72)*Math.PI/180,x=64+Math.cos(a)*34,y=71+Math.sin(a)*27;texture+=path(`M${x-5} ${y} q0 -8 8 -6 q8 2 2 7 q-4 3 -5 -1`,'#132d40',1.5);}
        const horns=p.theme==='beast'||key.includes('DRAGON')?'<path d="M31 48 Q14 31 28 23 L44 38 M89 39 L102 23 Q117 36 98 52" fill="'+shine+'" stroke="#223346" stroke-width="3"/>':'';
        const markup=`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="fruit" x2=".8" y2="1"><stop stop-color="${shine}"/><stop offset=".35" stop-color="${fill}"/><stop offset="1" stop-color="#283348"/></linearGradient></defs>${horns}<path d="${shape}" fill="url(#fruit)" stroke="#182b3c" stroke-width="4"/><path d="M62 36 Q51 21 64 11 Q80 6 77 19 Q70 26 67 17" fill="none" stroke="#8f774e" stroke-width="6" stroke-linecap="round"/><path d="M68 29 Q89 9 101 25 Q89 40 68 29Z" fill="#74a27b" stroke="#264b48" stroke-width="3"/>${texture}<g transform="rotate(${(p.seed%23-11)*2} 64 72)">${motif}</g><path d="M33 49 Q29 61 32 67" stroke="#fff" stroke-opacity=".42" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
        const source='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(markup);
        cache.set(key,source);return source;
    }
    function draw(ctx,key,x,y,size,label=false) {
        if(!FRUITS[key])return;
        if(!images.has(key)){const im=new Image();im.src=uri(key);images.set(key,im);}
        const im=images.get(key);
        ctx.save();
        ctx.fillStyle='rgba(15,29,38,.22)';ctx.beginPath();ctx.ellipse(x,y+size*.35,size*.32,size*.12,0,0,Math.PI*2);ctx.fill();
        if(im.complete&&im.naturalWidth)ctx.drawImage(im,x-size/2,y-size*.6,size,size);
        if(label) {
            const title=name(key);ctx.font='600 11px Arial';ctx.textAlign='center';
            const w=ctx.measureText(title).width+14;
            ctx.fillStyle='rgba(13,29,42,.84)';ctx.beginPath();ctx.roundRect(x-w/2,y+size*.48,w,20,6);ctx.fill();
            ctx.fillStyle='#fff0d1';ctx.fillText(title,x,y+size*.48+14);
        }
        ctx.restore();
    }
    return {uri,draw,name,profile};
})();
