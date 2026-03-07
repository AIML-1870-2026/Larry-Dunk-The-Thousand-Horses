// ============================================================
// CUTSCENE / DIALOGUE SYSTEM
// Each dialogue line: { speaker, text, color }
// ============================================================

function startCutscene(dialogues, callback) {
    game.cutsceneQueue = dialogues;
    game.cutsceneIndex = 0;
    game.cutsceneCallback = callback;
    game.phase = GamePhase.CUTSCENE;
    document.getElementById('dialogueBox').style.display = 'block';
    document.getElementById('actionPanel').style.display = 'none';
    showDialogueLine();
}

// Cinema: full-screen visual scenes drawn on canvas during cutscenes.
// Each dialogue line may have a drawScene(ctx, canvas) property.
// When set, render() calls it instead of drawing the game grid.
const Cinema = {
    // Dark tech lab — blue-green glow, circuit lines, chip diagram
    lab: function() {
        return function(ctx, canvas) {
            const W = canvas.width, H = canvas.height;
            const t = Date.now();
            // Background gradient
            const bg = ctx.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#020810');
            bg.addColorStop(1, '#0a1828');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // Circuit grid lines
            ctx.strokeStyle = 'rgba(30,100,180,0.15)';
            ctx.lineWidth = 1;
            for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
            for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

            // Center: brain chip diagram — glowing circle with circuit paths
            const cx = W / 2, cy = H * 0.42;
            const pulse = 0.5 + 0.5 * Math.sin(t / 600);
            ctx.shadowColor = '#22aaff';
            ctx.shadowBlur = 20 + pulse * 15;
            ctx.strokeStyle = `rgba(60,180,255,${0.6 + pulse * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.stroke();
            // Circuit spokes
            const spokes = 8;
            for (let i = 0; i < spokes; i++) {
                const a = (i / spokes) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * 28, cy + Math.sin(a) * 28);
                ctx.lineTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80);
                ctx.stroke();
                // Right-angle bends
                const bx = cx + Math.cos(a) * 80, by = cy + Math.sin(a) * 80;
                ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 18 * Math.cos(a + Math.PI/2), by + 18 * Math.sin(a + Math.PI/2)); ctx.stroke();
            }
            // Chip center label
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(80,200,255,${0.7 + pulse * 0.3})`;
            ctx.font = 'bold 11px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('CHIP v1', cx, cy + 4);

            // Left: Haras silhouette (dark figure with faint blue outline)
            const hx = 200, hy = H * 0.55;
            ctx.shadowColor = '#4488ff';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#06101e';
            ctx.beginPath(); ctx.arc(hx, hy - 70, 18, 0, Math.PI * 2); ctx.fill(); // head
            ctx.fillRect(hx - 16, hy - 52, 32, 55); // body
            ctx.fillRect(hx - 28, hy - 48, 12, 40); // left arm
            ctx.fillRect(hx + 16, hy - 48, 12, 40); // right arm
            ctx.strokeStyle = 'rgba(80,160,255,0.45)';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(hx, hy - 70, 18, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeRect(hx - 16, hy - 52, 32, 55);
            ctx.shadowBlur = 0;

            // Right: screen/monitor
            const sx = W - 230, sy = H * 0.28;
            ctx.strokeStyle = 'rgba(40,160,100,0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(sx, sy, 180, 110);
            ctx.fillStyle = 'rgba(0,20,10,0.8)';
            ctx.fillRect(sx + 2, sy + 2, 176, 106);
            ctx.fillStyle = `rgba(40,220,120,${0.5 + pulse * 0.3})`;
            ctx.font = '9px Courier New';
            ctx.textAlign = 'left';
            const lines = ['> NEURAL SCAN: DUNK_L', '> CHIP RECEPTIVITY: 100%', '> STATUS: UNIQUE', '> TARGET: ACQUIRED'];
            lines.forEach((l, i) => ctx.fillText(l, sx + 10, sy + 22 + i * 18));

            // Vignette
            const vig = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.75);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.65)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        };
    },

    // Warm sepia flashback
    flashback: function() {
        return function(ctx, canvas) {
            const W = canvas.width, H = canvas.height;
            const bg = ctx.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#1a0e04');
            bg.addColorStop(1, '#2e1a08');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // Film grain (static dots)
            ctx.fillStyle = 'rgba(255,200,100,0.04)';
            for (let i = 0; i < 300; i++) {
                const gx = Math.floor(Math.random() * W);
                const gy = Math.floor(Math.random() * H);
                ctx.fillRect(gx, gy, 2, 2);
            }
            // Horizontal scan lines
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);

            // "~~ FLASHBACK ~~" watermark
            ctx.font = 'bold 18px Courier New';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(220,170,80,0.35)';
            ctx.fillText('~~ FLASHBACK ~~', W / 2, 36);

            // Vignette
            const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        };
    },

    // CRT broadcast / announcement screen
    broadcast: function() {
        return function(ctx, canvas) {
            const W = canvas.width, H = canvas.height;
            const t = Date.now();
            ctx.fillStyle = '#020602';
            ctx.fillRect(0, 0, W, H);

            // CRT scanlines
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

            // Noise flicker
            if (Math.sin(t / 80) > 0.7) {
                ctx.fillStyle = 'rgba(0,50,0,0.12)';
                ctx.fillRect(0, 0, W, H);
            }

            // "LIVE BROADCAST" banner
            const pulse = 0.6 + 0.4 * Math.sin(t / 400);
            ctx.fillStyle = `rgba(255,30,30,${pulse})`;
            ctx.fillRect(20, 18, 110, 22);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText('● LIVE', 28, 33);

            // Podium silhouette center
            const px = W / 2, py = H * 0.58;
            ctx.fillStyle = '#0a200a';
            // Podium box
            ctx.fillRect(px - 30, py - 10, 60, 20);
            ctx.fillRect(px - 20, py + 10, 40, 30);
            // Person silhouette
            ctx.beginPath(); ctx.arc(px, py - 60, 20, 0, Math.PI * 2); ctx.fill();
            ctx.fillRect(px - 18, py - 40, 36, 50);
            ctx.strokeStyle = `rgba(60,255,80,${pulse * 0.5})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(px - 30, py - 10, 60, 20);

            // Screen overlay text
            ctx.fillStyle = `rgba(60,255,80,${0.7 * pulse})`;
            ctx.font = '11px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('PRIME MINISTER LARRY DUNK', W / 2, H * 0.82);
            ctx.fillStyle = `rgba(60,200,60,0.4)`;
            ctx.fillText('EMERGENCY BROADCAST — ALL CHANNELS', W / 2, H * 0.87);

            const vig = ctx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.7);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.8)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        };
    },

    // Multiverse / portal dimensional rift
    portal: function() {
        return function(ctx, canvas) {
            const W = canvas.width, H = canvas.height;
            const t = Date.now();
            ctx.fillStyle = '#06020e';
            ctx.fillRect(0, 0, W, H);
            // Portal spiral
            const cx = W / 2, cy = H * 0.4;
            for (let r = 200; r > 20; r -= 18) {
                const a = 0.3 + 0.3 * Math.sin(t / 800);
                ctx.strokeStyle = `rgba(${100 + r/2},${20 + r/4},${220},${a * (r / 200)})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
            }
            // Stars
            ctx.fillStyle = 'rgba(200,180,255,0.5)';
            for (let i = 0; i < 80; i++) {
                const sx = (i * 137.5 % W), sy = (i * 97.3 % H);
                ctx.fillRect(sx, sy, 1, 1);
            }
            const vig = ctx.createRadialGradient(W/2, H/2, H*0.15, W/2, H/2, H*0.75);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.75)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        };
    },

    // Simple dark cinematic (dramatic moments)
    dark: function(tint) {
        return function(ctx, canvas) {
            const W = canvas.width, H = canvas.height;
            const t = Date.now();
            const r = tint ? tint[0] : 10, g = tint ? tint[1] : 8, b = tint ? tint[2] : 18;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, 0, W, H);
            const vig = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.7);
            vig.addColorStop(0, `rgba(${r+15},${g+12},${b+25},0)`);
            vig.addColorStop(1, 'rgba(0,0,0,0.9)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        };
    },

    // End credits screen
    credits: function() {
        return function(ctx, canvas) {
            const W = canvas.width, H = canvas.height;
            const t = Date.now();
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);

            const pulse = 0.75 + 0.25 * Math.sin(t / 900);

            // Gold horizontal rules
            ctx.strokeStyle = `rgba(200,160,30,${0.4 * pulse})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(W*0.15, H*0.28); ctx.lineTo(W*0.85, H*0.28); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(W*0.15, H*0.72); ctx.lineTo(W*0.85, H*0.72); ctx.stroke();

            // Main title
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(255,204,51,0.5)';
            ctx.shadowBlur = 24 * pulse;
            ctx.fillStyle = `rgba(255,204,51,${pulse})`;
            ctx.font = 'bold 40px Courier New';
            ctx.fillText('LARRY DUNK', W / 2, H * 0.42);

            ctx.shadowBlur = 12;
            ctx.fillStyle = `rgba(210,170,60,${pulse * 0.85})`;
            ctx.font = '20px Courier New';
            ctx.fillText('THE THOUSAND HORSES', W / 2, H * 0.52);

            ctx.shadowBlur = 0;

            // Credits
            ctx.font = '13px Courier New';
            ctx.fillStyle = `rgba(150,130,70,${0.65 * pulse})`;
            ctx.fillText('Made with Claude', W / 2, H * 0.62);
            ctx.fillText('Special thanks to Victor Winter', W / 2, H * 0.69);

            // Vignette
            const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.72);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.75)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        };
    },

    // Chapter title card
    chapter: function(title, sub) {
        return function(ctx, canvas) {
            const W = canvas.width, H = canvas.height;
            const t = Date.now();
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);
            const pulse = 0.7 + 0.3 * Math.sin(t / 700);
            // Gold horizontal rule
            ctx.strokeStyle = `rgba(200,160,30,${pulse * 0.6})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(W*0.1, H*0.44); ctx.lineTo(W*0.9, H*0.44); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(W*0.1, H*0.6); ctx.lineTo(W*0.9, H*0.6); ctx.stroke();
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(220,190,60,${pulse})`;
            ctx.font = 'bold 36px Courier New';
            ctx.fillText(title, W / 2, H * 0.545);
            if (sub) {
                ctx.fillStyle = `rgba(160,140,80,${pulse * 0.8})`;
                ctx.font = '16px Courier New';
                ctx.fillText(sub, W / 2, H * 0.64);
            }
        };
    }
};

function showDialogueLine() {
    if (game.cutsceneIndex >= game.cutsceneQueue.length) {
        endCutscene();
        return;
    }
    const line = game.cutsceneQueue[game.cutsceneIndex];
    // Cinema: update the background draw function for this line (null = show game grid)
    game.cinemaDrawScene = line.drawScene || null;
    game.tutorialHighlight = line.highlight || null;
    document.getElementById('dlgSpeaker').textContent = line.speaker || '';
    document.getElementById('dlgSpeaker').style.color = line.color || '#ffcc44';

    const fullText = line.text;
    let charIdx = 0;
    const textEl = document.getElementById('dlgText');
    textEl.textContent = '';

    if (game._typewriterInterval) clearInterval(game._typewriterInterval);
    game._typewriterDone = false;
    game._typewriterFull = fullText;

    speakLine(line.speaker, fullText);

    game._typewriterInterval = setInterval(() => {
        charIdx++;
        textEl.textContent = fullText.substring(0, charIdx);
        if (charIdx >= fullText.length) {
            clearInterval(game._typewriterInterval);
            game._typewriterDone = true;
        }
    }, 25);
}

function advanceDialogue() {
    if (!game._typewriterDone) {
        // Skip to end of current line
        clearInterval(game._typewriterInterval);
        stopVoice();
        document.getElementById('dlgText').textContent = game._typewriterFull;
        game._typewriterDone = true;
        return;
    }
    game.cutsceneIndex++;
    if (game.cutsceneIndex >= game.cutsceneQueue.length) {
        endCutscene();
    } else {
        showDialogueLine();
    }
}

function backDialogue(e) {
    if (e) e.stopPropagation();
    if (game.cutsceneIndex <= 0) return;
    if (game._typewriterInterval) clearInterval(game._typewriterInterval);
    stopVoice();
    game.cutsceneIndex--;
    // Show previous line immediately — no typewriter re-run on back
    const line = game.cutsceneQueue[game.cutsceneIndex];
    game.cinemaDrawScene = line.drawScene || null;
    game.tutorialHighlight = line.highlight || null;
    document.getElementById('dlgSpeaker').textContent = line.speaker || '';
    document.getElementById('dlgSpeaker').style.color = line.color || '#ffcc44';
    document.getElementById('dlgText').textContent = line.text;
    game._typewriterDone = true;
    game._typewriterFull = line.text;
}

function skipAllDialogue(e) {
    if (e) e.stopPropagation();
    if (game._typewriterInterval) clearInterval(game._typewriterInterval);
    stopVoice();
    endCutscene();
}

function endCutscene() {
    game.cinemaDrawScene = null;
    game.tutorialHighlight = null;
    document.getElementById('dialogueBox').style.display = 'none';
    document.getElementById('actionPanel').style.display = 'flex';
    if (game.cutsceneCallback) game.cutsceneCallback();
}
