import fs from 'node:fs';
const base='assets/generated/sprites/captain/';
const spec=JSON.parse(fs.readFileSync(base+'sprite-request.json','utf8'));
const n=spec.states.walk.frames;
const prompt=`Draw an animation strip of exactly ${n} full-body versions of the pirate in reference 1, in one horizontal row.
Reference 1 controls costume, face and painted cartoon style. Reference 2 controls layout and blank space. Reference 3 controls the LEG POSES: match those diagrams, one diagram per pirate.
This is a FRONT-FACING march toward the viewer. Torso and BOTH knees face the camera. The head can retain the slight right-facing tilt from the original. In the first pose, the foot on the LEFT SIDE OF THE IMAGE is forward and lower. The foot on the RIGHT SIDE OF THE IMAGE is behind and higher. In the third pose this is reversed. Second and fourth poses have close feet and alternate lifted knees.
Visually match the BLUE and ORANGE legs in the diagram but paint the actual pants dark and boots brown. Do not copy the reference pirate's original legs into these frames. Redraw the lower body to follow each diagram. Show two legs and two feet per character. Frame one and frame three must NOT have the same silhouette or same forward boot.
Maintain the same hat, face, red coat, teal sash, cutlass held low and body scale in every frame. Same top-left lighting. Keep all characters separate and fully inside their slots with ${spec.cell.safe_margin}px padding. Pure flat ${spec.chroma_key.hex} background, no shadows, no text, no diagram lines. Original costume colors only; no blue or orange guide legs.
Output the single ${n}-pose strip only.`;
fs.writeFileSync(base+'prompts/walk-retry.txt',prompt);
console.log('Prepared compact pose-specific walk correction.');
