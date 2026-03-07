// ============================================================
// TETRIS CAPTURE MINIGAME
// Triggered when a Larry Dunk unit hits 0 HP.
// startTetrisCapture(unit, options)
//   options.rigged = true  → impossible board (Zeus forced fail)
// ============================================================

const TETRIS_CONFIG = {
    cols: 10,
    rows: 20,
    tileSize: 24,
    boardX: 300,                     // shifted left to make room for sidebar
    get boardY() { return (640 - this.rows * this.tileSize) / 2; },
    get boardW() { return this.cols * this.tileSize; },
    get boardH() { return this.rows * this.tileSize; }
};

const TETROMINOS = {
    I: { color: '#0ff', glow: 'rgba(0,255,255,0.5)',   cells: [[0,1],[1,1],[2,1],[3,1]] },
    O: { color: '#ff0', glow: 'rgba(255,240,0,0.5)',   cells: [[0,0],[1,0],[0,1],[1,1]] },
    T: { color: '#c06eff', glow: 'rgba(180,80,255,0.5)', cells: [[1,0],[0,1],[1,1],[2,1]] },
    S: { color: '#0f0', glow: 'rgba(0,255,80,0.5)',    cells: [[1,0],[2,0],[0,1],[1,1]] },
    Z: { color: '#f44', glow: 'rgba(255,60,60,0.5)',   cells: [[0,0],[1,0],[1,1],[2,1]] },
    J: { color: '#55f', glow: 'rgba(80,80,255,0.5)',   cells: [[0,0],[0,1],[1,1],[2,1]] },
    L: { color: '#f80', glow: 'rgba(255,140,0,0.5)',   cells: [[2,0],[0,1],[1,1],[2,1]] }
};

const TETROMINO_KEYS = Object.keys(TETROMINOS);

// Rigged piece sequence — tall and awkward, can't clear lines
const RIGGED_SEQUENCE = ['S', 'Z', 'S', 'Z', 'I', 'S', 'Z', 'S', 'Z', 'S', 'Z'];

let tetris = {
    active: false,
    unit: null,
    rigged: false,
    board: [],
    currentPiece: null,
    nextPieceKey: null,
    score: 0,
    threshold: 0,
    dropInterval: null,
    riggedIndex: 0,
    rivalArrived: false,
    gameOver: false,
    onSuccess: null,
    onFail: null,
    lineFlashTimer: 0,
    winFlashTimer: 0,
    particles: []
};

// ---- THRESHOLDS ----
function getTetrisThreshold(unit) {
    if (unit.type === 'mrRuno')   return 800;
    if (unit.type === 'cainAbel') return 100;
    return 200;
}

