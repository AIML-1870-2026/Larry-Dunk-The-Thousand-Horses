// ============================================================
// LEVELS, VICTORY/DEFEAT, TURN EVENTS
// Level index:
//   0 Prologue  1 Tutorial  2 Cain&Abel    3 BritishLarry   4 SurvivalistLarry
//   5 Paraplegic  6 Axe  7 Cereal  8 RivalHaras  9 MrRuno
//   10 Investment  11 Zeus  12 Final
// ============================================================

function checkVictoryDefeat() {
    if (game.phase === GamePhase.TETRIS) return; // wait for Tetris to resolve first
    const haras = game.units.find(u => u.type === 'haras' && u.team === 'player');
    if (haras && !haras.alive) {
        game.phase = GamePhase.DEFEAT;
        playSound('defeat');
        playMusic('defeat');
        setTimeout(() => { if (game.phase === GamePhase.DEFEAT) document.getElementById('defeatScreen').style.display = 'flex'; }, 1000);
        return;
    }

    const playerAlive = game.units.filter(u => u.alive && u.team === 'player');
    if (playerAlive.length === 0) {
        game.phase = GamePhase.DEFEAT;
        playSound('defeat');
        playMusic('defeat');
        setTimeout(() => { if (game.phase === GamePhase.DEFEAT) document.getElementById('defeatScreen').style.display = 'flex'; }, 1000);
        return;
    }

    const level = LEVELS[game.currentLevel];
    if (level && level.victoryCheck) {
        if (level.victoryCheck()) {
            game.phase = GamePhase.VICTORY;
            playSound('victory');
            playMusic('victory');
            document.getElementById('victoryText').textContent = level.victoryText || 'Level Complete!';
            setTimeout(() => {
                if (game.phase === GamePhase.VICTORY) document.getElementById('victoryScreen').style.display = 'flex';
            }, 1000);
        }
    } else {
        const enemyAlive = game.units.filter(u => u.alive && u.team === 'enemy');
        if (enemyAlive.length === 0) {
            game.phase = GamePhase.VICTORY;
            playSound('victory');
            playMusic('victory');
            setTimeout(() => { if (game.phase === GamePhase.VICTORY) document.getElementById('victoryScreen').style.display = 'flex'; }, 1000);
        }
    }
}

function checkTurnEvents() {
    const level = LEVELS[game.currentLevel];
    if (level && level.turnEvent) level.turnEvent(game.turn);
}

// ---- LEVEL HELPERS ----
function fillGrid(w, h, terrain) {
    game.gridW = w; game.gridH = h;
    game.grid = [];
    for (let y = 0; y < h; y++) {
        game.grid[y] = [];
        for (let x = 0; x < w; x++) game.grid[y][x] = terrain;
    }
}

function startLevel(intro) {
    startCutscene(intro, () => {
        if (game.currentLevel !== 11) playMusic('playerPhase');
        game.phase = GamePhase.PLAYER_TURN;
        showBanner('Player Phase', 1200);
    });
}

function allEnemiesDefeated() {
    return game.units.filter(u => u.alive && u.team === 'enemy').length === 0;
}

