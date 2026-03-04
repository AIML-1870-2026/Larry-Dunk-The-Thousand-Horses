// ============================================================
// ENEMY AI
// ============================================================

function doEnemyTurn() {
    const enemies = game.units.filter(u => u.alive && u.team === 'enemy' && !u.acted);

    if (enemies.length === 0) {
        endEnemyTurn();
        return;
    }

    let delay = 0;
    for (const enemy of enemies) {
        delay += 500;
        setTimeout(() => doEnemyAction(enemy), delay);
    }
    setTimeout(() => endEnemyTurn(), delay + 600);
}

function doEnemyAction(enemy) {
    if (!enemy.alive) return;

    // Special: Mr. Runo runs toward exit in his office level
    if (enemy.type === 'mrRuno' && game.currentLevel === 11) {
        const exitTiles = [];
        for (let gy = 0; gy < game.gridH; gy++) {
            for (let gx = 0; gx < game.gridW; gx++) {
                if (game.grid[gy][gx] === Terrain.EXIT) exitTiles.push({ x: gx, y: gy });
            }
        }
        if (exitTiles.length > 0) {
            const target = exitTiles[0];
            const moveTiles = getMovementTiles(enemy);
            let bestTile = null;
            let bestDist = Infinity;
            for (const t of moveTiles) {
                const d = getManhattan(t.x, t.y, target.x, target.y);
                if (d < bestDist) { bestDist = d; bestTile = t; }
            }
            if (bestTile) {
                enemy.gx = bestTile.x;
                enemy.gy = bestTile.y;
            }
            if (enemy.gx === target.x && enemy.gy === target.y) {
                showBanner('Mr. Runo escaped!', 2000);
                game.phase = GamePhase.DEFEAT;
                setTimeout(() => {
                    document.getElementById('defeatScreen').style.display = 'flex';
                }, 2200);
                return;
            }
        }
        enemy.acted = true;
        return;
    }

    // Find closest player unit — skip invisible units (Cereal Mascot Larry)
    const playerUnits = game.units.filter(u => u.alive && u.team === 'player' && !u.invisible);
    if (playerUnits.length === 0) return;

    let closestTarget = null;
    let closestDist = Infinity;
    for (const pu of playerUnits) {
        const d = getManhattan(enemy.gx, enemy.gy, pu.gx, pu.gy);
        if (d < closestDist) { closestDist = d; closestTarget = pu; }
    }

    // Attack if in range — skip invisible units (Cereal Mascot Larry)
    const atkTiles = getAttackTiles(enemy, enemy.gx, enemy.gy);
    if (atkTiles.length > 0) {
        let weakest = null;
        for (const at of atkTiles) {
            const t = getUnitAt(at.x, at.y);
            if (t && !t.invisible && (!weakest || t.hp < weakest.hp)) weakest = t;
        }
        if (weakest) {
            doCombat(enemy, weakest);
            enemy.acted = true;
            checkVictoryDefeat();
            return;
        }
    }

    // Move toward closest target
    if (enemy.mov > 0) {
        const moveTiles = getMovementTiles(enemy);
        let bestTile = null;
        let bestDist2 = Infinity;
        for (const t of moveTiles) {
            const d = getManhattan(t.x, t.y, closestTarget.gx, closestTarget.gy);
            if (d < bestDist2) { bestDist2 = d; bestTile = t; }
        }
        if (bestTile) {
            enemy.gx = bestTile.x;
            enemy.gy = bestTile.y;
        }

        // Try attack after moving
        const atkTiles2 = getAttackTiles(enemy, enemy.gx, enemy.gy);
        if (atkTiles2.length > 0) {
            let weakest = null;
            for (const at of atkTiles2) {
                const t = getUnitAt(at.x, at.y);
                if (t && !t.invisible && (!weakest || t.hp < weakest.hp)) weakest = t;
            }
            if (weakest) doCombat(enemy, weakest);
        }
    }

    enemy.acted = true;
    checkVictoryDefeat();
}

function endEnemyTurn() {
    if (game.phase === GamePhase.VICTORY || game.phase === GamePhase.DEFEAT) return;
    if (game.phase === GamePhase.TETRIS) return; // counterattack triggered Tetris — wait for it to resolve

    game.turn++;
    game.units.forEach(u => {
        u.acted = false;
        // Reset Spray Tan debuff — restores range for next player turn
        if (u.sprayTanned) {
            u.range++;
            u.sprayTanned = false;
        }
        // Terrain effects at turn start
        if (u.alive) {
            const terrain = getTerrain(u.gx, u.gy);
            if (terrain === Terrain.LAVA) {
                u.hp = Math.max(1, u.hp - 2);   // LAVA: 2 damage/turn (min 1 HP — can't die from terrain)
            } else if (terrain === Terrain.FOREST) {
                u.hp = Math.min(u.maxHp, u.hp + 1);  // FOREST: heal 1 HP/turn
            } else if (terrain === Terrain.THRONE) {
                u.hp = Math.min(u.maxHp, u.hp + 2);  // THRONE: heal 2 HP/turn
            }
        }
    });
    game.phase = GamePhase.PLAYER_TURN;
    playSound('player_phase');
    showBanner('Player Phase', 1200);
    updateTopBar();
    checkTurnEvents();
}
