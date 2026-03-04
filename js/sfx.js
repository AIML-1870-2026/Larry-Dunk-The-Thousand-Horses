// ============================================================
// SOUND EFFECTS — Web Audio API synthesis (no external files)
// All sounds are procedurally generated.
//
// Public API: playSound(id)
// IDs: select, move, hit, death,
//      tetris_place, tetris_clear, tetris_success, tetris_fail,
//      player_phase, enemy_phase, ad_jingle, victory, defeat
// ============================================================

const _AudioCtxClass = window.AudioContext || window.webkitAudioContext;
let _audioCtx = null;

function _ac() {
    if (!_audioCtx) _audioCtx = new _AudioCtxClass();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
}

function playSound(id) {
    try { if (_sfx[id]) _sfx[id](_ac()); } catch (e) {}
}

const _sfx = {

    // Unit selected
    select: function(ac) {
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, ac.currentTime);
        g.gain.setValueAtTime(0.12, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.09);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + 0.09);
    },

    // Unit moves
    move: function(ac) {
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(170, ac.currentTime + 0.13);
        g.gain.setValueAtTime(0.1, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.13);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + 0.13);
    },

    // Attack hits
    hit: function(ac) {
        // Noise burst
        const bufSize = Math.floor(ac.sampleRate * 0.1);
        const buf  = ac.createBuffer(1, bufSize, ac.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ac.createBufferSource();
        noise.buffer = buf;
        const ng = ac.createGain();
        noise.connect(ng); ng.connect(ac.destination);
        ng.gain.setValueAtTime(0.25, ac.currentTime);
        ng.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
        noise.start(ac.currentTime);
        noise.stop(ac.currentTime + 0.12);
        // Pitch drop thud
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ac.currentTime + 0.15);
        g.gain.setValueAtTime(0.22, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + 0.18);
    },

    // Unit dies (non-Larry — Larry triggers Tetris instead)
    death: function(ac) {
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ac.currentTime + 0.65);
        g.gain.setValueAtTime(0.28, ac.currentTime);
        g.gain.setValueAtTime(0.28, ac.currentTime + 0.3);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.65);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + 0.65);
    },

    // Tetris piece locks into place
    tetris_place: function(ac) {
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(65, ac.currentTime + 0.12);
        g.gain.setValueAtTime(0.28, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.14);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + 0.14);
    },

    // Tetris line cleared — ascending chime
    tetris_clear: function(ac) {
        [523, 659, 784, 1047].forEach((freq, i) => {
            const t   = ac.currentTime + i * 0.07;
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g); g.connect(ac.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.13, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            osc.start(t);
            osc.stop(t + 0.18);
        });
    },

    // Tetris capture succeeded
    tetris_success: function(ac) {
        const notes = [523, 659, 784, 1047, 1047];
        const durs  = [0.12, 0.12, 0.12, 0.12, 0.35];
        let t = ac.currentTime;
        notes.forEach((freq, i) => {
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g); g.connect(ac.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.22, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + durs[i]);
            osc.start(t);
            osc.stop(t + durs[i]);
            t += 0.1;
        });
    },

    // Tetris capture failed (also Zeus rigged board)
    tetris_fail: function(ac) {
        [400, 320, 240, 160].forEach((freq, i) => {
            const t   = ac.currentTime + i * 0.14;
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g); g.connect(ac.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.17, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.start(t);
            osc.stop(t + 0.22);
        });
    },

    // Player Phase banner
    player_phase: function(ac) {
        [440, 660].forEach((freq, i) => {
            const t   = ac.currentTime + i * 0.13;
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g); g.connect(ac.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.18, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.start(t);
            osc.stop(t + 0.22);
        });
    },

    // Enemy Phase banner
    enemy_phase: function(ac) {
        [440, 294].forEach((freq, i) => {
            const t   = ac.currentTime + i * 0.15;
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g); g.connect(ac.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.13, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
            osc.start(t);
            osc.stop(t + 0.24);
        });
    },

    // Ad Break — obnoxious ascending corporate jingle
    ad_jingle: function(ac) {
        [523, 659, 784, 880].forEach((freq, i) => {
            const t   = ac.currentTime + i * 0.14;
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g); g.connect(ac.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.16, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.start(t);
            osc.stop(t + 0.22);
        });
        // Obnoxious bass underneath
        const bass = ac.createOscillator();
        const bg   = ac.createGain();
        bass.connect(bg); bg.connect(ac.destination);
        bass.type = 'sine';
        bass.frequency.setValueAtTime(130, ac.currentTime);
        bg.gain.setValueAtTime(0.1, ac.currentTime);
        bg.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.7);
        bass.start(ac.currentTime);
        bass.stop(ac.currentTime + 0.7);
    },

    // Level victory stinger
    victory: function(ac) {
        const notes = [523, 659, 784, 1047];
        const durs  = [0.14, 0.14, 0.14, 0.5];
        let t = ac.currentTime;
        notes.forEach((freq, i) => {
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g); g.connect(ac.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.24, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + durs[i]);
            osc.start(t);
            osc.stop(t + durs[i]);
            t += 0.12;
        });
    },

    // Defeat stinger
    defeat: function(ac) {
        const notes = [392, 330, 262, 196];
        const durs  = [0.2, 0.2, 0.2, 0.6];
        let t = ac.currentTime;
        notes.forEach((freq, i) => {
            const osc = ac.createOscillator();
            const g   = ac.createGain();
            osc.connect(g); g.connect(ac.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            g.gain.setValueAtTime(0.2, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + durs[i]);
            osc.start(t);
            osc.stop(t + durs[i]);
            t += 0.18;
        });
    }
};
