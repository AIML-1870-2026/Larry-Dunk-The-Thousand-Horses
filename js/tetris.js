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
    // Board drawn centered in the canvas
    get boardW() { return this.cols * this.tileSize; },
    get boardH() { return this.rows * this.tileSize; },
    get boardX() { return (960 - this.boardW) / 2; },
    get boardY() { return (640 - this.boardH) / 2; }
};

const TETROMINOS = {
    I: { color: '#0ff', cells: [[0,1],[1,1],[2,1],[3,1]] },
    O: { color: '#ff0', cells: [[0,0],[1,0],[0,1],[1,1]] },
    T: { color: '#a0f', cells: [[1,0],[0,1],[1,1],[2,1]] },
    S: { color: '#0f0', cells: [[1,0],[2,0],[0,1],[1,1]] },
    Z: { color: '#f00', cells: [[0,0],[1,0],[1,1],[2,1]] },
    J: { color: '#00f', cells: [[0,0],[0,1],[1,1],[2,1]] },
    L: { color: '#f80', cells: [[2,0],[0,1],[1,1],[2,1]] }
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
    score: 0,
    threshold: 0,
    dropInterval: null,
    riggedIndex: 0,
    rivalArrived: false,
    gameOver: false,
    onSuccess: null,
    onFail: null
};

// ---- THRESHOLDS ----
function getTetrisThreshold(unit) {
    if (unit.type === 'mrRuno')  return 800;   // high — genuine stakes
    if (unit.type === 'cainAbel') return 100;  // trivial
    return 200;                                 // common larry dunk
}

// ---- ENTRY POINT ----
function startTetrisCapture(unit, options = {}) {
    tetris.active = true;
    tetris.unit = unit;
    tetris.rigged = options.rigged || false;
    tetris.board = Array.from({ length: TETRIS_CONFIG.rows }, () => Array(TETRIS_CONFIG.cols).fill(null));
    tetris.score = 0;
    tetris.threshold = getTetrisThreshold(unit);
    tetris.riggedIndex = 0;
    tetris.rivalArrived = false;
    tetris.gameOver = false;

    tetris.onSuccess = () => {
        playSound('tetris_success');
        // Mr. Runo: immune to chip — biceps too powerful even for Tetris
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
        // Track capture for pre-level selector pool
        if (!game.capturedLarryDunks.includes(unit.type)) game.capturedLarryDunks.push(unit.type);
        // Unit is captured — join player team
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
            // Zeus arc — rival Haras cutscene
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
                // Remove Zeus from map, load final level (index 13)
                const zeus = game.units.find(u => u.type === 'zeusLarry');
                if (zeus) zeus.alive = false;
                loadLevel(13);
            });
        } else if (unit.type === 'mrRuno') {
            // Mr. Runo escapes permanently
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
            // Soft retry — unit stays on map
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

    // Rigged: rival arrives after 15 seconds no matter what
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
function spawnTetrisPiece() {
    let key;
    if (tetris.rigged) {
        key = RIGGED_SEQUENCE[tetris.riggedIndex % RIGGED_SEQUENCE.length];
        tetris.riggedIndex++;
    } else {
        key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
    }
    const tmino = TETROMINOS[key];
    tetris.currentPiece = {
        key,
        color: tmino.color,
        cells: tmino.cells.map(([x, y]) => [x + 3, y]),
        locked: false
    };
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

function lockPiece() {
    for (const [x, y] of tetris.currentPiece.cells) {
        if (y >= 0) tetris.board[y][x] = tetris.currentPiece.color;
    }
    playSound('tetris_place');
    clearLines();
    spawnTetrisPiece();

    // Check if new piece immediately collides (game over / board full)
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
            y++; // recheck this row
        }
    }
    if (linesCleared > 0) {
        playSound('tetris_clear');
        const points = [0, 100, 300, 500, 800][Math.min(linesCleared, 4)];
        tetris.score += points;
        if (tetris.score >= tetris.threshold && !tetris.rigged) {
            tetris.gameOver = true;
            stopTetrisDrop();
            setTimeout(() => tetris.onSuccess(), 400);
        } else {
            // Restart drop with updated speed
            startTetrisDrop();
        }
    }
}