// ---- ENTRY POINT ----
function startTetrisCapture(unit, options = {}) {
    if (game.currentLevel !== 12) playMusic('tetris');
    tetris.active = true;
    tetris.unit = unit;
    tetris.rigged = options.rigged || false;
    tetris.board = Array.from({ length: TETRIS_CONFIG.rows }, () => Array(TETRIS_CONFIG.cols).fill(null));
    tetris.score = 0;
    tetris.threshold = getTetrisThreshold(unit);
    tetris.riggedIndex = 0;
    tetris.rivalArrived = false;
    tetris.gameOver = false;
    tetris.lineFlashTimer = 0;
    tetris.winFlashTimer = 0;
    tetris.particles = [];
    tetris.nextPieceKey = _pickNextKey();

    tetris.onSuccess = () => {
        playSound('tetris_success');
        if (unit.type === 'mrRuno') {
            unit.alive = false;
            endTetris();
            startCutscene([
                { speaker: 'MR. RUNO', text: '*the chip shatters against his biceps* ...I felt a tingle.', color: '#2a2' },
                { speaker: 'HARAS', text: '...', color: '#88f' },
                { speaker: 'NARRATOR', text: 'Mr. Runo cannot be chipped. He escapes permanently.', color: '#aaa' },
                { speaker: 'HARAS', text: 'Doesn\'t matter. I don\'t need his brain. I just needed him stopped.', color: '#88f' }
            ], () => {
                game.phase = GamePhase.PLAYER_TURN;
                checkVictoryDefeat();
            });
            return;
        }
        if (!game.capturedLarryDunks.includes(unit.type)) game.capturedLarryDunks.push(unit.type);
        unit.hp = 1;
        unit.alive = true;
        unit.team = 'player';
        unit.acted = true;
        endTetris();
        startCutscene([
            { speaker: 'HARAS', text: 'Chip implanted. Welcome to the team.', color: '#88f' },
            { speaker: unit.name.toUpperCase(), text: '...yes... master...', color: '#f80' }
        ], () => {
            game.phase = GamePhase.PLAYER_TURN;
            checkVictoryDefeat();
        });
    };

    tetris.onFail = () => {
        playSound('tetris_fail');
        endTetris();
        if (tetris.rigged) {
            startCutscene([
                { speaker: 'NARRATOR', text: 'The board shifts. The pieces are wrong. Something is rigged.', color: '#aaa' },
                { speaker: 'RIVAL HARAS', text: 'Step aside.', color: '#f44' },
                { speaker: 'NARRATOR', text: 'A rival Haras, guided by Zeus\'s lightning coordinates, steps through a portal and snatches Zeus Larry Dunk.', color: '#f44' },
                { speaker: 'ZEUS LARRY DUNK', text: 'YES! This is the Haras I wanted!', color: '#ff0' },
                { speaker: 'HARAS', text: '...', color: '#88f' },
                { speaker: 'HARAS', text: 'The horses. Use the horses. NOW.', color: '#f44' },
                { speaker: 'NARRATOR', text: 'Three more rival Harases emerge from separate portals. All guided by the same coordinates. All wanting the same thing.', color: '#f44' },
                { speaker: 'RIVAL HARAS', text: 'Those horses are MINE. I was here first.', color: '#f44' },
                { speaker: 'RIVAL HARAS', text: 'Your coordinates came from MY lightning read. Step BACK.', color: '#f44' },
                { speaker: 'NARRATOR', text: 'Zeus, passed between rivals like a prize, issues contradictory commands to the horse army.', color: '#aaa' },
                { speaker: 'ZEUS LARRY DUNK', text: 'TRAMPLE HIM — no — THAT ONE — ALL OF THEM — WAIT —', color: '#ff0' },
                { speaker: 'NARRATOR', text: 'The thousand horses receive five different orders in three seconds.', color: '#aaa' },
                { speaker: 'NARRATOR', text: 'The horses begin attacking everyone indiscriminately.', color: '#f44' },
                { speaker: 'CAIN & ABEL', text: 'The rivals are fighting each other. We have assessed this. This is the window.', color: '#e90' },
                { speaker: 'HARAS', text: 'Loyal horse. Find me.', color: '#88f' }
            ], () => {
                const zeus = game.units.find(u => u.type === 'zeusLarry');
                if (zeus) zeus.alive = false;
                loadLevel(13);
            });
        } else if (unit.type === 'mrRuno') {
            unit.alive = false;
            startCutscene([
                { speaker: 'MR. RUNO', text: '*tears the chip device apart with his biceps* Not today.', color: '#2a2' },
                { speaker: 'NARRATOR', text: 'Mr. Runo escapes. He cannot be recaptured in this run.', color: '#aaa' },
                { speaker: 'HARAS', text: '...', color: '#88f' }
            ], () => {
                game.phase = GamePhase.PLAYER_TURN;
                checkVictoryDefeat();
            });
        } else {
            unit.hp = Math.ceil(unit.maxHp * 0.2);
            unit.alive = true;
            startCutscene([
                { speaker: 'NARRATOR', text: 'The chip implant failed. Larry Dunk recovers.', color: '#aaa' },
                { speaker: 'HARAS', text: 'Try again.', color: '#88f' }
            ], () => {
                game.phase = GamePhase.PLAYER_TURN;
            });
        }
    };

    game.phase = GamePhase.TETRIS;
    document.getElementById('btnEndTurn').style.display = 'none';
    spawnTetrisPiece();
    startTetrisDrop();

    if (tetris.rigged) {
        setTimeout(() => {
            if (tetris.active) {
                tetris.rivalArrived = true;
                tetris.gameOver = true;
                stopTetrisDrop();
                setTimeout(() => tetris.onFail(), 800);
            }
        }, 15000);
    }
}

