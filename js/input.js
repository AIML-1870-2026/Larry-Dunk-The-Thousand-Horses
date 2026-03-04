// ============================================================
// INPUT HANDLING
// ============================================================

canvas.addEventListener('click', (e) => {
    if (game.phase === GamePhase.TETRIS) {
        handleTetrisClick(e);
        return;
    }
    if (game.phase === GamePhase.AD_BREAK) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const gx = Math.floor((mx - GRID_OFFSET_X) / TILE_SIZE);
    const gy = Math.floor((my - GRID_OFFSET_Y) / TILE_SIZE);
    if (gx >= 0 && gx < game.gridW && gy >= 0 && gy < game.gridH) {
        game.cursor = { x: gx, y: gy };
        handleGridClick(gx, gy);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (game.phase === GamePhase.TETRIS) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const gx = Math.floor((mx - GRID_OFFSET_X) / TILE_SIZE);
    const gy = Math.floor((my - GRID_OFFSET_Y) / TILE_SIZE);
    if (gx >= 0 && gx < game.gridW && gy >= 0 && gy < game.gridH) {
        game.cursor = { x: gx, y: gy };
        const unit = getUnitAt(gx, gy);
        if (unit) {
            showUnitInfo(unit);
        } else {
            showTerrainInfo(getTerrain(gx, gy));
        }
        game.hoveredUnit = unit || null;
    } else {
        game.hoveredUnit = null;
        showUnitInfo(null);
    }
});

function handleGridClick(gx, gy) {
    if (game.phase === GamePhase.PLAYER_TURN) {
        const unit = getUnitAt(gx, gy);
        if (unit && unit.team === 'player' && !unit.acted) selectUnit(unit);

    } else if (game.phase === GamePhase.UNIT_SELECTED) {
        const clickedMove = game.moveTiles.find(t => t.x === gx && t.y === gy);
        if (clickedMove) {
            moveUnit(game.selectedUnit, gx, gy);
        } else {
            deselectUnit();
            const unit = getUnitAt(gx, gy);
            if (unit && unit.team === 'player' && !unit.acted) selectUnit(unit);
        }

    } else if (game.phase === GamePhase.ATTACK_SELECT) {
        const clickedAtk = game.attackTiles.find(t => t.x === gx && t.y === gy);
        if (clickedAtk) {
            const target = getUnitAt(gx, gy);
            if (target) {
                doCombat(game.selectedUnit, target);
                // Tetris takes over — clean up selection and stop normal flow
                if (game.phase === GamePhase.TETRIS) {
                    game.selectedUnit = null;
                    game.moveTiles = [];
                    game.attackTiles = [];
                    document.getElementById('btnAttack').style.display = 'none';
                    document.getElementById('btnWait').style.display = 'none';
                    return;
                }
                // Ad Break takes over — overlay handles combat + finishUnitAction on skip
                // selectedUnit intentionally NOT cleared so finishUnitAction can mark it acted
                if (game.phase === GamePhase.AD_BREAK) {
                    game.moveTiles = [];
                    game.attackTiles = [];
                    document.getElementById('btnAttack').style.display = 'none';
                    document.getElementById('btnWait').style.display = 'none';
                    return;
                }
                game.selectedUnit.attacksLeft--;
                if (game.selectedUnit.attacksLeft <= 0) {
                    finishUnitAction();
                } else {
                    // Cain & Abel gets another attack
                    game.attackTiles = getAttackTiles(game.selectedUnit, game.selectedUnit.gx, game.selectedUnit.gy);
                    if (game.attackTiles.length === 0) finishUnitAction();
                }
                checkVictoryDefeat();
            }
        } else {
            finishUnitAction();
        }
    }
}

function selectUnit(unit) {
    playSound('select');
    game.selectedUnit = unit;
    game.moveTiles = getMovementTiles(unit);
    game.phase = GamePhase.UNIT_SELECTED;
    document.getElementById('btnAttack').style.display = 'none';
    document.getElementById('btnWait').style.display = 'none';
}

function moveUnit(unit, gx, gy) {
    // Female Larry bad driving: 20% chance to land 1 tile off in a random direction
    if (unit.badDriving && Math.random() < 0.2) {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
        const nx = gx + dx, ny = gy + dy;
        if (nx >= 0 && nx < game.gridW && ny >= 0 && ny < game.gridH &&
            getTerrain(nx, ny).moveCost < 99 && !getUnitAt(nx, ny)) {
            gx = nx; gy = ny;
            showBanner('Bad Driving!', 900);
        }
    }
    playSound('move');
    unit.gx = gx;
    unit.gy = gy;
    game.moveTiles = [];
    unit.attacksLeft = unit.type === 'cainAbel' ? 2 : 1;
    game.attackTiles = getAttackTiles(unit, gx, gy);

    if (game.attackTiles.length > 0) {
        game.phase = GamePhase.ATTACK_SELECT;
        document.getElementById('btnAttack').style.display = 'inline-block';
        document.getElementById('btnWait').style.display = 'inline-block';
    } else {
        finishUnitAction();
    }
}

function doAttack() {
    // Player clicks attack tile directly on canvas; button is a no-op
}

function doWait() {
    finishUnitAction();
}

function finishUnitAction() {
    if (game.phase === GamePhase.TETRIS) return; // Tetris is resolving, don't touch phase
    if (game.selectedUnit) game.selectedUnit.acted = true;
    game.selectedUnit = null;
    game.moveTiles = [];
    game.attackTiles = [];
    game.phase = GamePhase.PLAYER_TURN;
    document.getElementById('btnAttack').style.display = 'none';
    document.getElementById('btnWait').style.display = 'none';

    // Auto end turn if all player units have acted
    const playerUnits = game.units.filter(u => u.alive && u.team === 'player');
    if (playerUnits.every(u => u.acted)) endPlayerTurn();
}

function deselectUnit() {
    game.selectedUnit = null;
    game.moveTiles = [];
    game.attackTiles = [];
    game.phase = GamePhase.PLAYER_TURN;
    document.getElementById('btnAttack').style.display = 'none';
    document.getElementById('btnWait').style.display = 'none';
}

function endPlayerTurn() {
    if (game.phase === GamePhase.ENEMY_TURN || game.phase === GamePhase.CUTSCENE) return;
    if (game.phase === GamePhase.TETRIS) return;
    deselectUnit();
    game.phase = GamePhase.ENEMY_TURN;
    playSound('enemy_phase');
    showBanner('Enemy Phase', 1200);
    updateTopBar();
    setTimeout(doEnemyTurn, 1500);
}
