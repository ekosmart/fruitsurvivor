// Dependency-free raster export of a code-drawn fruit/compass emblem.
import fs from 'node:fs';
import zlib from 'node:zlib';
fs.mkdirSync('pwa/icons',{recursive:true});
function crc(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([n,t,data,c]);}
const colors={navy:[11,28,41],gold:[223,187,121],purple:[145,79,154],leaf:[109,201,188],light:[255,230,160]};
function polygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
function pixel(x,y){
  let color=colors.navy;
  const r=Math.hypot(x-256,y-256);
  if(r>174&&r<181)color=colors.gold;
  if(polygon(x,y,[[256,58],[266,85],[256,108],[246,85]])||polygon(x,y,[[256,404],[266,427],[256,454],[246,427]])||polygon(x,y,[[58,256],[85,246],[108,256],[85,266]])||polygon(x,y,[[404,256],[427,246],[454,256],[427,266]]))color=colors.gold;
  const fruit=((x-224)/72)**2+((y-280)/88)**2<1||((x-288)/72)**2+((y-280)/88)**2<1;
  if(fruit)color=colors.purple;
  if(((x-286)/47)**2+((y-170)/22)**2<1)color=colors.leaf;
  if(Math.abs(x-(254+(200-y)*.16))<7&&y>142&&y<207)color=colors.gold;
  if(polygon(x,y,[[268,212],[214,283],[246,283],[235,338],[300,258],[265,258]]))color=colors.light;
  if(fruit&&Math.hypot(x-190,y-250)<7)color=colors.light;
  return color;
}
for(const [name,size,maskable] of [['icon-192.png',192,false],['icon-512.png',512,false],['maskable-512.png',512,true],['apple-touch-icon.png',180,false]]){
  const rows=Buffer.alloc((size*4+1)*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const rgb=[0,0,0];
    for(let sy=0;sy<2;sy++)for(let sx=0;sx<2;sx++){
      let px=(x+(sx+.5)/2)*512/size,py=(y+(sy+.5)/2)*512/size;
      if(maskable){px=256+(px-256)/.78;py=256+(py-256)/.78;}
      const c=pixel(px,py);for(let n=0;n<3;n++)rgb[n]+=c[n]/4;
    }
    const offset=y*(size*4+1)+1+x*4;
    for(let n=0;n<3;n++)rows[offset+n]=Math.round(rgb[n]);rows[offset+3]=255;
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  fs.writeFileSync('pwa/icons/'+name,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]));
}
