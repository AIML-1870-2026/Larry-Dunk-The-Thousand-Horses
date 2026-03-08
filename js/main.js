// ============================================================
// MAIN — game loop, screen handlers, keyboard shortcuts
// ============================================================

// LDs available at the START of each level in normal play order.
// Indexed by level number; mrRuno and zeusLarry are never capturable.
// New order: 0 Prologue 1 Tutorial 2 C&A 3 British 4 Survivalist 5 Paraplegic
//            6 Axe 7 Cereal 8 RivalHaras 9 Runo 10 Investment 11 Female 12 Zeus 13 Final
const LD_POOL_AT_LEVEL = [
    [],                                                                                                    // 0 Prologue
    [],                                                                                                    // 1 Tutorial
    [],                                                                                                    // 2 Cain & Abel (haven't captured yet)
    ['cainAbel'],                                                                                          // 3 British Larry
    ['cainAbel', 'britishLarry'],                                                                          // 4 Survivalist
    ['cainAbel', 'britishLarry', 'survivalistLarry'],                                                      // 5 Paraplegic
    ['cainAbel', 'britishLarry', 'survivalistLarry', 'paraplegicLarry'],                                  // 6 Axe
    ['cainAbel', 'britishLarry', 'survivalistLarry', 'paraplegicLarry', 'axeLarry'],                      // 7 Cereal
    ['cainAbel', 'britishLarry', 'survivalistLarry', 'paraplegicLarry', 'axeLarry', 'cerealLarry'],       // 8 Rival Haras (rival not capturable)
    ['cainAbel', 'britishLarry', 'survivalistLarry', 'paraplegicLarry', 'axeLarry', 'cerealLarry'],       // 9 Mr. Runo (Runo not capturable as LD)
    ['cainAbel', 'britishLarry', 'survivalistLarry', 'paraplegicLarry', 'axeLarry', 'cerealLarry', 'larryDunk'],  // 10 Investment
    ['cainAbel', 'britishLarry', 'survivalistLarry', 'paraplegicLarry', 'axeLarry', 'cerealLarry', 'investmentLarry', 'larryDunk'],  // 11 Female
    ['cainAbel', 'britishLarry', 'survivalistLarry', 'paraplegicLarry', 'axeLarry', 'cerealLarry', 'investmentLarry', 'femaleLarry', 'larryDunk'],  // 12 Zeus (mrRuno not capturable)
    ['cainAbel', 'britishLarry', 'survivalistLarry', 'paraplegicLarry', 'axeLarry', 'cerealLarry', 'investmentLarry', 'femaleLarry', 'larryDunk'],  // 13 Final (zeusLarry not capturable)
];

// ---- TITLE SCREEN ----
document.getElementById('titleScreen').addEventListener('click', () => {
    playMusic('title');
    document.getElementById('titleScreen').style.display = 'none';
    showLevelSelect();
});

function showLevelSelect() {
    const screen = document.getElementById('levelSelectScreen');
    const grid   = document.getElementById('levelGrid');
    grid.innerHTML = '';

    // Start from beginning
    const startBtn = document.createElement('button');
    startBtn.className = 'lvl-btn lvl-start';
    startBtn.textContent = '▶  Start from Beginning';
    startBtn.onclick = () => {
        screen.style.display = 'none';
        loadLevel(0);
    };
    grid.appendChild(startBtn);

    // One button per level
    LEVELS.forEach((lvl, i) => {
        const btn = document.createElement('button');
        btn.className = 'lvl-btn';
        btn.innerHTML = `<span class="lvl-num">${i}.</span>${lvl.name}`;
        btn.onclick = () => {
            screen.style.display = 'none';
            // When jumping directly to a level, give the pool you'd have in normal play
            if (LEVELS[i].ldSlots && game.capturedLarryDunks.length === 0) {
                game.capturedLarryDunks = (LD_POOL_AT_LEVEL[i] || []).slice();
            }
            loadLevel(i);
        };
        grid.appendChild(btn);
    });

    screen.style.display = 'flex';
}

// ---- VICTORY SCREEN ----
document.getElementById('victoryScreen').addEventListener('click', () => {
    document.getElementById('victoryScreen').style.display = 'none';
    const level = LEVELS[game.currentLevel];
    if (level.onVictory) {
        level.onVictory();
    } else if (game.currentLevel < LEVELS.length - 1) {
        loadLevel(game.currentLevel + 1);
    }
});

// ---- DEFEAT SCREEN ----
document.getElementById('defeatScreen').addEventListener('click', () => {
    document.getElementById('defeatScreen').style.display = 'none';
    loadLevel(game.currentLevel);
});

// ---- KEYBOARD SHORTCUTS ----
document.addEventListener('keydown', (e) => {
    // Tetris keys handled in tetris.js; Ad Break blocks all game keys
    if (game.phase === GamePhase.TETRIS) return;
    if (game.phase === GamePhase.AD_BREAK) return;

    if (e.key === 'Escape') {
        if (game.phase === GamePhase.UNIT_SELECTED || game.phase === GamePhase.ATTACK_SELECT) {
            deselectUnit();
        }
    }
    if (e.key === ' ' || e.key === 'Enter') {
        if (game.phase === GamePhase.CUTSCENE) advanceDialogue();
    }
    if (e.key === 'v' || e.key === 'V') {
        const on = toggleVoice();
        showBanner(on ? 'Voice Acting: ON' : 'Voice Acting: OFF', 1200);
    }
});

// ---- GAME LOOP ----
function gameLoop() {
    updateAnimations();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
