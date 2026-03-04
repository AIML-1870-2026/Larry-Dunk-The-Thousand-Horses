# Larry Dunk: The Thousand Horses
### Game Design Specification v0.2

---

## IMPLEMENTATION PROGRESS

### Status: IN PROGRESS

### Playtest Bug Fixes — COMPLETED
- [x] **Tetris for C&A** — added cainAbel as enemy unit in Level 2 (was dialogue-only, never on map)
- [x] **Level 2 difficulty** — reduced from 5 guards to 3 guards; C&A is now the boss
- [x] **Level 3 difficulty** — reduced to 3 guards + 1 robot (was 4 guards + 2 robots)
- [x] **C&A horse shop dialogue** — onVictory: "I was just at the horse shop" surprise moment
- [x] **Skip All dialogue** — button in dialogue box, calls endCutscene() immediately
- [x] **Turn banner** — 52px, colored blue/red by phase, pop-in CSS animation, screen flash
- [x] **Range hover preview** — hovering any unit shows its attack range tiles (blue/red tint by team)
- [x] **Special ability** — ⚡ prefix + yellow highlight + ★ TETRIS CAPTURE on Larry Dunk units
- [x] **Game feel** — white hit flash on damage, larger red death burst, selected unit pulse ring, damage numbers 20px bold