// ---- PIECE MANAGEMENT ----
function _pickNextKey() {
    if (tetris.rigged) {
        const k = RIGGED_SEQUENCE[tetris.riggedIndex % RIGGED_SEQUENCE.length];
        tetris.riggedIndex++;
        return k;
    }
    return TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
}

function spawnTetrisPiece() {
    const key = tetris.nextPieceKey || _pickNextKey();
    const tmino = TETROMINOS[key];
    tetris.currentPiece = {
        key,
        color: tmino.color,
        glow: tmino.glow,
        cells: tmino.cells.map(([x, y]) => [x + 3, y]),
        locked: false
    };
    tetris.nextPieceKey = _pickNextKey();
}

function rotatePiece() {
    if (!tetris.currentPiece) return;
    const cells = tetris.currentPiece.cells;
    const cx = cells.reduce((s, [x]) => s + x, 0) / cells.length;
    const cy = cells.reduce((s, [, y]) => s + y, 0) / cells.length;
    const rotated = cells.map(([x, y]) => [
        Math.round(cx + (y - cy)),
        Math.round(cy - (x - cx))
    ]);
    if (!collidesBoard(rotated)) tetris.currentPiece.cells = rotated;
}

function movePiece(dx, dy) {
    if (!tetris.currentPiece) return false;
    const moved = tetris.currentPiece.cells.map(([x, y]) => [x + dx, y + dy]);
    if (collidesBoard(moved)) return false;
    tetris.currentPiece.cells = moved;
    return true;
}

function collidesBoard(cells) {
    for (const [x, y] of cells) {
        if (x < 0 || x >= TETRIS_CONFIG.cols) return true;
        if (y >= TETRIS_CONFIG.rows) return true;
        if (y >= 0 && tetris.board[y][x]) return true;
    }
    return false;
}

function getGhostCells() {
    if (!tetris.currentPiece || tetris.gameOver) return [];
    let cells = tetris.currentPiece.cells.map(([x, y]) => [x, y]);
    while (true) {
        const moved = cells.map(([x, y]) => [x, y + 1]);
        if (collidesBoard(moved)) break;
        cells = moved;
    }
    return cells;
}

