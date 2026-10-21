# Captain sprite QA

Provider: GPT / `codex`, using the sprite-gen component-row pipeline.
Base identity: `base-source.png` / `assets/generated/hero/pirate-base.png`.
Output: transparent 768 × 384 atlas, 192 × 192 cells, 4 idle + 4 walk frames.

## Idle

Pass at game display scale. Four subtle idle poses, stable hat/face/costume,
complete anatomy, feet grounded, no visible green matte or clipped accessories.
Motion is deliberately minimal.

## Walk

Best-effort / experimental locomotion. The final correction uses a front-facing
cartoon march with a slightly turned head. The sequence alternates which foot
is forward and reads as stepping at the game's small sprite scale. Four frames
contain two principal repeated gait poses; this is not a smooth four-phase
anatomically precise walk. Do not describe it as production-quality locomotion
or use it for measured root motion / stride matching.

Earlier rows repeatedly kept the same leg forward. They were regenerated,
not repaired by cropping, reordering, or retiming. The final correction uses
`prompts/walk-retry.txt`; report: `reports/walk-final-correction.json`.

Additional motion reference: `references/walk-motion-guide.png`, a newly drawn
pose diagram made by `tools/make-motion-reference.py`. It supplies leg placement
only; the generated base supplies character identity and costume.

## Pipeline and runtime

- Canonical connected-component extraction, not fixed-width image cutting.
- Extraction and automated inspection report no errors or warnings.
- Atlas is composed by sprite-gen and consumed using `manifest.json.frame_layout.rows`.
- Browser preview runs the same renderer as the game.
- Horizontal mirroring follows aim direction; this also mirrors accessory
  handedness. No independent rear or side-view animation was generated.
- Normal, dragon, and Zoan renderer branches are smoke-tested separately.
- Motion review includes contact sheets and the animated browser preview.