### Sprite Status (final approved designs)
- haras ✓ (hair fixed — charcoal #333, shifted up u*2.5, clearly visible)
- minion ✓, civilian ✓ (now own sprite: grey shirt, dark jeans, medium skin)
- larryDunk ✓, cainAbel ✓
- mrRuno ✓, zeusLarry ✓, britishLarry ✓, financierLarry ✓
- paraplegicLarry ✓, axeLarry ✓, cerealLarry ✓, investmentLarry ✓, femaleLarry ✓
- horse ✓ (barrel body, neck trapezoid, polygon head, wide mane + forelock), loyalHorse ✓
- enemyHaras ✓, guard ✓, robot ✓, dummy ✓
- All 12 Larry Dunk variants + all support units now have sprites

### Completed (latest session)
- [x] Full-window layout: #gameContainer now fixed inset 0, canvas 100%×100%. Game stretches to fill browser window. Click coordinates already scale-compensated in input.js.
- [x] Level selector: title screen click → level select menu. Shows "Start from Beginning" + all 14 levels by name. Jump to any level directly. Implemented in main.js (showLevelSelect()), index.html, main.css.
- [x] test.html: automated test suite — checks all unit types, sprite keys, terrain types, all key functions, runs loadLevel(0-13) smoke test. Open separately from index.html.
- [x] Bug fix: combat.js `isLarryDunk` Tetris trigger now checks `defender.team === 'enemy'`. Previously player-team Larry units (mrRuno in Level 12) would incorrectly trigger Tetris when killed by enemies.
- [x] enemyHaras sprite: added evil eyebrows (`_brow 'evil'`) to visually distinguish rival from player Haras at a glance. Dark red body (#4a0000) vs player's dark blue (#1a3a8a) was already there.
- [x] Chaos cutscene (tetris.js Zeus rigged fail): Mr. Runo removed (doesn't protect Haras), "golden horse" removed. Runo runs away in Level 13 intro: `*looks at the horses* ...not my problem. *runs*`. Ending narrator: "The horse carries Haras off into the sunset..." (no "golden").
- [x] DIALOGUE.md fully synced to levels.js — verified line-by-line match across all 14 levels + Between 12-13 chaos section.
- [x] Level 9 (Bollywood Star) deleted from levels.js. Final level sequence: 0 Prologue → 1 Tutorial → 2 Cain&Abel → 3 BritishLarry → 4 FinancierLarry → 5 Paraplegic → 6 AxeMurderer → 7 Cereal → 8 Investment → 9 FemaleLarry → 10 RivalHaras → 11 MrRuno → 12 Zeus → 13 Final
- [x] ai.js: Mr. Runo level check = 11; tetris.js: Zeus rigged fail → loadLevel(13)
- [x] Dialogue overhaul: "Evil Brainchip", alien cover story, "Order recieved", Haras brainchip plugs kept (vulnerability intentional), new C&A non-horse dialogue (Levels 6/7/8/10), new Runo depth (Level 11 victory), rival Haras pressure (Levels 3/5/8/9 transitions), Level 10 Rival Haras encounter added

### Completed (current session)
- [x] Bug fix: Level 4 Financier trigger — `u.acted` was always false in `turnEvent` because `endEnemyTurn` resets `acted` before calling `checkTurnEvents`. Fixed by removing `&& u.acted` — unit just needs to be on throne tile (7,4) at turn end.
- [x] Bug fix: ai.js post-move attack loop was missing `!t.invisible` check, allowing enemies to target invisible Cereal Mascot Larry after moving. Fixed to match pre-move attack check.
- [x] Tetris speed escalation: drop interval now starts at 800ms and decreases by 50ms per 50 pts scored (min 150ms). Drop restarts after each score update. Rigged board stays constant 600ms. Resolves open question.
- [x] Spec open questions updated: marked 4 as resolved, clarified Dr. Retina death list, noted rival Haras design status.

### Completed (this session)
- [x] Playtest feedback batch — 8 items fixed: Axe Larry evil brows; Level 3 robot removed (2 guards + boss only); femaleLarry nerfed (HP16 ATK4 DEF2), back-line guards→robots in L9; Level 8 OFFICE_FLOOR doorways fixed + EQUIPMENT desks added; Level 9 mall improved with GYM_FLOOR shops + FOREST planters; ldSlots capped (L6-7: 2, L8-9: 2, L10: 2, L11: 1); LD death persistence in loadLevel(); Mr. Runo non-capturable confirmed already working; Tetris render code verified correct.
- [x] Tutorial redesign: expanded 8×6 → 9×7 map; added Haras as player unit at (1,3); terrain: WALL(3,1), WALL(3,5), FOREST(4,3); civilians at (5,2),(6,3),(7,5); 9-line intro dialogue covers all mechanics (select, blue tiles, movement, wall/forest terrain, red tiles, attack, Wait button, auto end-turn, counterattack, unit info panel hover, Haras = VIP); 2 Tetris teaser lines added to victory dialogue. DIALOGUE.md synced.
- [x] Larry Dunk selector cards enhanced: added `desc` field to all 12 LD templates in units.js; card HTML now shows name, ★ ability tag, stat row (HP/ATK/DEF/MOV/RNG), and ability description sentence. CSS added `.ld-stats` (blue) and `.ld-desc` (grey) rules; card min-width 180→210px.
- [x] Haras sprite fixed: hair now charcoal #333 shifted to headY-u*2.5, radius u*6.5×u*7.5 — clearly visible against dark background
- [x] Civilian sprite: own drawSprite_civilian (grey shirt, dark jeans, medium skin — distinct from minion). spriteKey updated in units.js
- [x] 6 new Larry Dunk variant sprites added to sprites.js, units.js, and sprite-preview.html:
  - paraplegicLarry: wheelchair (wheels + spokes + armrests), red cape, blue superhero costume, gold star
  - axeLarry: blue suit, bloody axe polygon, blood spatters, evil brows
  - cerealLarry: white chef hat with star, orange mascot suit, yellow polka dots, white mascot gloves
  - investmentLarry: charcoal power suit, dark red tie + gold pin, briefcase
  - femaleLarry: pink blazer, black flared skirt, longer blond flowing hair
- [x] Level sequence (CURRENT): 0 Prologue → 1 Tutorial → 2 Cain&Abel → 3 British Larry → 4 Financier Larry → 5 Paraplegic Larry → 6 Axe Murderer → 7 Cereal Mascot → 8 Investment Group → 9 Female Larry → 10 Rival Haras → 11 Mr. Runo → 12 Zeus → 13 Final
- [x] Level 10 NEW — Rival Haras Encounter: interdimensional crossroads 12×8, portal corners + cloud strip. Rival Haras (+guards+robots) ambushes player before Runo access. Win condition: clear all enemies. Victory reveals why player Haras is superior (Dr. Retina training). Rival says "same face" — C&A verify.
- [x] Level 3 — British Larry: parliament chamber map 14×10, guards + 2 robots, British Larry as boss, full dialogue
- [x] Level 4 — Financier Larry: island map 12×9 with WATER border, 3 guards, THRONE secret tile at (7,4), financier spawns on Wait trigger
- [x] Level 5 — Paraplegic Larry: rooftop map 12×8 with CLOUD terrain, superhero wheelchair boss
- [x] Level 6 — Axe Murderer Larry: slaughterhouse 12×8 with FOREST crates, chain kill boss
- [x] Level 7 — Cereal Mascot Larry: TV studio 12×9 with TEMPLE floor, invisible boss (cerealLarry)
- [x] Level 8 — Investment Group Larry: corporate office 14×9 with wall corridors, briefcase boss
- [x] Level 10 — Female Larry: mall 12×8 with WATER fountain + FOREST shops, bad driving boss
- [x] tetris.js: loadLevel(7) → loadLevel(13) for Zeus rigged fail path
- [x] ai.js: Mr. Runo level index fixed (5 → 11). Invisible units (cerealLarry) skipped by enemy AI in both target selection loops
- [x] levels.js: Mr. Runo onVictory loadLevel(6) → loadLevel(12); Zeus/Final header comments updated to 12/13
- [x] Ad Break ability (investmentLarry, player only): fake YouTube-style ad overlay (3s skip countdown) defers combat until player clicks "Skip Ad ▶"; implemented via GamePhase.AD_BREAK + game.pendingAdBreak + showAdBreak/skipAdBreak in ui.js; constants.js, index.html, main.css, combat.js, input.js all updated
- [x] SFX: 13 synthesized sounds via Web Audio API (sfx.js). Wired: select, move, hit, death, tetris_place, tetris_clear, tetris_success, tetris_fail, player_phase, enemy_phase, ad_jingle, victory, defeat
- [x] Code review bugs fixed:
  - CRITICAL: onVictory double-call — was fired in checkVictoryDefeat's setTimeout AND on victory screen click; removed from setTimeout (click handler is sole caller)
  - CRITICAL: Mr. Runo victoryCheck — `!mrRuno.alive` never true after Tetris success (unit switches to player team alive); fixed to `!mrR.alive || mrR.team === 'player'`
  - Mr. Runo turn 8 defeat event — also incorrectly triggered if Runo was already captured; fixed to check `u.team === 'enemy'`
  - loadLevel missing resets: adBreakOverlay hide + pendingAdBreak/timer clear added
  - Keyboard guard for AD_BREAK phase added to main.js keydown listener
  - levels.js header comment updated to full 0-13 sequence
- [x] Variant abilities implemented:
  - Spray Tan (larryDunk, britishLarry): surviving defender + adjacent enemies lose 1 range (sprayTanned flag); resets in endEnemyTurn
  - Cannibalism (financierLarry): heals HP = damage dealt, shows green +N animation
  - Chain Kill (axeLarry): on non-Larry kill, one free attack on nearest adjacent enemy (isChain prevents chaining from chains)
  - Invisible (cerealLarry): `invisible: true` in template; enemy AI skips unit as target
  - Bad Driving (femaleLarry): 20% chance to land 1 tile off in random direction in moveUnit (input.js)


### Completed (previous sessions)
- [x] File structure refactor: split into css/, js/, art/, sfx/, music/ folders
- [x] Rename all "Ronald Dump" → "Larry Dunk" (sprite keys, unit types, dialogue, titles)
- [x] Rename `mrRoonoh` → `mrRuno`, `zeusRonald` → `zeusLarry`
- [x] Update title screen: "LARRY DUNK / The Thousand Horses"
- [x] Add `civilian` unit type + sprite for tutorial
- [x] Rewrite Tutorial level: civilian refuses chip → minion executes → Haras laughs
- [x] Rewrite post-tutorial cutscene: Haras discovers Larry Dunk's anomalous neural profile
- [x] Rewrite Mr. Runo level: father reveal at level start
- [x] Rewrite Mr. Runo turn 4 event: Dr. Retina flashback (Pi-Hub, robot training, death)
- [x] Rewrite Mr. Runo post-capture: butterfly effect cutscene
- [x] Implement Tetris capture overlay (canvas-based, keyboard + click controls)
- [x] Score threshold system per rarity (common=200, cainAbel=100, mrRuno=800, zeus=rigged)
- [x] Hook Tetris into combat: Larry Dunk hits 0 HP → startTetrisCapture()
- [x] Zeus: rigged board + rival Haras cutscene after 15 seconds
- [x] Update ending screen: "LARRY DUNK: THE THOUSAND HORSES"

#### Bug Fixes (this session)
- [x] Phase race condition: `game.phase = TETRIS` now set synchronously in `doCombat()` so `finishUnitAction()` can't overwrite it with PLAYER_TURN 400ms later
- [x] Input guard: `handleGridClick` returns early after `doCombat()` if phase is TETRIS; `finishUnitAction()` checks phase before running
- [x] Zeus neutral team: `getAttackTiles()` now excludes `team === 'neutral'` so player cannot attack Zeus directly
- [x] Victory/Tetris collision: `checkVictoryDefeat()` now guards `if (phase === TETRIS) return` so VICTORY can't fire during a capture

#### Sprite System (this session)
- [x] Full rewrite of sprites.js: pixel-pattern system replaced with smooth vector draw functions
- [x] All sprites use `u = sz/20` as proportional unit; draw with arc/ellipse/roundRect/path
- [x] All humanoid eyes = black dots (no colored eyes)
- [x] Haras: full black hair oval (peeks above/around skin oval), no chip dot
- [x] Civilian/Minion: neat brown hair, medium skin, yellow jacket
- [x] Larry Dunk: wild blond poof, orange-tan skin, blue suit, red tie, black dot eyes
- [x] Cain & Abel: two LD heads side by side on wide shared body, center red stripe
- [x] Mr. Runo: navy suit with white lapels, HUGE bicep ellipses (brown skin, Haras bloodline)
- [x] Zeus Larry Dunk: toga (cream + gold band + drape folds), no crown, bare arm, blond hair
- [x] Horse: profile view, barrel body, arching neck trapezoid, polygon head (tall skull + muzzle), dark mane
- [x] Loyal Horse: identical to horse + tiny 3-dot yellow bow on mane (normal yellow, not bright)
- [x] British Larry Dunk sprite: red military coat, gold epaulettes, top hat, monocle + chain, blond peeking out — has _brow/_nose/_mouth face details
- [x] Financier Larry Dunk sprite: cream linen suit, deep tan skin, slicked light blond hair, gold-framed sunglasses — has _brow/_nose face details
- [x] sprite-preview.html: standalone file (no game deps), shows all sprites by section
- [x] Horse fix: bigger barrel body, wider neck trapezoid, mane now u*2.8 wide + forelock tuft at poll. Rear rump bump removed (user preferred clean barrel).
- [x] britishLarry + financierLarry added to sprite-preview.html, SPRITES dispatch table, and units.js templates

---

## Overview

**Platform:** Web (HTML, CSS, JavaScript) — single `index.html`, no dependencies, vanilla JS + Canvas
**Genre:** Tactical RPG (Fire Emblem-style) with Tetris capture minigame
**Perspective:** Top-down grid/map, cutscenes via dialogue box
**Tone:** Edgy dark comedy with absurdist lore, villain protagonist

---

## Story Summary

You play as **Haras**, a megalomaniacal tech villain who has invented a brain chip capable of remote detonation. With the world under his thumb, he discovers that **Larry Dunk** — the Prime Minister — has a uniquely chip-receptive brain network, making him the perfect fully-controllable middle manager. Haras begins harvesting Larry Dunks from across the multiverse to consolidate ultimate power, while rival Harases from other universes compete for the same goal.

---

## Characters

### Haras
- The player character and villain protagonist
- Inventor of the brain chip
- His own chip is a prototype and cannot self-destruct
- Edgelord personality — dramatic, grandiose, insecure
- Backstory: abandoned as a child with **Dr. Retina**, then apprenticed under him
- Superior robot-directing skills give him an edge over rival Harases
- Deep-seated fear of losing control; anger toward his father

### Larry Dunk (Base)
- Prime Minister, fully controllable via brain chip
- Brain networks are uniquely wired to the chip: orders are sent **and** executed without conscious input
- Exception: does not execute orders while sleeping (unless it's a sleepwalking Larry Dunk)
- Found across multiple universes in wildly different forms

### Dr. Retina
- Haras's former master/mentor
- Harsh and demanding during apprenticeship
- Taught Haras tech fundamentals and robot direction
- Status: deceased — **in each universe, Dr. Retina has died in increasingly unhinged ways**
  - Universe 1 (flashback): died of old age (baseline)
  - Universe 2: choked on a grape
  - Universe 3: fell into a volcano while texting
  - Universe 4: legally declared dead from boredom
  - Universe 5+: escalate from here (TBD)

### The Rival Harases
- Other-universe versions of Haras, also racing to collect Larry Dunks
- Player's Haras is ahead due to superior robot skills
- Subplot runs throughout; become a real threat after Zeus arc

---

## Larry Dunk Variants

| # | Variant | Rarity | Special Ability | Tetris Threshold | Fail Result |
|---|---|---|---|---|---|
| 1 | **Prime Minister Larry Dunk** | Common | Spray Tan: blinds adjacent enemies (reduces their range by 1 for 1 turn) | Very Low | Soft retry |
| 2 | **Financier Larry Dunk** | Secret | Cannibalism: gains HP equal to damage dealt | Low | Soft retry |
| 3 | **Mr. Runo Larry Dunk** | Rare | High Agency: immune to brain chip, cannot be permanently chipped — must be physically subdued | High | Escapes permanently |
| 4 | **Paraplegic Superhero Larry Dunk** | Uncommon | Eye Bullets: ranged attack from any direction, 3 range | Low | Soft retry |
| 5 | **Axe Murderer Larry Dunk** | Uncommon | Chain Kill: if he kills a unit, immediately attacks an adjacent enemy | Low | Soft retry |
| 6 | **Cereal Mascot Larry Dunk** | Uncommon | Invisible: enemy units cannot target or move toward him | Low | Soft retry |
| 7 | **Investment Group Larry Dunk** | Rare | Ad Break: extremely powerful attack, but player must watch a fake in-game ad before it fires | Low | Soft retry |
| 8 | **British Larry Dunk** | Uncommon | Spray Tan (British): same blind effect as Prime Minister but in metric | Low | Soft retry |
| 10 | **Female Larry Dunk** | Uncommon | Bad Driving: movement is unpredictable — moves toward target but may overshoot or veer slightly | Low | Soft retry |
| 11 | **Cain & Abel Larry Dunk** | Story-Required | Two Attacks Per Turn; running gag: "we only need one horse" | Very Low | Soft retry (story-guaranteed) |
| 12 | **Zeus Larry Dunk** | Legendary | Lightning: ranged attack; accidentally broadcasts coordinates | Unwinnable | Rival Haras steals him |

### Notes on Specific Abilities

**Financier Larry Dunk — Secret Unit**
- Hidden on island map
- Player must move a unit to a specific tile and use "Wait" there to trigger his appearance
- Ability reflects his diet choices on the island

**Investment Group Larry Dunk — Ad Break**
- When player selects the special attack, a full-screen fake ad plays (in-game, canvas-drawn)
- Ad cannot be skipped for ~5 seconds
- After ad, the attack fires with massive damage
- Tone: a fake ad for a vague financial product. Absurdist.

**Female Larry Dunk — Bad Driving**
- Movement tiles shown normally, but after player selects destination, there is a small random chance she ends up 1 tile off in a random direction
- Purely cosmetic downside, played for comedy

**British Larry Dunk — Spray Tan (British)**
- Same mechanical effect as Prime Minister's spray tan
- Dialogue refers to it in a British way ("Quite blinded, I'm afraid.")

**Cain & Abel Larry Dunk**
- Conjoined twins — one sprite, two heads
- Gets 2 attacks per turn (already in codebase as `attacksLeft: 2`)
- Running gag: they only physically need one horse between them (they share one body)

---

## Narrative Structure

### Act 1 — Exposition

#### Cutscene: The Speech
Haras unveils his brain chip to the world. Villain monologue. He reveals the self-destruct switch. Everyone must comply or face execution.
> *Key beat: Haras's chip glows differently — the prototype.*

---

### Tutorial Level — The Refusal

**Gameplay:** Player directs a minion to execute a civilian who has refused the brain chip.

**Dialogue:**
- **Haras:** "A civilian has refused the chip. Make an example of them."
- **Civilian:** "I'd rather die standing than live kneeling."
- **Minion:** "I don't want to do this... I don't want to die either :("
- **Haras:** *[laughs]*

**Mechanics taught:** Basic minion movement, attacking, consequence of non-compliance

---

### Cutscene — Larry Dunk Gets Chipped

Haras reviews chip data. Discovers Larry Dunk (Prime Minister) has an anomalous neural profile — orders are received AND executed without conscious input. Realizes that an army of Larry Dunks would give him total, effortless control. The multiverse idea is born.

---

### Act 2 — The Collection

A series of levels, each in a different universe, each featuring a new Larry Dunk variant. Escalating absurdity. Rival Harases appear as background pressure.

**Universe order (suggested):**
1. Cain & Abel universe
2. Paraplegic Superhero / Axe Murderer / Cereal Mascot (2–3 collection levels, order TBD)
3. British / Female variants (TBD)
4. Investment Group (rare encounter)
5. Financier (secret — island map)
6. Mr. Runo arc (penultimate collection arc)

---

### The Mr. Runo Arc

**Setup:** Intel identifies a Larry Dunk variant called **Mr. Runo** — unusually resistant to the brain chip due to enormous bicep muscle mass interfering with chip signal.

**Reveal (at level start):** Mr. Runo is **Haras's father** who abandoned him with Dr. Retina.

**Tone:** Edgy, dramatic, deeply personal. Haras goes full edgelord.

**Gameplay:** Chase level in a gym. 8-turn limit. Robots arrive turn 4.

---

### Turn 4 Flashback — The Apprenticeship Under Dr. Retina

Triggered mid-level. Key beats:

1. **The Apprenticeship** — Dr. Retina is cold and demanding. Haras learns *some* things. Not a lot, but some.
2. **The Pi-Hub Half-Year** — For six full months, Haras's only task is using "pi-hub" to download increasingly large digit counts of pi. He is profoundly bored. His evil empire is born from boredom and a lot of digits of pi.
3. **Robot Efficiency Training** — Dr. Retina teaches Haras to direct robots efficiently. This becomes his signature skill and edge over rival Harases.
4. **Dr. Retina's Death** — Died of old age (in this universe). In other universes, increasingly unhinged.

After flashback: robots arrive as player reinforcements.

---

### Post-Capture — The Butterfly Effect

Haras uses a time machine to prevent Mr. Runo from abandoning him with Dr. Retina.
- **Consequence:** Without the abandonment, Haras never learned robot direction as well — his skills are subtly weakened.
- **Consequence:** Rival Harases now have a relative advantage.
- **Subplot escalation:** The multiverse race tightens.

---

### Act 3 — Zeus Larry Dunk & The Thousand Horses

Haras finds **Zeus Larry Dunk** — rarest variant, on Mount Olympus.

**Key beats:**
- Haras demands 1,000 horses
- Cain & Abel interrupt: "You only need one horse." (they mean it)
- Zeus deliberates, grants the horses
- Zeus retaliates with lightning — barely singes Haras
- Lightning inadvertently broadcasts Haras's multiverse coordinates to all rival Harases
- Haras immediately moves to capture Zeus → Tetris triggers
- Board is rigged — impossible configurations, threshold unreachable
- Rival Haras arrives mid-Tetris, snatches Zeus Larry Dunk
- **Tonal shift:** rivals are now a real threat

---

### Act 4 — The Final Confrontation

Haras deploys 1,000 horses against rival Harases. Final tactical battle. Rivals defeated.

**The Betrayal:** 999 horses turn on Haras. One stays.

**Ending:** The one loyal horse carries Haras into the sunset.

> *"You only need 1 horse."*

---

## Core Gameplay — Tactical RPG (Fire Emblem Style)

- Turn-based, grid/map combat
- Player Phase → Enemy Phase
- Click unit → blue movement tiles → click to move → red attack tiles → click to attack
- Combat: ATK - DEF - terrain bonus = damage, counterattacks in range
- Terrain types: Plain, Forest, Mountain, Wall, Water, Portal, Temple, Cloud, Lava, Throne, Gym Floor, Equipment, Exit
- Cain & Abel gets 2 attacks per turn

---

## Core Mechanic — Tetris Capture

When a Larry Dunk is defeated (HP → 0), combat pauses and a Tetris board overlays the screen.

### How It Works
1. Tetris board overlays the canvas
2. Player must reach a score threshold to successfully implant the brain chip
3. Outcome on failure depends on rarity tier

### Thresholds & Failure

| Variant | Threshold | On Fail |
|---|---|---|
| Common Larry Dunks | Very Low | Soft retry — unit stays on map |
| Cain & Abel | Very Low | Soft retry (story-guaranteed) |
| Mr. Runo | High | Escapes permanently — gone from this run |
| Zeus Larry Dunk | Unwinnable | Rival Haras arrives, steals Zeus |

### Design Intent
- Common = trivial, reinforces power fantasy
- Mr. Runo = genuine stakes, permanent miss
- Zeus = forced narrative moment, not a player failure

---

## Technical Architecture

- Multi-file JS (no modules) loaded in order via index.html script tags: constants → sprites → units → grid → combat → ai → ui → input → cutscene → levels → tetris → main
- Canvas-based rendering, smooth vector-style sprites via draw functions (no pixel arrays)
- Sprite keys: `haras`, `minion`, `larryDunk`, `cainAbel`, `mrRuno`, `zeusLarry`, `britishLarry`, `financierLarry`, `horse`, `loyalHorse`, `enemyHaras`, `guard`, `robot`, `dummy`, `civilian`
- Unit type → template → `createUnit(type, gx, gy, team)`
- Tetris overlay: triggered in `doCombat()` synchronously (phase set immediately, not in timeout) when a Larry Dunk unit reaches 0 HP; board drawn on canvas as a modal layer
- Zeus uses `team: 'neutral'`; `getAttackTiles()` excludes neutral team

### Larry Dunk type flag
All Larry Dunk variants should have `isLarryDunk: true` in their template so the combat system knows to trigger Tetris instead of a standard kill.

---

## Open Questions / TBD

- [x] Exact order of collection levels for non-Mr. Runo variants — RESOLVED: 0 Prologue → 1 Tutorial → 2 C&A → 3 British → 4 Financier → 5 Paraplegic → 6 Axe → 7 Cereal → 8 Investment → 9 Female → 10 RivalHaras → 11 MrRuno → 12 Zeus → 13 Final
- [x] Ad Break mechanic — RESOLVED: fake LARRY DUNK FINANCIAL SERVICES™ ad with 3s countdown before skip; absurdist legal disclaimer; obnoxious corporate tone
- [x] Financier island map design — RESOLVED: secret wait tile is THRONE at grid (7,4); player must move any unit there; financier spawns at (7,5) next turn
- [x] Female Larry Dunk — RESOLVED: 20% chance to land 1 tile off in random direction (bad driving), plays a banner if it fires
- [ ] Audio: civilian refusal VO link (developer to provide)
- [ ] Audio: "Absolute Cinema" ending clip link (developer to provide)
- [ ] Dr. Retina universe deaths — confirm list beyond the first two (U1: old age, U2: choked on grape, U3: fell into volcano while texting, U4: legally declared dead from boredom, U5+: TBD)
- [x] Does Tetris have a piece-fall speed increase — RESOLVED: yes, 800ms→150ms min, -50ms per 50 pts scored; restarts drop interval after each score update
- [ ] Do rival Harases appear as visible units on earlier maps before the Zeus arc? (design decision — currently only appear in Level 10 as combat encounter)

---

## KNOWN BUGS & TODO (Playtest Feedback)

### CRITICAL BUGS
- [x] **Tetris box opens but game doesn't render** — Investigated code path: render()→renderTetris() is correctly called every frame during TETRIS phase; all phase-change guards (checkVictoryDefeat, finishUnitAction, endPlayerTurn) already have `if TETRIS return` guards. Code appears correct — may have been an older build issue.
- [x] **Back button in dialogue** — Fixed: backDialogue() now shows previous line immediately (no typewriter re-run). Button visibility improved: color #555→#888, border #444→#666, hover #aaa→#ccc.

### BALANCE & DIFFICULTY
- [x] **Level 3 (British Larry — Parliament) too hard** — Removed robot (ranged threat during approach). Now 2 guards + britishLarry boss only. Guard repositioned to (8,5) for better layout.
- [x] **Level 11 (Mr. Runo) impossible** — Runo was escaping in 3 enemy turns (7-tile run, MOV 3). Fixed: added WALL barrier at x=10 (gap at y=5 via EQUIPMENT) forcing Runo through the chokepoint — now takes 4 enemy turns to escape. Runo HP 45→35 so 4-turn burst can actually kill him.
- [x] **Mr. Runo should NOT be a capturable ally** — ALREADY HANDLED in tetris.js `onSuccess`: if `unit.type === 'mrRuno'`, returns early before adding to `capturedLarryDunks`. Both success and fail paths result in Runo escaping permanently.
- [x] **Female Larry Dunk (Level 9) too easy** — femaleLarry nerfed: HP 22→16, ATK 5→4, DEF 3→2. Back-line guards replaced with robots (ATK 8, range 2) to compensate.
- [x] **Ally Larry Dunk count in later levels** — ldSlots capped: Levels 6-7 reduced 3→2, Levels 8-9 reduced 3→2, Level 10 reduced 3→2, Level 11 reduced 3→1. LD death persistence added to `loadLevel()`: deployed LDs that die are removed from `capturedLarryDunks` before the next level loads.

### VISUAL / SPRITE BUGS
- [x] **Level 5 (Paraplegic Larry) — ambiguous white shape** — Root cause: 24-tile solid CLOUD stripe at y=0 and y=1 looked like out-of-bounds area. Fixed: replaced with WALL border at y=0 (rooftop parapet), WALL at y=7 (bottom border), and 4 small CLOUD accent tiles at the corners of y=1-2 (sky visible through gaps).
- [x] **Level 7 (Cereal Mascot) — ambiguous white thing** — Root cause: cerealLarry's tall white #ffffff hat and gloves read as blank UI space, not a unit. Fixed: hat and gloves changed to golden cream #fff0b0; hat gets a #cc9900 outline stroke to clearly read as a costume element.
- [x] **Axe Murderer Larry Dunk needs angry eyebrows** — `_brow` changed from `'angry'` to `'evil'` (same sinister angle as enemyHaras).
- [x] **Level 8 (Investment Group) background should look like an office** — OFFICE_FLOOR already was the base. Fixed green PLAIN doorway tiles → OFFICE_FLOOR. Added EQUIPMENT desk clusters at 6 locations (rows 1, 3, 5, 7).
- [x] **Level 9 (Female Larry — Mall) background should look like a mall** — Added GYM_FLOOR shop interiors (8 tiles), FOREST planter/kiosk clusters (5 tiles), WALL storefront pillars at 3 positions along top/bottom.

### CONTENT / DIALOGUE
- [x] **Level 5 (Paraplegic Larry) post-capture dialogue** — onVictory is already clean: 3 lines, keeps eye bullet gag, clean transition to Level 6.
- [x] **Remove Bollywood Larry from Level 9 (Female Larry)** — bollywoodLarry fully deleted from all files.

### FEATURES
- [x] **Tile terrain effects on gameplay** — Effects (defBonus, moveCost) already coded in constants.js + combat.js. Made visible: DEF badge (+N) on tiles in render(), terrain hover panel in showTerrainInfo().
- [ ] **AI voice acting for all dialogue** — VERY LAST FEATURE. Only implement after final playtest sign-off from user. Each speaker needs distinct voice profile (Haras: dramatic baritone; Larry Dunk: pompous; Narrator: deadpan; etc.). Developer to confirm TTS approach (ElevenLabs, browser TTS, pre-recorded files).

