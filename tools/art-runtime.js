/* Original illustrated art renderer. Inlined by integrate-art.mjs for offline play. */
const PirateArt = (() => {
    const pack = JSON.parse(document.getElementById('pirate-art-data').textContent);
    const hero = JSON.parse(document.getElementById('pirate-hero-data').textContent);
    const imageCache = new Map();
    const backgroundCache = new Map();
    const motion = new WeakMap();
    let animationTime = 0;
    let lastTick = performance.now();

    function image(source) {
        if (!imageCache.has(source)) {
            const value = new Image();
            value.src = source;
            imageCache.set(source, value);
        }
        return imageCache.get(source);
    }
    function ready(img) { return img.complete && img.naturalWidth > 0; }
    function tick(paused) {
        const now = performance.now();
        if (!paused) animationTime += Math.min(now - lastTick, 100);
        lastTick = now;
    }
    function shadow(ctx, radius, heroRing = false) {
        ctx.save();
        ctx.fillStyle = 'rgba(15,29,43,.25)';
        ctx.beginPath();
        ctx.ellipse(0, radius * .65, radius * 1.03, radius * .4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (heroRing) {
            ctx.strokeStyle = 'rgba(255,227,158,.9)';
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            ctx.ellipse(0, radius * .65, radius * 1.2, radius * .5, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
    function state(entity) {
        let s = motion.get(entity);
        if (!s) {
            s = { x:entity.x, y:entity.y, moved: -1000, facing:1, phase:(entity.x + entity.y) % 900 };
            motion.set(entity,s);
        }
        const dx = entity.x-s.x, dy = entity.y-s.y;
        // Teleports must not be interpreted as footsteps.
        if (Math.hypot(dx,dy) > .08 && Math.hypot(dx,dy) < 60) {
            s.moved = animationTime;
            if (Math.abs(dx) > .1) s.facing = dx < 0 ? -1 : 1;
        }
        s.x=entity.x; s.y=entity.y;
        return s;
    }
    function drawBackground(ctx, index, width, height) {
        const a=pack.islands[index] || pack.islands[0];
        const img=image(a.background);
        ctx.fillStyle=a.ground;
        ctx.fillRect(0,0,width,height);
        if (!ready(img)) return;
        // Rasterize SVG once per island/viewport, keep only two world surfaces.
        const scale=Math.min(1,3072/width,1920/height);
        const w=Math.round(width*scale), h=Math.round(height*scale);
        const key=`${index}:${w}:${h}`;
        if (!backgroundCache.has(key)) {
            const surface=document.createElement('canvas');
            surface.width=w; surface.height=h;
            surface.getContext('2d').drawImage(img,0,0,w,h);
            backgroundCache.set(key,surface);
            while(backgroundCache.size>2) backgroundCache.delete(backgroundCache.keys().next().value);
        }
        ctx.drawImage(backgroundCache.get(key),0,0,width,height);
    }
    function drawEnemy(ctx, entity, forceTier) {
        const a=pack.islands[entity.islandType] || pack.islands[0];
        const tier=forceTier || (entity.isBoss?'boss':entity.isElite?'elite':'normal');
        const img=image(a.enemies[tier]);
        const s=state(entity);
        const moving=animationTime-s.moved<100 && !entity.frozen && !entity.stunned;
        const bob=moving?Math.sin((animationTime+s.phase)/95)*1.4:0;
        const size=entity.radius*(tier==='boss'?3.45:3.2);
        ctx.save();
        ctx.shadowBlur=0;
        shadow(ctx,entity.radius);
        ctx.translate(0,bob);
        ctx.scale(s.facing,1);
        if(ready(img)) ctx.drawImage(img,-size/2,-size*.69,size,size);
        else {
            // Brief loading silhouette; no font/emoji dependency.
            ctx.fillStyle=a.accent;
            ctx.beginPath(); ctx.ellipse(0,-6,entity.radius,entity.radius*1.25,0,0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
    }
    function drawHero(ctx, entity) {
        if(entity._ultimateMotion && entity._ultimateMotion.key!=="DRAGON")return;
        const s=state(entity);
        const moving=animationTime-s.moved<100;
        const stateName=moving?'walk':'idle';
        const row=hero.manifest?.frame_layout?.[stateName];
        const img=image(hero.atlas || hero.base);
        const size=entity.radius*4.65;
        ctx.save();
        ctx.shadowBlur=0;
        shadow(ctx,entity.radius,!entity.isAI);
        // Remain upright; horizontal facing follows the mouse/attack direction.
        ctx.scale(Math.cos(entity.angle)<-.08?-1:1,1);
        if(ready(img)) {
            if (row) {
                const frames=row.frames;
                const frame=frames[Math.floor(animationTime/1000*row.fps)%frames.length];
                ctx.drawImage(img,frame.x,frame.y,frame.w,frame.h,-size/2,-size*.79,size,size);
            } else {
                const aspect=img.naturalWidth/img.naturalHeight;
                ctx.drawImage(img,-size*aspect/2,entity.radius*.65-size,size*aspect,size);
            }
        }
        // Attack feedback follows existing combat timers; it does not alter damage.
        const sinceAttack=Date.now()-entity.lastAttack;
        if(sinceAttack>=0 && sinceAttack<160) {
            ctx.strokeStyle=`rgba(255,238,180,${1-sinceAttack/160})`;
            ctx.lineWidth=3;
            ctx.beginPath(); ctx.arc(4,-4,entity.radius*1.65,-1.2,.8); ctx.stroke();
        }
        ctx.restore();
    }
    // Decode starting island and hero ahead of their first draw.
    image(pack.islands[0].background);
    image(hero.atlas || hero.base);
    for(const source of Object.values(pack.islands[0].enemies)) image(source);
    return { tick, drawBackground, drawEnemy, drawHero, islandCount:pack.islands.length };
})();
