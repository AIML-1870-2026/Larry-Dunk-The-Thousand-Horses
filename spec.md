# Larry Dunk: The Thousand Horses — Implementation Spec

A browser-based Fire Emblem-style tactical RPG with a Tetris capture minigame. Vanilla JS + Canvas, no dependencies, no build step.

---

## File Structure

```
index.html          — HTML structure only
css/main.css        — all styles
js/
  constants.js      — canvas, TILE_SIZE, GamePhase, game state object, Terrain
  sprites.js        — SPRITES object, drawPixelChar(), drawUnit()
  units.js          — createUnit() and all unit templates
  grid.js           — getTerrain, getUnitAt, getMoveTiles, getAttackTiles, getManhattan
  combat.js         — doCombat(), _resolveCombat()
  ai.js             — doEnemyTurn(), doEnemyAction(), endEnemyTurn()
  ui.js             — render(), showUnitInfo(), showBanner(), updateAnimations()
  input.js          — canvas click/mousemove, selectUnit, moveUnit, endPlayerTurn
  cutscene.js       — startCutscene(), advanceDialogue(), endCutscene()
  levels.js         — LEVELS array, loadLevel(), checkVictoryDefeat(), checkTurnEvents(), showLarryDunkSelector()
  tetris.js         — Tetris capture minigame overlay
  main.js           — gameLoop(), title/victory/defeat handlers, keyboard shortcuts
sfx/                — sound files (Web Audio API synthesis)
DIALOGUE.md         — all dialogue text (authoritative source for dialogue)
```

Scripts load in the order listed. No modules — all globals.

---

## Canvas & Layout

```js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE_SIZE = 48;
const GRID_OFFSET_X = 16;
const GRID_OFFSET_Y = 40;
```

Canvas internal resolution: **960×640**. The game container is `position: fixed; inset: 0` — canvas stretches to fill the full browser window. Click coordinates are scale-compensated in input.js using `canvas.getBoundingClientRect()`.

---

## Game Phases

```js
const GamePhase = {
    TITLE:         'title',
    CUTSCENE:      'cutscene',
    PLAYER_TURN:   'playerTurn',
    UNIT_SELECTED: 'unitSelected',
    UNIT_MOVED:    'unitMoved',
    ATTACK_SELECT: 'attackSelect',
    ENEMY_TURN:    'enemyTurn',
    ANIMATION:     'animation',
    VICTORY:       'victory',
    DEFEAT:        'defeat',
    ENDING:        'ending',
    TETRIS:        'tetris',
    AD_BREAK:      'adBreak'
};
```

---

## Game State Object

```js
let game = {
    phase: GamePhase.TITLE,
    currentLevel: 0,
    turn: 1,
    units: [],
    grid: [],           // game.grid[y][x] = Terrain object
    gridW: 0,
    gridH: 0,
    selectedUnit: null,
    moveTiles: [],      // { x, y } tiles highlighted in blue
    attackTiles: [],    // { x, y } tiles highlighted in red
    cursor: { x: 0, y: 0 },
    animations: [],
    cutsceneQueue: [],
    cutsceneIndex: 0,
    camera: { x: 0, y: 0 },
    levelComplete: false,
    betrayalTriggered: false,
    horsesCollected: 0,
    pendingAdBreak: null,
    _adCountdownTimer: null,
    hoveredUnit: null,
    capturedLarryDunks: [],   // types captured via Tetris; persists across levels
    selectedLarryDunks: [],   // types chosen in pre-level LD selector
    _ldSelectorCallback: null,
    _ldSelectorMaxSlots: 0,
    pendingMoveTile: null      // { tx, ty } tile clicked but not yet confirmed
};
```

---

## Terrain Types

All terrain defined as objects in `constants.js`. `game.grid[y][x]` holds a reference.

