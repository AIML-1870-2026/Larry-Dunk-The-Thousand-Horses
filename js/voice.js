// ============================================================
// VOICE ACTING — Web Speech API TTS
// speakLine(speaker, text), stopVoice(), toggleVoice()
// Character profiles from spec:
//   Haras: dramatic baritone | Larry Dunk: pompous | Narrator: deadpan
// ============================================================

const VOICE_PROFILES = {
    'Haras':                  { pitch: 0.55, rate: 0.78 },  // dramatic baritone
    'Narrator':               { pitch: 1.0,  rate: 0.82 },  // deadpan
    'Larry Dunk':             { pitch: 1.3,  rate: 1.08 },  // pompous
    'Mr. Runo':               { pitch: 0.7,  rate: 0.88 },  // gruff
    'Dr. Retina':             { pitch: 1.15, rate: 1.3  },  // harsh, clipped
    'Cain & Abel Larry Dunk': { pitch: 1.35, rate: 1.12 },
    'Zeus Larry Dunk':        { pitch: 0.85, rate: 0.68 },  // divine, slow
    'Loyal Horse':            { pitch: 0.45, rate: 0.55 },  // horse
};

let _voiceEnabled = true;

function _getVoiceProfile(speaker) {
    if (!speaker) return { pitch: 1.0, rate: 1.0 };
    if (VOICE_PROFILES[speaker]) return VOICE_PROFILES[speaker];
    // Any Larry Dunk variant not explicitly listed
    if (speaker.toLowerCase().includes('larry')) return VOICE_PROFILES['Larry Dunk'];
    return { pitch: 1.0, rate: 1.0 };
}

function stopVoice() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function speakLine(speaker, text) {
    if (!_voiceEnabled || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const profile = _getVoiceProfile(speaker);
    utter.pitch = profile.pitch;
    utter.rate = profile.rate;
    utter.volume = 0.9;
    window.speechSynthesis.speak(utter);
}

function toggleVoice() {
    _voiceEnabled = !_voiceEnabled;
    if (!_voiceEnabled) stopVoice();
    return _voiceEnabled;
}