// ---- LEVEL DEFINITIONS ----
const LEVELS = [

    // 0: Prologue cutscene
    {
        name: 'Prologue',
        setup: function() {
            document.getElementById('levelName').textContent = 'Prologue';
            const _lab = Cinema.lab(), _dark = Cinema.dark(), _broadcast = Cinema.broadcast();
            const exposition = [
                { speaker: 'NARRATOR', text: 'In a world not unlike our own...', color: '#aaa', drawScene: Cinema.dark([4,4,12]) },
                { speaker: 'NARRATOR', text: 'A great guy named HARAS invented a revolutionary brain chip.', color: '#aaa', drawScene: _lab },
                { speaker: 'HARAS', text: 'Finally. My Evil Brainchip is complete. Once implanted, I can control everyone.', color: '#88f', drawScene: _lab },
                { speaker: 'NARRATOR', text: 'Haras distributed the chips, selling it as the newest piece of technology...but with a self destruction function in case "aliens ever come and enslave everyone."', color: '#aaa', drawScene: _lab },
                { speaker: 'HARAS', text: 'Many people now have my chip in their brain. And soon everyone will. Even me — but mine is just a prototype. Non-brain exploding.', color: '#88f', drawScene: _lab },
                { speaker: 'HARAS', text: 'ATTENTION, CITIZENS. You will all listen to me now. Disobey, and I will detonate your chip.', color: '#f44', drawScene: _broadcast },
                { speaker: 'NARRATOR', text: 'The world trembled. But Haras\'s ambitions were far from satisfied...', color: '#aaa', drawScene: _dark },
                { speaker: 'HARAS', text: 'I need soldiers. Powerful ones. But first — an example must be made.', color: '#88f', drawScene: _dark }
            ];
            startCutscene(exposition, () => { loadLevel(1); });
        }
    },

    // 1: Tutorial — The Refusal
    {
        name: 'Tutorial: The Refusal',
        gridW: 9, gridH: 7,
        objective: 'Eliminate all citizens who refused the brain chip.',
        setup: function() {
            fillGrid(9, 7, Terrain.PLAIN);
            game.grid[1][3] = Terrain.WALL;
            game.grid[5][3] = Terrain.WALL;
            game.grid[3][4] = Terrain.FOREST;

            game.units = [
                createUnit('haras',    1, 3, 'player'),
                createUnit('minion',   1, 2, 'player'),
                createUnit('minion',   1, 4, 'player'),
                createUnit('civilian', 5, 2, 'enemy'),
                createUnit('civilian', 6, 3, 'enemy'),
                createUnit('civilian', 7, 5, 'enemy')
            ];

            const intro = [
                { speaker: 'HARAS',    text: 'Three citizens dared to refuse the brain chip. I will make an example. ATTACK THEM.', color: '#88f',
                  highlight: { type: 'units', team: 'enemy' } },
                { speaker: 'HARAS',    text: 'Click one of your units to select it. Blue tiles show where it can move.', color: '#88f',
                  highlight: { type: 'units', team: 'player' } },
                { speaker: 'HARAS',    text: 'Walls are impassable.', color: '#88f',
                  highlight: { type: 'tiles', tiles: [{gx:3,gy:1},{gx:3,gy:5}] } },
                { speaker: 'HARAS',    text: 'Forest tiles (the darker green square) cost extra movement to enter but give a defense bonus — stand in one to reduce incoming damage.', color: '#88f',
                  highlight: { type: 'tiles', tiles: [{gx:4,gy:3}] } },
                { speaker: 'HARAS',    text: 'After moving, red tiles mark targets in attack range. Click one to strike.', color: '#88f',
                  highlight: { type: 'units', team: 'enemy' } },
                { speaker: 'HARAS',    text: 'If you prefer not to attack, press Wait. The turn ends automatically when all your units have acted.', color: '#88f' },
                { speaker: 'CIVILIAN', text: 'We\'ll die before we comply!', color: '#ccc',
                  highlight: { type: 'units', team: 'enemy' } },
                { speaker: 'HARAS',    text: 'Enemies can counterattack if you\'re within their range. Hover any unit to inspect its stats: HP, ATK, DEF, MOV, RNG.', color: '#88f',
                  highlight: { type: 'units', team: 'enemy' } },
                { speaker: 'MINION',   text: 'And you, sir? Are you joining us?', color: '#cc0',
                  highlight: { type: 'units', unitType: 'minion' } },
                { speaker: 'HARAS',    text: 'I\'m always in the fight because I am the ultimate SIGMA MALE. But if I fall — the mission ends. Keep me alive.', color: '#f44',
                  highlight: { type: 'units', unitType: 'haras' } }
            ];
            startLevel(intro);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Order Restored.',
        onVictory: function() {
            const _lab = Cinema.lab(), _dark = Cinema.dark();
            const _portal = Cinema.portal();
            const postTutorial = [
                { speaker: 'HARAS',      text: 'Good. The message is clear.', color: '#88f', drawScene: _dark },
                { speaker: 'NARRATOR',   text: 'Haras reviews the brain chip data. One profile catches his eye...', color: '#aaa', drawScene: _lab },
                { speaker: 'HARAS',      text: 'Larry Dunk. Prime Minister. His brain structure is... strange.', color: '#88f', drawScene: _lab },
                { speaker: 'NARRATOR',   text: 'Haras sends an order to Larry Dunk\'s chip for the first time.', color: '#aaa', drawScene: _lab },
                { speaker: 'HARAS',      text: 'Usually my chips can\'t control everything the person does.', color: '#88f', drawScene: _lab },
                { speaker: 'HARAS',      text: 'But Larry Dunk\'s chip... I can control everything he does.', color: '#f44', drawScene: _lab },
                { speaker: 'LARRY DUNK', text: 'Wha— what\'s happening to my brain— it\'s a tremendous brain, everyone says—', color: '#f80', drawScene: _dark },
                { speaker: 'HARAS',      text: 'Silence.', color: '#f44', drawScene: _dark },
                { speaker: 'LARRY DUNK', text: '...', color: '#f80', drawScene: _dark },
                { speaker: 'HARAS',      text: 'He could be..the ultimate middle manager!!', color: '#88f', drawScene: _lab },
                { speaker: 'HARAS',      text: 'If this Larry Dunk is so useful, I could get more from other universes. Because of the multiverse.', color: '#88f', drawScene: _lab },
                { speaker: 'HARAS',      text: 'An army of Larry Dunks. The perfect middle managers, all at my command..', color: '#f44', drawScene: _lab },
                { speaker: 'NARRATOR',   text: 'And so began the hunt across the multiverse.', color: '#aaa', drawScene: _portal }
            ];
            startCutscene(postTutorial, () => { loadLevel(2); });
        }
    },

    // 2: Ch.1 — Cain & Abel Universe
    {
        name: 'Ch.1: Multiverse Recruitment',
        gridW: 12, gridH: 10,
        objective: 'Defeat the multiverse guards and recruit Cain & Abel Larry Dunk!',
        setup: function() {
            fillGrid(12, 10, Terrain.PLAIN);
            game.grid[1][10] = Terrain.PORTAL;
            game.grid[2][10] = Terrain.PORTAL;
            for (let y = 3; y <= 6; y++) game.grid[y][4] = Terrain.WALL;
            game.grid[2][5] = Terrain.FOREST;
            game.grid[7][5] = Terrain.FOREST;
            game.grid[4][7] = Terrain.FOREST;
            game.grid[5][7] = Terrain.FOREST;
            game.grid[0][6] = Terrain.WATER;
            game.grid[0][7] = Terrain.WATER;
            game.grid[9][6] = Terrain.WATER;
            game.grid[9][7] = Terrain.WATER;

            const ca = createUnit('cainAbel', 10, 4, 'enemy');
            ca.hp = 25; ca.maxHp = 25;
            game.units = [
                createUnit('haras', 0, 4, 'player'),
                createUnit('larryDunk', 1, 4, 'player'),
                createUnit('minion', 0, 3, 'player'),
                createUnit('minion', 0, 5, 'player'),
                createUnit('guard', 8, 5, 'enemy'),
                ca
            ];

            const intro = [
                { speaker: 'GUARD', text: 'Sir — both of you, sir — what do we do with the horses after?', color: '#bbb' },
                { speaker: 'ABEL', text: 'We only need one horse.', color: '#e90' },
                { speaker: 'HARAS', text: 'Ah yes, you\'re conjoined after all, but you won\'t need any horses soon because you\'re part of my army now. Maybe I should get some horses.', color: '#88f' },
                { speaker: 'CAIN', text: 'Exactly one.', color: '#e90' },
                { speaker: 'GUARD', text: '...which one?', color: '#bbb' },
                { speaker: 'CAIN & ABEL', text: 'We haven\'t decided yet. Prepare yourselves.', color: '#e90' },
                { speaker: 'HARAS', text: 'The multiverse portal is open. I can sense more Larry Dunks through it. Using my powers. From my brainchip. (Buy my brainchip.)', color: '#88f' },
                { speaker: 'HARAS', text: 'Guards are protecting the dimensional rift. Fight through them.', color: '#88f' }
            ];

            startLevel(intro);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Portal Secured!',
        onVictory: function() {
            const meetCainAbel = [
                { speaker: 'HARAS', text: 'Another universe. Another collection. Let\'s go. I\'m so great. Which is why you (yes you) should buy my brain chip', color: '#88f' }
            ];
            startCutscene(meetCainAbel, () => { loadLevel(3); });
        }
    },

    // 3: Ch.2 — British Larry Dunk
    {
        name: 'Ch.2: The Parliament Gambit',
        gridW: 14, gridH: 10,
        objective: 'Fight through Parliament\'s guard corps and capture British Larry Dunk.',
        ldSlots: [[0,3],[0,5],[0,7]],
        setup: function() {
            fillGrid(14, 10, Terrain.PLAIN);
            // Chamber walls (top and bottom corridors)
            for (let x = 0; x < 14; x++) {
                game.grid[0][x] = Terrain.WALL;
                game.grid[9][x] = Terrain.WALL;
            }
            // Interior pillars (pairs of walls like parliamentary benches)
            game.grid[2][4] = Terrain.WALL; game.grid[3][4] = Terrain.WALL;
            game.grid[6][4] = Terrain.WALL; game.grid[7][4] = Terrain.WALL;
            game.grid[2][9] = Terrain.WALL; game.grid[3][9] = Terrain.WALL;
            game.grid[6][9] = Terrain.WALL; game.grid[7][9] = Terrain.WALL;
            // Forest (hedgerows outside)
            game.grid[1][2] = Terrain.FOREST; game.grid[8][2] = Terrain.FOREST;
            game.grid[4][6] = Terrain.FOREST; game.grid[5][11] = Terrain.FOREST;
            // Throne at the back — British Larry's seat
            game.grid[4][12] = Terrain.THRONE; game.grid[5][12] = Terrain.THRONE;

            game.units = [
                createUnit('haras', 1, 4, 'player'),
                createUnit('larryDunk', 1, 5, 'player'),
                createUnit('minion', 1, 2, 'player'),
                createUnit('minion', 1, 7, 'player'),
                // Guards defending parliament
                createUnit('guard', 5, 2, 'enemy'),
                createUnit('guard', 8, 5, 'enemy'),
                createUnit('guard', 10, 2, 'enemy'),
                createUnit('robot', 7, 7, 'enemy'),
                // British Larry — the boss (enemy, triggers Tetris when defeated)
                createUnit('britishLarry', 12, 4, 'enemy')
            ];
            spawnSelectedLarryDunks();

            const intro = [
                { speaker: 'HARAS', text: 'Larry Dunk. Come here. You\'re getting a brain chip', color: '#88f' },
                { speaker: 'BRITISH LARRY DUNK', text: 'My BRAIN?! How extraordinarily rude. Guards! Deal with this... p-p-p-PEASANT!', color: '#f80' }
            ];

            startLevel(intro);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Parliament Falls!',
        onVictory: function() {
            const postBritish = [
                { speaker: 'HARAS', text: 'Noted. There\'s a signal from a remote beach. A Larry Dunk variant living off-grid.', color: '#88f' },
                { speaker: 'HARAS', text: 'Alone. For eleven years. I want to know what he\'s been eating. Perhaps a thousand horses. Just like the hit video game, Larry Dunk: The Thousand Horses.', color: '#88f' },
                { speaker: 'NARRATOR', text: 'Somewhere in the multiverse, another Haras is running the same calculation.', color: '#555' },
                { speaker: 'HARAS', text: 'But he\'s worse, because I\'m the best one.', color: '#88f' }
            ];
            startCutscene(postBritish, () => { loadLevel(4); });
        }
    },

    // 4: Ch.2.5 — Survivalist Larry Dunk (Secret Beach)
    {
        name: 'Ch.2.5: The Beach',
        gridW: 12, gridH: 9,
        objective: 'Secure the beach. Search the beach house — something is hidden here.',
        ldSlots: [[1,5],[2,3],[2,6]],
        setup: function() {
            game.gridW = 12; game.gridH = 9;
            game.survivalistRevealed = false;
            game.grid = [];
            for (let y = 0; y < 9; y++) {
                game.grid[y] = [];
                for (let x = 0; x < 12; x++) {
                    // Water border
                    if (y === 0 || y === 8 || x === 0 || x === 11) {
                        game.grid[y][x] = Terrain.WATER;
                    } else {
                        game.grid[y][x] = Terrain.PLAIN;
                    }
                }
            }
            // Forest patches (jungle)
            game.grid[2][3] = Terrain.FOREST; game.grid[2][4] = Terrain.FOREST;
            game.grid[6][7] = Terrain.FOREST; game.grid[6][8] = Terrain.FOREST;
            game.grid[4][9] = Terrain.FOREST;
            game.grid[3][6] = Terrain.FOREST;
            // THRONE — the secret Wait tile (old beach ruins)
            game.grid[4][7] = Terrain.THRONE;
            // Wall (rocky outcroppings)
            game.grid[2][9] = Terrain.MOUNTAIN;
            game.grid[6][2] = Terrain.MOUNTAIN;

            game.units = [
                createUnit('haras', 1, 4, 'player'),
                createUnit('larryDunk', 2, 4, 'player'),
                createUnit('minion', 1, 3, 'player'),
                // Beach security — small patrol
                createUnit('guard', 5, 2, 'enemy'),
                createUnit('guard', 8, 5, 'enemy'),
                createUnit('guard', 5, 6, 'enemy'),
                createUnit('robot', 8, 2, 'enemy')
            ];
            spawnSelectedLarryDunks();

            const intro = [
                { speaker: 'NARRATOR', text: 'A wide open beach. No civilization. No contact. Eleven years of silence.', color: '#aaa' },
                { speaker: 'HARAS', text: 'His neural signature led us here. A Larry Dunk living completely off-grid.', color: '#88f' },
                { speaker: 'HARAS', text: 'Defeat the beach\'s security patrols. And... search the beach house. Something is here.', color: '#88f' },
                { speaker: 'NARRATOR', text: 'The beach chair in the interior pulses with a faint signal. Someone rests there.', color: '#555' }
            ];

            startLevel(intro);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Beach Secured!',
        turnEvent: function(_turn) {
            if (!game.survivalistRevealed) {
                // Check if any player unit is sitting on the throne tile (4,7)
                const onThrone = game.units.find(u => u.alive && u.team === 'player' && u.gx === 7 && u.gy === 4);
                if (onThrone) {
                    game.survivalistRevealed = true;
                    startCutscene([
                        { speaker: 'NARRATOR', text: 'The beach chair shifts. Something emerges from the jungle.', color: '#aaa' },
                        { speaker: 'SURVIVALIST LARRY', text: '...I wasn\'t expecting visitors.', color: '#f80' },
                        { speaker: 'HARAS', text: 'Larry Dunk. Eleven years on this beach. Alone.', color: '#88f' },
                        { speaker: 'SURVIVALIST LARRY', text: 'I was eating extremely well. The local fauna is... quite nutritious.', color: '#f80' },
                        { speaker: 'HARAS', text: 'Give me your brain chip. Now.', color: '#f44' },
                        { speaker: 'SURVIVALIST LARRY', text: 'Certainly not. *consumes something* I have resources you cannot imagine.', color: '#f80' },
                        { speaker: 'CAIN & ABEL', text: 'Did he just eat a crab whole? We respect that. One crab is enough.', color: '#e90' }
                    ], () => {
                        // Spawn Survivalist Larry as enemy near the throne
                        game.units.push(createUnit('survivalistLarry', 7, 5, 'enemy'));
                        game.phase = GamePhase.PLAYER_TURN;
                        showBanner('SURVIVALIST LARRY FOUND!', 2000);
                    });
                }
            }
        },
        onVictory: function() {
            const fin = game.units.find(u => u.type === 'survivalistLarry');
            const captured = fin && fin.team === 'player';

            const dialogue = captured ? [
                { speaker: 'SURVIVALIST LARRY', text: '...yes... master... I have... skills I can offer.', color: '#f80' },
                { speaker: 'HARAS', text: 'Excellent. His cannibalism ability alone makes him invaluable.', color: '#88f' }
            ] : [
                { speaker: 'NARRATOR', text: 'The beach house is secured. The interior was never searched.', color: '#aaa' },
                { speaker: 'HARAS', text: 'A soldier lost. No matter. The next target is more important.', color: '#88f' }
            ];

            dialogue.push(
                { speaker: 'HARAS', text: 'My sensors are picking up a powerful anomaly. A Larry Dunk called Mr. Runo.', color: '#88f' },
                { speaker: 'HARAS', text: 'Surely that couldn\'t be... never mind. He will be captured.', color: '#88f' }
            );

            startCutscene(dialogue, () => { loadLevel(5); });
        }
    },

    // 5: Ch.3 — Paraplegic Superhero Larry Dunk
    {
        name: 'Ch.3: Eye Bullets',
        gridW: 12, gridH: 8,
        objective: 'Fight through rooftop security and capture Paraplegic Superhero Larry Dunk!',
        ldSlots: [[1,5],[0,2],[1,6]],
        setup: function() {
            fillGrid(12, 8, Terrain.PLAIN);
            // Rooftop parapet wall (top + bottom border)
            for (let x = 0; x < 12; x++) { game.grid[0][x] = Terrain.WALL; game.grid[7][x] = Terrain.WALL; }
            // CLOUD patches — sky visible through gaps in the parapet
            game.grid[1][0] = Terrain.CLOUD; game.grid[1][11] = Terrain.CLOUD;
            game.grid[2][0] = Terrain.CLOUD; game.grid[2][11] = Terrain.CLOUD;
            // Air vents + rooftop structures
            game.grid[2][4] = Terrain.WALL; game.grid[2][5] = Terrain.WALL;
            game.grid[5][3] = Terrain.WALL; game.grid[5][8] = Terrain.WALL;
            game.grid[3][1] = Terrain.MOUNTAIN; game.grid[4][10] = Terrain.MOUNTAIN;

            game.units = [
                createUnit('haras', 0, 3, 'player'),
                createUnit('larryDunk', 0, 4, 'player'),
                createUnit('minion', 1, 3, 'player'),
                createUnit('guard', 4, 2, 'enemy'),
                createUnit('guard', 4, 5, 'enemy'),
                createUnit('guard', 7, 3, 'enemy'),
                createUnit('robot', 7, 5, 'enemy'),
                createUnit('robot', 9, 4, 'enemy'),
                createUnit('robot', 6, 2, 'enemy'),
                createUnit('paraplegicLarry', 10, 3, 'enemy')
            ];
            spawnSelectedLarryDunks();

            startLevel([
                { speaker: 'NARRATOR', text: 'Universe 5. A rooftop. A Larry Dunk who became a superhero after losing the use of his legs.', color: '#aaa' },
                { speaker: 'PARAPLEGIC LARRY', text: 'HALT! I am SUPER LARRY DUNK, defender of justice and democracy!', color: '#f80' },
                { speaker: 'HARAS', text: 'Your wheelchair has rockets on it.', color: '#88f' },
                { speaker: 'PARAPLEGIC LARRY', text: 'Yes. And EYE BULLETS. Don\'t come any closer.', color: '#f80' },
                { speaker: 'HARAS', text: 'Rockets and eye bullets. Fantastic. Surround him.', color: '#88f' }
            ]);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Super Larry Captured!',
        onVictory: function() {
            startCutscene([
                { speaker: 'PARAPLEGIC LARRY', text: '...you\'ve... neutralized my rockets. But the chip... it won\'t...', color: '#f80' },
                { speaker: 'HARAS', text: 'Your eye bullets are spectacular, by the way. Range 3.', color: '#88f' },
                { speaker: 'HARAS', text: 'Moving on. Next signal: an axe murderer.', color: '#88f' },
                { speaker: 'NARRATOR', text: 'Rival Haras count: 6 active. All behind you. None of them understand why.', color: '#aaa' }
            ], () => { loadLevel(6); });
        }
    },

    // 6: Ch.3.2 — Axe Murderer Larry Dunk
    {
        name: 'Ch.3.2: The Slaughterhouse',
        gridW: 12, gridH: 8,
        objective: 'Neutralize the axe murderer. Careful — he chain attacks after kills.',
        ldSlots: [[0,5],[2,2],[1,6],[0,2]],
        setup: function() {
            fillGrid(12, 8, Terrain.PLAIN);
            // Warehouse crates
            game.grid[1][4] = Terrain.FOREST; game.grid[1][5] = Terrain.FOREST;
            game.grid[6][3] = Terrain.FOREST; game.grid[6][7] = Terrain.FOREST;
            game.grid[3][9] = Terrain.FOREST;
            // Wall segments (warehouse walls/pillars)
            game.grid[0][6] = Terrain.WALL; game.grid[7][6] = Terrain.WALL;
            game.grid[3][0] = Terrain.WALL; game.grid[4][0] = Terrain.WALL;

            game.units = [
                createUnit('haras', 1, 3, 'player'),
                createUnit('larryDunk', 1, 4, 'player'),
                createUnit('minion', 0, 3, 'player'),
                createUnit('guard', 5, 1, 'enemy'),
                createUnit('guard', 5, 6, 'enemy'),
                createUnit('guard', 7, 3, 'enemy'),
                createUnit('guard', 6, 5, 'enemy'),
                createUnit('robot', 7, 1, 'enemy'),
                createUnit('guard', 4, 6, 'enemy'),
                createUnit('axeLarry', 9, 3, 'enemy')
            ];
            spawnSelectedLarryDunks();

            startLevel([
                { speaker: 'NARRATOR', text: 'An abandoned slaughterhouse. Three guards — visibly unhappy about their assignment.', color: '#aaa' },
                { speaker: 'AXE MURDERER LARRY', text: 'Welcome. I\'ve been expecting someone. *wipes axe*', color: '#f80' },
                { speaker: 'HARAS', text: 'Put the axe down.', color: '#88f' },
                { speaker: 'AXE MURDERER LARRY', text: 'No.', color: '#f80' },
                { speaker: 'LARRY DUNK', text: '...he\'s me. But he\'s... scarier than me. I don\'t know how to feel.', color: '#f80' },
                { speaker: 'CAIN & ABEL', text: 'We have seen many things. This is among them.', color: '#e90' },
                { speaker: 'ABEL', text: 'I didn\'t see it.', color: '#e90' },
                { speaker: 'CAIN', text: 'One universe was enough.', color: '#e90' }
            ]);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Axe Murderer Chipped!',
        onVictory: function() {
            startCutscene([
                { speaker: 'AXE MURDERER LARRY', text: '...I was mid-chain. You interrupted my chain.', color: '#f80' },
                { speaker: 'HARAS', text: 'Your chain attack ability is indeed useful. I\'ll keep it.', color: '#88f' },
                { speaker: 'HARAS', text: 'Next: an investment group. Corporate.', color: '#88f' }
            ], () => { loadLevel(7); });
        }
    },

    // 7: Ch.3.3 — Cereal Mascot Larry Dunk
    {
        name: 'Ch.3.3: Part of a Complete Breakfast',
        gridW: 12, gridH: 9,
        objective: 'Find and capture the Cereal Mascot Larry Dunk — enemy units can\'t see him, but you can.',
        ldSlots: [[0,3],[2,3],[0,6]],
        setup: function() {
            fillGrid(12, 9, Terrain.TEMPLE);
            // TV studio props / set pieces
            game.grid[2][3] = Terrain.FOREST; game.grid[2][4] = Terrain.FOREST;
            game.grid[6][7] = Terrain.FOREST; game.grid[6][8] = Terrain.FOREST;
            game.grid[4][5] = Terrain.FOREST;
            game.grid[0][6] = Terrain.WALL; game.grid[8][6] = Terrain.WALL;
            game.grid[1][0] = Terrain.WALL; game.grid[7][0] = Terrain.WALL;

            game.units = [
                createUnit('haras', 1, 4, 'player'),
                createUnit('larryDunk', 1, 5, 'player'),
                createUnit('minion', 0, 5, 'player'),
                createUnit('guard', 5, 2, 'enemy'),
                createUnit('guard', 5, 6, 'enemy'),
                createUnit('guard', 7, 4, 'enemy'),
                createUnit('robot', 8, 3, 'enemy'),
                createUnit('guard', 9, 6, 'enemy'),
                createUnit('cerealLarry', 10, 4, 'enemy')  // invisible: enemy AI ignores him
            ];
            spawnSelectedLarryDunks();

            startLevel([
                { speaker: 'NARRATOR', text: 'A TV studio. The cereal mascot Larry Dunk has been filming commercials for eleven years.', color: '#aaa' },
                { speaker: 'CEREAL LARRY', text: 'Hey kids! Are you HUNGRY? Because LARRY DUNK\'S CRISPY BITES are—', color: '#f80' },
                { speaker: 'HARAS', text: 'Why aren\'t the guards doing anything? He\'s right there.', color: '#88f' },
                { speaker: 'NARRATOR', text: 'The guards appear to be unable to perceive him. He\'s been standing next to them for three minutes.', color: '#aaa' },
                { speaker: 'CEREAL LARRY', text: '— part of a complete BREAKFAST! Heh heh! *poses with cereal box*', color: '#f80' },
                { speaker: 'HARAS', text: 'Remarkable. His invisibility ability is real. Take down the guards first.', color: '#88f' },
                { speaker: 'CAIN & ABEL', text: 'We also cannot see him. We share the visual processing. This is not helping.', color: '#e90' }
            ]);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Mascot Acquired!',
        onVictory: function() {
            startCutscene([
                { speaker: 'CEREAL LARRY', text: 'Oh! A new friend! Would you like some LARRY DUNK\'S CRISPY BITES?', color: '#f80' },
                { speaker: 'HARAS', text: 'I\'m putting a chip in your brain.', color: '#88f' },
                { speaker: 'CEREAL LARRY', text: '...okay! *poses*', color: '#f80' },
                { speaker: 'HARAS', text: 'His invisibility will be... useful. Next: someone\'s blocking the portal. Another Haras.', color: '#88f' }
            ], () => { loadLevel(8); });
        }
    },

    // 8: Ch.3.7 — Rival Haras Encounter
    {
        name: 'Ch.3.7: The Other Me',
        gridW: 12, gridH: 8,
        objective: 'Defeat the rival Haras blocking your path to Mr. Runo.',
        ldSlots: [[1,5],[1,2],[0,6],[0,3]],
        setup: function() {
            game.gridW = 12; game.gridH = 8;
            game.grid = [];
            for (let y = 0; y < 8; y++) {
                game.grid[y] = [];
                for (let x = 0; x < 12; x++) {
                    if (y <= 1) game.grid[y][x] = Terrain.CLOUD;
                    else game.grid[y][x] = Terrain.PLAIN;
                }
            }
            // Portal tiles — interdimensional crossroads
            game.grid[2][0]  = Terrain.PORTAL; game.grid[5][0]  = Terrain.PORTAL;
            game.grid[2][11] = Terrain.PORTAL; game.grid[5][11] = Terrain.PORTAL;
            // Terrain hazards
            game.grid[3][4] = Terrain.WALL; game.grid[3][5] = Terrain.WALL;
            game.grid[4][7] = Terrain.WALL; game.grid[4][8] = Terrain.WALL;
            game.grid[1][6] = Terrain.FOREST; game.grid[6][3] = Terrain.FOREST;
            game.grid[6][9] = Terrain.FOREST;

            game.units = [
                createUnit('haras', 0, 3, 'player'),
                createUnit('larryDunk', 0, 4, 'player'),
                createUnit('minion', 1, 3, 'player'),
                createUnit('enemyHaras', 10, 3, 'enemy'),
                createUnit('guard', 7, 2, 'enemy'),
                createUnit('guard', 7, 5, 'enemy'),
                createUnit('robot', 9, 2, 'enemy'),
                createUnit('guard', 5, 6, 'enemy'),
                createUnit('larryDunk', 8, 4, 'enemy')
            ];
            spawnSelectedLarryDunks();

            startLevel([
                { speaker: 'NARRATOR', text: 'An interdimensional crossroads. The portal to Mr. Runo\'s universe is blocked.', color: '#aaa' },
                { speaker: 'RIVAL HARAS', text: 'So. The one they\'re all talking about.', color: '#a88' },
                { speaker: 'HARAS', text: '...', color: '#88f' },
                { speaker: 'RIVAL HARAS', text: 'I\'ve collected 7 Larry Dunks. Chipped and controlled. How many have you got?', color: '#a88' },
                { speaker: 'HARAS', text: 'More than you.', color: '#88f' },
                { speaker: 'RIVAL HARAS', text: 'I\'ve been watching your robot routing. You do something different. Where did you learn that?', color: '#a88' },
                { speaker: 'HARAS', text: 'From a man who died of old age. In this universe at least.', color: '#88f' },
                { speaker: 'RIVAL HARAS', text: 'You\'re blocking my path to Runo. I won\'t let you take him.', color: '#a88' },
                { speaker: 'HARAS', text: 'You already lost. You just don\'t know it yet.', color: '#f44' },
                { speaker: 'CAIN & ABEL', text: 'There are two of him now. This is concerning. We only need one Haras.', color: '#e90' }
            ]);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Rival Defeated!',
        onVictory: function() {
            startCutscene([
                { speaker: 'RIVAL HARAS', text: '...how? I had the same chips. The same plan. The same face.', color: '#a88' },
                { speaker: 'HARAS', text: 'I\'m simply better.', color: '#88f' },
                { speaker: 'NARRATOR', text: 'The portal opens. Mr. Runo\'s universe is accessible.', color: '#aaa' },
                { speaker: 'CAIN & ABEL', text: 'He said "same face." That was accurate. We verified.', color: '#e90' },
                { speaker: 'HARAS', text: 'Move out.', color: '#88f' }
            ], () => { loadLevel(9); });
        }
    },

    // 9: Ch.4 — Catch Mr. Runo!
    {
        name: 'Ch.4: Catch Mr. Runo!',
        gridW: 14, gridH: 10,
        objective: 'Stop Mr. Runo before he escapes through the exit!',
        runoEscape: true,
        ldSlots: [[2,7],[0,4],[3,4]],
        setup: function() {
            fillGrid(14, 10, Terrain.GYM_FLOOR);
            game.grid[1][3] = Terrain.EQUIPMENT;
            game.grid[1][4] = Terrain.EQUIPMENT;
            game.grid[3][6] = Terrain.EQUIPMENT;
            game.grid[3][7] = Terrain.EQUIPMENT;
            game.grid[5][2] = Terrain.EQUIPMENT;
            game.grid[5][10] = Terrain.EQUIPMENT;
            game.grid[7][5] = Terrain.EQUIPMENT;
            game.grid[7][8] = Terrain.EQUIPMENT;
            for (let x = 0; x < 14; x++) { game.grid[0][x] = Terrain.WALL; game.grid[9][x] = Terrain.WALL; }
            for (let y = 0; y < 10; y++) game.grid[y][0] = Terrain.WALL;
            // Barrier wall at x=10 — forces Runo through the EQUIPMENT gap at y=5
            for (let y = 1; y <= 8; y++) game.grid[y][10] = Terrain.WALL;
            game.grid[5][10] = Terrain.EQUIPMENT; // restore the gap (overwrite the wall loop above)
            game.grid[4][13] = Terrain.EXIT;
            game.grid[5][13] = Terrain.EXIT;

            const intro = [
                { speaker: 'NARRATOR', text: 'The team arrives at Mr. Runo\'s office.', color: '#aaa' },
                { speaker: 'HARAS', text: 'There he is.', color: '#88f' },
                { speaker: 'NARRATOR', text: 'Haras stares at Mr. Runo\'s face for a long moment.', color: '#aaa' },
                { speaker: 'HARAS', text: '...', color: '#88f' },
                { speaker: 'HARAS', text: 'You left me with Dr. Retina. You ABANDONED me.', color: '#f44' },
                { speaker: 'MR. RUNO', text: 'Son, I—', color: '#2a2' },
                { speaker: 'HARAS', text: 'SURROUND HIM.', color: '#f44' }
            ];

            game.units = [
                createUnit('haras', 1, 4, 'player'),
                createUnit('larryDunk', 1, 5, 'player'),
                createUnit('minion', 1, 2, 'player'),
                createUnit('minion', 2, 8, 'player'),
                createUnit('mrRuno', 7, 5, 'enemy'),
                createUnit('guard', 5, 3, 'enemy'),   // blocking the corridor
                createUnit('guard', 5, 7, 'enemy')    // blocking the corridor
            ];
            spawnSelectedLarryDunks();

            startLevel(intro);
        },
        victoryCheck: function() {
            return false; // Only onRunoEscape can trigger victory — player can never "catch" Runo
        },
        victoryText: 'Mr. Runo Cornered!',
        onRunoEscape: function(runoUnit) {
            runoUnit.alive = false;
            game.phase = GamePhase.CUTSCENE; // freeze everything
            showBanner('RUNO ESCAPED!', 1600);
            setTimeout(() => {
                startCutscene([
                    { speaker: 'HARAS', text: '...', color: '#88f' },
                    { speaker: 'MR. RUNO', text: '*running* You\'ll never hold me, Haras. Your robots can\'t—', color: '#2a2' },
                    { speaker: 'ROBOT', text: '[UNIT: RUNO_M — INTERCEPTED — CORRIDOR 4B]', color: '#8af' },
                    { speaker: 'MR. RUNO', text: '...', color: '#2a2' },
                    { speaker: 'NARRATOR', text: 'The robots weren\'t deployed to catch Runo in the gym. They were sent through the building\'s other exit — to meet him on the other side.', color: '#aaa' },
                    { speaker: 'MR. RUNO', text: 'You... sent them ahead. Before the fight even started.', color: '#2a2' },
                    { speaker: 'HARAS', text: 'Dr. Retina taught me: routing logic. Efficiency is everything.', color: '#88f' },
                    { speaker: 'ROBOT', text: '[CONTAINMENT ACTIVE — AWAITING ORDERS]', color: '#8af' },
                    { speaker: 'MR. RUNO', text: '...clever. I\'ll give you that, son.', color: '#2a2' },
                    { speaker: 'HARAS', text: 'Don\'t call me that.', color: '#f44' }
                ], () => {
                    game.phase = GamePhase.VICTORY;
                    playSound('victory');
                    setTimeout(() => { document.getElementById('victoryScreen').style.display = 'flex'; }, 600);
                });
            }, 1800);
        },
        turnEvent: function(turn) {
            if (turn === 3) {
                const _fb = Cinema.flashback();
                startCutscene([
                    { speaker: 'NARRATOR', text: '~~ FLASHBACK ~~', color: '#a87040', drawScene: _fb },
                    { speaker: 'DR. RETINA', text: 'Again. From the beginning.', color: '#c8b090', drawScene: _fb },
                    { speaker: 'YOUNG HARAS', text: 'I\'ve done this seventeen times today—', color: '#b0b0ee', drawScene: _fb },
                    { speaker: 'DR. RETINA', text: 'Then do it an eighteenth.', color: '#c8b090', drawScene: _fb },
                    { speaker: 'NARRATOR', text: 'For six months, Dr. Retina assigned Haras a single task: use "pi-hub" to download digits of pi. Increasingly large counts. Every day.', color: '#a87040', drawScene: _fb },
                    { speaker: 'YOUNG HARAS', text: '*staring at the screen* ...3.14159265358979... I\'ve memorized eleven million of these.', color: '#b0b0ee', drawScene: _fb },
                    { speaker: 'YOUNG HARAS', text: 'There has to be something better to do with this much patience.', color: '#b0b0ee', drawScene: _fb },
                    { speaker: 'NARRATOR', text: 'That was the moment in this universe. Here, the evil empire was born from boredom and pi.', color: '#a87040', drawScene: _fb },
                    { speaker: 'DR. RETINA', text: 'Now — the robots. Watch how I direct them. Efficiency is everything.', color: '#c8b090', drawScene: _fb },
                    { speaker: 'YOUNG HARAS', text: '*scribbling notes* Routing logic... parallel command threads... I can do this better than you.', color: '#b0b0ee', drawScene: _fb },
                    { speaker: 'NARRATOR', text: 'Dr. Retina died shortly after. Old age. Peacefully.', color: '#a87040', drawScene: _fb },
                    { speaker: 'NARRATOR', text: 'In this universe, at least.', color: '#a87040', drawScene: _fb },
                    { speaker: 'NARRATOR', text: '~~ END FLASHBACK ~~', color: '#a87040', drawScene: _fb },
                    { speaker: 'CAIN & ABEL', text: 'We met Dr. Retina once. He could not decide which of us to address. Neither could we.', color: '#e90' },
                    { speaker: 'HARAS', text: 'He taught me everything. My father just... left. But I learned to plan ahead.', color: '#88f' },
                    { speaker: 'HARAS', text: 'Deploy the robots. Send them through the service entrance.', color: '#f44' }
                ], () => {
                    // Robots appear — player assumes they'll help catch Runo in the gym
                    // (they're actually sent ahead to intercept at the exit)
                    game.units.push(createUnit('robot', 1, 1, 'player'));
                    game.units.push(createUnit('robot', 1, 8, 'player'));
                    game.phase = GamePhase.PLAYER_TURN;
                    showBanner('Robots Deployed!', 1500);
                });
            }
            // No turn limit defeat — robots will catch Runo when he escapes
        },
        onVictory: function() {
            const postCapture = [
                { speaker: 'MR. RUNO', text: '*panting* ...you got me.', color: '#2a2' },
                { speaker: 'HARAS', text: 'Your biceps are too strong for the chip. But I don\'t need your brain.', color: '#88f' },
                { speaker: 'MR. RUNO', text: 'Son — I had reasons—', color: '#2a2' },
                { speaker: 'HARAS', text: 'Don\'t.', color: '#f44' },
                { speaker: 'HARAS', text: '...', color: '#88f' },
                { speaker: 'MR. RUNO', text: 'You needed the pressure. Needed to be hungry.', color: '#2a2' },
                { speaker: 'HARAS', text: 'Don\'t make excuses', color: '#f44' },
                { speaker: 'MR. RUNO', text: 'I\'m not. I\'m simply explaining myself.', color: '#2a2' },
                { speaker: 'NARRATOR', text: 'Haras restrains Mr. Runo using the robots. Then stares at the time machine for a long moment.', color: '#aaa' },
                { speaker: 'HARAS', text: 'I could go back. Stop him from leaving.', color: '#88f' },
                { speaker: 'HARAS', text: '...I\'m doing it. With my time machine.', color: '#f44' },
                { speaker: 'NARRATOR', text: 'The timeline shifts. Mr. Runo never left. Haras was never alone.', color: '#aaa' },
                { speaker: 'NARRATOR', text: 'But something is different now.', color: '#aaa' },
                { speaker: 'HARAS', text: 'It doesn\'t matter. I still have targets. And then — Zeus.', color: '#88f' }
            ];
            startCutscene(postCapture, () => { loadLevel(10); });
        }
    },

    // 10: Ch.3.4 — Investment Group Larry Dunk
    {
        name: 'Ch.3.4: Q4 Acquisition',
        gridW: 14, gridH: 9,
        objective: 'Break into the boardroom and capture Investment Group Larry Dunk.',
        ldSlots: [[0,5],[2,6],[0,8],[1,8]],
        setup: function() {
            game.gridW = 14; game.gridH = 9;
            game.grid = [];
            // Upper floor (boardroom / 15th floor): rows 0–3
            for (let y = 0; y < 4; y++) {
                game.grid[y] = [];
                for (let x = 0; x < 14; x++) game.grid[y][x] = Terrain.UPPER_FLOOR;
            }
            // Floor separator: row 4 is all WALL except stair openings at x=4 and x=9
            game.grid[4] = [];
            for (let x = 0; x < 14; x++) game.grid[4][x] = Terrain.WALL;
            game.grid[4][4] = Terrain.STAIR;
            game.grid[4][9] = Terrain.STAIR;
            // Lower floor (lobby / entrance): rows 5–8
            for (let y = 5; y < 9; y++) {
                game.grid[y] = [];
                for (let x = 0; x < 14; x++) game.grid[y][x] = Terrain.OFFICE_FLOOR;
            }
            // Upper floor obstacles
            game.grid[0][6] = Terrain.WALL; game.grid[0][7] = Terrain.WALL;   // conference partition
            game.grid[1][5] = Terrain.WALL; game.grid[1][8] = Terrain.WALL;   // room dividers
            game.grid[2][1] = Terrain.EQUIPMENT; game.grid[2][12] = Terrain.EQUIPMENT; // desks
            game.grid[1][11] = Terrain.THRONE; game.grid[1][12] = Terrain.THRONE;      // conference table
            // Lower floor obstacles
            game.grid[5][1] = Terrain.EQUIPMENT; game.grid[5][2] = Terrain.EQUIPMENT;  // reception desk
            game.grid[7][5] = Terrain.WALL;      game.grid[7][8] = Terrain.WALL;       // pillars
            game.grid[6][11] = Terrain.EQUIPMENT; game.grid[6][12] = Terrain.EQUIPMENT; // filing cabinets

            game.units = [
                createUnit('haras', 1, 7, 'player'),
                createUnit('larryDunk', 0, 7, 'player'),
                createUnit('minion', 1, 6, 'player'),
                createUnit('guard', 6, 6, 'enemy'),        // lower floor — guards left stairway
                createUnit('guard', 10, 7, 'enemy'),       // lower floor — guards right stairway
                createUnit('guard', 3, 2, 'enemy'),        // upper floor — boardroom left
                createUnit('robot', 8, 2, 'enemy'),        // upper floor — boardroom center
                createUnit('robot', 5, 1, 'enemy'),        // upper floor — near left stair
                createUnit('investmentLarry', 12, 1, 'enemy')  // upper floor — at conference table
            ];
            spawnSelectedLarryDunks();

            startLevel([
                { speaker: 'NARRATOR', text: 'The boardroom of Larry Dunk Acquisitions LLC. Fifteenth floor.', color: '#aaa' },
                { speaker: 'NARRATOR', text: 'Haras has been quieter since the Runo situation. The team does not ask.', color: '#555' },
                { speaker: 'INVESTMENT LARRY', text: 'I\'ve been expecting a hostile takeover. I did not expect... this.', color: '#f80' },
                { speaker: 'HARAS', text: 'I want your brain. Literally.', color: '#88f' },
                { speaker: 'INVESTMENT LARRY', text: 'My legal team will— actually, before we proceed: are you familiar with our Ad Break restructuring package?', color: '#f80' },
                { speaker: 'HARAS', text: 'I have no interest in your—', color: '#88f' },
                { speaker: 'INVESTMENT LARRY', text: 'Of course you do. When I attack at full power, I first require everyone present to watch a brief message from our sponsors.', color: '#f80' },
                { speaker: 'HARAS', text: 'Fight through corporate security. Get me that brain.', color: '#88f' }
            ]);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Hostile Takeover Complete!',
        onVictory: function() {
            startCutscene([
                { speaker: 'INVESTMENT LARRY', text: '...this acquisition is... pending regulatory approval...', color: '#f80' },
                { speaker: 'HARAS', text: 'Chip installed. Welcome to the portfolio.', color: '#88f' },
                { speaker: 'NARRATOR', text: 'His Ad Break ability remains active. The chip did not disable the ad.', color: '#aaa' },
                { speaker: 'CAIN & ABEL', text: 'That advertisement was twenty-two seconds. We counted. We had time.', color: '#e90' },
                { speaker: 'HARAS', text: 'Next signal: Zeus Larry Dunk. Mount Olympus.', color: '#88f' }
            ], () => { loadLevel(11); });
        }
    },

    // 11: Ch.5 — The Thousand Horses (Zeus)
    {
        name: 'Ch.4: The Thousand Horses',
        gridW: 16, gridH: 12,
        objective: 'Defeat the rival Haras clones using the horse army!',
        setup: function() {
            game.gridW = 16; game.gridH = 12;
            game.grid = [];
            for (let y = 0; y < 12; y++) {
                game.grid[y] = [];
                for (let x = 0; x < 16; x++) {
                    // y=0: Zeus's divine cloud row; y=1-4: temple approach; y=5+: plain battlefield
                    game.grid[y][x] = y === 0 ? Terrain.CLOUD : y <= 4 ? Terrain.TEMPLE : Terrain.PLAIN;
                }
            }
            game.grid[0][7] = Terrain.THRONE;
            game.grid[0][8] = Terrain.THRONE;
            game.grid[5][3]  = Terrain.FOREST;
            game.grid[5][12] = Terrain.FOREST;
            game.grid[8][5]  = Terrain.MOUNTAIN;
            game.grid[8][10] = Terrain.MOUNTAIN;
            game.grid[6][0]  = Terrain.WALL;
            game.grid[7][0]  = Terrain.WALL;
            game.grid[6][15] = Terrain.WALL;
            game.grid[7][15] = Terrain.WALL;

            const intro = [
                { speaker: 'NARRATOR', text: 'Mount Olympus.', color: '#aaa' },
                { speaker: 'ZEUS LARRY DUNK', text: 'WHO DARES APPROACH MY DIVINE THRONE?!', color: '#ff0' },
                { speaker: 'HARAS', text: 'Zeus Larry Dunk. Enemies are approaching, but I can help. I want 1,000 horses.', color: '#88f' },
                { speaker: 'ZEUS LARRY DUNK', text: 'You dare to ask ME for a THOUSAND HORSES', color: '#ff0' },
                { speaker: 'HARAS', text: 'Yes, one for each member of my army.', color: '#88f' },
                { speaker: 'CAIN & ABEL', text: 'We only need one horse because we are conjoined.', color: '#e90' },
                { speaker: 'ZEUS LARRY DUNK', text: 'This reminds me of the Thesis...situation. But I trust that you will be different. The great Zeus can\'t be fooled twice.', color: '#ff0' },
                { speaker: 'HARAS', text: 'Then we agree. Give me the horses and I will defeat every rival Haras who threatens us both.', color: '#88f' },
                { speaker: 'ZEUS LARRY DUNK', text: '...very well. *summons 1,000 horses* NOW PROVE YOUR WORTH, MORTAL.', color: '#ff0' },
                { speaker: 'NARRATOR', text: 'Armed with the horse army, Haras faces his multiverse rivals.', color: '#aaa' }
            ];

            game.units = [
                createUnit('haras', 2, 8, 'player'),
                createUnit('larryDunk', 3, 8, 'player'),
                createUnit('cainAbel', 2, 9, 'player'),
                createUnit('mrRuno', 4, 9, 'player'),
                createUnit('horse', 5, 7, 'player'),
                createUnit('horse', 6, 7, 'player'),
                createUnit('horse', 7, 7, 'player'),
                createUnit('horse', 5, 8, 'player'),
                createUnit('horse', 6, 8, 'player'),
                createUnit('horse', 7, 8, 'player'),
                createUnit('horse', 5, 9, 'player'),
                createUnit('horse', 6, 9, 'player'),
                createUnit('horse', 7, 9, 'player'),
                createUnit('horse', 8, 8, 'player'),
                createUnit('enemyHaras', 12, 2, 'enemy'),
                createUnit('enemyHaras', 14, 4, 'enemy'),
                createUnit('enemyHaras', 13, 6, 'enemy'),
                createUnit('enemyHaras', 11, 8, 'enemy'),
                createUnit('guard', 12, 4, 'enemy'),
                createUnit('guard', 13, 3, 'enemy'),
                createUnit('guard', 14, 7, 'enemy'),
                createUnit('guard', 12, 9, 'enemy'),
                createUnit('robot', 13, 5, 'enemy'),
                createUnit('robot', 14, 6, 'enemy')
            ];

            // Zeus sits on throne — neutral, will be captured (rigged Tetris)
            const zeus = createUnit('zeusLarry', 7, 0, 'neutral');
            zeus.acted = true;
            game.units.push(zeus);

            startLevel(intro);
        },
        victoryCheck: allEnemiesDefeated,
        victoryText: 'Rivals Defeated!',
        onVictory: function() {
            const zeusArc = [
                { speaker: 'HARAS', text: 'Every rival Haras — destroyed. Now, Zeus Larry Dunk...', color: '#88f' },
                { speaker: 'HARAS', text: 'I think I\'ll keep you. You\'re too powerful to leave unsecured.', color: '#f44' },
                { speaker: 'ZEUS LARRY DUNK', text: 'WHAT?! After I gave you my horses?!', color: '#ff0' },
                { speaker: 'ZEUS LARRY DUNK', text: 'LIGHTNING STRIKE!', color: '#ff0' },
                { speaker: 'NARRATOR', text: 'Zeus hurls a bolt directly at Haras.', color: '#aaa' },
                { speaker: 'HARAS', text: '...ow. A little.', color: '#88f' },
                { speaker: 'NARRATOR', text: 'The lightning does almost nothing to Haras.', color: '#aaa' },
                { speaker: 'NARRATOR', text: 'But it does something else.', color: '#aaa' },
                { speaker: 'NARRATOR', text: 'The blast broadcasts Haras\'s exact multiverse coordinates — to every rival Haras still searching for him.', color: '#f44' },
                { speaker: 'NARRATOR', text: 'His lead — maintained this whole time — is gone.', color: '#f44' },
                { speaker: 'HARAS', text: 'Capture him. NOW. Before they arrive.', color: '#f44' },
                { speaker: 'NARRATOR', text: 'Haras moves in. The Tetris board appears.', color: '#aaa' },
                { speaker: 'NARRATOR', text: 'Something is wrong with the pieces.', color: '#aaa' }
            ];
            startCutscene(zeusArc, () => {
                // Find Zeus and trigger the rigged (forced fail) Tetris
                const zeus = game.units.find(u => u.type === 'zeusLarry');
                if (zeus) startTetrisCapture(zeus, { rigged: true });
            });
        }
    },

    // 12: FINAL — The One Horse
    {
        name: 'FINAL: The One Horse',
        gridW: 16, gridH: 12,
        objective: 'Get Haras to the escape portal! Survive the horse onslaught.',
        setup: function() {
            game.gridW = 16; game.gridH = 12;
            game.grid = [];
            for (let y = 0; y < 12; y++) {
                game.grid[y] = [];
                for (let x = 0; x < 16; x++) {
                    game.grid[y][x] = y === 0 ? Terrain.CLOUD : Terrain.PLAIN;
                }
            }
            game.grid[5][15] = Terrain.PORTAL;
            game.grid[6][15] = Terrain.PORTAL;
            game.grid[4][8]  = Terrain.FOREST;
            game.grid[7][8]  = Terrain.FOREST;
            game.grid[3][12] = Terrain.MOUNTAIN;
            game.grid[8][12] = Terrain.MOUNTAIN;

            game.units = [
                createUnit('haras', 1, 5, 'player'),
                createUnit('loyalHorse', 2, 5, 'player'),
                createUnit('larryDunk', 1, 6, 'player'),
                createUnit('cainAbel', 2, 7, 'player'),
                createUnit('mrRuno', 1, 4, 'player'),
                createUnit('zeusLarry', 7, 1, 'enemy'),
                createUnit('horse', 8, 3, 'enemy'),
                createUnit('horse', 9, 4, 'enemy'),
                createUnit('horse', 10, 3, 'enemy'),
                createUnit('horse', 8, 5, 'enemy'),
                createUnit('horse', 9, 6, 'enemy'),
                createUnit('horse', 10, 7, 'enemy'),
                createUnit('horse', 11, 5, 'enemy'),
                createUnit('horse', 12, 4, 'enemy'),
                createUnit('horse', 12, 6, 'enemy'),
                createUnit('guard', 13, 5, 'enemy'),
                createUnit('guard', 14, 5, 'enemy')
            ];

            const intro = [
                { speaker: 'NARRATOR', text: 'The portal is thirty meters away. Chaos is everywhere.', color: '#aaa' },
                { speaker: 'LOYAL HORSE', text: '*appears at Haras\'s side*', color: '#fc0' },
                { speaker: 'NARRATOR', text: 'The horses — The Thousand Horses — turn.', color: '#f44' },
                { speaker: 'ZEUS LARRY DUNK', text: 'HORSES. TRAMPLE HIM.', color: '#ff0' },
                { speaker: 'LOYAL HORSE', text: '*stands firm*', color: '#fc0' },
                { speaker: 'CAIN & ABEL', text: 'Run for the portal!', color: '#e90' },
                { speaker: 'HARAS', text: '*blacks out*', color: '#88f' }
            ];

            startCutscene(intro, () => {
                game.phase = GamePhase.PLAYER_TURN;
                showBanner('FINAL BATTLE', 2000);
            });
        },
        victoryCheck: function() {
            const haras = game.units.find(u => u.type === 'haras' && u.alive);
            if (haras) {
                const terrain = getTerrain(haras.gx, haras.gy);
                if (terrain === Terrain.PORTAL) return true;
            }
            return false;
        },
        victoryText: 'Escaped!',
        turnEvent: function(turn) {
            if (turn % 2 === 0 && turn <= 8) {
                for (let i = 0; i < 2; i++) {
                    const sy = Math.floor(Math.random() * 8) + 2;
                    // Spawn at x=14, not x=15, so horses never block the portal tiles
                    if (!getUnitAt(14, sy)) game.units.push(createUnit('horse', 14, sy, 'enemy'));
                }
                showBanner('More horses!', 1000);
            }
        },
        onVictory: function() {
            const _cred = Cinema.credits();
            const ending = [
                { speaker: 'NARRATOR', text: 'The horse carrying Haras leaps through the portal.', color: '#aaa' },
                { speaker: 'NARRATOR', text: 'Behind them — 999 horses. Zeus Larry Dunk. The rivals. Even his own father.', color: '#aaa' },
                { speaker: 'NARRATOR', text: 'It doesn\'t matter anymore.', color: '#aaa' },
                { speaker: 'HARAS', text: '...I had a thousand horses. And I lost them all.', color: '#88f' },
                { speaker: 'LOYAL HORSE', text: '*gentle neigh*', color: '#fc0' },
                { speaker: 'HARAS', text: 'But you stayed.', color: '#88f' },
                { speaker: 'NARRATOR', text: 'The horse carries Haras off into the sunset...', color: '#fc0' },
                { speaker: 'NARRATOR', text: 'Past the conquered Larry Dunks.', color: '#fc0' },
                { speaker: '', text: '"You only need 1 horse."', color: '#fc0', drawScene: _cred },
                { speaker: '', text: 'Thank you for playing.', color: '#888', drawScene: _cred }
            ];

            document.getElementById('victoryScreen').style.display = 'none';
            startCutscene(ending, () => {
                game.phase = GamePhase.ENDING;
                game.cinemaDrawScene = _cred; // hold credits on screen after cutscene ends
            });
        }
    }
];

// ---- LARRY DUNK SELECTOR ----
function showLarryDunkSelector(maxSlots, callback) {
    game._ldSelectorCallback = callback;
    game._ldSelectorMaxSlots = maxSlots;
    game.selectedLarryDunks = [];

    const overlay  = document.getElementById('larryDunkSelector');
    const grid     = document.getElementById('ldSelectorGrid');
    const usedEl   = document.getElementById('ldSlotsUsed');
    const maxEl    = document.getElementById('ldSlotsMax');

    grid.innerHTML = '';
    maxEl.textContent  = maxSlots;
    usedEl.textContent = '0';

    game.capturedLarryDunks.forEach(type => {
        const unit = createUnit(type, 0, 0, 'player');
        const card = document.createElement('div');
        card.className   = 'ld-card';
        card.dataset.type = type;
        card.innerHTML   = `<div class="ld-name">${unit.name}</div><div class="ld-special">★ ${unit.special}</div><div class="ld-stats">HP:${unit.hp}  ATK:${unit.atk}  DEF:${unit.def}  MOV:${unit.mov}  RNG:${unit.range}</div><div class="ld-desc">${unit.desc || ''}</div>`;
        card.addEventListener('click', () => {
            const idx = game.selectedLarryDunks.indexOf(type);
            if (idx >= 0) {
                game.selectedLarryDunks.splice(idx, 1);
                card.classList.remove('ld-selected');
            } else if (game.selectedLarryDunks.length < maxSlots) {
                game.selectedLarryDunks.push(type);
                card.classList.add('ld-selected');
            }
            usedEl.textContent = game.selectedLarryDunks.length;
        });
        grid.appendChild(card);
    });

    overlay.style.display = 'flex';
}

function confirmLarryDunkDeploy() {
    document.getElementById('larryDunkSelector').style.display = 'none';
    if (game._ldSelectorCallback) game._ldSelectorCallback();
}

function spawnSelectedLarryDunks() {
    const level = LEVELS[game.currentLevel];
    if (!level || !level.ldSlots) return;
    game.selectedLarryDunks.forEach((type, i) => {
        if (i >= level.ldSlots.length) return;
        const [gx, gy] = level.ldSlots[i];
        if (!getUnitAt(gx, gy)) game.units.push(createUnit(type, gx, gy, 'player'));
    });
}

// ---- LEVEL LOADER ----
function loadLevel(index) {
    // LD persistence: remove any deployed Larry Dunks that died in the last battle
    game.selectedLarryDunks.forEach(type => {
        const ld = game.units.find(u => u.type === type && u.isLarryDunk);
        if (ld && !ld.alive) {
            const idx = game.capturedLarryDunks.indexOf(type);
            if (idx >= 0) game.capturedLarryDunks.splice(idx, 1);
        }
    });

    game.currentLevel = index;
    game.phase = GamePhase.CUTSCENE; // immediately clear any defeat/victory state
    game.turn = 1;
    game.units = [];
    game.grid = [];
    game.gridW = 0;
    game.gridH = 0;
    game.selectedUnit = null;
    game.hoveredUnit = null;
    game.pendingMoveTile = null;
    game.moveTiles = [];
    game.attackTiles = [];
    game.animations = [];
    document.getElementById('moveConfirm').style.display = 'none';
    game.betrayalTriggered = false;
    game.survivalistRevealed = false;

    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('defeatScreen').style.display = 'none';
    document.getElementById('adBreakOverlay').style.display = 'none';
    document.getElementById('larryDunkSelector').style.display = 'none';
    if (game._adCountdownTimer) { clearInterval(game._adCountdownTimer); game._adCountdownTimer = null; }
    game.pendingAdBreak = null;

    resetMusicPositions();
    playMusic(index === 11 ? 'level12' : 'cutscene');

    const level = LEVELS[index];
    document.getElementById('levelName').textContent = level.name;

    if (level.objective) {
        document.getElementById('objectiveBox').textContent = level.objective;
        document.getElementById('objectiveBox').style.display = 'block';
    } else {
        document.getElementById('objectiveBox').style.display = 'none';
    }

    document.getElementById('actionPanel').style.display = 'flex';
    updateTopBar();

    // Show Larry Dunk selector before battle if this level has slots and pool is non-empty
    if (level.ldSlots && game.capturedLarryDunks.length > 0) {
        showLarryDunkSelector(level.ldSlots.length, () => level.setup());
    } else {
        game.selectedLarryDunks = [];
        level.setup();
    }
}
