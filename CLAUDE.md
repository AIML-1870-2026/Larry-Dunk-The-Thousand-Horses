# Larry Dunk: The Thousand Horses

## Project Overview
A Fire Emblem-style tactical RPG with a Tetris capture minigame. Browser-based, no dependencies, vanilla JS + Canvas. See `larry_dunk_spec.md` for full story, character list, and design decisions.

## File Structure
```
index.html          ← HTML structure only (no inline CSS or JS)
css/
  main.css          ← all styles
js/
  constants.js      ← canvas, ctx, TILE_SIZE, GamePhase, game state, Terrain
  sprites.js        ← SPRITES object, drawPixelChar(), drawUnit()
  units.js          ← createUnit() and all unit templates
  grid.js           ← getTerrain, getUnitAt, movement/attack tile logic
  combat.js         ← doCombat()
  ai.js             ← doEnemyTurn(), doEnemyAction(), endEnemyTurn()
  ui.js             ← render(), showUnitInfo(), showBanner(), updateTopBar(), updateAnimations()
  input.js          ← canvas click/mousemove, selectUnit, moveUnit, endPlayerTurn, etc.
  cutscene.js       ← startCutscene(), advanceDialogue(), endCutscene()
  levels.js         ← LEVELS array, loadLevel(), checkVictoryDefeat(), checkTurnEvents()
  tetris.js         ← Tetris capture minigame overlay
  main.js           ← gameLoop(), title/victory/defeat handlers, keyboard shortcuts
art/                ← future sprite sheets or image assets
sfx/                ← sound effect files
music/              ← background music files
larry_dunk_spec.md  ← full game spec, todo list, all design decisions (single source of truth)
```

## Working Instructions (IMPORTANT)
- **Work one file at a time.** Do not write multiple files simultaneously.
- **Order by dependency level** — most foundational first (constants → sprites → units → grid → combat → ai → ui → input → cutscene → levels → tetris → main → css → html).
- **Always maintain the TodoWrite tool list** to track progress across sessions.
- **Save progress to files** — don't rely on conversation context. All decisions live in `larry_dunk_spec.md`.
- **After finishing a file**, mark the todo done and move to the next.
- **After completing ANY work**, update `larry_dunk_spec.md` immediately — mark completed items `[x]`, add new decisions to the relevant sections. Never leave the spec out of date.

## Dialogue Editing Workflow
- All game dialogue is in `DIALOGUE.md` — the user edits that file directly.
- When the user says "apply dialogue" (or similar), read `DIALOGUE.md` and sync every changed line into `levels.js`.
- **Match by speaker+position within each scene.** Lines are in order; update text only, don't touch code structure.
- Do NOT change `SPEAKER:` labels in DIALOGUE.md — they're used to match lines in code.
- Do NOT add or remove lines from DIALOGUE.md without also updating levels.js manually.

## Key Characters
- **Haras** — villain protagonist, edgelord, superior robot skills
- **Larry Dunk** — Prime Minister, uniquely chip-receptive brain, 12 variants across the multiverse
- **Mr. Runo** — Haras's estranged father, immune to brain chip (huge biceps)
- **Dr. Retina** — Haras's harsh mentor, died of old age (varies by universe, increasingly unhinged)
- **Cain & Abel Larry Dunk** — conjoined twins, "we only need one horse"
- **Zeus Larry Dunk** — divine, grants 1000 horses, can't be captured (rival Haras steals him)
- **Loyal Horse** — the one horse that doesn't betray Haras

## Architecture Notes
- JS load order matters (no modules). Scripts loaded in order in index.html.
- `isLarryDunk: true && team === 'enemy'` triggers Tetris on death (combat.js). Player-team Larry units die normally.
- Tetris overlay renders on top of the game canvas as a modal layer.
- All Larry Dunk sprite keys: `larryDunk`, `cainAbel`, `mrRuno`, `zeusLarry`, `britishLarry`, `financierLarry`, `paraplegicLarry`, `axeLarry`, `cerealLarry`, `investmentLarry`, `femaleLarry`.
- Game fills full browser window (100vw × 100vh). Canvas internal resolution stays 960×640; input.js scales clicks.
- Level selector: main.js `showLevelSelect()` — shown on title click, lets player jump to any level.
- test.html: standalone test suite (loads all JS, runs automated checks). Not part of the game.
- DIALOGUE.md workflow: user edits DIALOGUE.md → says "apply dialogue" → Claude syncs to levels.js. Always read DIALOGUE.md first, it is authoritative over levels.js.