function lockPiece() {
    const { boardX, boardY, tileSize } = TETRIS_CONFIG;
    for (const [x, y] of tetris.currentPiece.cells) {
        if (y >= 0) {
            tetris.board[y][x] = tetris.currentPiece.color;
            // Spawn lock particles
            for (let i = 0; i < 4; i++) {
                tetris.particles.push({
                    x: boardX + x * tileSize + tileSize / 2,
                    y: boardY + y * tileSize + tileSize / 2,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -Math.random() * 3,
                    color: tetris.currentPiece.color,
                    life: 22 + Math.floor(Math.random() * 14)
                });
            }
        }
    }
    playSound('tetris_place');
    clearLines();
    if (tetris.gameOver) return; // onSuccess already queued — don't also trigger onFail
    spawnTetrisPiece();

    if (collidesBoard(tetris.currentPiece.cells)) {
        tetris.gameOver = true;
        stopTetrisDrop();
        setTimeout(() => tetris.onFail(), 600);
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let y = TETRIS_CONFIG.rows - 1; y >= 0; y--) {
        if (tetris.board[y].every(cell => cell !== null)) {
            tetris.board.splice(y, 1);
            tetris.board.unshift(Array(TETRIS_CONFIG.cols).fill(null));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        playSound('tetris_clear');
        tetris.lineFlashTimer = 12;
        const points = [0, 100, 300, 500, 800][Math.min(linesCleared, 4)];
        tetris.score += points;
        if (tetris.score >= tetris.threshold && !tetris.rigged) {
            tetris.gameOver = true;
            stopTetrisDrop();
            tetris.winFlashTimer = 30; // white win flash for ~0.5s at 60fps
            setTimeout(() => tetris.onSuccess(), 800);
        } else {
            startTetrisDrop();
        }
    }
}

// ---- DROP LOOP ----
function _tetrisDropSpeed() {
    if (tetris.rigged) return 600;
    return Math.max(150, 800 - Math.floor(tetris.score / 50) * 50);
}

function startTetrisDrop() {
    stopTetrisDrop();
    tetris.dropInterval = setInterval(() => {
        if (tetris.gameOver) return;
        if (!movePiece(0, 1)) lockPiece();
    }, _tetrisDropSpeed());
}

function stopTetrisDrop() {
    if (tetris.dropInterval) {
        clearInterval(tetris.dropInterval);
        tetris.dropInterval = null;
    }
}

function endTetris() {
    tetris.active = false;
    stopTetrisDrop();
    if (game.currentLevel !== 12) playMusic('playerPhase');
    document.getElementById('btnEndTurn').style.display = 'inline-block';
}

// ---- INPUT ----
function handleTetrisClick(e) {
    if (tetris.gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    if (mx < canvas.width / 2) movePiece(-1, 0);
    else movePiece(1, 0);
}

document.addEventListener('keydown', (e) => {
    if (game.phase !== GamePhase.TETRIS || tetris.gameOver) return;
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') movePiece(-1, 0);
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') movePiece(1, 0);
    if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') movePiece(0, 1);
    if (e.key === 'ArrowUp'    || e.key === 'w' || e.key === 'W' || e.key === 'z' || e.key === 'Z') rotatePiece();
    if (e.key === ' ') { while (movePiece(0, 1)) {} lockPiece(); }
    e.preventDefault();
});

// ---- RENDER ----
function _drawTetrisCell(px, py, color, alpha, glow) {
    const ts = TETRIS_CONFIG.tileSize;
    ctx.globalAlpha = alpha;
    if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 8;
    }
    ctx.fillStyle = color;
    ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);
    // Bevel highlight top/left
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(px + 1, py + 1, ts - 2, 3);
    ctx.fillRect(px + 1, py + 1, 3, ts - 2);
    // Bevel shadow bottom/right
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(px + 1, py + ts - 4, ts - 2, 3);
    ctx.fillRect(px + ts - 4, py + 1, 3, ts - 2);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
}

