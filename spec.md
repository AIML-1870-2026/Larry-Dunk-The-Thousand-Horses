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
  grid.js           — getTerrain, getUnitAt, getMovementTiles, getAttackTiles, getManhattan
  combat.js         — doCombat(), _resolveCombat()
  ai.js             — doEnemyTurn(), doEnemyAction(), endEnemyTurn()
  ui.js             — render(), showUnitInfo(), showBanner(), updateAnimations(), updateTopBar()
  input.js          — canvas click/mousemove, selectUnit, moveUnit, endPlayerTurn
  cutscene.js       — startCutscene(), advanceDialogue(), endCutscene()
  levels.js         — LEVELS array, loadLevel(), checkVictoryDefeat(), checkTurnEvents()
  tetris.js         — Tetris capture minigame overlay
  music.js          — playMusic(trackName), stopMusic(); mp3-backed track map
  main.js           — gameLoop(), title/victory/defeat handlers, keyboard shortcuts
sfx/                — sound files (Web Audio API synthesis)
music/              — background mp3 files
DIALOGUE.md         — all dialogue text (authoritative source — sync to levels.js on request)
```

Scripts load in the order listed. No modules — everything is global.

---

## Canvas & Layout

```js
const TILE_SIZE = 48;
const GRID_OFFSET_X = 16;
const GRID_OFFSET_Y = 40;
```

Canvas internal resolution: **960×640**. The container is `position: fixed; inset: 0` — canvas stretches to fill the full browser window. Click coordinates are scale-compensated using `canvas.getBoundingClientRect()`.

---

## Game Phases

```js
const GamePhase = {
    TITLE, CUTSCENE, PLAYER_TURN, UNIT_SELECTED, UNIT_MOVED,
    ATTACK_SELECT, ENEMY_TURN, ANIMATION, VICTORY, DEFEAT,
    ENDING, TETRIS, AD_BREAK
};
```

---

## Game State

```js
let game = {
    phase: GamePhase.TITLE,
    currentLevel: 0,
    turn: 1,
    units: [],
    grid: [],           // game.grid[y][x] = Terrain object
    gridW: 0, gridH: 0,
    selectedUnit: null,
    moveTiles: [],      // {x,y} tiles in blue
    attackTiles: [],    // {x,y} tiles in red
    cursor: { x: 0, y: 0 },
    animations: [],
    cutsceneQueue: [], cutsceneIndex: 0,
    capturedLarryDunks: [],   // types captured via Tetris; persists across levels
    selectedLarryDunks: [],   // types chosen in pre-level LD selector
    pendingAdBreak: null,
    hoveredUnit: null,
    pendingMoveTile: null,    // {tx, ty} tile clicked awaiting confirmation
    betrayalTriggered: false,
    horsesCollected: 0
};
```

---

## Terrain Types

`game.grid[y][x]` holds a Terrain reference. Tiles with `defBonus > 0` show a `+N` badge.

| Key | Name | moveCost | defBonus | Notes |
|-----|------|----------|----------|-------|
| PLAIN | Plain | 1 | 0 | Default outdoor tile |
| FOREST | Forest | 2 | 2 | Also heals +1 HP/turn |
| MOUNTAIN | Mountain | 3 | 3 | High ground |
| WALL | Wall | 99 | 0 | Impassable |
| WATER | Water | 99 | 0 | Impassable |
| PORTAL | Portal | 1 | 0 | Pulsing purple arc animation |
| TEMPLE | Temple | 1 | 2 | Stone floor |
| CLOUD | Cloud | 1 | 1 | Sky edge tiles |
| LAVA | Lava | 99 | 0 | Impassable; placed units take −2 HP/turn |
| THRONE | Throne | 1 | 4 | Heals +2 HP/turn; triggers Level 4 secret |
| OFFICE_FLOOR | Office Floor | 1 | 0 | Corporate lobby |
| GYM_FLOOR | Gym Floor | 1 | 0 | Mall / gym interior |
| EQUIPMENT | Equipment | 2 | 1 | Desks, gym machines |
| EXIT | Exit | 1 | 0 | Pulsing red rect; Level 11 escape point |
| STAIR | Stairs | 2 | 0 | Two-floor connector; draws 4 horizontal step lines |
| UPPER_FLOOR | Upper Floor | 1 | 1 | Elevated zone; height advantage |

Terrain HP effects per turn (applied in `endEnemyTurn`): LAVA −2, FOREST +1, THRONE +2.

---

## Unit Templates

`createUnit(type, gx, gy, team)` clones the template and adds: `type, maxHp, gx, gy, team, acted, alive, isLarryDunk, invisible, badDriving, attacksLeft`. `attacksLeft = 2` for `cainAbel`, 1 for all others.

### Standard Units

| type | name | HP | ATK | DEF | MOV | RNG |
|------|------|----|-----|-----|-----|-----|
| haras | Haras | 30 | 8 | 5 | 4 | 2 |
| minion | Minion | 15 | 5 | 2 | 3 | 1 |
| civilian | Civilian | 8 | 0 | 0 | 0 | 1 |
| guard | Guard | 18 | 6 | 4 | 3 | 1 |
| robot | Robot | 22 | 7 | 6 | 3 | 1 |
| enemyHaras | Rival Haras | 28 | 9 | 5 | 4 | 2 |
| horse | Horse | 30 | 12 | 5 | 7 | 1 |
| loyalHorse | Loyal Horse | 38 | 15 | 7 | 8 | 1 |
| dummy | Dummy | 10 | 2 | 1 | 0 | 1 |

### Larry Dunk Variants (`isLarryDunk: true` on all)

| type | name | HP | ATK | DEF | MOV | RNG | Ability |
|------|------|----|-----|-----|-----|-----|---------|
| larryDunk | Larry Dunk | 35 | 7 | 7 | 3 | 1 | Spray Tan |
| cainAbel | Cain & Abel | 40 | 9 | 6 | 3 | 1 | 2 Attacks/Turn |
| britishLarry | British Larry Dunk | 32 | 8 | 6 | 3 | 1 | Spray Tan |
| financierLarry | Survivalist Larry Dunk | 28 | 10 | 4 | 4 | 1 | Cannibalism |
| paraplegicLarry | Paraplegic Superhero Larry | 30 | 9 | 3 | 3 | 3 | Eye Bullets |
| axeLarry | Axe Murderer Larry Dunk | 36 | 13 | 3 | 3 | 1 | Chain Kill |
| cerealLarry | Cereal Mascot Larry Dunk | 25 | 6 | 4 | 4 | 1 | Invisible |
| investmentLarry | Investment Group Larry Dunk | 30 | 15 | 5 | 2 | 1 | Ad Break |
| femaleLarry | Female Larry Dunk | 16 | 4 | 2 | 4 | 1 | Bad Driving |
| mrRuno | Mr. Runo | 35 | 12 | 4 | 3 | 1 | Huge Biceps (non-capturable) |
| zeusLarry | Zeus Larry Dunk | 50 | 11 | 5 | 3 | 3 | Lightning |

---

## Core Mechanics

### Movement

`getMovementTiles(unit)` — BFS up to `unit.mov` movement points. Tiles with `moveCost ≥ 99` block movement. Enemy-occupied tiles block; ally-occupied tiles are passable but not selectable as destinations.

### Attack

`getAttackTiles(unit, fromX, fromY)` — returns tiles within Manhattan distance `unit.range` containing a living non-neutral enemy.

**paraplegicLarry exception:** If any enemy is within Manhattan ≤ 1 of (fromX, fromY), returns `[]` immediately. Shows `TOO CLOSE!` banner.

### Combat Formula

```
damage = max(1, attacker.atk - defender.def - terrain.defBonus)
defender.hp -= damage
```

**Counterattack:** If defender survives and attacker is within `defender.range`:
```
cDmg = max(1, defender.atk - attacker.def - attackerTerrain.defBonus)
attacker.hp = max(1, attacker.hp - cDmg)   // counterattacks CANNOT kill
```
If the clamp fires, shows `SURVIVED!` banner.

**Larry Dunk death:** If `defender.isLarryDunk && defender.team === 'enemy'` and HP hits 0: set `defender.hp = 1`, mark `attacker.acted = true`, call `startTetrisCapture(defender)` synchronously. **Initialize the Tetris board before setting `phase = TETRIS`** or the render loop crashes.

### Turns

1. **Player Phase** — units act one at a time. Turn ends when all player units have `acted = true`, or player clicks End Turn.
2. `checkTurnEvents()` fires at turn end.
3. **Enemy Phase** — AI acts for all enemies sequentially.
4. `endEnemyTurn()` resets `sprayTanned` flags and all `acted` flags, increments `game.turn`, returns to Player Phase.

### Victory / Defeat

- **Defeat:** Haras dies, or all player units die.
- **Victory:** Level's `victoryCheck()` returns true (default: all enemies dead).
- `checkVictoryDefeat()` exits immediately if `phase === TETRIS`.

---

## Special Abilities

**Spray Tan** (`larryDunk`, `britishLarry`): when defender survives, defender + all enemies adjacent to defender lose 1 range (`sprayTanned = true`). Resets at `endEnemyTurn`. Shows `SPRAY TAN!` banner.

**Cannibalism** (`financierLarry`): after dealing damage, attacker heals `min(damage, maxHp - hp)` HP. Shows `CANNIBALISM!` banner and green `+N` floating number.

**2 Attacks/Turn** (`cainAbel`): `attacksLeft: 2`. After first attack, decrement; if > 0 allow another attack before marking acted.

**Chain Kill** (`axeLarry`): after killing a non-Larry unit, `setTimeout(500)` then one free attack on nearest adjacent enemy. `isChain = true` prevents recursion. Shows `CHAIN KILL!` banner.

**Invisible** (`cerealLarry`): `invisible: true`. Enemy AI skips invisible units in all target selection.

**Ad Break** (`investmentLarry`, player only): on attack, store `pendingAdBreak`, set `phase = AD_BREAK`, show full-screen fake YouTube ad (LARRY DUNK FINANCIAL SERVICES™) with 3-second countdown. "Skip Ad ▶" calls `skipAdBreak()` which calls `_resolveCombat()`.

**Bad Driving** (`femaleLarry`): `badDriving: true`. In `moveUnit()`, 20% chance to land on a random adjacent tile instead. Shows `Bad Driving!` banner.

**Eye Bullets** (`paraplegicLarry`): range 3, cannot attack if any enemy is adjacent. Implemented as early return in `getAttackTiles()`. Shows `TOO CLOSE!` banner.

---

## Tetris Capture

Triggered synchronously in `_resolveCombat()` when a Larry Dunk (enemy team) hits 0 HP.

| Unit | Threshold | On Fail |
|------|-----------|---------|
| Most Larry Dunks | 200 | Soft retry |
| cainAbel | 100 | Soft retry (story guaranteed) |
| mrRuno | 800 | Escapes permanently — `onSuccess` returns early |
| zeusLarry | ∞ (rigged) | Rival steals him → chaos cutscene → `loadLevel(13)` |

Board: 10×20. Standard pieces (I,O,T,S,Z,J,L). Arrow keys / WASD to move/rotate, Space to hard drop.
Speed: 800ms drop → 150ms minimum, −50ms per 50 pts.
On success: unit joins `team = 'player'`, type added to `game.capturedLarryDunks`.

---

## Larry Dunk Selector

Before levels with `ldSlots`, player picks Larry Dunks from their captured pool to bring into battle. Selections stored in `game.selectedLarryDunks`, spawned at designated spawn tiles via `spawnSelectedLarryDunks()`.

When jumping to a level via level select, `game.capturedLarryDunks` is pre-filled with the LDs that would have been captured by that point (`LD_POOL_AT_LEVEL` in main.js).

---

## AI

`doEnemyAction(enemy)`:

1. Filter living player units, exclude invisible ones.
2. Score each visible player unit: `score = (maxHp - hp) + (type === 'haras' ? 20 : 0) - getManhattan(enemy, unit) * 2`.
3. If attack tiles exist pre-move, attack highest-scoring target in range.
4. Otherwise: move toward highest-scoring target, then attack post-move.

Enemies have a **bias** toward Haras (+20) and wounded units (up to ~35 pts), tempered by distance so nearby units stay relevant.

`endEnemyTurn()`: resets `sprayTanned`, resets `acted`, increments `game.turn`, applies terrain HP effects, returns to Player Phase.

**Level 11 special:** `mrRuno` moves toward EXIT tiles each turn and never attacks.

---

## Rendering

`render()` called every frame:

1. Grid tiles (terrain color + grid lines)
2. Terrain effects: PORTAL pulsing arc, EXIT pulsing rect, STAIR step lines
3. DEF bonus badges on tiles with `defBonus > 0`
4. Hover preview: movement + attack reach for hovered unit
5. Phase hint above grid: "Select a unit" / "Click blue tile to move" / "Click red tile to attack — or End Turn"
6. Move tiles: blue overlay (alpha 0.45) + white inner stroke
7. Attack tiles: pulsing red overlay (`sin(Date.now()/200)`) + pink inner stroke
8. Cursor, units, selected unit pulse ring
9. Animations (hit flash, damage numbers, death burst, screen flash)
10. Cutscene dim overlay; Tetris overlay (delegated to tetris.js)

**End Turn button:** gold-green with pulsing `box-shadow`. Auto-disabled during Enemy Phase.

---

## Sprites

All sprites drawn via JS vector functions using `u = sz / 20` as proportional unit. No image assets.

Sprite keys: `haras`, `minion`, `civilian`, `larryDunk`, `cainAbel`, `mrRuno`, `zeusLarry`, `britishLarry`, `financierLarry`, `paraplegicLarry`, `axeLarry`, `cerealLarry`, `investmentLarry`, `femaleLarry`, `horse`, `loyalHorse`, `enemyHaras`, `guard`, `robot`, `dummy`

Key visual identifiers:
- **haras**: dark blue body, black hair oval
- **enemyHaras**: dark red body (#4a0000), evil angled brows — visually distinct
- **larryDunk**: wild blond poof, orange-tan skin, blue suit, red tie
- **cainAbel**: two Larry heads side-by-side on one wide shared body, red center stripe
- **mrRuno**: navy suit, enormous brown bicep ellipses
- **zeusLarry**: cream toga, gold band, bare arm, blond hair
- **britishLarry**: red military coat, gold epaulettes, top hat, monocle + chain
- **financierLarry**: cream linen suit, deep tan, slicked hair, gold sunglasses
- **paraplegicLarry**: wheelchair, red cape, blue superhero costume, gold star
- **axeLarry**: blue suit, bloody axe polygon, blood spatters, evil brows
- **cerealLarry**: golden cream chef hat (#fff0b0), orange mascot suit, yellow polka dots
- **investmentLarry**: charcoal power suit, dark red tie + gold pin, briefcase
- **femaleLarry**: pink blazer, black flared skirt, flowing blond hair
- **horse**: barrel body, arching neck, polygon head, dark mane + forelock
- **loyalHorse**: identical to horse + tiny 3-dot yellow bow on mane

---

## SFX

`playSound(name)` — 13 synthesized sounds via Web Audio API, no external files:
`select`, `move`, `hit`, `death`, `tetris_place`, `tetris_clear`, `tetris_success`, `tetris_fail`, `player_phase`, `enemy_phase`, `ad_jingle`, `victory`, `defeat`

---

## Music System

`playMusic(trackName)` / `stopMusic()` in `music.js`. All tracks backed by mp3 files in `music/`. No Web Audio synthesis — pure `new Audio(file)` with `loop = true`.

| Track | File |
|-------|------|
| `title`, `cutscene`, `victory` | `HoliznaCC0 - Deus Ex Machina.mp3` |
| `playerPhase`, `tetris` | `Koi-discovery - Plasma-corrélation.mp3` |
| `enemyPhase`, `defeat` | `Koi-discovery - Rouge-haine-les-9-âmes.mp3` |
| `ending`, `credits` | `oji - idée. (en mi bémol majeur).mp3` |
| `level12` | `Song For Wemmbu PLAYFUL MASSACRE (2v1000 ver.).mp3` |

Level 12 music plays uninterrupted throughout the entire level (cutscene, player/enemy turns, Zeus Tetris). All phase-transition `playMusic` calls are guarded with `game.currentLevel !== 12`.

---

## Dialogue System

`startCutscene(lines, callback)` — typewriter effect, Space/Enter/click to advance. Each line: `{ speaker: 'NAME', text: '...', color: '#hex' }`. Skip All button calls `endCutscene()` immediately. Back button replays previous line.

All dialogue text lives in `DIALOGUE.md` and is synced to `levels.js` on request ("apply dialogue").

---

## Levels

### Level 0 — Prologue
Pure cutscene. Haras monologues about the brain chip and Larry Dunk's unique chip-receptive brain. No combat.

### Level 1 — Tutorial: The Refusal (9×7)
Haras and two minions vs three brain-chipped civilians. Covers: select, move, terrain effects, attack, wait, counterattack, hover unit info. Plain map with a few WALL pillars and a FOREST tile.

### Level 2 — Ch.1: Multiverse Recruitment (12×10)
Haras discovers the multiverse. Portals in the corner, WALL barrier down the middle, FOREST and WATER hazards. Two guards protect the portal. Cain & Abel Larry Dunk is the Tetris boss.

### Level 3 — Ch.2: The Parliament Gambit (14×10)
Parliament chamber. WALL border rows top/bottom, WALL pillars creating corridors, FOREST flanks, THRONE in the far corner. Two guards + British Larry Dunk (Spray Tan boss).

### Level 4 — Ch.2.5: The Island (12×9)
Small island with WATER border — no escape routes. FOREST clusters and MOUNTAIN high ground. Hidden THRONE tile triggers the Survivalist Larry spawn cutscene mid-battle. Three guards defend it.

### Level 5 — Ch.3: Eye Bullets (12×8)
Rooftop. WALL border rows, CLOUD sky gaps in corners, air vent WALL structures, MOUNTAIN patches. Guards + robots defend the rooftop. Paraplegic Larry (range 3, can't attack when adjacent) is the boss.

### Level 6 — Ch.3.2: The Slaughterhouse (12×8)
Industrial slaughterhouse. FOREST crates scattered throughout, WALL columns. Four guards + Axe Murderer Larry (Chain Kill boss).

### Level 7 — Ch.3.3: Part of a Complete Breakfast (12×9)
TV studio. Base TEMPLE floor. FOREST set pieces, WALL studio walls. Three guards + Cereal Mascot Larry (Invisible boss — enemies never target him; player must find him).

### Level 8 — Ch.3.4: Q4 Acquisition (14×9)
**Two-floor corporate office.** Rows 0–3 = UPPER_FLOOR boardroom. Row 4 = solid WALL separator with two STAIR tiles creating chokepoints. Rows 5–8 = OFFICE_FLOOR lobby. Player starts in the lobby and must climb the stairs to reach the boardroom where Investment Larry waits at a THRONE conference table.

### Level 9 — Ch.3.6: Wrong Turn (12×8)
Shopping mall. Base TEMPLE tile floor. Central WATER fountain, GYM_FLOOR shop interiors along the sides, FOREST planters lining the walkway, WALL entrance pillars. Guards + robots + Female Larry Dunk (Bad Driving boss).

### Level 10 — Ch.3.7: The Other Me (12×8)
Interdimensional crossroads. CLOUD sky at the top, PORTAL tiles on the flanks. Rival Haras and his team block the path to Mr. Runo's universe.

### Level 11 — Ch.4: Catch Mr. Runo! (14×10)
Gym. WALL barrier at x=10 forces a chokepoint chase route. EQUIPMENT obstacles throughout. Mr. Runo runs for the EXIT tiles on the far right — does not attack. Turn 3: Dr. Retina flashback, two robots spawn as player reinforcements. Must stop Runo before he escapes.

### Level 12 — Ch.5: The Thousand Horses (16×12)
Mount Olympus. CLOUD divine row at top, TEMPLE approach, PLAIN battlefield below. Haras commands a massive horse army against waves of rival Harases. Zeus Larry Dunk is neutral — can't be attacked. On victory: Zeus betrayal cutscene → rigged Tetris → chaos → Level 13.

### Level 13 — FINAL: The One Horse (16×12)
The horses betray Haras. CLOUD sky, PORTAL escape tiles on the far right. Loyal Horse is Haras's only ally. Enemy zeusLarry + 9 enemy horses + guards. More enemy horses spawn every even turn. Victory: move Haras to a PORTAL escape tile.

---

## Implementation Notes

- **Tetris init order:** Always set up `tetris.board` **before** setting `game.phase = TETRIS`. If phase is set first, the render loop tries to read the board before it exists and crashes `requestAnimationFrame`.
- **Phase guards:** Every system that changes phase checks current phase first. `checkVictoryDefeat()` returns if `TETRIS`. `finishUnitAction()` checks before setting `PLAYER_TURN`.
- **onVictory called once:** Only from the victory screen click handler in `main.js`, not from `checkVictoryDefeat()`.
- **Attack-select:** Clicking a friendly unit tile in `ATTACK_SELECT` phase is ignored — does not cancel the attack.
- **Counterattack:** Cannot kill the attacker — floored at 1 HP. Shows `SURVIVED!` banner if clamped.
