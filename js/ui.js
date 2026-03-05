// ============================================================
// UI & RENDERING
// ============================================================

function showUnitInfo(unit) {
    const panel = document.getElementById('unitInfo');
    if (!unit) { panel.style.display = 'none'; return; }
    panel.style.display = 'block';
    const label = unit.team === 'enemy' ? ' [ENEMY]' : unit.team === 'neutral' ? ' [NEUTRAL]' : '';
    document.getElementById('uiName').textContent = unit.name + label;
    document.getElementById('uiHP').textContent  = `HP: ${unit.hp}/${unit.maxHp}`;
    document.getElementById('uiATK').textContent = `ATK: ${unit.atk}  DEF: ${unit.def}`;
    document.getElementById('uiDEF').textContent = `MOV: ${unit.mov}  RNG: ${unit.range}`;
    document.getElementById('uiMOV').textContent = unit.isLarryDunk ? '★ TETRIS CAPTURE' : '';
    const specialEl = document.getElementById('uiSpecial');
    if (unit.special) {
        specialEl.textContent = `⚡ ${unit.special}`;
        specialEl.style.color = '#ffcc44';
    } else {
        specialEl.textContent = '';
    }
    document.getElementById('uiName').style.color = unit.team === 'player' ? '#88ccff' : '#ff8888';
}

