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

function showDialogueLine() {
    if (game.cutsceneIndex >= game.cutsceneQueue.length) {
        endCutscene();
        return;
    }
    const line = game.cutsceneQueue[game.cutsceneIndex];
    document.getElementById('dlgSpeaker').textContent = line.speaker || '';
    document.getElementById('dlgSpeaker').style.color = line.color || '#ffcc44';

    const fullText = line.text;
    let charIdx = 0;
    const textEl = document.getElementById('dlgText');
    textEl.textContent = '';

    if (game._typewriterInterval) clearInterval(game._typewriterInterval);
    game._typewriterDone = false;
    game._typewriterFull = fullText;

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
    game.cutsceneIndex--;
    // Show previous line immediately — no typewriter re-run on back
    const line = game.cutsceneQueue[game.cutsceneIndex];
    document.getElementById('dlgSpeaker').textContent = line.speaker || '';
    document.getElementById('dlgSpeaker').style.color = line.color || '#ffcc44';
    document.getElementById('dlgText').textContent = line.text;
    game._typewriterDone = true;
    game._typewriterFull = line.text;
}

function skipAllDialogue(e) {
    if (e) e.stopPropagation();
    if (game._typewriterInterval) clearInterval(game._typewriterInterval);
    endCutscene();
}

function endCutscene() {
    document.getElementById('dialogueBox').style.display = 'none';
    document.getElementById('actionPanel').style.display = 'flex';
    if (game.cutsceneCallback) game.cutsceneCallback();
}