// ---- DROP LOOP ----
// Speed escalates as score increases: 800ms → 150ms (minimum), 50ms faster per 50 pts
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
    document.getElementById('btnEndTurn').style.display = 'inline-block';
}

// ---- INPUT ----
function handleTetrisClick(e) {
    // Click left half = move left, right half = move right (simple touch-friendly control)
    if (tetris.gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    if (mx < canvas.width / 2) {
        movePiece(-1, 0);
    } else {
        movePiece(1, 0);
    }
}

document.addEventListener('keydown', (e) => {
    if (game.phase !== GamePhase.TETRIS || tetris.gameOver) return;
    if (e.key === 'ArrowLeft')  movePiece(-1, 0);
    if (e.key === 'ArrowRight') movePiece(1, 0);
    if (e.key === 'ArrowDown')  movePiece(0, 1);
    if (e.key === 'ArrowUp' || e.key === 'z' || e.key === 'Z') rotatePiece();
    if (e.key === ' ') {
        // Hard drop
        while (movePiece(0, 1)) {}
        lockPiece();
    }
    e.preventDefault();
});

// ---- RENDER ----
function renderTetris() {
    const { boardX, boardY, boardW, boardH, tileSize, cols, rows } = TETRIS_CONFIG;

    // Dim the game behind
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Board background
    ctx.fillStyle = '#111';
    ctx.fillRect(boardX - 2, boardY - 2, boardW + 4, boardH + 4);
    ctx.strokeStyle = '#44f';
    ctx.lineWidth = 2;
    ctx.strokeRect(boardX - 2, boardY - 2, boardW + 4, boardH + 4);

    // Locked cells
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (tetris.board[y][x]) {
                ctx.fillStyle = tetris.board[y][x];
                ctx.fillRect(boardX + x * tileSize + 1, boardY + y * tileSize + 1, tileSize - 2, tileSize - 2);
            }
        }
    }

    // Current piece
    if (tetris.currentPiece && !tetris.gameOver) {
        ctx.fillStyle = tetris.currentPiece.color;
        for (const [x, y] of tetris.currentPiece.cells) {
            if (y >= 0) {
                ctx.fillRect(boardX + x * tileSize + 1, boardY + y * tileSize + 1, tileSize - 2, tileSize - 2);
            }
        }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(boardX + x * tileSize, boardY);
        ctx.lineTo(boardX + x * tileSize, boardY + boardH);
        ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(boardX, boardY + y * tileSize);
        ctx.lineTo(boardX + boardW, boardY + y * tileSize);
        ctx.stroke();
    }

    // HUD — score and threshold
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc44';
    ctx.fillText(`CHIP IMPLANT: ${tetris.score} / ${tetris.rigged ? '???' : tetris.threshold}`, boardX + boardW / 2, boardY - 16);

    // Unit name
    ctx.fillStyle = '#88ccff';
    ctx.fillText(`CAPTURING: ${tetris.unit ? tetris.unit.name.toUpperCase() : ''}`, boardX + boardW / 2, boardY - 32);

    // Controls hint
    ctx.fillStyle = '#555';
    ctx.font = '11px Courier New';
    ctx.fillText('← → move  ↑/Z rotate  ↓ soft drop  SPACE hard drop', boardX + boardW / 2, boardY + boardH + 18);

    // Rival arriving overlay
    if (tetris.rivalArrived) {
        ctx.fillStyle = 'rgba(200,0,0,0.6)';
        ctx.fillRect(boardX, boardY, boardW, boardH);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Courier New';
        ctx.fillText('RIVAL HARAS INCOMING', boardX + boardW / 2, boardY + boardH / 2);
    }
}