function showTerrainInfo(terrain) {
    const panel = document.getElementById('unitInfo');
    if (!terrain || terrain === Terrain.PLAIN || terrain === Terrain.WALL || terrain === Terrain.WATER) {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'block';
    document.getElementById('uiName').textContent = terrain.name;
    document.getElementById('uiName').style.color = '#cccccc';
    document.getElementById('uiHP').textContent = '';
    document.getElementById('uiATK').textContent = terrain.defBonus > 0 ? `DEF Bonus: +${terrain.defBonus}` : 'DEF Bonus: none';
    document.getElementById('uiDEF').textContent = terrain.moveCost >= 99 ? 'Impassable' : `Move Cost: ${terrain.moveCost}`;
    document.getElementById('uiMOV').textContent = '';
    const specialEl = document.getElementById('uiSpecial');
    specialEl.style.color = '#aaa';
    if (terrain === Terrain.THRONE)       specialEl.textContent = '★ Heals 5 HP/turn';
    else if (terrain === Terrain.LAVA)    specialEl.textContent = '★ -1 HP/turn';
    else if (terrain === Terrain.PORTAL)  specialEl.textContent = '★ Dimensional rift';
    else if (terrain === Terrain.EXIT)    specialEl.textContent = '★ Escape point';
    else specialEl.textContent = '';
}

function showBanner(text, duration) {
    const banner = document.getElementById('turnBanner');
    banner.textContent = text;
    // Color by phase
    if (text.includes('Player')) {
        banner.style.color = '#88ccff';
        banner.style.textShadow = '0 0 30px rgba(80,160,255,0.9)';
        game.animations.push({ type: 'flash', color: '#0044aa', timer: 18 });
    } else if (text.includes('Enemy')) {
        banner.style.color = '#ff8888';
        banner.style.textShadow = '0 0 30px rgba(255,60,60,0.9)';
        game.animations.push({ type: 'flash', color: '#880000', timer: 18 });
    } else {
        banner.style.color = '#fff';
        banner.style.textShadow = '0 0 20px rgba(100,150,255,0.8)';
    }
    banner.classList.remove('banner-animate');
    void banner.offsetWidth; // force reflow to restart animation
    banner.classList.add('banner-animate');
    setTimeout(() => { banner.style.opacity = 0; banner.classList.remove('banner-animate'); }, duration || 1500);
}

function updateTopBar() {
    document.getElementById('turnInfo').textContent =
        game.phase === GamePhase.ENEMY_TURN ? 'Enemy Phase' : 'Player Phase';
    document.getElementById('turnCount').textContent = `Turn ${game.turn}`;
}

function updateAnimations() {
    for (let i = game.animations.length - 1; i >= 0; i--) {
        game.animations[i].timer--;
        if (game.animations[i].timer <= 0) game.animations.splice(i, 1);
    }
}

function render() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (game.phase === GamePhase.TITLE || game.phase === GamePhase.ENDING) return;

    // Draw grid
    for (let gy = 0; gy < game.gridH; gy++) {
        for (let gx = 0; gx < game.gridW; gx++) {
            const terrain = game.grid[gy][gx];
            const px = gx * TILE_SIZE + GRID_OFFSET_X;
            const py = gy * TILE_SIZE + GRID_OFFSET_Y;

            ctx.fillStyle = terrain.color;
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);

            // Terrain badge — show DEF bonus on tiles that have one
            if (terrain.defBonus > 0) {
                const label = `+${terrain.defBonus}`;
                ctx.font = 'bold 9px Courier New';
                ctx.textAlign = 'right';
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.fillRect(px + TILE_SIZE - 18, py + TILE_SIZE - 14, 17, 11);
                ctx.fillStyle = '#aaffcc';
                ctx.fillText(label, px + TILE_SIZE - 2, py + TILE_SIZE - 4);
                ctx.textAlign = 'left';
            }

            if (terrain === Terrain.PORTAL) {
                ctx.fillStyle = `rgba(150, 50, 200, ${0.3 + 0.2 * Math.sin(Date.now() / 300)})`;
                ctx.beginPath();
                ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
                ctx.fill();
            }
            if (terrain === Terrain.EXIT) {
                ctx.fillStyle = `rgba(255, 50, 50, ${0.3 + 0.2 * Math.sin(Date.now() / 400)})`;
                ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
            if (terrain === Terrain.STAIR) {
                ctx.strokeStyle = 'rgba(255,255,255,0.28)';
                ctx.lineWidth = 1;
                for (let s = 1; s <= 4; s++) {
                    const sy = py + s * (TILE_SIZE / 5);
                    ctx.beginPath();
                    ctx.moveTo(px + 3, sy);
                    ctx.lineTo(px + TILE_SIZE - 3, sy);
                    ctx.stroke();
                }
            }
        }
    }

    // Hover range indicator (show any hovered unit's movement + attack reach)
    if (game.hoveredUnit && game.hoveredUnit.alive &&
        game.phase !== GamePhase.ATTACK_SELECT && game.phase !== GamePhase.UNIT_SELECTED) {
        const hu = game.hoveredUnit;
        // Movement range — faint blue fill
        const moveTiles = getMovementTiles(hu);
        for (const t of moveTiles) {
            const px = t.x * TILE_SIZE + GRID_OFFSET_X;
            const py = t.y * TILE_SIZE + GRID_OFFSET_Y;
            ctx.fillStyle = hu.team === 'player'
                ? 'rgba(50, 130, 255, 0.12)'
                : 'rgba(255, 80, 30, 0.10)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
        // Attack range — slightly stronger overlay on top of movement
        const range = hu.range || 1;
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                if (Math.abs(dx) + Math.abs(dy) <= range && (dx !== 0 || dy !== 0)) {
                    const tx = hu.gx + dx, ty = hu.gy + dy;
                    if (tx >= 0 && ty >= 0 && tx < game.gridW && ty < game.gridH) {
                        const px = tx * TILE_SIZE + GRID_OFFSET_X;
                        const py = ty * TILE_SIZE + GRID_OFFSET_Y;
                        ctx.fillStyle = hu.team === 'player'
                            ? 'rgba(80, 180, 255, 0.18)'
                            : 'rgba(255, 100, 50, 0.18)';
                        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
        }
        // Border on the unit's own tile
        const hpx = hu.gx * TILE_SIZE + GRID_OFFSET_X;
        const hpy = hu.gy * TILE_SIZE + GRID_OFFSET_Y;
        ctx.strokeStyle = hu.team === 'player' ? 'rgba(80,180,255,0.5)' : 'rgba(255,100,50,0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(hpx + 1, hpy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.lineWidth = 1;
    }

    // Movement tiles
    if (game.phase === GamePhase.UNIT_SELECTED) {
        for (const t of game.moveTiles) {
            const px = t.x * TILE_SIZE + GRID_OFFSET_X;
            const py = t.y * TILE_SIZE + GRID_OFFSET_Y;
            ctx.fillStyle = 'rgba(50, 100, 255, 0.35)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
        // Attack range preview: show where the unit could attack from the hovered move tile
        const hoveredMove = game.moveTiles.find(t => t.x === game.cursor.x && t.y === game.cursor.y);
        if (hoveredMove && game.selectedUnit) {
            const unit = game.selectedUnit;
            const range = unit.range || 1;
            for (let dy = -range; dy <= range; dy++) {
                for (let dx = -range; dx <= range; dx++) {
                    const d = Math.abs(dx) + Math.abs(dy);
                    if (d >= 1 && d <= range) {
                        const ax = hoveredMove.x + dx, ay = hoveredMove.y + dy;
                        if (ax >= 0 && ay >= 0 && ax < game.gridW && ay < game.gridH) {
                            ctx.fillStyle = 'rgba(255, 80, 80, 0.22)';
                            ctx.fillRect(ax * TILE_SIZE + GRID_OFFSET_X, ay * TILE_SIZE + GRID_OFFSET_Y, TILE_SIZE, TILE_SIZE);
                        }
                    }
                }
            }
        }
        // Pending move tile: highlight chosen destination distinctly
        if (game.pendingMoveTile) {
            const { tx, ty } = game.pendingMoveTile;
            ctx.fillStyle = 'rgba(255, 240, 80, 0.3)';
            ctx.fillRect(tx * TILE_SIZE + GRID_OFFSET_X, ty * TILE_SIZE + GRID_OFFSET_Y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#ffffaa';
            ctx.lineWidth = 3;
            ctx.strokeRect(tx * TILE_SIZE + GRID_OFFSET_X + 1.5, ty * TILE_SIZE + GRID_OFFSET_Y + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
            ctx.lineWidth = 1;
        }
    }

    // Attack tiles
    if (game.phase === GamePhase.ATTACK_SELECT) {
        for (const t of game.attackTiles) {
            const px = t.x * TILE_SIZE + GRID_OFFSET_X;
            const py = t.y * TILE_SIZE + GRID_OFFSET_Y;
            ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
    }

    // Cursor
    if (game.phase !== GamePhase.CUTSCENE && game.phase !== GamePhase.ENEMY_TURN) {
        const cx = game.cursor.x * TILE_SIZE + GRID_OFFSET_X;
        const cy = game.cursor.y * TILE_SIZE + GRID_OFFSET_Y;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx + 1, cy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.lineWidth = 1;
    }

    // Units
    for (const unit of game.units) {
        if (!unit.alive) continue;
        const px = unit.gx * TILE_SIZE + GRID_OFFSET_X;
        const py = unit.gy * TILE_SIZE + GRID_OFFSET_Y;
        drawUnit(unit, px, py);
    }

    // Selected unit pulse glow
    if (game.selectedUnit && game.selectedUnit.alive) {
        const su = game.selectedUnit;
        const px = su.gx * TILE_SIZE + GRID_OFFSET_X;
        const py = su.gy * TILE_SIZE + GRID_OFFSET_Y;
        const pulse = 0.45 + 0.45 * Math.sin(Date.now() / 140);
        ctx.strokeStyle = `rgba(100, 200, 255, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.lineWidth = 1;
    }

    // Damage/death/hit/flash animations
    for (const anim of game.animations) {
        if (anim.type === 'flash') {
            ctx.globalAlpha = (anim.timer / 18) * 0.35;
            ctx.fillStyle = anim.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
        }
        if (anim.type === 'hitFlash') {
            ctx.globalAlpha = (anim.timer / 8) * 0.85;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(anim.x, anim.y, TILE_SIZE, TILE_SIZE);
            ctx.globalAlpha = 1;
        }
        if (anim.type === 'damage') {
            ctx.fillStyle = anim.color || '#ff4444';
            ctx.font = 'bold 20px Courier New';
            ctx.textAlign = 'center';
            const yOff = (60 - anim.timer) * 0.8;
            ctx.globalAlpha = Math.min(1, anim.timer / 20);
            ctx.fillText(anim.text, anim.x, anim.y - yOff);
            ctx.globalAlpha = 1;
        }
        if (anim.type === 'death') {
            const p = anim.timer / 40;
            ctx.globalAlpha = p;
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(anim.x - 4, anim.y - 4, TILE_SIZE + 8, TILE_SIZE + 8);
            ctx.globalAlpha = p * 0.6;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(anim.x, anim.y, TILE_SIZE, TILE_SIZE);
            ctx.globalAlpha = 1;
        }
    }

    // Cutscene dim — darken the world so the dialogue box reads clearly
    if (game.phase === GamePhase.CUTSCENE) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Tetris overlay (delegated to tetris.js)
    if (game.phase === GamePhase.TETRIS) {
        renderTetris();
    }
}

// ---- AD BREAK ----

function showAdBreak() {
    const overlay = document.getElementById('adBreakOverlay');
    const countdown = document.getElementById('adSkipCountdown');
    const skipBtn = document.getElementById('adSkipBtn');
    skipBtn.style.display = 'none';
    countdown.style.display = 'block';
    overlay.style.display = 'flex';

    playSound('ad_jingle');
    let count = 3;
    countdown.textContent = 'Skip ad in ' + count;
    if (game._adCountdownTimer) clearInterval(game._adCountdownTimer);
    game._adCountdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
            countdown.textContent = 'Skip ad in ' + count;
        } else {
            clearInterval(game._adCountdownTimer);
            game._adCountdownTimer = null;
            countdown.style.display = 'none';
            skipBtn.style.display = 'inline-block';
        }
    }, 1000);
}

function skipAdBreak() {
    document.getElementById('adBreakOverlay').style.display = 'none';
    if (game._adCountdownTimer) {
        clearInterval(game._adCountdownTimer);
        game._adCountdownTimer = null;
    }
    if (!game.pendingAdBreak) return;

    const { attacker, defender, isChain } = game.pendingAdBreak;
    game.pendingAdBreak = null;

    // Restore to a neutral phase before resolving (_resolveCombat may set TETRIS)
    game.phase = GamePhase.PLAYER_TURN;
    _resolveCombat(attacker, defender, isChain);
    checkVictoryDefeat();

    // Finish the player's action unless Tetris or game-over took over
    if (game.phase !== GamePhase.TETRIS &&
        game.phase !== GamePhase.VICTORY &&
        game.phase !== GamePhase.DEFEAT) {
        finishUnitAction();
    }
}