| Key | Name | moveCost | defBonus | Notes |
|-----|------|----------|----------|-------|
| PLAIN | Plain | 1 | 0 | Default outdoor tile |
| FOREST | Forest | 2 | 2 | Jungle/crates/planters |
| MOUNTAIN | Mountain | 3 | 3 | High ground |
| WALL | Wall | 99 | 0 | Impassable |
| WATER | Water | 99 | 0 | Impassable |
| PORTAL | Portal | 1 | 0 | Animated purple glow (pulsing arc) |
| TEMPLE | Temple | 1 | 2 | Stone floor |
| CLOUD | Cloud | 1 | 1 | Sky edge tiles |
| LAVA | Lava | 99 | 0 | Impassable; -1 HP/turn if standing on |
| THRONE | Throne | 1 | 4 | Special interaction tile; +5 HP/turn |
| OFFICE_FLOOR | Office Floor | 1 | 0 | Corporate interior |
| GYM_FLOOR | Gym Floor | 1 | 0 | Gym/mall interior |
| EQUIPMENT | Equipment | 2 | 1 | Desks, gym equipment |
| EXIT | Exit | 1 | 0 | Animated red pulse; win condition in Level 11 |
| STAIR | Stairs | 2 | 0 | Two-floor connector; renders with 4 horizontal step lines |
| UPPER_FLOOR | Upper Floor | 1 | 1 | Elevated zone; height advantage |

Tiles with `defBonus > 0` show a small `+N` badge in the bottom-right corner.

---

## Unit Templates

`createUnit(type, gx, gy, team)` clones the template and adds runtime fields: `type, maxHp, gx, gy, team, acted, alive, isLarryDunk, invisible, badDriving, attacksLeft`.

`attacksLeft` = 2 for `cainAbel`, 1 for all others.

### Player/Shared Units

| type | name | HP | ATK | DEF | MOV | RNG | special |
|------|------|----|-----|-----|-----|-----|---------|
| haras | Haras | 30 | 8 | 5 | 4 | 2 | Brain Chip Control |
| minion | Minion | 15 | 5 | 2 | 3 | 1 | Expendable |
| civilian | Civilian | 8 | 0 | 0 | 0 | 1 | Cannot fight |
| guard | Guard | 18 | 6 | 4 | 3 | 1 | — |
| robot | Robot | 22 | 7 | 6 | 3 | 1 | Mechanical |
| enemyHaras | Rival Haras | 28 | 9 | 5 | 4 | 2 | Multiverse Clone |
| dummy | Dummy | 10 | 2 | 1 | 0 | 1 | Cannot move |
| horse | Horse | 20 | 6 | 3 | 6 | 1 | Cavalry |
| loyalHorse | Loyal Horse | 25 | 8 | 5 | 7 | 1 | The One Horse |

### Larry Dunk Variants (all have `isLarryDunk: true`)

| type | name | HP | ATK | DEF | MOV | RNG | special | ability |
|------|------|----|-----|-----|-----|-----|---------|---------|
| larryDunk | Larry Dunk | 35 | 7 | 7 | 3 | 1 | Brain Chipped | Spray Tan |
| cainAbel | Cain & Abel | 40 | 9 | 6 | 3 | 1 | 2 Attacks/Turn | Double attack |
| mrRuno | Mr. Runo | 35 | 12 | 4 | 3 | 1 | Huge Biceps | Non-capturable |
| zeusLarry | Zeus Larry Dunk | 50 | 11 | 5 | 3 | 3 | Lightning | Range 3 |
| britishLarry | British Larry Dunk | 32 | 8 | 6 | 3 | 1 | Spray Tan (British) | Spray Tan |
| financierLarry | Financier Larry Dunk | 28 | 10 | 4 | 4 | 1 | Cannibalism | Heals on hit |
| paraplegicLarry | Paraplegic Superhero Larry | 30 | 9 | 3 | 3 | 3 | Eye Bullets | Range 3; can't attack if adjacent enemy |
| axeLarry | Axe Murderer Larry Dunk | 36 | 13 | 3 | 3 | 1 | Chain Kill | Free attack after kill |
| cerealLarry | Cereal Mascot Larry Dunk | 25 | 6 | 4 | 4 | 1 | Invisible | `invisible: true`; AI ignores |
| investmentLarry | Investment Group Larry Dunk | 30 | 15 | 5 | 2 | 1 | Ad Break | Ad overlay before attack (player only) |
| femaleLarry | Female Larry Dunk | 16 | 4 | 2 | 4 | 1 | Bad Driving | `badDriving: true`; 20% off-target move |

---

## Core Mechanics

### Movement

