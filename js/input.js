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
    // During tutorial dialogue, allow player interaction on the grid
    const phase = (game.phase === GamePhase.CUTSCENE && game.tutorialHighlight)
        ? GamePhase.PLAYER_TURN : game.phase;

    if (phase === GamePhase.PLAYER_TURN) {
        const unit = getUnitAt(gx, gy);
        if (unit && unit.team === 'player' && !unit.acted) selectUnit(unit);

    } else if (phase === GamePhase.UNIT_SELECTED) {
        const clickedMove = game.moveTiles.find(t => t.x === gx && t.y === gy);
        const clickedAtk = game.attackTiles.find(t => t.x === gx && t.y === gy);
        if (clickedMove) {
            // Show confirmation panel instead of moving immediately
            game.pendingMoveTile = { tx: gx, ty: gy };
            positionMoveConfirm(gx, gy);
            document.getElementById('moveConfirm').style.display = 'flex';
        } else if (clickedAtk) {
            // Attack from current position without moving
            game.moveTiles = [];
            executeAttack(gx, gy);
        } else {
            // Clicked outside movement range — cancel pending and deselect
            game.pendingMoveTile = null;
            document.getElementById('moveConfirm').style.display = 'none';
            deselectUnit();
            const unit = getUnitAt(gx, gy);
            if (unit && unit.team === 'player' && !unit.acted) selectUnit(unit);
        }

    } else if (phase === GamePhase.ATTACK_SELECT) {
        const clickedAtk = game.attackTiles.find(t => t.x === gx && t.y === gy);
        if (clickedAtk) {
            executeAttack(gx, gy);
        } else {
            // Clicking a friendly unit tile shouldn't cancel the attack — ignore it
            const clickedUnit = getUnitAt(gx, gy);
            if (clickedUnit && clickedUnit.team === 'player') return;
            finishUnitAction();
        }
    }
}

function executeAttack(gx, gy) {
    const target = getUnitAt(gx, gy);
    if (!target) return;
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
        // Cain & Abel gets another attack — switch to ATTACK_SELECT so the next click
        // goes through that branch and doesn't accidentally reset attacksLeft again
        game.phase = GamePhase.ATTACK_SELECT;
        game.attackTiles = getAttackTiles(game.selectedUnit, game.selectedUnit.gx, game.selectedUnit.gy);
        if (game.attackTiles.length === 0) finishUnitAction();
    }
    checkVictoryDefeat();
}

function selectUnit(unit) {
    playSound('select');
    game.selectedUnit = unit;
    game.moveTiles = getMovementTiles(unit);
    game.attackTiles = getAttackTiles(unit, unit.gx, unit.gy);
    game.phase = GamePhase.UNIT_SELECTED;
    document.getElementById('btnAttack').style.display = 'none';
    document.getElementById('btnWait').style.display = game.attackTiles.length > 0 ? 'inline-block' : 'none';
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
        if (unit.type === 'paraplegicLarry') showBanner('TOO CLOSE!', 1000);
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
    game.pendingMoveTile = null;
    document.getElementById('moveConfirm').style.display = 'none';
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
    game.pendingMoveTile = null;
    document.getElementById('moveConfirm').style.display = 'none';
    game.phase = GamePhase.PLAYER_TURN;
    document.getElementById('btnAttack').style.display = 'none';
    document.getElementById('btnWait').style.display = 'none';
}

function confirmMove() {
    if (!game.pendingMoveTile || !game.selectedUnit) return;
    const { tx, ty } = game.pendingMoveTile;
    game.pendingMoveTile = null;
    document.getElementById('moveConfirm').style.display = 'none';
    moveUnit(game.selectedUnit, tx, ty);
}

function cancelMove() {
    game.pendingMoveTile = null;
    document.getElementById('moveConfirm').style.display = 'none';
    // Keep unit selected so player can choose a different tile
}

function positionMoveConfirm(gx, gy) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    let vpx = ((gx + 1) * TILE_SIZE + GRID_OFFSET_X) * scaleX + rect.left;
    let vpy = (gy * TILE_SIZE + GRID_OFFSET_Y) * scaleY + rect.top;
    // Clamp so panel doesn't go off screen
    vpx = Math.min(vpx, window.innerWidth - 125);
    vpy = Math.min(vpy, window.innerHeight - 80);
    const panel = document.getElementById('moveConfirm');
    panel.style.left = vpx + 'px';
    panel.style.top = vpy + 'px';
}

function endPlayerTurn() {
    if (game.phase === GamePhase.ENEMY_TURN || game.phase === GamePhase.CUTSCENE) return;
    if (game.phase === GamePhase.TETRIS) return;
    deselectUnit();
    game.phase = GamePhase.ENEMY_TURN;
    if (game.currentLevel !== 12) playMusic('enemyPhase');
    playSound('enemy_phase');
    showBanner('Enemy Phase', 1200);
    updateTopBar();
    setTimeout(doEnemyTurn, 1500);
}
