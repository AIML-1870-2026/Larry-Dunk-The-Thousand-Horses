# Larry Dunk: The Thousand Horses — Implementation Spec

Browser-based Fire Emblem-style tactical RPG with a Tetris capture minigame. Vanilla JS + Canvas, no dependencies.

**Story:** Haras is a tech villain who invented a brain chip that can remotely control people. He discovers that Larry Dunk — the Prime Minister — has a uniquely chip-receptive brain, making him the perfect puppet. Haras begins harvesting Larry Dunks from across the multiverse, each one a different variant with different abilities. Rival Harases from other universes are doing the same thing. The endgame involves Zeus Larry Dunk and his thousand horses, which betray everyone. Haras escapes on the one loyal horse.

---

## File Structure

```
index.html, css/main.css
js/  constants → sprites → units → grid → combat → ai → ui → input → cutscene → levels → tetris → music → voice → main
sfx/, music/, DIALOGUE.md
```

No modules — everything is global. Canvas: **960×640**, scaled to full window. `TILE_SIZE=48`, `GRID_OFFSET_X=16`, `GRID_OFFSET_Y=40`.

---

## Game Phases

`TITLE, CUTSCENE, PLAYER_TURN, UNIT_SELECTED, UNIT_MOVED, ATTACK_SELECT, ENEMY_TURN, ANIMATION, VICTORY, DEFEAT, ENDING, TETRIS, AD_BREAK`

---

## Terrain Types

| Key | moveCost | defBonus | Notes |
|-----|----------|----------|-------|
| PLAIN | 1 | 0 | |
| FOREST | 2 | 2 | +1 HP/turn |
| MOUNTAIN | 3 | 3 | |
| WALL / WATER | 99 | 0 | Impassable |
| PORTAL | 1 | 0 | |
| TEMPLE | 1 | 2 | |
| CLOUD | 1 | 1 | |
| LAVA | 99 | 0 | −2 HP/turn |
| THRONE | 1 | 4 | +2 HP/turn; triggers L4 secret |
| OFFICE_FLOOR / GYM_FLOOR | 1 | 0 | |
| EQUIPMENT | 2 | 1 | |
| EXIT | 1 | 0 | L11 escape point |
| STAIR | 2 | 0 | Two-floor connector |
| UPPER_FLOOR | 1 | 1 | Height advantage |

---

## Units

### Standard

| type | HP | ATK | DEF | MOV | RNG |
|------|----|-----|-----|-----|-----|
| haras | 30 | 8 | 5 | 4 | 2 |
| minion | 15 | 5 | 2 | 3 | 1 |
| civilian | 8 | 0 | 0 | 0 | 1 |
| guard | 18 | 6 | 4 | 3 | 1 |
| robot | 22 | 7 | 6 | 3 | 1 |
| enemyHaras | 28 | 9 | 5 | 4 | 2 |
| horse | 30 | 12 | 5 | 7 | 1 |
| loyalHorse | 38 | 15 | 7 | 8 | 1 |

### Larry Dunk Variants (`isLarryDunk: true`)

| type | HP | ATK | DEF | MOV | RNG | Ability |
|------|----|-----|-----|-----|-----|---------|
| larryDunk | 35 | 7 | 7 | 3 | 1 | Spray Tan |
| cainAbel | 40 | 9 | 6 | 3 | 1 | 2 Attacks/Turn |
| britishLarry | 32 | 8 | 6 | 3 | 1 | Parliamentary Order (flavor) |
| financierLarry | 28 | 10 | 4 | 4 | 1 | Cannibalism |
| paraplegicLarry | 30 | 9 | 3 | 3 | 3 | Eye Bullets |
| axeLarry | 36 | 13 | 3 | 3 | 1 | Chain Kill |
| cerealLarry | 25 | 6 | 4 | 4 | 1 | Invisible |
| investmentLarry | 30 | 15 | 5 | 2 | 1 | Ad Break |
| femaleLarry | 16 | 4 | 2 | 4 | 1 | Bad Driving |
| mrRuno | 35 | 12 | 4 | 3 | 1 | Non-capturable |
| zeusLarry | 50 | 11 | 5 | 3 | 3 | Lightning |

---

## Combat

```
damage = max(1, atk - def - terrain.defBonus)
counterDmg = max(1, def.atk - atk.def - terrain.defBonus)
attacker.hp = max(1, attacker.hp - counterDmg)  // counterattacks cannot kill
```

Larry Dunk hits 0 HP → Tetris capture (synchronous). Defeat: Haras dies or all player units die.

---

## Special Abilities

- **Spray Tan** (`larryDunk`): defender + adjacent enemies lose 1 range if range > 1. Resets end of turn.
- **Cannibalism** (`financierLarry`): heals HP equal to damage dealt.
- **2 Attacks/Turn** (`cainAbel`): `attacksLeft: 2`, resets each turn.
- **Chain Kill** (`axeLarry`): free attack on nearest adjacent enemy after non-Larry kill.
- **Invisible** (`cerealLarry`): enemy AI ignores this unit entirely.
- **Ad Break** (`investmentLarry`): full-screen fake 3s YouTube ad before attack resolves.
- **Bad Driving** (`femaleLarry`): 20% chance to land 1 tile off target on move.
- **Eye Bullets** (`paraplegicLarry`): range 3, but can't attack if any enemy is adjacent.