`getMoveTiles(unit)` — BFS from unit's position up to `unit.mov` movement points. `moveCost` is subtracted per tile crossed. Tiles with `moveCost >= 99` are impassable. Tiles occupied by enemy units are impassable; tiles occupied by allies are passable but not selectable as destinations.

### Attack

`getAttackTiles(unit, fromX, fromY)` — returns tiles within Manhattan distance `unit.range` that contain a living enemy unit. Neutral team units are excluded.

**Special case — paraplegicLarry:** If any enemy unit is within Manhattan distance 1 of `(fromX, fromY)`, returns `[]` immediately (wheelchair helpless up close).

### Combat Formula

```
damage = max(1, attacker.atk - defender.def - terrain.defBonus)
defender.hp -= damage
```

**Counterattack:** If the defender survives and the attacker is within `defender.range`, the defender immediately counterattacks:
```
counterDmg = max(1, defender.atk - attacker.def - attackerTerrain.defBonus)
attacker.hp -= counterDmg
```

**Death:** Unit is marked `alive = false`. A death burst animation plays.

**Larry Dunk death exception:** If `defender.isLarryDunk && defender.team === 'enemy'` and HP reaches 0, instead of dying: `defender.hp = 1`, `attacker.acted = true`, and `startTetrisCapture(defender)` is called synchronously. **Never use setTimeout before setting the Tetris phase** — the render loop will crash on an uninitialized board.

**Larry Dunk counterattack exception:** If a Larry Dunk (enemy team) would die from a counterattack, it clings to 1 HP. Only a direct player attack triggers Tetris.

### Turns

1. **Player Phase** — player selects units, moves, attacks, waits. Turn ends automatically when all player units have `acted = true`, or player clicks End Turn.
2. `checkTurnEvents()` fires at the end of each player turn (before enemy phase).
3. **Enemy Phase** — AI acts for all enemy units in sequence.
4. `endEnemyTurn()` resets `sprayTanned` flags and all unit `acted` flags, increments `game.turn`, returns to Player Phase.

### Victory / Defeat

- **Defeat:** Haras dies, or all player units die → `GamePhase.DEFEAT`.
- **Victory:** Level's `victoryCheck()` returns true (default: all enemies dead) → `GamePhase.VICTORY`.
- `checkVictoryDefeat()` returns immediately if `phase === GamePhase.TETRIS`.

---

## Special Abilities

### Spray Tan — `larryDunk`, `britishLarry`
Triggers when **defender survives** (not on kill). The defender and all enemy units adjacent to the defender (Manhattan ≤ 1) lose 1 range (`u.range = max(1, u.range - 1)`) and are flagged `sprayTanned = true`. Resets at the start of the next player turn in `endEnemyTurn()`.

### Cannibalism — `financierLarry`
After dealing damage, attacker heals `min(damage, maxHp - hp)` HP. A green `+N` floating number plays.

### 2 Attacks/Turn — `cainAbel`
`attacksLeft: 2` in template. In input.js, after an attack, if `attacksLeft > 1`, decrement and allow another attack before marking `acted`.

### Chain Kill — `axeLarry`
When axeLarry kills a non-Larry-Dunk unit (not `isChain`), `setTimeout(500)` then one free attack on the nearest living enemy unit within range. The follow-up uses `doCombat(attacker, chainTarget, true)` — the `isChain = true` flag prevents recursion.

### Invisible — `cerealLarry`
`invisible: true` on the unit. Enemy AI skips invisible units in all target selection loops (both pre-move targeting and post-move attack selection).

### Ad Break — `investmentLarry` (player-controlled only)
When `doCombat` is called with a player-team `investmentLarry` attacker, instead of resolving immediately: set `game.pendingAdBreak = { attacker, defender, isChain }`, set `game.phase = GamePhase.AD_BREAK`, call `showAdBreak()`. Shows a full-screen fake YouTube-style ad (LARRY DUNK FINANCIAL SERVICES™) with a 3-second countdown. After countdown, "Skip Ad ▶" becomes clickable, calls `skipAdBreak()` which calls `_resolveCombat(attacker, defender, isChain)`. Keyboard input is blocked during AD_BREAK phase.

### Bad Driving — `femaleLarry`
`badDriving: true` on the unit. In `moveUnit()`, after computing the destination tile: 20% chance (`Math.random() < 0.2`) to instead land on a random adjacent tile. If the random tile is occupied or out of bounds, the unit stays at the original destination. Show a "BAD DRIVING!" banner if the deviation fires.

