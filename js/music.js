// ============================================================
// MUSIC SYSTEM — mp3-backed tracks
// playMusic(trackName), stopMusic()
// ============================================================

let _musicCurrentTrack = null;
let _musicAudio = null;
let _musicSavedPositions = {}; // track name → saved currentTime

const MUSIC_FILES = {
    level12:     'music/Song For Wemmbu PLAYFUL MASSACRE (2v1000 ver.).mp3',
    title:       'music/HoliznaCC0 - Deus Ex Machina.mp3',
    cutscene:    'music/HoliznaCC0 - Deus Ex Machina.mp3',
    victory:     'music/HoliznaCC0 - Deus Ex Machina.mp3',
    playerPhase: 'music/Koi-discovery - Plasma-corrélation.mp3',
    tetris:      'music/Koi-discovery - Plasma-corrélation.mp3',
    enemyPhase:  'music/Koi-discovery - Rouge-haine-les-9-âmes.mp3',
    defeat:      'music/Koi-discovery - Rouge-haine-les-9-âmes.mp3',
    ending:      'music/oji - idée. (en mi bémol majeur).mp3',
    credits:     'music/oji - idée. (en mi bémol majeur).mp3',
};

// Tracks that resume from where they left off when switched back to mid-battle
const RESUMABLE_TRACKS = new Set(['playerPhase', 'enemyPhase', 'tetris', 'level12']);

function playMusic(trackName) {
    if (_musicCurrentTrack === trackName) return;
    // Save current position for resumable tracks
    if (_musicAudio && _musicCurrentTrack && RESUMABLE_TRACKS.has(_musicCurrentTrack)) {
        _musicSavedPositions[_musicCurrentTrack] = _musicAudio.currentTime;
    }
    stopMusic();
    _musicCurrentTrack = trackName;
    const file = MUSIC_FILES[trackName];
    if (!file) return;
    _musicAudio = new Audio(file);
    _musicAudio.loop = true;
    _musicAudio.volume = 0.5;
    // Restore saved position for resumable tracks (so music continues where it left off)
    if (RESUMABLE_TRACKS.has(trackName) && _musicSavedPositions[trackName] > 0) {
        _musicAudio.currentTime = _musicSavedPositions[trackName];
    }
    _musicAudio.play().catch(() => {});
}

function stopMusic() {
    if (_musicAudio && _musicCurrentTrack && RESUMABLE_TRACKS.has(_musicCurrentTrack)) {
        _musicSavedPositions[_musicCurrentTrack] = _musicAudio.currentTime;
    }
    _musicCurrentTrack = null;
    if (_musicAudio) {
        _musicAudio.pause();
        _musicAudio.src = '';
        _musicAudio = null;
    }
}

// Call this at the start of a new level to reset battle music positions
function resetMusicPositions() {
    _musicSavedPositions = {};
}
