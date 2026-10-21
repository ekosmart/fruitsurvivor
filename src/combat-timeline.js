// Timers use game time, so delayed ultimates pause with the menu.
const CombatTimeline=(()=>{
 let time=0,nextId=1;const jobs=new Map();
 return {
  schedule(fn,delay=0,repeat=0){const id=nextId++;jobs.set(id,{fn,due:time+Math.max(0,delay),repeat});return id;},
  cancel(id){jobs.delete(id);},
  clear(){jobs.clear();},
  tick(delta){time+=delta;for(const [id,job] of [...jobs]){if(!jobs.has(id)||job.due>time)continue;if(job.repeat)job.due+=job.repeat;else jobs.delete(id);job.fn();}},
  get pending(){return jobs.size;}
 };
})();