### Eye Bullets — `paraplegicLarry`
Range 3. Cannot attack if any enemy unit is adjacent (Manhattan ≤ 1). Implemented in `getAttackTiles()` as an early return.

---

## Tetris Capture

When a Larry Dunk (enemy team) hits 0 HP in `_resolveCombat()`:
1. `defender.hp = 1` (stays alive)
2. `attacker.acted = true`
3. `startTetrisCapture(defender)` called synchronously

`startTetrisCapture(unit, opts)` initializes the board **before** setting `game.phase = GamePhase.TETRIS` to avoid render crashes.

### Board
10 wide × 20 tall. Standard Tetris pieces (I, O, T, S, Z, J, L). Controls: arrow keys or WASD to move/rotate, Space/Down to hard drop.

### Score Thresholds

| Unit | Threshold | On Fail |
|------|-----------|---------|
| larryDunk, britishLarry, paraplegicLarry, axeLarry, cerealLarry, investmentLarry, femaleLarry, financierLarry | 200 | Soft retry (unit stays on map, player can attack again) |
| cainAbel | 100 | Soft retry |
| mrRuno | 800 | Mr. Runo escapes permanently — `onSuccess` checks `unit.type === 'mrRuno'` and returns without capturing |
| zeusLarry | ∞ (rigged) | Forced fail → chaos cutscene in tetris.js → `loadLevel(13)` |

### Speed Escalation
Drop interval starts at 800ms. Every 50 pts scored, interval decreases by 50ms (minimum 150ms). Drop timer resets after each score update.

### On Success
Unit switches to `team = 'player'`. Type is added to `game.capturedLarryDunks`. Game returns to `GamePhase.PLAYER_TURN`.

### Rigged Board (Zeus)
`startTetrisCapture(zeus, { rigged: true })` — pieces are specifically chosen to create unplayable configurations. After 15 seconds, the chaos cutscene fires automatically (tetris.js), then `loadLevel(13)`.

---

## Larry Dunk Selector

Before each level with `ldSlots`, `showLarryDunkSelector(maxSlots, callback)` shows an overlay. Player selects up to `maxSlots` Larry Dunks from `game.capturedLarryDunks`. Selected types stored in `game.selectedLarryDunks`. On deploy, `spawnSelectedLarryDunks()` places them on the spawn tiles defined in the level's `ldSlots` array.

`ldSlots` format: `[[gx, gy], [gx, gy], ...]` — spawn positions on the map.

When jumping directly to a level via level select, `game.capturedLarryDunks` is pre-populated with `LD_POOL_AT_LEVEL[i]` (defined in main.js) — the LDs that would have been captured by that point in a normal playthrough.

### LD death persistence
At `loadLevel()`, any LD in `selectedLarryDunks` that died during the previous level is removed from `capturedLarryDunks` before the next level loads.

---

## AI

`doEnemyTurn()` iterates all living enemy units and calls `doEnemyAction(unit)`:

1. Find the nearest living player unit that is not invisible (`!u.invisible`).
2. Move toward that unit (BFS pathfinding using `getMoveTiles`).
3. After moving, check `getAttackTiles(unit, unit.gx, unit.gy)` — attack the first valid target (excluding invisible units).
4. Mark `unit.acted = true`.

`endEnemyTurn()`:
- Resets `sprayTanned` flags: for each unit with `sprayTanned`, restore `range += 1`, clear flag.
- Resets all units' `acted = false`.
- Increments `game.turn`.
- Calls `checkTurnEvents()`, then returns to `GamePhase.PLAYER_TURN`.

---

## Rendering

`render()` is called every frame via `requestAnimationFrame`. It draws:
1. Grid tiles (fill with `terrain.color`, thin grid lines)
2. Special terrain effects (PORTAL pulsing arc, EXIT pulsing rect, STAIR step lines)
3. DEF bonus badges on tiles with `defBonus > 0`
4. Move tiles (blue overlay), attack tiles (red overlay), hover previews
5. Units via `drawUnit(unit, px, py, sz)`
6. Animations (hit flash, damage numbers, death burst, pulse ring on selected unit)
7. UI overlay (top bar: level name, turn counter; unit info panel on hover)
8. Tetris overlay (when `phase === TETRIS`)