---

## Tetris Capture

| Unit | Threshold | On Fail |
|------|-----------|---------|
| Most LDs | 200 | Soft retry |
| cainAbel | 100 | Soft retry |
| mrRuno | 800 | Escapes permanently |
| zeusLarry | ∞ rigged | Rival steals him → Level 13 |

Board 10×20. WASD/arrows to play. Speed: 800ms → 150ms min, −50ms per 50pts.

---

## AI

Score per target: `(maxHp - hp) + (haras ? 20 : 0) - distance * 2`. Attacks best target in range pre-move, else moves toward best target then attacks. Skips invisible units. mrRuno runs for EXIT and never attacks.

---

## SFX & Audio

**SFX** (`sfx.js`): 13 Web Audio synthesized sounds — select, move, hit, death, tetris_place, tetris_clear, tetris_success, tetris_fail, player_phase, enemy_phase, ad_jingle, victory, defeat.

**Music** (`music.js`): mp3-backed, `playMusic(track)` / `stopMusic()`.

| Track | File |
|-------|------|
| title, cutscene, victory | HoliznaCC0 - Deus Ex Machina |
| playerPhase, tetris | Koi-discovery - Plasma-corrélation |
| enemyPhase, defeat | Koi-discovery - Rouge-haine-les-9-âmes |
| ending, credits | oji - idée. (en mi bémol majeur) |
| level12 (exclusive) | Song For Wemmbu — PLAYFUL MASSACRE (2v1000 ver.) |

Level 12 music plays uninterrupted — all phase-transition calls guarded with `currentLevel !== 12`.

**Voice** (`voice.js`): Web Speech API TTS. `speakLine(speaker, text)` on each dialogue line, `stopVoice()` on advance/back/skip/end. Profiles: Haras 0.55/0.78, Narrator 1.0/0.82, Larry Dunk 1.3/1.08, Mr. Runo 0.7/0.88, Dr. Retina 1.15/1.3, Zeus 0.85/0.68, Loyal Horse 0.45/0.55. Unknown Larry variants fall back to Larry Dunk.

### Music Credits
| Artist | Track | License |
|--------|-------|---------|
| HoliznaCC0 | Deus Ex Machina | CC0 |
| Koi-discovery | Plasma-corrélation | CC BY |
| Koi-discovery | Rouge-haine-les-9-âmes | CC BY |
| oji | idée. (en mi bémol majeur) | CC BY |
| (unknown) | Song For Wemmbu — PLAYFUL MASSACRE (2v1000 ver.) | unverified (YouTube) |

---

## Dialogue

`startCutscene(lines, callback)` — typewriter, advance/back/skip. Each line: `{ speaker, text, color, drawScene?, highlight? }`. `DIALOGUE.md` is authoritative — sync to `levels.js` on "apply dialogue".

---

## Levels

| # | Name | Size | Boss | Notes |
|---|------|------|------|-------|
| 0 | Prologue | — | — | Cutscene only |
| 1 | Tutorial | 9×7 | — | 3 civilians, tutorial highlights |
| 2 | Multiverse Recruitment | 12×10 | Cain & Abel | 1 guard |
| 3 | The Parliament Gambit | 14×10 | British Larry | 2 guards |
| 4 | The Beach | 12×9 | Survivalist Larry | THRONE secret at (7,4) |
| 5 | Eye Bullets | 12×8 | Paraplegic Larry | Rooftop, CLOUD corners |
| 6 | The Slaughterhouse | 12×8 | Axe Murderer Larry | 3 guards |
| 7 | Part of a Complete Breakfast | 12×9 | Cereal Larry | Invisible boss |
| 8 | Q4 Acquisition | 14×9 | Investment Larry | Two-floor, STAIR at (4,4)+(9,4) |
| 9 | Wrong Turn | 12×8 | Female Larry | Mall, WATER fountain |
| 10 | The Other Me | 12×8 | Rival Haras | PORTAL flanks |
| 11 | Catch Mr. Runo! | 14×10 | Mr. Runo | Runs for EXIT, don't let him escape |
| 12 | The Thousand Horses | 16×12 | Zeus (neutral) | Rigged Tetris → Level 13 |
| 13 | The One Horse | 16×12 | — | Escape via PORTAL; loyal horse only ally |

---

## Implementation Notes

- **Tetris init:** Set up `tetris.board` before setting `phase = TETRIS` or render crashes.
- **onVictory:** Called once from victory screen click in `main.js` only.
- **Counterattack:** Floored at 1 HP — cannot kill. Shows `SURVIVED!`.
- **Attack from position:** In `UNIT_SELECTED`, clicking an attack tile attacks without moving.
- **loadLevel resets:** grid, gridW/H, selectedUnit, hoveredUnit, pendingMoveTile, moveTiles, attackTiles, animations. Hides `#moveConfirm`.
- **ENDING phase:** Renders `game.cinemaDrawScene` if set (credits persist after cutscene ends).
- **Tutorial:** `game.tutorialHighlight` on each line; render draws pulsing yellow box; grid clicks work during dialogue.
