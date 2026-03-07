// ============================================================
// MUSIC SYSTEM — mp3-backed tracks
// playMusic(trackName), stopMusic()
// ============================================================

let _musicCurrentTrack = null;
let _musicAudio = null;

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

function playMusic(trackName) {
    if (_musicCurrentTrack === trackName) return;
    stopMusic();
    _musicCurrentTrack = trackName;
    const file = MUSIC_FILES[trackName];
    if (!file) return;
    _musicAudio = new Audio(file);
    _musicAudio.loop = true;
    _musicAudio.volume = 0.5;
    _musicAudio.play().catch(() => {});
}

function stopMusic() {
    _musicCurrentTrack = null;
    if (_musicAudio) {
        _musicAudio.pause();
        _musicAudio.src = '';
        _musicAudio = null;
    }
}