---

## Sprites

All sprites are drawn via JS vector functions using `u = sz / 20` as the proportional unit. No image assets — pure canvas draw calls (arc, fillRect, beginPath, etc.).

Sprite keys: `haras`, `minion`, `civilian`, `larryDunk`, `cainAbel`, `mrRuno`, `zeusLarry`, `britishLarry`, `financierLarry`, `paraplegicLarry`, `axeLarry`, `cerealLarry`, `investmentLarry`, `femaleLarry`, `horse`, `loyalHorse`, `enemyHaras`, `guard`, `robot`, `dummy`

Key visual identifiers:
- **haras**: dark blue body, black hair oval, no chip visible
- **enemyHaras**: dark red body (#4a0000), evil angled eyebrows — distinct from player Haras
- **larryDunk**: wild blond poof, orange-tan skin, blue suit, red tie
- **cainAbel**: two Larry Dunk heads side-by-side on one wide shared body, red center stripe
- **mrRuno**: navy suit with white lapels, enormous brown bicep ellipses (Haras's bloodline)
- **zeusLarry**: cream toga with gold band, bare arm, blond hair, no crown
- **britishLarry**: red military coat, gold epaulettes, top hat, monocle + chain
- **financierLarry**: cream linen suit, deep tan skin, slicked blond hair, gold-framed sunglasses
- **paraplegicLarry**: wheelchair (wheels/spokes/armrests), red cape, blue superhero costume, gold star
- **axeLarry**: blue suit, bloody axe polygon, blood spatters, evil angled brows
- **cerealLarry**: golden cream chef hat (#fff0b0) with #cc9900 outline, orange mascot suit, yellow polka dots, mascot gloves
- **investmentLarry**: charcoal power suit, dark red tie + gold pin, briefcase
- **femaleLarry**: pink blazer, black flared skirt, longer flowing blond hair
- **horse**: profile view, barrel body, arching neck trapezoid, polygon head, dark mane + forelock
- **loyalHorse**: identical to horse + tiny 3-dot yellow bow on mane

---

## SFX

13 synthesized sounds via Web Audio API (sfx.js). No external files.

`playSound(name)` where name is one of: `select`, `move`, `hit`, `death`, `tetris_place`, `tetris_clear`, `tetris_success`, `tetris_fail`, `player_phase`, `enemy_phase`, `ad_jingle`, `victory`, `defeat`

---

## Dialogue System

`startCutscene(lines, callback)` — shows dialogue box, typewriter effect on each line. `advanceDialogue()` on Space/Enter or click. On last line, calls `callback`.

Each line: `{ speaker: 'NAME', text: 'Text here.', color: '#hex' }`

Skip All button calls `endCutscene()` immediately. Back button shows previous line instantly.

All dialogue text lives in `DIALOGUE.md` and is synced to `levels.js` on request.

---

## Levels

### Level 0 — Prologue
Pure cutscene. No grid. Dialogue → `loadLevel(1)`.

---

### Level 1 — Tutorial: The Refusal
**Grid:** 9×7, all PLAIN
**Terrain:** WALL at (3,1), WALL at (3,5), FOREST at (4,3)
**Units:**
- haras (1,3) player, minion (1,2) player, minion (1,4) player
- civilian (5,2) enemy, civilian (6,3) enemy, civilian (7,5) enemy

**Objective:** Eliminate all civilians.
**Victory:** All enemies dead.
**No ldSlots.**
**Mechanics taught:** Select, move, wall, forest, attack, wait, counterattack, hover unit info, Haras = VIP.

---

### Level 2 — Ch.1: Multiverse Recruitment
**Grid:** 12×10, all PLAIN
**Terrain:** PORTAL (10,1), PORTAL (10,2); WALL row y=3–6 at x=4; FOREST (5,2),(5,7),(7,4),(7,5); WATER (6,0),(7,0),(6,9),(7,9)
**Units:**
- haras (0,4), larryDunk (1,4), minion (0,3), minion (0,5) — all player
- guard (6,2) enemy, guard (8,5) enemy, cainAbel (10,4) enemy

**Objective:** Defeat guards and capture Cain & Abel (Tetris).
**Victory:** All enemies dead.
**No ldSlots.**

---

### Level 3 — Ch.2: The Parliament Gambit
**Grid:** 14×10
**Base:** all PLAIN
**Terrain:** WALL border y=0 and y=9 (full rows); WALL pillars at (4,2),(4,3),(4,6),(4,7),(9,2),(9,3),(9,6),(9,7); FOREST (2,1),(2,8),(6,4),(11,5); THRONE (12,4),(12,5)
**Units:**
- haras (1,4), larryDunk (1,5), minion (1,2), minion (1,7) — all player
- guard (5,2) enemy, guard (8,5) enemy, britishLarry (12,4) enemy

**ldSlots:** [[0,3],[0,5]]
**Objective:** Capture British Larry Dunk.
**Victory:** All enemies dead.

---

### Level 4 — Ch.2.5: The Island
**Grid:** 12×9
**Base:** PLAIN interior, WATER border (y=0, y=8, x=0, x=11)
**Terrain:** FOREST (3,2),(4,2),(7,6),(8,6),(9,4),(6,3); THRONE (7,4); MOUNTAIN (9,2),(2,6)
**Units:**
- haras (1,4), larryDunk (2,4), minion (1,3) — all player
- guard (5,2) enemy, guard (8,5) enemy, guard (5,6) enemy

**ldSlots:** [[1,5],[2,3]]
**Objective:** Defeat guards. Secret: move any unit to THRONE tile (gx=7, gy=4) to trigger Survivalist Larry.
**Turn Event:** Each turn, check if any player unit is at (gx=7, gy=4). If yes and `!game.financierRevealed`, fire cutscene, set `game.financierRevealed = true`, spawn `financierLarry` at (7,5) as enemy, show banner "SURVIVALIST LARRY FOUND!".
**Victory:** All enemies dead.
**On Victory (financierLarry captured):** Special dialogue with Survivalist Larry.
**On Victory (not captured):** Short "signal lost" dialogue.
Both paths push a shared 2-line transition then `loadLevel(5)`.

---

### Level 5 — Ch.3: Eye Bullets
**Grid:** 12×8
**Base:** all PLAIN
**Terrain:** WALL border y=0 and y=7 (full rows); CLOUD (0,1),(11,1),(0,2),(11,2) (corner accents); WALL (4,2),(5,2),(3,5),(8,5); MOUNTAIN (1,3),(10,4)
**Units:**
- haras (0,3), larryDunk (0,4), minion (1,3) — all player
- guard (4,2), guard (4,5), guard (7,3), robot (7,5), robot (9,4), paraplegicLarry (10,3) — all enemy

**ldSlots:** [[1,5],[0,2]]
**Objective:** Defeat all enemies and capture paraplegic Larry.
**Victory:** All enemies dead.

---

### Level 6 — Ch.3.2: The Slaughterhouse
**Grid:** 12×8
**Base:** all PLAIN
**Terrain:** FOREST (4,1),(5,1),(3,6),(7,6),(9,3) — crates; WALL (6,0),(6,7),(0,3),(0,4)
**Units:**
- haras (1,3), larryDunk (1,4), minion (0,3) — all player
- guard (5,1), guard (5,6), guard (7,3), guard (6,5), axeLarry (9,3) — all enemy

**ldSlots:** [[0,5],[2,2]]
**Objective:** Defeat all enemies and capture Axe Murderer Larry.
**Victory:** All enemies dead.

---

### Level 7 — Ch.3.3: Part of a Complete Breakfast
**Grid:** 12×9
**Base:** all TEMPLE (TV studio floor)
**Terrain:** FOREST (3,2),(4,2),(7,6),(8,6),(5,4) — set pieces; WALL (6,0),(6,8),(0,1),(0,7)
**Units:**
- haras (1,4), larryDunk (1,5), minion (0,5) — all player
- guard (5,2), guard (5,6), guard (7,4), cerealLarry (10,4) — all enemy

**ldSlots:** [[0,3],[2,3]]
**Objective:** Defeat all guards. Cereal Larry is invisible to enemies — player must find and attack him.
**Victory:** All enemies dead.

---

### Level 8 — Ch.3.4: Q4 Acquisition
**Grid:** 14×9
**Two-floor layout:**
- Rows 0–3: UPPER_FLOOR (boardroom / 15th floor)
- Row 4: WALL across all x=0–13, except STAIR at x=4 and x=9
- Rows 5–8: OFFICE_FLOOR (lobby / entrance)

**Upper floor obstacles:** WALL (0,6),(0,7),(1,5),(1,8); EQUIPMENT (2,1),(2,12); THRONE (1,11),(1,12)
**Lower floor obstacles:** EQUIPMENT (5,1),(5,2),(6,11),(6,12); WALL (7,5),(7,8)

**Units:**
- haras (1,7), larryDunk (0,7), minion (1,6) — player, lower floor
- guard (6,6) enemy — lower floor, guards left stairway
- guard (3,2) enemy — upper floor boardroom left
- robot (8,2) enemy — upper floor boardroom center
- investmentLarry (12,1) enemy — upper floor at conference table

**ldSlots:** [[0,5],[2,4]]
**Objective:** Fight through the lobby, climb the stairs (MOV cost 2), fight through the boardroom, capture Investment Larry.
**Victory:** All enemies dead.

---

### Level 9 — Ch.3.6: Wrong Turn
**Grid:** 12×8
**Base:** all TEMPLE (mall tile floor)
**Terrain:** WATER (5,3),(6,3),(5,4),(6,4) — fountain; GYM_FLOOR (1,1),(2,1),(2,5),(6,5),(1,10),(2,10),(5,10),(6,10) — shops; FOREST (3,1),(3,6),(8,1),(8,6),(5,2),(5,6) — planters; WALL (1,0),(1,7),(6,0),(6,7),(11,0),(11,7) — pillars
**Units:**
- haras (1,3), larryDunk (1,4), minion (0,3) — player
- guard (4,2), guard (4,5), robot (7,3), robot (9,5), femaleLarry (9,3) — enemy

**ldSlots:** [[0,4],[2,3]]
**Objective:** Defeat all enemies and capture Female Larry Dunk.
**Victory:** All enemies dead.

---

### Level 10 — Ch.3.7: The Other Me
**Grid:** 12×8
**Base:** CLOUD for y≤1, PLAIN for y≥2
**Terrain:** PORTAL (0,2),(0,5),(11,2),(11,5); WALL (4,3),(5,3),(7,4),(8,4); FOREST (6,1),(3,6),(9,6)
**Units:**
- haras (0,3), larryDunk (0,4), minion (1,3) — player
- enemyHaras (10,3), guard (2,7), guard (2,5), larryDunk (4,8) — enemy (rival Haras's team)

**ldSlots:** [[1,5],[1,2]]
**Objective:** Defeat rival Haras and his forces to unlock Mr. Runo's universe.
**Victory:** All enemies dead.

---

### Level 11 — Ch.4: Catch Mr. Runo!
**Grid:** 14×10
**Base:** all GYM_FLOOR
**Terrain:** WALL border y=0 and y=9 (full rows), WALL at x=0 (full column); WALL at x=10 for y=1–8 (barrier), EXCEPT EQUIPMENT at (5,10) which creates a chokepoint gap; EQUIPMENT (3,1),(4,1),(6,3),(7,3),(2,5),(10,5),(5,7),(8,7); EXIT (4,13),(5,13)
**Units:**
- haras (1,4), larryDunk (1,5), minion (1,2), minion (2,8) — player
- mrRuno (7,5) — enemy (flees toward EXIT)

**ldSlots:** [[2,7]]
**Objective:** Stop Mr. Runo before he reaches the EXIT tiles. 10-turn limit.
**Turn Event at turn 3:** Dr. Retina flashback cutscene → spawn robot (1,1) and robot (1,8) as player units.
**Turn Event at turn ≥ 10:** If Mr. Runo still alive and enemy team → defeat cutscene.
**Victory:** `mrRuno.alive === false` (Tetris succeeds but he escapes anyway — `onSuccess` returns early for mrRuno type).
**Mr. Runo AI:** Moves toward EXIT tiles at (13,4),(13,5) each turn instead of attacking.

---

### Level 12 — Ch.5: The Thousand Horses
**Grid:** 16×12
**Base:** CLOUD at y=0, TEMPLE for y=1–4, PLAIN for y≥5
**Terrain:** THRONE (0,7),(0,8); FOREST (3,5),(12,5); MOUNTAIN (5,8),(10,8); WALL (0,6),(0,7),(15,6),(15,7)
**Units (player):** haras (2,8), larryDunk (3,8), cainAbel (2,9), mrRuno (4,9), 10× horse at (5–8, 7–9)
**Units (enemy):** 4× enemyHaras at (12,2),(14,4),(13,6),(11,8); 4× guard; 2× robot
**Zeus:** `createUnit('zeusLarry', 7, 0, 'neutral')` — `acted = true`, team neutral, `getAttackTiles` excludes neutral team so player cannot attack Zeus directly.

**Objective:** Defeat all rival Harases with the horse army.
**Victory:** All enemies dead.
**On Victory:** Zeus betrayal cutscene → `startTetrisCapture(zeus, { rigged: true })`.
After rigged Tetris fails → chaos cutscene in tetris.js → `loadLevel(13)`.

---

### Level 13 — FINAL: The One Horse
**Grid:** 16×12
**Base:** CLOUD at y=0, PLAIN everywhere else
**Terrain:** PORTAL (5,15),(6,15); FOREST (8,4),(8,7); MOUNTAIN (12,3),(12,8)
**Units (player):** haras (1,5), loyalHorse (2,5), larryDunk (1,6), cainAbel (2,7), mrRuno (1,4)
**Units (enemy):** zeusLarry (1,7) enemy; 9× horse enemies; 2× guard at (13,5),(14,5)
**Turn Event:** Every even turn ≤ 8, spawn 2 enemy horses at x=14 random y=2–9 (if tile unoccupied).

**Objective:** Move Haras to a PORTAL tile (gx=15, gy=5 or 6).
**Victory:** `getTerrain(haras.gx, haras.gy) === Terrain.PORTAL`
**On Victory:** Ending cutscene → `GamePhase.ENDING` → title card drawn on canvas.

---

## HTML Structure (key IDs)

```html
<canvas id="gameCanvas"></canvas>
<div id="titleScreen">...</div>
<div id="levelSelectScreen"><div id="levelGrid"></div></div>
<div id="victoryScreen"><span id="victoryText"></span></div>
<div id="defeatScreen">...</div>
<div id="dialogueBox">
  <span id="dialogueSpeaker"></span>
  <span id="dialogueText"></span>
  <button id="skipAllBtn">Skip All</button>
  <button id="backDialogueBtn">◀ Back</button>
</div>
<div id="bannerOverlay"><span id="bannerText"></span></div>
<div id="unitInfoPanel">
  <span id="unitName"></span>
  <span id="unitStats"></span>
  <span id="unitSpecial"></span>
</div>
<div id="terrainInfoPanel">
  <span id="terrainName"></span>
  <span id="terrainSpecial"></span>
</div>
<div id="topBar">
  <span id="levelName"></span>
  <span id="turnCounter"></span>
  <span id="phaseIndicator"></span>
</div>
<div id="larryDunkSelector">
  <div id="ldSelectorGrid"></div>
  <span id="ldSlotsUsed"></span>/<span id="ldSlotsMax"></span>
  <button id="ldDeployBtn">Deploy</button>
</div>
<div id="adBreakOverlay">...</div>
<div id="tetrisOverlay">...</div>
```

---

## Notes for Implementation

- **Phase guard pattern:** Every system that changes phase checks the current phase first. `checkVictoryDefeat()` returns if `TETRIS`. `finishUnitAction()` checks before setting `PLAYER_TURN`. `endPlayerTurn()` checks before starting enemy phase.
- **Tetris init order:** Always initialize `tetris.board` **before** setting `game.phase = TETRIS`. If phase is set first, the render loop will attempt to access `tetris.board[y][x]` before it exists and crash the `requestAnimationFrame` chain.
- **onVictory is called once:** Only from the victory screen click handler in `main.js`. Not from `checkVictoryDefeat()`.
- **Mr. Runo victory condition:** `mrRuno.alive === false` only — `mrRuno` can never have `team === 'player'` because `onSuccess` in tetris.js returns early for his type.
- **LD selector pool:** `LD_POOL_AT_LEVEL` in main.js maps each level index to the LDs captured by that point in a normal playthrough. Used when jumping directly to a level.