function renderTetris() {
    const { boardX, boardY, boardW, boardH, tileSize, cols, rows } = TETRIS_CONFIG;

    // ---- Full screen dim ----
    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Atmospheric radial glow behind board
    const grd = ctx.createRadialGradient(boardX + boardW / 2, boardY + boardH / 2, 40, boardX + boardW / 2, boardY + boardH / 2, 340);
    grd.addColorStop(0, 'rgba(30,10,60,0.6)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ---- LEFT INFO PANEL ----
    const panelX = 20;
    const panelW = boardX - 36;
    const panelMid = panelX + panelW / 2;

    // Panel bg
    ctx.fillStyle = 'rgba(10,8,30,0.75)';
    ctx.strokeStyle = 'rgba(80,60,140,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(panelX, boardY, panelW, boardH, 6);
    ctx.fill();
    ctx.stroke();

    // "CHIP IMPLANT" header
    ctx.font = 'bold 11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc44';
    ctx.fillText('CHIP IMPLANT', panelMid, boardY + 22);

    // Unit name
    ctx.font = 'bold 10px Courier New';
    ctx.fillStyle = '#88ccff';
    const unitName = tetris.unit ? tetris.unit.name.toUpperCase() : '';
    // word-wrap long names
    const words = unitName.split(' ');
    let line = '', lineY = boardY + 40;
    for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > panelW - 8) {
            ctx.fillText(line, panelMid, lineY); lineY += 13; line = word;
        } else { line = test; }
    }
    if (line) { ctx.fillText(line, panelMid, lineY); lineY += 13; }

    // Score label
    lineY += 10;
    ctx.font = '10px Courier New';
    ctx.fillStyle = '#aaa';
    ctx.fillText('SCORE', panelMid, lineY);
    lineY += 16;
    ctx.font = 'bold 20px Courier New';
    ctx.fillStyle = '#fff';
    ctx.fillText(tetris.score, panelMid, lineY);
    lineY += 10;

    // Progress bar
    lineY += 12;
    ctx.font = '10px Courier New';
    ctx.fillStyle = '#aaa';
    ctx.fillText(tetris.rigged ? 'TARGET: ???' : `TARGET: ${tetris.threshold}`, panelMid, lineY);
    lineY += 8;
    const barW = panelW - 20;
    const barX = panelX + 10;
    const prog = tetris.rigged ? 0 : Math.min(1, tetris.score / tetris.threshold);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(barX, lineY, barW, 12);
    if (prog > 0) {
        const barGrd = ctx.createLinearGradient(barX, 0, barX + barW * prog, 0);
        barGrd.addColorStop(0, '#446622');
        barGrd.addColorStop(0.6, '#66cc33');
        barGrd.addColorStop(1, '#88ff44');
        ctx.fillStyle = barGrd;
        ctx.fillRect(barX, lineY, barW * prog, 12);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, lineY, barW, 12);
    lineY += 22;

    // Speed label
    if (!tetris.rigged) {
        const speed = _tetrisDropSpeed();
        const speedPct = Math.round((1 - (speed - 150) / 650) * 100);
        ctx.font = '10px Courier New';
        ctx.fillStyle = '#888';
        ctx.fillText(`SPEED: ${speedPct}%`, panelMid, lineY);
    } else {
        ctx.font = 'bold 10px Courier New';
        ctx.fillStyle = '#f44';
        ctx.fillText('⚡ RIGGED ⚡', panelMid, lineY);
    }

    // ---- BOARD ----

    // Board background
    ctx.fillStyle = '#090812';
    ctx.fillRect(boardX, boardY, boardW, boardH);

    // Line clear flash
    if (tetris.lineFlashTimer > 0) {
        const alpha = (tetris.lineFlashTimer / 12) * 0.55;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(boardX, boardY, boardW, boardH);
        tetris.lineFlashTimer--;
    }

    // Win flash — gold/green when threshold reached
    if (tetris.winFlashTimer > 0) {
        const wAlpha = (tetris.winFlashTimer / 30) * 0.7;
        ctx.fillStyle = `rgba(80,255,140,${wAlpha})`;
        ctx.fillRect(boardX, boardY, boardW, boardH);
        tetris.winFlashTimer--;
        // "CAPTURED!" text
        ctx.save();
        ctx.font = `bold ${Math.round(28 + (30 - tetris.winFlashTimer) * 0.5)}px Courier New`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255,255,255,${wAlpha * 1.3})`;
        ctx.shadowColor = '#44ff88';
        ctx.shadowBlur = 20;
        ctx.fillText('CAPTURED!', boardX + boardW / 2, boardY + boardH / 2);
        ctx.restore();
    }

    // Locked cells
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (tetris.board[y][x]) {
                _drawTetrisCell(boardX + x * tileSize, boardY + y * tileSize, tetris.board[y][x], 1, null);
            }
        }
    }

    // Ghost piece
    if (!tetris.gameOver) {
        const ghost = getGhostCells();
        for (const [x, y] of ghost) {
            if (y >= 0) {
                ctx.globalAlpha = 0.22;
                ctx.fillStyle = tetris.currentPiece.color;
                ctx.fillRect(boardX + x * tileSize + 1, boardY + y * tileSize + 1, tileSize - 2, tileSize - 2);
                ctx.globalAlpha = 1;
            }
        }
    }

    // Current piece
    if (tetris.currentPiece && !tetris.gameOver) {
        for (const [x, y] of tetris.currentPiece.cells) {
            if (y >= 0) {
                _drawTetrisCell(boardX + x * tileSize, boardY + y * tileSize, tetris.currentPiece.color, 1, tetris.currentPiece.glow);
            }
        }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
        ctx.beginPath(); ctx.moveTo(boardX + x * tileSize, boardY);
        ctx.lineTo(boardX + x * tileSize, boardY + boardH); ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
        ctx.beginPath(); ctx.moveTo(boardX, boardY + y * tileSize);
        ctx.lineTo(boardX + boardW, boardY + y * tileSize); ctx.stroke();
    }

    // Board border glow
    ctx.shadowColor = tetris.rigged ? 'rgba(255,40,40,0.8)' : 'rgba(80,80,255,0.7)';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = tetris.rigged ? '#f44' : '#55f';
    ctx.lineWidth = 2;
    ctx.strokeRect(boardX - 1, boardY - 1, boardW + 2, boardH + 2);
    ctx.shadowBlur = 0;

    // Particles
    for (let i = tetris.particles.length - 1; i >= 0; i--) {
        const p = tetris.particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--;
        if (p.life <= 0) { tetris.particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life / 36;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        ctx.globalAlpha = 1;
    }

    // ---- RIGHT SIDEBAR — next piece + controls ----
    const sideX = boardX + boardW + 16;
    const sideW = canvas.width - sideX - 20;
    const sideH = boardH;

    ctx.fillStyle = 'rgba(10,8,30,0.75)';
    ctx.strokeStyle = 'rgba(80,60,140,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(sideX, boardY, sideW, sideH, 6);
    ctx.fill();
    ctx.stroke();

    const sideMid = sideX + sideW / 2;

    // Next piece label
    ctx.font = 'bold 11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc44';
    ctx.fillText('NEXT', sideMid, boardY + 22);

    // Next piece preview
    if (tetris.nextPieceKey) {
        const npTmino = TETROMINOS[tetris.nextPieceKey];
        const previewTile = 18;
        const previewCx = sideMid;
        const previewCy = boardY + 58;
        const cells = npTmino.cells;
        const minX = Math.min(...cells.map(([x]) => x));
        const minY = Math.min(...cells.map(([, y]) => y));
        for (const [x, y] of cells) {
            const px = previewCx + (x - minX - 1) * previewTile - previewTile / 2;
            const py = previewCy + (y - minY) * previewTile;
            ctx.shadowColor = npTmino.glow;
            ctx.shadowBlur = 8;
            ctx.fillStyle = npTmino.color;
            ctx.fillRect(px + 1, py + 1, previewTile - 2, previewTile - 2);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(px + 1, py + 1, previewTile - 2, 3);
            ctx.shadowBlur = 0;
        }
    }

    // Controls guide
    const ctrlY = boardY + 120;
    const controls = [
        ['MOVE', '← →  /  A D'],
        ['ROTATE', '↑  /  W  /  Z'],
        ['SOFT DROP', '↓  /  S'],
        ['HARD DROP', 'SPACE'],
    ];
    ctx.font = 'bold 10px Courier New';
    ctx.fillStyle = '#888';
    ctx.fillText('CONTROLS', sideMid, ctrlY);
    let cy = ctrlY + 14;
    for (const [label, key] of controls) {
        ctx.font = '9px Courier New';
        ctx.fillStyle = '#555';
        ctx.fillText(label, sideMid, cy);
        cy += 12;
        ctx.font = 'bold 10px Courier New';
        ctx.fillStyle = '#aaccff';
        ctx.fillText(key, sideMid, cy);
        cy += 16;
    }

    // Ability reminder
    cy += 6;
    if (tetris.unit) {
        ctx.font = '9px Courier New';
        ctx.fillStyle = '#664444';
        ctx.fillText('CAPTURING', sideMid, cy);
        cy += 13;
        ctx.font = 'bold 9px Courier New';
        ctx.fillStyle = '#ff8888';
        // wrap name
        const words2 = tetris.unit.name.toUpperCase().split(' ');
        let ln = '';
        for (const w of words2) {
            const test = ln ? ln + ' ' + w : w;
            if (ctx.measureText(test).width > sideW - 10) {
                ctx.fillText(ln, sideMid, cy); cy += 12; ln = w;
            } else { ln = test; }
        }
        if (ln) { ctx.fillText(ln, sideMid, cy); cy += 12; }
        if (tetris.unit.special) {
            cy += 4;
            ctx.font = '9px Courier New';
            ctx.fillStyle = '#aaa';
            ctx.fillText('★ ' + tetris.unit.special, sideMid, cy);
        }
    }

    // Rival arriving overlay
    if (tetris.rivalArrived) {
        ctx.fillStyle = 'rgba(200,0,0,0.65)';
        ctx.fillRect(boardX, boardY, boardW, boardH);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 15px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('RIVAL HARAS', boardX + boardW / 2, boardY + boardH / 2 - 10);
        ctx.fillText('INCOMING', boardX + boardW / 2, boardY + boardH / 2 + 10);
    }

    ctx.textAlign = 'left';
}
