# Larry Dunk: The Thousand Horses
### Game Design Specification v0.3

---

## QUICK REFERENCE

**Level sequence:** 0 Prologue → 1 Tutorial → 2 Cain&Abel → 3 British Larry → 4 Survivalist Larry → 5 Paraplegic Larry → 6 Axe Murderer → 7 Cereal Mascot → 8 Investment Group → 9 Female Larry → 10 Rival Haras → 11 Mr. Runo → 12 Zeus → 13 Final

**File load order:** constants → sprites → units → grid → combat → ai → ui → input → cutscene → levels → tetris → main

**Canvas:** 960×640, TILE_SIZE=48, GRID_OFFSET_X=16, GRID_OFFSET_Y=40

---

## IMPLEMENTATION STATUS

### All Completed Features

#### Foundation
- [x] File structure: css/, js/, art/, sfx/, music/ folders
- [x] Full-window layout: #gameContainer fixed inset 0, canvas 100%×100%; click coordinates scale-compensated in input.js
- [x] JS load order: all scripts loaded in dependency order via index.html
- [x] test.html: automated test suite — checks all unit types, sprite keys, terrain types, key functions, runs loadLevel(0-13) smoke test

#### Sprites (final approved designs)
- [x] All sprites use `u = sz/20` proportional unit; smooth vector draw functions (arc/ellipse/roundRect/path)
- [x] haras, minion, civilian, guard, robot, dummy, horse, loyalHorse, enemyHaras — all complete
- [x] larryDunk, cainAbel, mrRuno, zeusLarry — complete
- [x] britishLarry: red military coat, gold epaulettes, top hat, monocle + chain
- [x] financierLarry (Survivalist Larry in dialogue): cream linen suit, deep tan, gold sunglasses
- [x] paraplegicLarry: wheelchair (wheels/spokes/armrests), red cape, blue superhero costume, gold star
- [x] axeLarry: blue suit, bloody axe polygon, blood spatters, evil brows
- [x] cerealLarry: golden cream (#fff0b0) chef hat + outline, orange mascot suit, yellow polka dots
- [x] investmentLarry: charcoal power suit, dark red tie + gold pin, briefcase
- [x] femaleLarry: pink blazer, black flared skirt, longer blond flowing hair
- [x] horse: barrel body, arching neck trapezoid, polygon head, wide mane + forelock
- [x] loyalHorse: identical to horse + tiny 3-dot yellow bow on mane
- [x] enemyHaras: dark red body (#4a0000) + evil eyebrows — visually distinct from player Haras (dark blue #1a3a8a)
- [x] sprite-preview.html: standalone preview (no game deps)

#### Unit System
- [x] createUnit(type, gx, gy, team) — all templates in units.js
- [x] Larry Dunk selector: pre-level overlay with cards showing name, ★ ability, stat row (HP/ATK/DEF/MOV/RNG), ability description sentence
- [x] Selector cards only show LDs available at that point in normal playthrough (LD_POOL_AT_LEVEL in main.js)
- [x] LD death persistence: deployed LDs that die are removed from capturedLarryDunks before next level loads
- [x] ldSlots expanded: L3=3, L4=3, L5=3, L6=4, L7=3, L8=4, L9=4, L10=4, L11=3

#### Variant Abilities (all implemented in combat.js / input.js)
- [x] Spray Tan (larryDunk, britishLarry): surviving defender + adjacent enemies lose 1 range for 1 turn (sprayTanned flag; resets in endEnemyTurn)
- [x] Cannibalism (financierLarry / Survivalist Larry): heals HP = damage dealt, shows green +N animation
- [x] 2 Attacks/Turn (cainAbel): attacksLeft: 2 in template
- [x] Chain Kill (axeLarry): on non-Larry kill, one free attack on nearest adjacent enemy (isChain flag prevents recursion)
- [x] Invisible (cerealLarry): invisible: true; enemy AI skips unit as target in both pre-move and post-move loops
- [x] Ad Break (investmentLarry, player only): fake LARRY DUNK FINANCIAL SERVICES™ ad (3s countdown before skip); deferred via GamePhase.AD_BREAK + game.pendingAdBreak + showAdBreak/skipAdBreak
- [x] Bad Driving (femaleLarry): 20% chance to land 1 tile off in random direction on move; plays banner if fires
- [x] Eye Bullets (paraplegicLarry): range 3 — but cannot attack if any enemy is adjacent (getAttackTiles returns [] if blocked; implemented in grid.js)

#### Terrain System
- [x] All terrain types: PLAIN, FOREST, MOUNTAIN, WALL, WATER, PORTAL, TEMPLE, CLOUD, LAVA, THRONE, OFFICE_FLOOR, GYM_FLOOR, EQUIPMENT, EXIT, STAIR, UPPER_FLOOR
- [x] STAIR: moveCost 2 (tactical chokepoint), renders with 4 horizontal step lines
- [x] UPPER_FLOOR: moveCost 1, defBonus +1 (height advantage)
- [x] DEF badge (+N) shown on all tiles with defBonus > 0
- [x] Terrain hover panel (showTerrainInfo) showing name + special effects

#### Combat System
- [x] ATK - DEF - terrain defBonus = damage (min 1); counterattacks in range
- [x] White hit flash on defender tile; red damage numbers; green heal numbers
- [x] Larry Dunk hits 0 HP → Tetris capture (synchronous, no setTimeout race condition)
- [x] isLarryDunk check requires team === 'enemy' (prevents friendly-fire Tetris)
- [x] Larry Dunks can't be killed by counterattacks — cling to 1 HP, must be finished directly
- [x] onVictory double-call fixed: removed from setTimeout, only fires on victory screen click

#### Tetris Capture
- [x] Canvas-based overlay, keyboard + click controls (arrow keys + WASD)
- [x] Score thresholds: Common=200, cainAbel=100, mrRuno=800, Zeus=rigged (unwinnable)
- [x] Speed escalation: 800ms → 150ms min, -50ms per 50 pts scored
- [x] Zeus rigged board: constant 600ms drop, rival Haras cutscene → loadLevel(13) after 15s
- [x] Mr. Runo non-capturable: onSuccess checks type === 'mrRuno', returns early (Runo escapes permanently)
- [x] Visual overhaul: ghost piece (drop preview), beveled cells with glow, particles on piece lock, line clear flash, atmospheric radial gradient background
- [x] Left info panel: unit name, score, progress bar with gradient fill, speed indicator
- [x] Right tutorial sidebar: next piece preview with glow, controls guide (WASD/arrows), unit ability reminder

#### AI
- [x] Enemy AI: weighted targeting — score = (maxHp-hp) + 20 if Haras - distance*2; picks highest-score visible unit for both movement and attack
- [x] Invisible units (cerealLarry) skipped by enemy AI in both target selection loops
- [x] Mr. Runo chase level: runs for exit (level 11 index check)

#### UI / UX
- [x] Level selector: title click → select menu, "Start from Beginning" + all 14 levels by name
- [x] Turn banner: 52px, colored blue/red by phase, pop-in CSS animation, screen flash
- [x] Range hover preview: hovering any unit shows movement + attack reach tiles
- [x] Selected unit pulse ring; damage numbers 20px bold; death burst animation
- [x] Skip All button in dialogue box (calls endCutscene immediately)
- [x] Back button in dialogue (shows previous line instantly, no typewriter re-run)
- [x] Ad Break overlay: full-screen fake YouTube-style ad with countdown
- [x] END TURN button: prominent gold-green glow with pulsing box-shadow; disabled/greyed during enemy phase
- [x] Phase hint text drawn on canvas above grid: "Select a unit" / "Click blue tile to move" / "Click red tile to attack — or End Turn"
- [x] Move tiles: alpha 0.45 + subtle white inner stroke
- [x] Attack tiles: pulsing alpha (0.38–0.53 via sin) + pink inner stroke
- [x] Ability banners: SPRAY TAN!, CANNIBALISM!, CHAIN KILL!, TOO CLOSE! (paraplegic blocked), SURVIVED! (counterattack clamped)
- [x] Counterattacks cannot kill the attacker — floor at 1 HP; SURVIVED! banner fires if clamp triggers
- [x] Attack-select bug fixed: clicking a friendly unit tile in ATTACK_SELECT no longer cancels the attack

#### SFX
- [x] 13 synthesized sounds via Web Audio API (sfx.js): select, move, hit, death, tetris_place, tetris_clear, tetris_success, tetris_fail, player_phase, enemy_phase, ad_jingle, victory, defeat

#### Levels
- [x] 0 Prologue: villain monologue, brain chip reveal
- [x] 1 Tutorial: 9×7 map, Haras + minion vs 3 civilians; 9-line tutorial dialogue covering all mechanics
- [x] 2 Cain & Abel: multiverse portal, C&A as Tetris boss
- [x] 3 British Larry: parliament chamber 14×10, guards + robot, Spray Tan boss
- [x] 4 Survivalist Larry (unit: financierLarry): island 12×9, WATER border, THRONE secret at (7,4), spawns on Wait trigger
- [x] 5 Paraplegic Larry: rooftop 12×8, CLOUD corners, WALL border; eye bullets boss (range 3, can't attack when adjacent enemy)
- [x] 6 Axe Murderer: slaughterhouse 12×8, FOREST crates, Chain Kill boss
- [x] 7 Cereal Mascot: TV studio 12×9, TEMPLE floor, Invisible boss
- [x] 8 Investment Group: **two-floor** corporate office 14×9; lower lobby (OFFICE_FLOOR) connects to upper boardroom (UPPER_FLOOR) via two STAIR tiles at (4,4) and (9,4); Investment Larry at conference table (THRONE) upstairs
- [x] 9 Female Larry: mall 12×8, WATER fountain, GYM_FLOOR shops, FOREST planters, Bad Driving boss
- [x] 10 Rival Haras: interdimensional crossroads 12×8, PORTAL corners + CLOUD strip; rival Haras + guards + robots
- [x] 11 Mr. Runo: gym 14×10, WALL barrier at x=10 forces 4-turn escape route; 8-turn limit, father reveal, Dr. Retina flashback at turn 4
- [x] 12 Zeus: Mount Olympus 16×10, TEMPLE + CLOUD, rigged Tetris, rival steals Zeus → loadLevel(13)
- [x] 13 Final: chaos, horses betray, loyal horse escape ending

#### Dialogue
- [x] DIALOGUE.md fully synced to levels.js — verified line-by-line across all 14 levels + Between 12-13 chaos section
- [x] Level 4 character renamed "Survivalist Larry" in dialogue (type stays financierLarry in code)

#### Cinematic System
- [x] `Cinema` object in cutscene.js: scene functions return `drawScene(ctx, canvas)` closures attached to individual dialogue lines
- [x] Cinema scenes: `lab` (tech lab, circuit grid, brain chip), `portal` (multiverse rift), `flashback` (sepia-toned, film grain), `broadcast` (TV static + announcement), `chipInsert` (post-tutorial chip implant sequence), `credits` (gold title + credits text on black)
- [x] Prologue (level 0): full cinematic with lab + broadcast scenes
- [x] Post-tutorial brain chip scene: chip insert + Larry reaction + "An army of Larry Dunks"
- [x] Cain & Abel pre-battle: intro dialogue shows C&A briefing guards before fight, "We only need one horse." in strategic context
- [x] Mr. Runo rework: `victoryCheck: () => false`; Runo scripted to reach EXIT → `onRunoEscape` fires; robots intercept cutscene → victory. No hard turn-limit defeat.
- [x] Credits scene: `Cinema.credits()` rendered in final level ending cutscene — "LARRY DUNK / THE THOUSAND HORSES / Made with Claude / Special thanks to Victor Winter"
- [x] Tetris Early Win: `clearLines()` checks `score >= threshold` immediately on line clear → triggers `gameOver = true`, `winFlashTimer`, `onSuccess()` after 800ms

#### Balance
- [x] Level 2: 5 guards → 3 guards; C&A is boss
- [x] Level 3: removed 1 robot (now 2 guards + boss)
- [x] Level 7: 4 guards → 3 guards
- [x] Level 8: 3 guards + 2 robots → 2 guards + 1 robot (pre two-floor redesign); now redesigned with 1 lower guard + 2 upper enemies
- [x] Level 10 (Rival Haras): removed 2 robots
- [x] Level 11 (Mr. Runo): HP 45→35, WALL barrier forces 4-turn escape
- [x] femaleLarry nerfed: HP 22→16, ATK 5→4, DEF 3→2
- [x] Levels 3–11: expanded LD slots + added compensating enemies per level (guards + robots)

---

## PENDING IMPLEMENTATION

### Bug Fixes & Improvements (priority order)
- [x] Map does not load when progressing from level to level on GitHub Pages — root cause: `loadLevel` reset `game.grid=[]` but not `game.gridW/gridH`; render loop crashed during LD selector gap. Fix: also reset `game.gridW=0; game.gridH=0` in `loadLevel`. First fails at island (L4) and L5 because those are the first levels with ldSlots encountered in normal play.
- [x] Cain & Abel can attack more than twice (infinite) and at range greater than 1 — fixed: removed attacksLeft reset in UNIT_SELECTED clickedAtk branch; added phase=ATTACK_SELECT after first attack; reset attacksLeft in endEnemyTurn; spray tan now only applies if range>1 so range can't be incorrectly incremented on reset
- [x] British Larry Dunk should NOT have Spray Tan ability — removed from combat.js trigger and units.js; replaced with passive "Parliamentary Order" flavor special
- [x] Survivalist Larry shown as "Financier Larry" in LD selector screen — changed unit name to 'Survivalist Larry Dunk' in units.js
- [x] Better tutorial: each dialogue line now carries a `highlight` property; render() draws a pulsing yellow box after the cutscene dim over matching units/tiles; cutscene.js reads it in showDialogueLine and clears on endCutscene; game.tutorialHighlight added to constants.js
- [x] Tutorial: allow player to move units while tutorial dialogue is open — `handleGridClick` computes `effectivePhase`: if `CUTSCENE && tutorialHighlight`, treats clicks as `PLAYER_TURN`
- [x] backDialogue (Back button) does not update game.tutorialHighlight — added `game.tutorialHighlight = line.highlight || null` in `backDialogue` alongside cinemaDrawScene update

### Music System (music.js — new file)
- [x] `music.js` created — pure mp3-backed system, no synthesis. `playMusic(trackName)` / `stopMusic()`. MUSIC_FILES map routes all tracks to provided mp3s.
- [x] Track assignments:
  - `title`, `cutscene`, `victory` → `HoliznaCC0 - Deus Ex Machina.mp3`
  - `playerPhase`, `tetris` → `Koi-discovery - Plasma-corrélation.mp3`
  - `enemyPhase`, `defeat` → `Koi-discovery - Rouge-haine-les-9-âmes.mp3`
  - `ending`, `credits` → `oji - idée. (en mi bémol majeur).mp3`
  - `level12` → `Song For Wemmbu PLAYFUL MASSACRE (2v1000 ver.).mp3` (exclusive to level 12)
- [x] Level 12 mp3 plays through entire battle (cutscene, player turns, enemy turns, Tetris) — all phase-transition music calls guarded with `game.currentLevel !== 12`
- [x] `playMusic`/`stopMusic` wired in: main.js (title click), levels.js (loadLevel, startLevel callback, checkVictoryDefeat), input.js (endPlayerTurn), ai.js (endEnemyTurn), tetris.js (startTetrisCapture, endTetris)
- [x] music.js added before main.js in index.html load order

### Balance
- [x] Horse buff: horse HP 20→30, ATK 6→12, DEF 3→5, MOV 6→7; loyalHorse HP 25→38, ATK 8→15, DEF 5→7, MOV 7→8

---

## OPEN QUESTIONS / BACKLOG

- [ ] Audio: civilian refusal VO link (developer to provide)
- [ ] Audio: "Absolute Cinema" ending clip link (developer to provide)
- [ ] Dr. Retina universe deaths — confirm list: U1=old age, U2=choked on grape, U3=fell into volcano texting, U4=legally declared dead from boredom, U5+=TBD
- [ ] Do rival Harases appear as visible units on earlier maps before Level 10? (currently only in Level 10 as combat encounter)
- [ ] AI voice acting — VERY LAST FEATURE. Only after final playtest sign-off. (Haras: dramatic baritone; Larry Dunk: pompous; Narrator: deadpan; etc.)

---

## Overview

**Platform:** Web (HTML, CSS, JavaScript) — single `index.html`, no dependencies, vanilla JS + Canvas
**Genre:** Tactical RPG (Fire Emblem-style) with Tetris capture minigame
**Perspective:** Top-down grid/map, cutscenes via dialogue box
**Tone:** Edgy dark comedy with absurdist lore, villain protagonist

---

## Story Summary

You play as **Haras**, a megalomaniacal tech villain who invented a brain chip capable of remote detonation. He discovers that **Larry Dunk** — the Prime Minister — has a uniquely chip-receptive brain, making him the perfect fully-controllable puppet. Haras begins harvesting Larry Dunks from across the multiverse while rival Harases from other universes race for the same goal.

---

## Characters

### Haras
- Villain protagonist. Inventor of the brain chip (his own is a prototype — non-brain-exploding).
- Edgelord: dramatic, grandiose, insecure. Superior robot-directing skills give him the edge.
- Abandoned as a child with Dr. Retina, then apprenticed under him.

### Larry Dunk (Base)
- Prime Minister. Brain chip gives Haras full remote control — orders sent AND executed without conscious input.
- Found across multiple universes in wildly different forms.

### Dr. Retina
- Haras's former mentor. Cold and demanding. Taught tech fundamentals and robot direction.
- Deceased in every universe — increasingly unhinged causes of death across universes.

### Mr. Runo
- Haras's father, who abandoned him with Dr. Retina.
- Enormous biceps interfere with chip signal — cannot be permanently chipped, must be physically subdued.
- Non-capturable: escapes permanently if Tetris fails.

### The Rival Harases
- Other-universe Harases also collecting Larry Dunks. Player's Haras leads due to robot skills.
- Become a real threat after Zeus arc.

---

## Larry Dunk Variants

| Variant | Unit Type | Ability | Notes |
|---------|-----------|---------|-------|
| Prime Minister Larry Dunk | larryDunk | Spray Tan: surviving defender + adjacent enemies lose 1 range for 1 turn | Common |
| Cain & Abel Larry Dunk | cainAbel | 2 Attacks/Turn | Conjoined twins. "We only need one horse." Story-guaranteed. |
| British Larry Dunk | britishLarry | Spray Tan (British): same effect, British flavor | Uncommon |
| Survivalist Larry Dunk | financierLarry | Cannibalism: heals HP = damage dealt | Secret — hidden on island, spawns via Wait on THRONE |
| Paraplegic Superhero Larry | paraplegicLarry | Eye Bullets: range 3 — **but can't attack if any enemy is adjacent** | Uncommon |
| Axe Murderer Larry Dunk | axeLarry | Chain Kill: killing a non-Larry triggers one free attack on nearest adjacent enemy | Uncommon |
| Cereal Mascot Larry Dunk | cerealLarry | Invisible: enemy AI cannot target or move toward this unit | Uncommon |
| Investment Group Larry Dunk | investmentLarry | Ad Break: player must watch a fake 3s unskippable ad before attack fires | Rare, highest ATK |
| Female Larry Dunk | femaleLarry | Bad Driving: 20% chance to land 1 tile off-target when moving | Uncommon |
| Mr. Runo | mrRuno | Huge Biceps: massive ATK; non-capturable (chip won't stick) | Rare, permanent miss on Tetris fail |
| Zeus Larry Dunk | zeusLarry | Lightning: range 3; accidentally broadcasts coordinates | Legendary; Tetris rigged — rival steals him |

---

## Tetris Capture

When a Larry Dunk (enemy team) hits 0 HP, Tetris overlay appears instead of death.

| Variant | Threshold | On Fail |
|---------|-----------|---------|
| Common Larry Dunks | Very Low (200) | Soft retry |
| Cain & Abel | Very Low (100) | Soft retry (story-guaranteed) |
| Mr. Runo | High (800) | Escapes permanently |
| Zeus Larry Dunk | Unwinnable (rigged) | Rival Haras steals him → level 13 |

Speed: 800ms drop interval → 150ms min, -50ms per 50 pts scored.

---

## Core Gameplay

- Turn-based grid combat: Player Phase → Enemy Phase
- Click unit → blue movement tiles → click to move → red attack tiles → click to attack
- Combat: `max(1, ATK - DEF - terrain.defBonus)` damage; counterattacks if defender survives and attacker is in range
- Terrain types: Plain, Forest, Mountain, Wall, Water, Portal, Temple, Cloud, Lava, Throne, Office Floor, Gym Floor, Equipment, Exit, **Stairs** (MOV 2), **Upper Floor** (DEF +1)
- Cain & Abel: 2 attacks per turn

---

## Technical Architecture

- Multi-file JS (no modules). Load order: constants → sprites → units → grid → combat → ai → ui → input → cutscene → levels → tetris → main
- Canvas rendering at 960×640 internal resolution, scaled to full browser window
- Sprite keys: `haras`, `minion`, `civilian`, `larryDunk`, `cainAbel`, `mrRuno`, `zeusLarry`, `britishLarry`, `financierLarry`, `paraplegicLarry`, `axeLarry`, `cerealLarry`, `investmentLarry`, `femaleLarry`, `horse`, `loyalHorse`, `enemyHaras`, `guard`, `robot`, `dummy`
- `createUnit(type, gx, gy, team)` — all templates in units.js with `isLarryDunk: true` on LD variants
- Tetris triggered synchronously in `_resolveCombat()` when LD hits 0 HP (no setTimeout — avoids render race condition)
- Zeus uses `team: 'neutral'`; `getAttackTiles()` excludes neutral team
- DIALOGUE.md is authoritative for all dialogue text. Sync to levels.js by running "apply dialogue".
