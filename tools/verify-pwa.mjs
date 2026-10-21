import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('dist/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,'/');assert.equal(manifest.display,'standalone');
for(const icon of manifest.icons){const image=fs.readFileSync('dist'+icon.src);assert.equal(image.readUInt32BE(16)+'x'+image.readUInt32BE(20),icon.sizes);}
const html=fs.readFileSync('dist/index.html','utf8');
for(const needle of ['rel="manifest"','apple-touch-icon','id="installButton"','/register.js'])assert.ok(html.includes(needle));
assert.ok(!html.includes('@@'));
const script=fs.readFileSync('dist/sw.js','utf8');
const handlers={},stores=new Map([['pirate-fruit-old',new Map()],['unrelated-app',new Map()]]);
let online=true,claims=0;
const origin='https://game.example';
const cacheName=script.match(/const CACHE = '([^']+)'/)[1];
const caches={
  async open(name){if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return {
    async addAll(files){for(const file of files){assert.ok(fs.existsSync('dist'+file),file);store.set(file,{body:fs.readFileSync('dist'+file),source:'cache'});}},
    async match(key){return store.get(key);}
  };},async keys(){return [...stores.keys()]},async delete(key){return stores.delete(key)}
};
vm.runInNewContext(script,{URL,caches,fetch:async()=>{if(!online)throw Error('Offline');return {source:'network'};},self:{location:{origin},clients:{claim:async()=>{claims++}},addEventListener:(type,fn)=>handlers[type]=fn}});
let work;handlers.install({waitUntil:p=>work=p});await work;
assert.ok(stores.get(cacheName).has('/index.html'));
handlers.activate({waitUntil:p=>work=p});await work;
assert.ok(!stores.has('pirate-fruit-old'));assert.ok(stores.has('unrelated-app'));assert.equal(claims,1);
async function request(path,method='GET'){let response;handlers.fetch({request:{url:new URL(path,origin).href,method},respondWith:p=>response=p});return response?await response:null;}
online=false;
assert.equal((await request('/')).source,'cache');
assert.equal((await request('/?installed=1')).source,'cache');
assert.equal((await request('/index.html')).source,'cache');
assert.equal((await request('/icons/icon-192.png')).source,'cache');
assert.equal(await request('/api/unknown'),null);
assert.equal(await request('/','POST'),null);
assert.equal(await request('https://another.example/'),null);
new vm.Script(fs.readFileSync('dist/register.js','utf8'));
assert.ok(!fs.existsSync('dist/backups'));
console.log('PWA checks passed: manifest/icons, precache, offline launch, query URLs, scope, cache cleanup and registration syntax.');
