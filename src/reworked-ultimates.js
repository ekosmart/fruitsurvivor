// Eight bespoke ultimates. Every phase uses the paused game clock, not wall time.
const ReworkedUltimates=(()=>{
 const specs={
  QUETZALCOATL:{name:'Feathered Serpent Dominion',cooldown:24000,duration:4400,color:'#76e09e',description:'Ular bersayap mengitari area, menarik musuh, menghujani racun, lalu menerjang pusat pusaran.'},
  PHOENIX:{name:'Rebirth Dive',cooldown:14000,duration:4600,color:'#5acfff',description:'Berubah menjadi phoenix, menukik dan meledakkan api biru. Lingkaran abu memulihkan HP kapten.'},
  SABERTOOTH:{name:'Predator Execution',cooldown:11000,duration:3500,color:'#ffbb76',description:'Menerkam target, mencakar empat kali, lalu menggigit. Luka cakar memberi bleed berkala.'},
  TRICERATOPS:{name:'Ironhorn Stampede',cooldown:14000,duration:2200,color:'#dfbe82',description:'Ancang-ancang lalu menyeruduk dengan pengurangan damage 65%, mendorong musuh dan menghentakkan tanah.'},
  DRAGON:{name:'Dragon’s Breath',cooldown:12000,duration:4500,color:'#ff8954',description:'Kepala naga menyemburkan api kerucut selama dua detik. Tanah terbakar terus melukai musuh.'},
  AZURE_DRAGON:{name:'Heavenly Dragon Descent',cooldown:24000,duration:3700,color:'#75caff',description:'Naga melingkari awan badai dan menarik musuh, lalu turun bersama hantaman petir besar.'},
  KIRIN:{name:'Celestial Thunder Run',cooldown:18000,duration:2600,color:'#e6c5ff',description:'Berubah menjadi Kirin dan berlari menerobos musuh. Jejak petir tetap aktif; titik akhir meledak dan memulihkan 10% HP.'},
  ORIGIN:{name:'Genesis Reset',cooldown:22000,duration:1700,color:'#fff2b1',description:'Membersihkan debuff kapten, memulihkan 35% HP, meniadakan proyektil masuk dan mendorong musuh tanpa menghapus debuff mereka.'}
 };
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const live=e=>e&&!e.dead&&e.hp>0;
 const point=(x,y,r=20)=>({x:clamp(x,r,GAME_WIDTH-r),y:clamp(y,r,GAME_HEIGHT-r)});
 function targets(owner){return owner.isAI?[player]:[...enemies,...(typeof ArenaManager!=='undefined'&&ArenaManager.active&&ArenaManager.ai?[ArenaManager.ai]:[])].filter(e=>e!==owner&&live(e));}
 function segmentDistance(e,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;const f=l?clamp(((e.x-a.x)*dx+(e.y-a.y)*dy)/l,0,1):0;return Math.hypot(e.x-a.x-dx*f,e.y-a.y-dy*f);}
 function push(e,from,amount){const a=Math.atan2(e.y-from.y,e.x-from.x),scale=e.isBoss?.3:1;Object.assign(e,point(e.x+Math.cos(a)*amount*scale,e.y+Math.sin(a)*amount*scale,e.radius||20));}
 function cleanse(p){
  for(const key of ['stunned','frozen','slowed','burning','blueburn','hellburn','charmed','confused','blinded','quasarDot','fear','_elysiumStun','_poisonRemaining','_poisonDamage','bleeding'])p[key]=0;
  if(p._poisonInterval){clearInterval(p._poisonInterval);p._poisonInterval=null;}
 }
 function hostile(projectile,owner){
  if(projectile.owner===owner)return false;
  if(projectile.owner)return owner.isAI?projectile.owner===player:enemies.includes(projectile.owner)||projectile.owner.isAI||projectile.owner instanceof Boss;
  // Legacy shots without an owner count only when travelling toward the caster.
  return Math.cos(projectile.angle||0)*(owner.x-projectile.x)+Math.sin(projectile.angle||0)*(owner.y-projectile.y)>0;
 }
 class Ultimate {
  constructor(owner,key,target){
   this.owner=owner;this.key=key;this.spec=specs[key];this.start=this.last=Voyage.clock;this.elapsed=0;this.finished=false;
   this.origin={x:owner.x,y:owner.y};this.angle=Math.atan2(target.y-owner.y,target.x-owner.x);this.flags=new Set();this.hit=new Set();this.wounded=new Set();this.trail=[];this.nextTick=0;
   this.base=Math.max(30,FRUITS[key].damage||60);this.totalDamage=0;this.healed=0;this.removedProjectiles=0;
   const range=key==='KIRIN'?460:key==='TRICERATOPS'?420:400;
   const d=Math.min(range,dist(owner,target));this.target=point(owner.x+Math.cos(this.angle)*d,owner.y+Math.sin(this.angle)*d,owner.radius);
   if(['KIRIN','TRICERATOPS'].includes(key))this.target=point(owner.x+Math.cos(this.angle)*range,owner.y+Math.sin(this.angle)*range,owner.radius);
   if(key==='SABERTOOTH'){
    this.prey=targets(owner).filter(e=>dist(e,owner)<=420).sort((a,b)=>dist(a,target)-dist(b,target))[0];
    if(this.prey){const a=Math.atan2(this.prey.y-owner.y,this.prey.x-owner.x);this.angle=a;this.target=point(this.prey.x-Math.cos(a)*35,this.prey.y-Math.sin(a)*35,owner.radius);}
   }
   this.lockEnd={PHOENIX:1000,SABERTOOTH:1450,TRICERATOPS:1550,DRAGON:2350,KIRIN:950}[key]||0;
   if(this.lockEnd){owner._ultimateMotion=this;owner._ultimateGuard=key==='TRICERATOPS'?.65:key==='PHOENIX'||key==='KIRIN'?.4:0;}
   if(key==='ORIGIN'){cleanse(owner);this.heal(.35);}
  }
  once(key,at,fn){if(this.elapsed>=at&&!this.flags.has(key)){this.flags.add(key);fn();}}
  damage(e,mult){if(!live(e))return;const amount=computeScaledDamage(Math.round(this.base*mult),this.owner);e.takeDamage(amount);this.totalDamage+=amount;}
  area(center,r,mult,after=()=>{}){for(const e of targets(this.owner))if(dist(e,center)<r+(e.radius||0)){this.damage(e,mult);after(e);}}
  heal(fraction){const amount=Math.min(this.owner.maxHp-this.owner.hp,this.owner.maxHp*fraction);this.owner.hp+=amount;this.healed+=amount;}
  release(){if(this.owner._ultimateMotion===this){delete this.owner._ultimateMotion;delete this.owner._ultimateGuard;}}
  cancel(){this.release();this.finished=true;}
  move(start,end){const previous={x:this.owner.x,y:this.owner.y};const f=clamp((this.elapsed-start)/(end-start),0,1),smooth=f*f*(3-2*f);Object.assign(this.owner,point(this.origin.x+(this.target.x-this.origin.x)*smooth,this.origin.y+(this.target.y-this.origin.y)*smooth,this.owner.radius));this.owner.angle=this.angle;return previous;}
  cone(e){const dx=e.x-this.origin.x,dy=e.y-this.origin.y;const along=dx*Math.cos(this.angle)+dy*Math.sin(this.angle);return along>0&&along<350&&Math.abs(dx*Math.sin(this.angle)-dy*Math.cos(this.angle))<along*.48+(e.radius||0);}
  tick(){
   const t=this.elapsed;
   switch(this.key){
    case 'QUETZALCOATL': if(t>=600){this.area(this.target,190,.23,e=>{this.wounded.add(e);});for(const e of this.wounded)if(live(e)&&dist(e,this.target)>190)this.damage(e,.11);}break;
    case 'PHOENIX': if(t>=1000&&dist(this.owner,this.target)<150)this.heal(.04);break;
    case 'SABERTOOTH': if(t>=500)for(const e of this.wounded)this.damage(e,.16);break;
    case 'DRAGON': if(t>=350)for(const e of targets(this.owner))if(this.cone(e))this.damage(e,t<2350?.28:.12);break;
    case 'AZURE_DRAGON': if(t>=800&&t<2400)this.area(this.target,205,.16);break;
    case 'KIRIN': if(t>=250)for(const e of targets(this.owner))if(this.trail.some(p=>dist(e,p)<43))this.damage(e,.22);break;
   }
  }
  update(){
   if(this.finished||gameState.paused)return;
   this.elapsed=Voyage.clock-this.start;const dt=Math.min(50,Voyage.clock-this.last);this.last=Voyage.clock;
   const t=this.elapsed;
   if(!live(this.owner)){this.cancel();return;}
   if(t>=this.lockEnd)this.release();
   if(t>=this.spec.duration){this.cancel();return;}
   if(['QUETZALCOATL','AZURE_DRAGON'].includes(this.key)){
    const begin=this.key==='QUETZALCOATL'?600:800,end=this.key==='QUETZALCOATL'?2600:2400;
    if(t>=begin&&t<end)for(const e of targets(this.owner)){const d=dist(e,this.target);if(d<220&&d>25){const step=Math.min(d-25,dt*.055*(e.isBoss?.25:1));e.x+=(this.target.x-e.x)/d*step;e.y+=(this.target.y-e.y)/d*step;}}
    this.once('descent',end,()=>this.area(this.target,210,this.key==='AZURE_DRAGON'?2.8:2.2,e=>{if(this.key==='AZURE_DRAGON')e.stunned=Math.max(e.stunned||0,75);else this.wounded.add(e);}));
   }
   if(this.key==='PHOENIX'){
    if(t>=300&&t<=1000)this.move(300,1000);
    this.once('land',1000,()=>{Object.assign(this.owner,this.target);this.area(this.target,145,1.8);});
   }
   if(this.key==='SABERTOOTH'){
    if(t<=400)this.move(0,400);
    for(let n=0;n<4;n++)this.once('claw'+n,400+n*210,()=>this.area(this.owner,88,.42,e=>this.wounded.add(e)));
    this.once('bite',1300,()=>this.area(this.owner,96,1.5,e=>push(e,this.owner,45)));
   }
   if(this.key==='TRICERATOPS'||this.key==='KIRIN'){
    const begin=this.key==='KIRIN'?200:450,end=this.key==='KIRIN'?850:1350;
    if(t>=begin&&t<=end){const previous=this.move(begin,end);if(!this.trail.length||dist(this.owner,this.trail[this.trail.length-1])>24)this.trail.push({x:this.owner.x,y:this.owner.y});
     for(const e of targets(this.owner))if(segmentDistance(e,previous,this.owner)<48+(e.radius||0)){
      if(!this.hit.has(e)){this.damage(e,1.1);this.hit.add(e);}push(e,previous,dt*.16);e.stunned=Math.max(e.stunned||0,15);
     }
    }
    this.once('arrival',end,()=>{Object.assign(this.owner,this.target);this.area(this.target,this.key==='KIRIN'?125:150,1.5,e=>{push(e,this.target,90);e.stunned=Math.max(e.stunned||0,55);});if(this.key==='KIRIN')this.heal(.1);});
   }
   if(this.key==='ORIGIN'){
    const radius=Math.min(300,50+t*.3);
    for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];if(dist(p,this.origin)<radius&&hostile(p,this.owner)){projectiles.splice(i,1);this.removedProjectiles++;}}
    for(const e of targets(this.owner))if(dist(e,this.origin)<radius&&!this.hit.has(e)){this.hit.add(e);this.damage(e,.7);push(e,this.origin,130);}
   }
   if(t>=this.nextTick){this.tick();this.nextTick=t+400;}
  }
  draw(c){if(this.finished)return;const t=this.elapsed,s=this.spec;
   c.save();c.strokeStyle=s.color;c.fillStyle=s.color;c.lineWidth=3;c.shadowColor=s.color;c.shadowBlur=12;
   const fade=Math.min(1,(s.duration-t)/400);c.globalAlpha=fade;
   if(['QUETZALCOATL','AZURE_DRAGON'].includes(this.key)){
    const azure=this.key==='AZURE_DRAGON',end=azure?2400:2600;
    ring(c,this.target,azure?205:190,t<600?.25:.55);
    c.save();c.translate(this.target.x,this.target.y);c.rotate(t/850);
    for(let i=0;i<7;i++){c.globalAlpha=.1;c.beginPath();c.ellipse(Math.cos(i)*100,Math.sin(i)*80,110,50,i,0,Math.PI*2);c.fill();}
    c.globalAlpha=.9;const r=t<end?150:Math.max(0,150-(t-end)*.3);serpent(c,r,t/260,azure);
    if(!azure)for(let n=0;n<18;n++){const a=n*2.4,rain=(t*.12+n*29)%180;c.save();c.rotate(a);c.translate(rain,0);feather(c,20);c.restore();}
    c.restore();
    if(t>=end){ring(c,this.target,Math.min(220,(t-end)*.55),Math.max(0,1-(t-end)/900));if(azure)for(let i=0;i<5;i++)bolt(c,this.target.x+(i-2)*65,this.target.y-220,this.target.x+(i-2)*40,this.target.y+(i%2)*40,t);}
   }else if(this.key==='PHOENIX'){
    if(t<1000){c.save();c.translate(this.owner.x,this.owner.y-20-Math.sin(Math.min(1,t/1000)*Math.PI)*65);c.rotate(this.angle);bird(c,1+Math.sin(t/120)*.12);c.restore();}
    else{ring(c,this.target,145,.22);ring(c,this.target,40+(t%650)/650*100,.65);c.save();c.translate(this.target.x,this.target.y);for(let i=0;i<8;i++){c.rotate(Math.PI/4);feather(c,45);}c.restore();}
   }else if(this.key==='DRAGON'){
    c.save();c.translate(this.origin.x,this.origin.y);c.rotate(this.angle);
    if(t>=350){c.globalAlpha=t<2350?.35:.14;c.beginPath();c.moveTo(25,0);c.arc(0,0,340,-.44,.44);c.closePath();c.fill();
     for(let n=0;n<14;n++){const d=35+((t*.25+n*23)%300),y=Math.sin(n*12+t/120)*d*.35;c.globalAlpha=t<2350?.8:.3;c.beginPath();c.ellipse(d,y,18+n%4,8,0,0,Math.PI*2);c.fill();}}
    if(t<2350){c.globalAlpha=1;dragonHead(c,0,-35,1.2);}c.restore();
   }else if(['SABERTOOTH','TRICERATOPS','KIRIN'].includes(this.key)){
    const end=this.key==='SABERTOOTH'?1450:this.key==='KIRIN'?950:1550;
    if(t<end){c.save();c.translate(this.owner.x,this.owner.y-12);c.rotate(this.angle);beast(c,this.key,t);c.restore();}
    if(this.key==='SABERTOOTH'){
     if(t>=400&&t<1450)for(let n=-1;n<=1;n++){c.save();c.translate(this.owner.x,this.owner.y);c.rotate(this.angle);c.lineWidth=5;c.beginPath();c.arc(22,n*17,55,-1.1+(t%210)/300,1.1);c.stroke();c.restore();}
     for(const e of this.wounded)if(live(e)){c.globalAlpha=.7;for(let n=0;n<3;n++){c.beginPath();c.moveTo(e.x-9+n*8,e.y-26);c.lineTo(e.x-14+n*8,e.y-10);c.stroke();}}
    }else{
     c.globalAlpha=.6;for(const p of this.trail){if(this.key==='KIRIN')bolt(c,p.x,p.y-25,p.x+4,p.y+8,t);else{c.beginPath();c.moveTo(p.x-14,p.y-9);c.lineTo(p.x+8,p.y+4);c.lineTo(p.x-3,p.y+14);c.stroke();}}
     const impact=this.key==='KIRIN'?850:1350;if(t>=impact)ring(c,this.target,Math.min(155,(t-impact)*.45),Math.max(0,1-(t-impact)/1000));
    }
   }else if(this.key==='ORIGIN'){
    ring(c,this.origin,Math.min(300,50+t*.3),.65);ring(c,this.origin,72,.5);
    c.save();c.translate(this.origin.x,this.origin.y);c.rotate(t/1000);for(let i=0;i<8;i++){c.rotate(Math.PI/4);c.beginPath();c.moveTo(38,-12);c.lineTo(58,0);c.lineTo(38,12);c.stroke();}c.restore();
   }
   c.restore();
  }
 }
 function ring(c,p,r,alpha){c.save();c.globalAlpha*=alpha;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,Math.max(1,r),0,Math.PI*2);c.stroke();c.globalAlpha*=.14;c.fill();c.restore();}
 function bolt(c,x,y,tx,ty,t){c.beginPath();c.moveTo(x,y);for(let n=1;n<=7;n++){const f=n/7;c.lineTo(x+(tx-x)*f+Math.sin(n*9+t/70)*8,y+(ty-y)*f);}c.stroke();}
 function feather(c,size){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(size*.7,-size*.6,size,0);c.quadraticCurveTo(size*.7,size*.5,0,0);c.fill();}
 function dragonHead(c,x,y,scale){c.save();c.translate(x,y);c.scale(scale,scale);c.fillStyle='#193748';c.lineWidth=3;c.beginPath();c.moveTo(-28,-24);c.lineTo(10,-20);c.lineTo(39,-9);c.lineTo(34,16);c.lineTo(-13,23);c.lineTo(-32,6);c.closePath();c.fill();c.stroke();c.fillStyle='#fff0bf';for(const side of [-1,1]){c.beginPath();c.moveTo(-17,side*16);c.lineTo(-43,side*40);c.lineTo(-28,side*8);c.fill();}c.fillStyle='#fff';c.fillRect(7,-12,10,5);c.beginPath();c.moveTo(23,13);c.lineTo(26,27);c.lineTo(31,12);c.fill();c.restore();}
 function serpent(c,r,t,azure){c.lineWidth=22;c.beginPath();for(let n=0;n<=36;n++){const a=n/36*Math.PI*1.7,x=Math.cos(a)*r,y=Math.sin(a)*r*.7+Math.sin(n*.6+t)*7;if(n===0)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();c.save();c.lineWidth=4;c.strokeStyle='#f5edc0';c.stroke();c.restore();dragonHead(c,r,0,1);if(!azure)for(const side of [-1,1]){c.save();c.translate(0,side*r*.65);c.scale(1,side);for(let n=0;n<7;n++){c.save();c.rotate(-1+n*.23);feather(c,65-n*4);c.restore();}c.restore();}}
 function bird(c,flap){c.save();c.scale(1,flap);for(const side of [-1,1]){c.save();c.scale(1,side);c.beginPath();c.moveTo(20,0);c.lineTo(-5,70);c.lineTo(-45,100);c.lineTo(-25,45);c.lineTo(-65,55);c.lineTo(-35,10);c.closePath();c.fill();c.stroke();c.restore();}c.fillStyle='#e7fcff';c.beginPath();c.ellipse(5,0,34,13,0,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(31,-6);c.lineTo(55,0);c.lineTo(31,6);c.fill();c.restore();}
 function beast(c,key,t){c.save();c.fillStyle=key==='SABERTOOTH'?'#aa6239':key==='TRICERATOPS'?'#647d70':'#a58bd1';c.beginPath();c.ellipse(-8,0,50,28,0,0,Math.PI*2);c.fill();c.stroke();for(const side of [-1,1]){c.beginPath();c.moveTo(-30,side*17);c.lineTo(-38+Math.sin(t/65)*12,side*40);c.moveTo(15,side*18);c.lineTo(25-Math.sin(t/65)*12,side*40);c.stroke();}c.beginPath();c.ellipse(35,0,25,23,0,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#fff2cc';if(key==='SABERTOOTH'){for(const side of [-1,1]){c.beginPath();c.moveTo(47,side*8);c.lineTo(68,side*21);c.lineTo(52,side*17);c.fill();}}else{const horns=key==='TRICERATOPS'?[-1,0,1]:[0];for(const side of horns){c.beginPath();c.moveTo(43,side*15-5);c.lineTo(82,side*22);c.lineTo(43,side*15+5);c.fill();}}c.fillStyle='#fff';c.fillRect(40,-13,7,4);c.restore();}
 for(const [key,spec] of Object.entries(specs))if(FRUITS[key])FRUITS[key].description=spec.description;
 function cast(owner,target){const key=owner.fruit;if(!specs[key])return false;cancel(owner);const action=new Ultimate(owner,key,target);specialAttacks.push(action);return true;}
 function cancel(owner){for(const a of specialAttacks)if(a instanceof Ultimate&&a.owner===owner)a.cancel();}
 return {specs,cast,cancel,isReworked:key=>!!specs[key],blocksMovement:p=>!!p._ultimateMotion,hideHero:p=>!!p._ultimateMotion&&p._ultimateMotion.key!=='DRAGON'};
})();
