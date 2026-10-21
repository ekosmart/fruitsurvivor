// Single owner for touch/keyboard combat, pause state, cooldowns and application UI.
const Voyage = (() => {
    const $=id=>document.getElementById(id);
    const input={x:0,y:0,stickId:null,attackId:null,attackHeld:false,attackQueued:false,ultimateQueued:false,touchAim:false};
    let clock=0,delta=16,last=performance.now(),started=false,starter='LIGHTNING',lastFruit='',toastUntil=0;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const active=()=>started&&!gameState.paused;
    const nearest=(p,range=620)=>enemies.filter(e=>!e.dead&&e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<range)
        .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    function toast(message){$('toast').textContent=message;toastUntil=performance.now()+2400;$('toast').classList.add('visible');}
    function clearInput(){
        input.x=input.y=0;input.stickId=input.attackId=null;
        input.attackHeld=input.attackQueued=input.ultimateQueued=false;
        for(const key of Object.keys(keys))keys[key]=false;
        mouse.leftClicked=mouse.rightClicked=mouse.leftPressed=mouse.rightPressed=false;
        $('joystickKnob').style.transform='translate(0px,0px)';
    }
    function syncPause(){
        gameState.paused=!$('mainMenu').hidden||!$('codexModal').hidden||!$('helpModal').hidden||
            $('inventoryOverlay').style.display==='flex'||SHOP.open;
        if(gameState.paused)clearInput();
    }
    function menu(){
        $('mainMenu').hidden=false;$('voyageHUD').hidden=true;
        $('startButton').querySelector('span').textContent=started?'Lanjutkan petualangan':'Mulai petualangan';
        $('starterSection').hidden=started;
        syncPause();
    }
    function start(){
        if(!started){
            started=true;player.fruit=starter;player.hp=player.maxHp;
            player.x=canvas.width*.5;player.y=canvas.height*.56;
            camera.x=player.x;camera.y=player.y;
            player.generateIsland();
        }
        $('mainMenu').hidden=true;$('voyageHUD').hidden=false;clearInput();syncPause();
        player.updateUI();updateHUD();
    }
    function openModal(id){
        $(id).hidden=false;syncPause();
        if(id==='codexModal')renderCodex($('fruitSearch').value);
    }
    function closeModals(){
        $('codexModal').hidden=$('helpModal').hidden=true;syncPause();
    }
    function inventory(){
        if(!started)return;
        const opening=$('inventoryOverlay').style.display!=='flex';
        SHOP.open=false;updateShopUI();
        $('inventoryOverlay').style.display=opening?'flex':'none';
        if(opening)player.renderInventoryUI();
        syncPause();
    }
    function shop(){
        if(!started)return;
        $('inventoryOverlay').style.display='none';SHOP.open=!SHOP.open;updateShopUI();syncPause();
    }
    function movePlayer(p){
        if(ReworkedUltimates.blocksMovement(p))return;
        let x=input.x,y=input.y;
        if(keys.KeyA||keys.ArrowLeft)x-=1;if(keys.KeyD||keys.ArrowRight)x+=1;
        if(keys.KeyW||keys.ArrowUp)y-=1;if(keys.KeyS||keys.ArrowDown)y+=1;
        const magnitude=Math.hypot(x,y);if(magnitude>1){x/=magnitude;y/=magnitude;}
        const speed=Math.min(p.speed,MAX_PLAYER_SPEED)*(delta/16.667);
        p.x=clamp(p.x+x*speed,p.radius,GAME_WIDTH-p.radius);
        p.y=clamp(p.y+y*speed,p.radius,GAME_HEIGHT-p.radius);
        if(input.touchAim){
            const target=nearest(p);
            if(target)p.angle=Math.atan2(target.y-p.y,target.x-p.x);
            else if(magnitude>.05)p.angle=Math.atan2(y,x);
        }else p.angle=Math.atan2(mouse.y-p.y,mouse.x-p.x);
    }
    function processCombatInput(p){
        if(!active())return;
        if(input.attackHeld||input.attackQueued||keys.Space)castBasic(p);
        if(input.ultimateQueued)castUltimate(p);
        input.attackQueued=input.ultimateQueued=false;
    }
    function castBasic(p=player){
        if(!active()||ReworkedUltimates.blocksMovement(p)||clock<(p._attackReadyAt||0))return false;
        p._attackReadyAt=clock+p.getAttackCooldown();p.lastAttack=Date.now();p.basicAttack();return true;
    }
    function castUltimate(p=player){
        if(!active()||ReworkedUltimates.blocksMovement(p)||!FRUITS[p.fruit]||clock<(p._ultimateReadyAt||0))return false;
        const spec=FruitArt.profile(p.fruit);
        const aim=p.isAI?player:input.touchAim?nearest(p):null;
        const tx=aim?.x??(input.touchAim?p.x+Math.cos(p.angle)*220:mouse.x);
        const ty=aim?.y??(input.touchAim?p.y+Math.sin(p.angle)*220:mouse.y);
        p.angle=Math.atan2(ty-p.y,tx-p.x);
        p._ultimateReadyAt=clock+spec.cooldown;p._ultimateDuration=spec.cooldown;p.lastSkill=Date.now();
        if(!ReworkedUltimates.cast(p,{x:tx,y:ty}))ReferenceUltimates.cast(p,{x:tx,y:ty});
        if(p===player)toast(spec.ultimate);
        p.updateUI();return true;
    }
    function drawUltimateEffects(){} // Reference effects use the existing game renderer.
    function cooldown(button,label,remaining,total,unavailable=false){
        const fraction=clamp(remaining/(total||1),0,1);
        $(button).style.setProperty('--remaining',`${fraction*100}%`);
        $(button).classList.toggle('cooling',remaining>0);
        $(button).classList.toggle('unavailable',unavailable);
        $(button).setAttribute('aria-disabled',String(unavailable||remaining>0));
        $(label).textContent=unavailable?'TANPA BUAH':remaining>0?`${(remaining/1000).toFixed(1)}s`:'SIAP';
    }
    function updateHUD(){
        $('hudLevel').textContent=String(player.level).padStart(2,'0');
        $('hudXP').textContent=`${Math.floor(player.xp)} / ${player.maxXp}`;
        $('xpFill').style.width=`${clamp(player.xp/player.maxXp*100,0,100)}%`;
        $('hudGold').textContent=player.gold.toLocaleString('id-ID');
        $('hudIsland').textContent=gameState.islands[gameState.currentIsland].name;
        $('hudEnemies').textContent=enemies.filter(e=>!e.dead).length;
        if(lastFruit!==player.fruit){
            lastFruit=player.fruit;
            $('hudFruitIcon').hidden=!FRUITS[player.fruit];
            if(FRUITS[player.fruit])$('hudFruitIcon').src=FruitArt.uri(player.fruit);
            $('hudFruitName').textContent=player.fruit?FruitArt.name(player.fruit):'Belum ada buah';
            $('hudRarity').textContent=FRUITS[player.fruit]?`${FRUITS[player.fruit].rarity} · ${FRUITS[player.fruit].category}`:'Temukan kekuatanmu';
            $('ultimateName').textContent=player.fruit?FruitArt.profile(player.fruit).ultimate:'Ambil buah untuk membuka Ultimate';
        }
        cooldown('attackButton','attackCooldown',Math.max(0,(player._attackReadyAt||0)-clock),player.getAttackCooldown());
        cooldown('ultimateButton','ultimateCooldown',Math.max(0,(player._ultimateReadyAt||0)-clock),player._ultimateDuration||1,!FRUITS[player.fruit]);
        const nearby=[...fruits,...portals].some(v=>Math.hypot(player.x-v.x,player.y-v.y)<50);
        $('interactButton').classList.toggle('nearby',nearby);
    }
    function tick(){
        const now=performance.now();delta=clamp(now-last,0,50);last=now;
        if(!gameState.paused){clock+=delta;CombatTimeline.tick(delta);}
        updateHUD();$('toast').classList.toggle('visible',now<toastUntil);
    }
    function renderCodex(query=''){
        const q=query.trim().toLowerCase(),grid=$('fruitGrid');grid.replaceChildren();
        const found=Object.keys(FRUITS).filter(k=>`${FruitArt.name(k)} ${FruitArt.profile(k).ultimate} ${FRUITS[k].category}`.toLowerCase().includes(q));
        for(const key of found){
            const spec=FruitArt.profile(key),card=document.createElement('article');card.className='fruit-card';
            const img=document.createElement('img');img.src=FruitArt.uri(key);img.alt=spec.name;
            const title=document.createElement('h3');title.textContent=spec.name;
            const rarity=document.createElement('small');rarity.textContent=`${FRUITS[key].rarity} · ${FRUITS[key].category}`;
            const power=document.createElement('p');power.textContent=spec.ultimate;
            const cd=document.createElement('em');cd.textContent=`Ultimate · ${spec.cooldown/1000} detik`;
            card.append(img,title,rarity,power,cd);
            if(ReworkedUltimates.specs[key]){const detail=document.createElement("p");detail.className="fruit-power-detail";detail.textContent=ReworkedUltimates.specs[key].description;card.appendChild(detail);}
            grid.appendChild(card);
        }
        $('fruitTotal').textContent=`${found.length} buah`;
    }
    function bind(){
        const hero=JSON.parse($('pirate-hero-data').textContent);
        document.querySelectorAll('.captain-image').forEach(im=>im.src=hero.base);
        const art=JSON.parse($('pirate-art-data').textContent);
        document.querySelector('.menu-sea').style.backgroundImage=`url("${art.islands[0].background}")`;
        document.querySelectorAll('.starter').forEach(b=>{
            b.querySelector('img').src=FruitArt.uri(b.dataset.fruit);
            b.onclick=()=>{starter=b.dataset.fruit;document.querySelectorAll('.starter').forEach(v=>{v.classList.toggle('selected',v===b);v.setAttribute('aria-pressed',String(v===b));});};
        });
        $('startButton').onclick=start;$('menuButton').onclick=menu;
        $('codexButton').onclick=()=>openModal('codexModal');
        $('helpButton').onclick=()=>openModal('helpModal');
        $('equippedFruit').onclick=()=>{$('fruitSearch').value=player.fruit?FruitArt.name(player.fruit):'';openModal('codexModal');};
        $('fruitSearch').oninput=e=>renderCodex(e.target.value);
        document.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModals);
        $('statusToggle').onclick=()=>{const collapsed=$('captainPanel').classList.toggle('compact');$('statusToggle').setAttribute('aria-expanded',String(!collapsed));};
        $('inventoryButton').onclick=inventory;$('shopButton').onclick=shop;
        $('closeInventoryBtn').addEventListener('click',()=>{ $('inventoryOverlay').style.display='none';syncPause();});
        $('shopClose').onclick=()=>{SHOP.open=false;updateShopUI();syncPause();};
        document.querySelectorAll('.shopItem').forEach(item=>item.addEventListener('click',()=>buyItem(Number(item.dataset.id))));
        $('interactButton').onclick=()=>{if(active())player.checkInteractions();};
        const stick=$('joystick');
        function setStick(e){
            const r=stick.getBoundingClientRect(),max=r.width*.34;
            const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
            const length=Math.hypot(x,y),scale=length>max?max/length:1;
            input.x=length<max*.12?0:x*scale/max;input.y=length<max*.12?0:y*scale/max;
            $('joystickKnob').style.transform=`translate(${x*scale}px,${y*scale}px)`;
        }
        stick.addEventListener('pointerdown',e=>{if(!active()||input.stickId!==null)return;e.preventDefault();input.stickId=e.pointerId;input.touchAim=true;stick.setPointerCapture(e.pointerId);setStick(e);});
        stick.addEventListener('pointermove',e=>{if(e.pointerId===input.stickId)setStick(e);});
        const releaseStick=e=>{if(e.pointerId===input.stickId){input.stickId=null;input.x=input.y=0;$('joystickKnob').style.transform='translate(0px,0px)';}};
        ['pointerup','pointercancel','lostpointercapture'].forEach(type=>stick.addEventListener(type,releaseStick));
        $('attackButton').addEventListener('pointerdown',e=>{
            if(!active()||input.attackId!==null)return;e.preventDefault();input.attackId=e.pointerId;input.attackHeld=true;input.touchAim=e.pointerType!=='mouse'||input.touchAim;
            e.currentTarget.setPointerCapture(e.pointerId);castBasic();
        });
        const releaseAttack=e=>{if(e.pointerId===input.attackId){input.attackHeld=false;input.attackId=null;}};
        ['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('attackButton').addEventListener(type,releaseAttack));
        $('attackButton').addEventListener('click',e=>{if(e.detail===0)castBasic();});
        $('ultimateButton').onclick=()=>castUltimate();
        $('ultimateButton').addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')input.touchAim=true;});
        canvas.addEventListener('pointermove',e=>{
            if(e.pointerType!=='mouse')return;input.touchAim=false;
            const r=canvas.getBoundingClientRect(),sx=(e.clientX-r.left)*canvas.width/r.width,sy=(e.clientY-r.top)*canvas.height/r.height;
            mouse.x=camera.x-canvas.width/2+sx;mouse.y=camera.y-canvas.height/2+sy;mouse.screenX=sx;mouse.screenY=sy;
        });
        canvas.addEventListener('pointerdown',e=>{
            if(!active()||e.pointerType!=='mouse')return;e.preventDefault();
            if(e.button===0)input.attackQueued=true;if(e.button===2)input.ultimateQueued=true;
        });
        canvas.addEventListener('contextmenu',e=>e.preventDefault());
        const controls=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyQ','KeyE','KeyI','KeyB','Digit1','Digit2','Digit3','Escape']);
        window.addEventListener('keydown',e=>{
            if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
            if(!controls.has(e.code))return;e.preventDefault();
            if(SHOP.open&&/^Digit[123]$/.test(e.code)){if(!e.repeat)buyItem(Number(e.code.slice(-1)));return;}
            if(e.code==='Escape'){if(e.repeat)return;if(!$('codexModal').hidden||!$('helpModal').hidden)closeModals();else if($('inventoryOverlay').style.display==='flex')inventory();else if(SHOP.open)shop();else if(started&&$('mainMenu').hidden)menu();else if(started)start();return;}
            if(e.repeat&&['KeyI','KeyB','KeyQ','KeyE'].includes(e.code))return;
            if(e.code==='KeyI'&&started&&$('mainMenu').hidden){inventory();return;}
            if(e.code==='KeyB'&&started&&$('mainMenu').hidden){shop();return;}
            if(!active())return;
            if(e.code==='KeyQ')input.ultimateQueued=true;
            else if(e.code==='KeyE')player.checkInteractions();
            else keys[e.code]=true;
        });
        window.addEventListener('keyup',e=>{keys[e.code]=false;});
        window.addEventListener('blur',()=>{clearInput();if(active())menu();});
        document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(active())menu();}});
        window.addEventListener('resize',clearInput);
        $('mainMenu').hidden=false;syncPause();updateHUD();
    }
    return {bind,start,menu,tick,movePlayer,processCombatInput,castBasic,castUltimate,drawUltimateEffects,clearInput,updateHUD,
        get clock(){return clock;},input};
})();
Voyage.bind();
gameLoop();
