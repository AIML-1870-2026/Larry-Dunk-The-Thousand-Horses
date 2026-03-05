// ============================================================
// COMBAT
// When a Larry Dunk unit hits 0 HP, triggers Tetris instead of death.
//
// Variant abilities implemented here:
//   Spray Tan (larryDunk, britishLarry): surviving defender + adjacent enemies
//     lose 1 range for 1 turn (sprayTanned flag; reset in endEnemyTurn)
//   Cannibalism (financierLarry): heals attacker by damage dealt
//   Chain Kill (axeLarry): killing a non-Larry unit gives 1 free attack on
//     the nearest adjacent enemy (isChain flag prevents infinite recursion)
//   Ad Break (investmentLarry, player only): triggers ad overlay before damage;
//     deferred via game.pendingAdBreak + showAdBreak() in ui.js
// ============================================================

// Public entry point — intercepts Ad Break for player investmentLarry
function doCombat(attacker, defender, isChain) {
    isChain = isChain || false;
    if (attacker.type === 'investmentLarry' && attacker.team === 'player') {
        game.pendingAdBreak = { attacker, defender, isChain };
        game.phase = GamePhase.AD_BREAK;
        showAdBreak();
        return;
    }
    _resolveCombat(attacker, defender, isChain);
}

// Internal — actual damage resolution (also called by skipAdBreak after ad dismissal)
function _resolveCombat(attacker, defender, isChain) {
    isChain = isChain || false;
    const terrain = getTerrain(defender.gx, defender.gy);
    const dmg = Math.max(1, attacker.atk - defender.def - terrain.defBonus);
    defender.hp -= dmg;

    playSound('hit');

    // Hit flash on the defender tile
    game.animations.push({
        type: 'hitFlash',
        x: defender.gx * TILE_SIZE + GRID_OFFSET_X,
        y: defender.gy * TILE_SIZE + GRID_OFFSET_Y,
        timer: 8
    });

    const dmgColor = '#ff4444';
    game.animations.push({
        type: 'damage',
        x: defender.gx * TILE_SIZE + GRID_OFFSET_X + TILE_SIZE / 2,
        y: defender.gy * TILE_SIZE + GRID_OFFSET_Y,
        text: `-${dmg}`,
        timer: 60,
        color: dmgColor
    });

    // Financier Larry — cannibalism: heals HP equal to damage dealt
    if (attacker.type === 'financierLarry') {
        const healed = Math.min(dmg, attacker.maxHp - attacker.hp);
        attacker.hp += healed;
        if (healed > 0) {
            showBanner('CANNIBALISM!', 1000);
            game.animations.push({
                type: 'damage',
                x: attacker.gx * TILE_SIZE + GRID_OFFSET_X + TILE_SIZE / 2,
                y: attacker.gy * TILE_SIZE + GRID_OFFSET_Y,
                text: `+${healed}`,
                timer: 60,
                color: '#44ff88'
            });
        }
    }

    if (defender.hp <= 0) {
        defender.hp = 0;

        if (defender.isLarryDunk && defender.team === 'enemy') {
            // Keep alive until Tetris resolves; startTetrisCapture sets phase internally
            defender.hp = 1;
            attacker.acted = true; // mark attacker done now (finishUnitAction won't run)
            startTetrisCapture(defender);
        } else {
            defender.alive = false;
            playSound('death');
            game.animations.push({
                type: 'death',
                x: defender.gx * TILE_SIZE + GRID_OFFSET_X,
                y: defender.gy * TILE_SIZE + GRID_OFFSET_Y,
                timer: 40
            });

            // Axe Murderer chain kill — one free attack on adjacent enemy after kill
            // (isChain prevents chaining from chains)
            if (!isChain && attacker.type === 'axeLarry' && attacker.alive) {
                const chainTarget = game.units.find(u =>
                    u.alive && u.team !== attacker.team &&
                    getManhattan(attacker.gx, attacker.gy, u.gx, u.gy) <= (attacker.range || 1)
                );
                if (chainTarget) {
                    showBanner('CHAIN KILL!', 1200);
                    setTimeout(() => {
                        if (attacker.alive && chainTarget.alive) doCombat(attacker, chainTarget, true);
                    }, 500);
                }
            }
        }
    } else {
        // Defender survived

        // Spray Tan blind — Larry Dunk and British Larry: defender + adjacent enemies
        // lose 1 range for the rest of this turn (resets at start of next player turn)
        if (attacker.type === 'larryDunk' || attacker.type === 'britishLarry') {
            const blinded = game.units.filter(u =>
                u.alive && u.team !== attacker.team &&
                getManhattan(u.gx, u.gy, defender.gx, defender.gy) <= 1
            );
            if (blinded.length > 0) showBanner('SPRAY TAN!', 1200);
            blinded.forEach(u => {
                if (!u.sprayTanned) {
                    u.range = Math.max(1, u.range - 1);
                    u.sprayTanned = true;
                }
            });
        }

        // Counterattack (only if defender survives and attacker is in range)
        // Counterattacks cannot kill — attacker always survives with at least 1 HP
        if (getManhattan(attacker.gx, attacker.gy, defender.gx, defender.gy) <= (defender.range || 1)) {
            const cTerrain = getTerrain(attacker.gx, attacker.gy);
            const cDmg = Math.max(1, defender.atk - attacker.def - cTerrain.defBonus);
            const rawHp = attacker.hp - cDmg;
            attacker.hp = Math.max(1, rawHp);
            game.animations.push({
                type: 'hitFlash',
                x: attacker.gx * TILE_SIZE + GRID_OFFSET_X,
                y: attacker.gy * TILE_SIZE + GRID_OFFSET_Y,
                timer: 8
            });
            game.animations.push({
                type: 'damage',
                x: attacker.gx * TILE_SIZE + GRID_OFFSET_X + TILE_SIZE / 2,
                y: attacker.gy * TILE_SIZE + GRID_OFFSET_Y,
                text: `-${cDmg}`,
                timer: 60,
                color: '#ffaa44'
            });
            if (rawHp <= 0) showBanner('SURVIVED!', 900);
        }
    }
}
