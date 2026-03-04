// ============================================================
// MAIN — game loop, screen handlers, keyboard shortcuts
// ============================================================

// ---- TITLE SCREEN ----
document.getElementById('titleScreen').addEventListener('click', () => {
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
});

// ---- GAME LOOP ----
function gameLoop() {
    updateAnimations();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
