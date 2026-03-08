// ============================================================
// SPRITES & DRAWING — smooth vector-style characters
// Design rules:
//   - All humanoid eyes = black dots
//   - Haras/Mr. Runo share brown skin #8B5E3C (bloodline)
//   - Larry Dunk family: orange-tan skin, blond hair
// ============================================================

// ---- LOW-LEVEL HELPERS ----

function _circle(x, y, r) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function _ellipse(x, y, rx, ry) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function _roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}

// ---- FACE HELPERS ----

function _eyes(cx, cy, u) {
    ctx.fillStyle = '#111';
    _circle(cx - u * 2, cy, u * 1.3);
    _circle(cx + u * 2, cy, u * 1.3);
}

// Hair oval behind, skin oval in front. Hair peeks out on top + sides.
function _head(cx, headY, u, skinColor, hairColor) {
    ctx.fillStyle = hairColor;
    _ellipse(cx, headY - u * 1.2, u * 6, u * 6.5);
    ctx.fillStyle = skinColor;
    _ellipse(cx, headY, u * 5, u * 5.5);
}

// Eyebrow types: 'angry' | 'flat' | 'raised' | 'evil'
function _brow(cx, y, u, type) {
    ctx.strokeStyle = '#2a1a08';
    ctx.lineWidth = Math.max(0.8, u * 0.75);
    ctx.lineCap = 'round';
    if (type === 'angry') {
        ctx.beginPath(); ctx.moveTo(cx - u*3.2, y - u*0.8); ctx.lineTo(cx - u*0.8, y + u*0.1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + u*0.8, y + u*0.1); ctx.lineTo(cx + u*3.2, y - u*0.8); ctx.stroke();
    } else if (type === 'flat') {
        ctx.beginPath(); ctx.moveTo(cx - u*3.2, y - u*0.3); ctx.lineTo(cx - u*0.8, y - u*0.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + u*0.8, y - u*0.3); ctx.lineTo(cx + u*3.2, y - u*0.3); ctx.stroke();
    } else if (type === 'raised') {
        ctx.beginPath(); ctx.moveTo(cx - u*3.5, y + u*0.4); ctx.quadraticCurveTo(cx - u*2, y - u*1.3, cx - u*0.8, y + u*0.1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + u*0.8, y + u*0.1); ctx.quadraticCurveTo(cx + u*2, y - u*1.3, cx + u*3.5, y + u*0.4); ctx.stroke();
    } else if (type === 'evil') {
        ctx.beginPath(); ctx.moveTo(cx - u*3.2, y + u*0.1); ctx.lineTo(cx - u*0.8, y - u*0.8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + u*0.8, y - u*0.8); ctx.lineTo(cx + u*3.2, y + u*0.1); ctx.stroke();
    }
    ctx.lineCap = 'butt'; ctx.lineWidth = 1;
}
function _nose(cx, y, u) {
    ctx.fillStyle = 'rgba(70,35,12,0.28)';
    _circle(cx - u * 0.8, y, u * 0.52);
    _circle(cx + u * 0.8, y, u * 0.52);
}
// Mouth types: 'stern' | 'flat' | 'smirk' | 'evil'
function _mouth(cx, y, u, type) {
    ctx.strokeStyle = 'rgba(50,20,8,0.75)';
    ctx.lineWidth = Math.max(0.6, u * 0.55);
    ctx.lineCap = 'round';
    if (type === 'stern') {
        ctx.beginPath(); ctx.moveTo(cx - u*1.8, y); ctx.lineTo(cx + u*1.8, y); ctx.stroke();
    } else if (type === 'flat') {
        ctx.beginPath(); ctx.moveTo(cx - u*1.5, y); ctx.lineTo(cx + u*1.5, y); ctx.stroke();
    } else if (type === 'smirk') {
        ctx.beginPath(); ctx.moveTo(cx - u*1.5, y + u*0.2); ctx.quadraticCurveTo(cx + u*0.2, y, cx + u*2, y - u*1); ctx.stroke();
    } else if (type === 'evil') {
        ctx.beginPath(); ctx.moveTo(cx - u*2.2, y + u*0.3); ctx.quadraticCurveTo(cx, y - u*1.4, cx + u*2.2, y + u*0.3); ctx.stroke();
    }
    ctx.lineCap = 'butt'; ctx.lineWidth = 1;
}

// ---- BODY HELPERS ----

function _suit(cx, bodyTop, u, color) {
    ctx.fillStyle = color;
    _roundRect(cx - u * 6, bodyTop, u * 12, u * 6, u * 1.5);
}
function _legs(cx, legTop, u, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cx - u * 5, legTop, u * 3.5, u * 3);
    ctx.fillRect(cx + u * 1.5, legTop, u * 3.5, u * 3);
}

// ============================================================
// PLAYER UNITS
// ============================================================

function drawSprite_haras(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;
    _suit(cx, y + u * 13, u, '#1a3a8a');
    // Hair — shifted high + bigger oval so it clearly peeks around the face
    // Using dark charcoal (#333) not pure black so it reads against dark backgrounds
    ctx.fillStyle = '#333333';
    _ellipse(cx, headY - u * 2.5, u * 6.5, u * 7.5);
    // Skin face on top
    ctx.fillStyle = '#8B5E3C';
    _ellipse(cx, headY, u * 5, u * 5.5);
    _eyes(cx, headY + u * 0.5, u);
    _legs(cx, y + u * 17.5, u, '#0a0a20');
}

function drawSprite_minion(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;
    ctx.fillStyle = '#cc9900';
    _roundRect(cx - u * 6, y + u * 13, u * 12, u * 6, u * 1.5);
    // Simple neat brown hair
    ctx.fillStyle = '#5a3a10';
    _ellipse(cx, headY - u * 1.2, u * 5.5, u * 6);
    ctx.fillStyle = '#ddb090';
    _ellipse(cx, headY, u * 5, u * 5.5);
    _eyes(cx, headY + u * 0.5, u);
    _legs(cx, y + u * 17.5, u, '#1a1a1a');
}

// Civilian: distinct from minion — plain grey shirt, dark jeans, different hair/skin
function drawSprite_civilian(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;
    // Plain slate-grey shirt (not the yellow minion jacket)
    ctx.fillStyle = '#556677';
    _roundRect(cx - u * 5.5, y + u * 13, u * 11, u * 6, u * 1.5);
    // Short dark brown hair, simple cap-style oval
    ctx.fillStyle = '#2a1a08';
    _ellipse(cx, headY - u * 1.8, u * 5.5, u * 5);
    // Medium skin tone — different from minion's ddb090
    ctx.fillStyle = '#cc9966';
    _ellipse(cx, headY, u * 4.8, u * 5.2);
    _eyes(cx, headY + u * 0.5, u);
    // Dark blue jeans
    ctx.fillStyle = '#2a3a5a';
    ctx.fillRect(cx - u * 4.5, y + u * 17.5, u * 3.5, u * 3);
    ctx.fillRect(cx + u * 1, y + u * 17.5, u * 3.5, u * 3);
}

function drawSprite_larryDunk(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;
    _suit(cx, y + u * 13, u, '#1a44aa');
    // Red tie
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.moveTo(cx - u*1.5, y + u*13); ctx.lineTo(cx + u*1.5, y + u*13);
    ctx.lineTo(cx + u, y + u*18.5); ctx.lineTo(cx, y + u*19.5); ctx.lineTo(cx - u, y + u*18.5);
    ctx.closePath(); ctx.fill();
    // Wild blond poof hair
    ctx.fillStyle = '#F0B840';
    ctx.beginPath(); ctx.arc(cx, headY - u, u * 7.5, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    _circle(cx - u * 5.5, headY - u * 0.5, u * 3);
    _circle(cx + u * 5.5, headY - u * 0.5, u * 3);
    // Orange-tan skin
    ctx.fillStyle = '#E8A060';
    _ellipse(cx, headY, u * 5, u * 5.5);
    // Rosy cheeks
    ctx.fillStyle = 'rgba(220,100,60,0.2)';
    _circle(cx - u * 3.5, headY + u * 1.2, u * 1.8);
    _circle(cx + u * 3.5, headY + u * 1.2, u * 1.8);
    _eyes(cx, headY + u * 0.5, u);
    _legs(cx, y + u * 17.5, u, '#111111');
}

function drawSprite_cainAbel(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2;
    const lx = cx - u * 4.5, rx = cx + u * 4.5, headY = y + u * 7.5;
    const su = u * 0.8; // scaled face unit for smaller heads

    ctx.fillStyle = '#1a44aa';
    _roundRect(cx - u * 9, y + u * 13, u * 18, u * 6, u * 1.5);
    ctx.fillStyle = '#cc2222'; ctx.fillRect(cx - u * 1.5, y + u * 13, u * 3, u * 5.5);

    // Left head
    ctx.fillStyle = '#F0B840';
    ctx.beginPath(); ctx.arc(lx, headY - u * 0.5, u * 5.5, Math.PI * 0.85, Math.PI * 2.15); ctx.fill();
    ctx.fillStyle = '#E8A060'; _ellipse(lx, headY, u * 3.8, u * 4.2);
    _eyes(lx, headY + su * 0.5, su);

    // Right head
    ctx.fillStyle = '#F0B840';
    ctx.beginPath(); ctx.arc(rx, headY - u * 0.5, u * 5.5, Math.PI * 0.85, Math.PI * 2.15); ctx.fill();
    ctx.fillStyle = '#E8A060'; _ellipse(rx, headY, u * 3.8, u * 4.2);
    _eyes(rx, headY + su * 0.5, su);

    ctx.fillStyle = '#111111';
    ctx.fillRect(cx - u * 7, y + u * 17.5, u * 4, u * 3);
    ctx.fillRect(cx + u * 3, y + u * 17.5, u * 4, u * 3);
}

// ============================================================
// LARRY DUNK VARIANTS
// ============================================================

function drawSprite_mrRuno(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 8;
    // HUGE BICEPS
    ctx.fillStyle = '#8B5E3C';
    _ellipse(cx - u * 8.5, y + u * 13.5, u * 4.5, u * 5.5);
    _ellipse(cx + u * 8.5, y + u * 13.5, u * 4.5, u * 5.5);
    ctx.fillStyle = '#7a5030';
    _ellipse(cx - u * 9, y + u * 18, u * 2.8, u * 2.2);
    _ellipse(cx + u * 9, y + u * 18, u * 2.8, u * 2.2);
    // Navy suit
    ctx.fillStyle = '#1a3a8a';
    _roundRect(cx - u * 4.5, y + u * 12.5, u * 9, u * 7, u * 1.5);
    // Lapels
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath(); ctx.moveTo(cx - u*2.5, y + u*12.5); ctx.lineTo(cx, y + u*16); ctx.lineTo(cx + u*2.5, y + u*12.5); ctx.fill();
    ctx.fillStyle = '#1a3a8a';
    ctx.beginPath(); ctx.moveTo(cx - u*1.2, y + u*12.5); ctx.lineTo(cx, y + u*15); ctx.lineTo(cx + u*1.2, y + u*12.5); ctx.fill();
    // Head
    _head(cx, headY, u, '#8B5E3C', '#111111');
    _eyes(cx, headY + u * 0.5, u);
    ctx.fillStyle = '#0a1a4a';
    ctx.fillRect(cx - u * 4, y + u * 18.5, u * 3.5, u * 2.5);
    ctx.fillRect(cx + u * 0.5, y + u * 18.5, u * 3.5, u * 2.5);
}

function drawSprite_zeusLarry(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;
    // Toga
    ctx.fillStyle = '#f2eede';
    _roundRect(cx - u * 6.5, y + u * 13, u * 13, u * 8, u * 2);
    ctx.fillStyle = '#e8e0cc';
    _roundRect(cx - u * 6.5, y + u * 10.5, u * 5, u * 4, u * 1.5);
    ctx.fillStyle = '#E8A060'; // bare right arm
    _ellipse(cx + u * 7, y + u * 15, u * 2, u * 3.5);
    ctx.fillStyle = '#c8a020'; // gold band
    ctx.fillRect(cx - u * 6.5, y + u * 13, u * 13, u * 1.5);
    // Drape folds
    ctx.strokeStyle = '#d0c4a8'; ctx.lineWidth = Math.max(0.5, u * 0.5);
    ctx.beginPath(); ctx.moveTo(cx - u*2, y + u*14.5); ctx.lineTo(cx - u*4, y + u*21); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + u*1, y + u*14.5); ctx.lineTo(cx + u*2.5, y + u*21); ctx.stroke();
    ctx.lineWidth = 1;
    // Wild blond hair
    ctx.fillStyle = '#F0B840';
    ctx.beginPath(); ctx.arc(cx, headY - u, u * 7.5, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    _circle(cx - u * 5.5, headY - u * 0.5, u * 3);
    _circle(cx + u * 5.5, headY - u * 0.5, u * 3);
    ctx.fillStyle = '#E8A060'; _ellipse(cx, headY, u * 5, u * 5.5);
    _eyes(cx, headY + u * 0.5, u);
}

function drawSprite_britishLarry(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 10;
    // Red coat (British military/aristocrat)
    ctx.fillStyle = '#cc1111';
    _roundRect(cx - u * 6.5, y + u * 14, u * 13, u * 7, u * 1.5);
    // Gold epaulettes
    ctx.fillStyle = '#c8a020';
    _ellipse(cx - u * 6, y + u * 14.5, u * 2.5, u * 1.5);
    _ellipse(cx + u * 6, y + u * 14.5, u * 2.5, u * 1.5);
    // Gold buttons down center
    ctx.fillStyle = '#c8a020';
    [y + u*15, y + u*17.5, y + u*20].forEach(by => _circle(cx, by, u * 0.8));
    // TOP HAT
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - u * 6.5, y + u * 2.5, u * 13, u * 1.5);
    ctx.fillRect(cx - u * 4.5, y - u * 5, u * 9, u * 8);
    // Hat band
    ctx.fillStyle = '#444';
    ctx.fillRect(cx - u * 4.5, y + u * 1.5, u * 9, u * 1);
    // Wild blond hair (peek out from under hat on sides)
    ctx.fillStyle = '#F0B840';
    _circle(cx - u * 5, y + u * 3.5, u * 2);
    _circle(cx + u * 5, y + u * 3.5, u * 2);
    // Head
    ctx.fillStyle = '#E8A060'; _ellipse(cx, headY, u * 5, u * 5.5);
    // MONOCLE (gold frame over right eye)
    ctx.strokeStyle = '#c8a020'; ctx.lineWidth = Math.max(0.8, u * 0.7);
    ctx.beginPath(); ctx.arc(cx + u * 2.2, headY + u * 0.5, u * 2, 0, Math.PI * 2); ctx.stroke();
    // Monocle chain
    ctx.beginPath(); ctx.moveTo(cx + u * 4.2, headY + u * 0.5); ctx.lineTo(cx + u * 5.5, headY + u * 2.5); ctx.stroke();
    ctx.lineWidth = 1;
    _eyes(cx, headY + u * 0.5, u);
    _brow(cx, headY - u * 1.0, u, 'flat'); // stiff upper lip
    _nose(cx, headY + u * 1.6, u);
    _mouth(cx, headY + u * 2.9, u, 'stern');
    _legs(cx, y + u * 19.5, u, '#0a0a20');
}

function drawSprite_survivalistLarry(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;
    // White/cream linen suit (beach wealth)
    ctx.fillStyle = '#f0ead8';
    _roundRect(cx - u * 6.5, y + u * 13, u * 13, u * 7, u * 1.5);
    // Tan polo shirt collar underneath
    ctx.fillStyle = '#e8d8b0';
    ctx.fillRect(cx - u * 2, y + u * 13, u * 4, u * 3);
    ctx.fillStyle = '#f0ead8'; // suit covers it mostly
    ctx.fillRect(cx - u * 1.5, y + u * 13, u * 3, u * 3);
    // Open collar V
    ctx.fillStyle = '#e0c890';
    ctx.beginPath(); ctx.moveTo(cx - u*2, y + u*13); ctx.lineTo(cx, y + u*16.5); ctx.lineTo(cx + u*2, y + u*13); ctx.fill();
    // Wild blond hair but slicked and sun-bleached (#ffe88a — lighter)
    ctx.fillStyle = '#ffe88a';
    ctx.beginPath(); ctx.arc(cx, headY - u, u * 7.5, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    _circle(cx - u * 5.5, headY - u * 0.5, u * 3);
    _circle(cx + u * 5.5, headY - u * 0.5, u * 3);
    // DEEP TAN skin (#C8703A — darker than normal Larry Dunk)
    ctx.fillStyle = '#C8703A';
    _ellipse(cx, headY, u * 5, u * 5.5);
    // Sunglasses instead of eyes
    ctx.fillStyle = '#111';
    _roundRect(cx - u * 4, headY + u * 0.2, u * 3.5, u * 2, u * 0.8);
    _roundRect(cx + u * 0.5, headY + u * 0.2, u * 3.5, u * 2, u * 0.8);
    // Frames
    ctx.strokeStyle = '#c8a020'; ctx.lineWidth = Math.max(0.5, u * 0.4);
    ctx.strokeRect(cx - u * 4, headY + u * 0.2, u * 3.5, u * 2);
    ctx.strokeRect(cx + u * 0.5, headY + u * 0.2, u * 3.5, u * 2);
    ctx.lineWidth = 1;
    _brow(cx, headY - u * 0.8, u, 'raised'); // still has the big brows
    _nose(cx, headY + u * 1.6, u);
    _mouth(cx, headY + u * 2.9, u, 'smirk'); // smug beach billionaire
    _legs(cx, y + u * 18.5, u, '#e0d4b0'); // cream trousers
}

// ---- Paraplegic Superhero Larry Dunk ----
// Wheelchair + superhero cape + blue costume + LD face (headY raised — sits in chair)
function drawSprite_paraplegicLarry(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 7.5;

    // Cape (drawn first — behind body)
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.moveTo(cx - u*3.5, y + u*11.5);
    ctx.lineTo(cx - u*9,   y + u*22);
    ctx.lineTo(cx - u*1.5, y + u*22);
    ctx.lineTo(cx - u*3,   y + u*11.5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + u*3,   y + u*11.5);
    ctx.lineTo(cx + u*1.5, y + u*22);
    ctx.lineTo(cx + u*9,   y + u*22);
    ctx.lineTo(cx + u*3.5, y + u*11.5);
    ctx.closePath(); ctx.fill();

    // Wheelchair WHEELS (big circles, dark)
    ctx.fillStyle = '#2a2a2a';
    _circle(cx - u*6.5, y + u*18, u*3.2);
    _circle(cx + u*6.5, y + u*18, u*3.2);
    // Wheel rims
    ctx.strokeStyle = '#888888'; ctx.lineWidth = Math.max(0.8, u*0.7);
    ctx.beginPath(); ctx.arc(cx - u*6.5, y + u*18, u*2.5, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + u*6.5, y + u*18, u*2.5, 0, Math.PI*2); ctx.stroke();
    // Spokes (3 per wheel)
    for (let a = 0; a < Math.PI; a += Math.PI / 3) {
        const cos = Math.cos(a) * u * 2.5, sin = Math.sin(a) * u * 2.5;
        ctx.beginPath(); ctx.moveTo(cx - u*6.5 + cos, y + u*18 + sin); ctx.lineTo(cx - u*6.5 - cos, y + u*18 - sin); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + u*6.5 + cos, y + u*18 + sin); ctx.lineTo(cx + u*6.5 - cos, y + u*18 - sin); ctx.stroke();
    }
    ctx.lineWidth = 1;

    // Wheelchair frame (grey metal)
    ctx.fillStyle = '#999999';
    ctx.fillRect(cx - u*6.5, y + u*14.5, u*0.9, u*5);  // left post
    ctx.fillRect(cx + u*5.6, y + u*14.5, u*0.9, u*5);  // right post
    ctx.fillRect(cx - u*6.5, y + u*13.5, u*13, u*1);   // backrest bar

    // Seat cushion
    ctx.fillStyle = '#446688';
    ctx.fillRect(cx - u*5.5, y + u*15, u*11, u*2.5);

    // Superhero costume (blue bodysuit)
    ctx.fillStyle = '#1144cc';
    _roundRect(cx - u*4.5, y + u*10.5, u*9, u*5.5, u);
    // Gold star emblem on chest
    ctx.fillStyle = '#ffcc00';
    _circle(cx, y + u*12.5, u*2);
    ctx.fillStyle = '#1144cc';
    _circle(cx, y + u*12.5, u*1.1);

    // Armrests
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(cx - u*5.5, y + u*12, u*1, u*4);
    ctx.fillRect(cx + u*4.5, y + u*12, u*1, u*4);

    // Legs (short — sitting, blue costume legs)
    ctx.fillStyle = '#0033aa';
    ctx.fillRect(cx - u*3.5, y + u*15.5, u*3, u*2.5);
    ctx.fillRect(cx + u*0.5, y + u*15.5, u*3, u*2.5);

    // HEAD + HAIR (classic Larry Dunk blond poof)
    ctx.fillStyle = '#F0B840';
    ctx.beginPath(); ctx.arc(cx, headY - u*0.5, u*6.5, Math.PI*0.8, Math.PI*2.2); ctx.fill();
    _circle(cx - u*5, headY, u*2.5);
    _circle(cx + u*5, headY, u*2.5);
    ctx.fillStyle = '#E8A060';
    _ellipse(cx, headY + u*0.5, u*4.5, u*5);
    _eyes(cx, headY + u*1, u);
}

// ---- Axe Murderer Larry Dunk ----
// Standard blue suit + brutal axe in right hand + blood splatter + evil brows
function drawSprite_axeLarry(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;

    // Axe HANDLE (behind body — drawn first)
    ctx.fillStyle = '#4a2808';
    ctx.fillRect(cx + u*4.5, y + u*10, u*1.8, u*12);

    // Axe BLADE
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.moveTo(cx + u*4.5, y + u*10);
    ctx.lineTo(cx + u*10, y + u*8);
    ctx.lineTo(cx + u*10.5, y + u*14);
    ctx.lineTo(cx + u*4.5, y + u*13);
    ctx.closePath(); ctx.fill();
    // Blade edge highlight
    ctx.strokeStyle = '#e8e8e8'; ctx.lineWidth = Math.max(0.5, u*0.4);
    ctx.beginPath();
    ctx.moveTo(cx + u*10, y + u*8);
    ctx.lineTo(cx + u*10.5, y + u*14);
    ctx.stroke();
    ctx.lineWidth = 1;

    // SUIT (slightly disheveled blue)
    _suit(cx, y + u * 13, u, '#1a44aa');
    // Red tie (still wearing it)
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.moveTo(cx - u*1.5, y + u*13); ctx.lineTo(cx + u*1.5, y + u*13);
    ctx.lineTo(cx + u, y + u*18); ctx.lineTo(cx, y + u*19); ctx.lineTo(cx - u, y + u*18);
    ctx.closePath(); ctx.fill();

    // Blood spatters on suit
    ctx.fillStyle = '#aa0000';
    _circle(cx - u*3, y + u*14.5, u*0.9);
    _circle(cx + u*1.5, y + u*13.5, u*0.7);
    _circle(cx - u*1, y + u*17, u*0.6);
    _circle(cx - u*4, y + u*16, u*0.5);
    _circle(cx + u*0.5, y + u*15.5, u*0.4);

    // Wild blond hair
    ctx.fillStyle = '#F0B840';
    ctx.beginPath(); ctx.arc(cx, headY - u, u * 7.5, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    _circle(cx - u * 5.5, headY - u * 0.5, u * 3);
    _circle(cx + u * 5.5, headY - u * 0.5, u * 3);
    // Orange-tan skin
    ctx.fillStyle = '#E8A060';
    _ellipse(cx, headY, u * 5, u * 5.5);
    _eyes(cx, headY + u * 0.5, u);
    _brow(cx, headY - u * 1.0, u, 'evil');

    _legs(cx, y + u * 17.5, u, '#111111');
}

// ---- Cereal Mascot Larry Dunk ----
// Bright orange mascot suit with yellow polka dots + tall white chef hat + LD face
function drawSprite_cerealLarry(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 11;

    // MASCOT HAT (tall cereal mascot hat — golden cream so it reads as costume, not UI)
    ctx.fillStyle = '#fff0b0';
    _roundRect(cx - u*4.5, y + u*1, u*9, u*6, u*1.5);     // puff top
    ctx.fillRect(cx - u*4, y + u*5.5, u*8, u*2.5);         // cylinder body
    // Hat outline (makes it clearly read as a hat, not blank space)
    ctx.strokeStyle = '#cc9900'; ctx.lineWidth = Math.max(0.8, u*0.5);
    ctx.beginPath(); ctx.roundRect(cx - u*4.5, y + u*1, u*9, u*6, u*1.5); ctx.stroke();
    ctx.strokeRect(cx - u*4, y + u*5.5, u*8, u*2.5);
    ctx.lineWidth = 1;
    // Hat band
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(cx - u*4, y + u*7, u*8, u*1.2);
    // Star on hat
    ctx.fillStyle = '#ffcc00';
    _circle(cx, y + u*3.5, u*1.5);

    // Bright orange mascot suit
    ctx.fillStyle = '#ee6622';
    _roundRect(cx - u*6, y + u*13.5, u*12, u*7, u*1.5);
    // Yellow polka dots
    ctx.fillStyle = '#ffee44';
    _circle(cx - u*3, y + u*15.5, u*1.3);
    _circle(cx + u*2.5, y + u*15, u*1.1);
    _circle(cx - u*0.5, y + u*18, u*1.2);
    _circle(cx + u*3.5, y + u*17.5, u*1);
    _circle(cx - u*3.5, y + u*18.5, u*0.8);

    // Head + LD hair (blond, same poof)
    ctx.fillStyle = '#F0B840';
    ctx.beginPath(); ctx.arc(cx, headY - u, u * 6.5, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    _circle(cx - u * 5, headY - u * 0.5, u * 2.8);
    _circle(cx + u * 5, headY - u * 0.5, u * 2.8);
    ctx.fillStyle = '#E8A060';
    _ellipse(cx, headY, u * 4.8, u * 5.2);
    _eyes(cx, headY + u * 0.5, u);
    _brow(cx, headY - u * 0.8, u, 'raised'); // enthusiastic brows

    // Mascot gloves (cream-colored cuffs)
    ctx.fillStyle = '#fff0b0';
    _circle(cx - u*7, y + u*15.5, u*2);
    _circle(cx + u*7, y + u*15.5, u*2);

    _legs(cx, y + u * 19, u, '#cc5500');
}

// ---- Investment Group Larry Dunk ----
// Ultra-dark charcoal power suit + briefcase + power tie + flat corporate brows
function drawSprite_investmentLarry(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;

    // Briefcase (right side, drawn behind arm)
    ctx.fillStyle = '#2a1a08';
    _roundRect(cx + u*5, y + u*14.5, u*5.5, u*3.5, u*0.5);
    ctx.fillStyle = '#5a4020';
    ctx.fillRect(cx + u*6.5, y + u*13.5, u*2.5, u*1.2); // handle
    ctx.fillStyle = '#c8a020';
    ctx.fillRect(cx + u*6.5, y + u*16, u*2.5, u*0.5); // clasp

    // Charcoal power suit
    ctx.fillStyle = '#1a1a22';
    _roundRect(cx - u * 6, y + u * 13, u * 12, u * 6, u * 1.5);
    // White shirt collar
    ctx.fillStyle = '#eeeeee';
    ctx.beginPath(); ctx.moveTo(cx - u*1.8, y + u*13); ctx.lineTo(cx, y + u*15.5); ctx.lineTo(cx + u*1.8, y + u*13); ctx.fill();
    // Dark red power tie
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.moveTo(cx - u*1.2, y + u*13); ctx.lineTo(cx + u*1.2, y + u*13);
    ctx.lineTo(cx + u*0.8, y + u*18); ctx.lineTo(cx, y + u*19); ctx.lineTo(cx - u*0.8, y + u*18);
    ctx.closePath(); ctx.fill();
    // Gold tie pin
    ctx.fillStyle = '#c8a020';
    ctx.fillRect(cx - u*0.8, y + u*15.5, u*1.6, u*0.6);

    // Wild blond hair
    ctx.fillStyle = '#F0B840';
    ctx.beginPath(); ctx.arc(cx, headY - u, u * 7.5, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    _circle(cx - u * 5.5, headY - u * 0.5, u * 3);
    _circle(cx + u * 5.5, headY - u * 0.5, u * 3);
    ctx.fillStyle = '#E8A060';
    _ellipse(cx, headY, u * 5, u * 5.5);
    _eyes(cx, headY + u * 0.5, u);
    _brow(cx, headY - u * 1.0, u, 'flat'); // corporate dead-eyes

    _legs(cx, y + u * 17.5, u, '#111118');
}

// ---- Female Larry Dunk ----
// Pink blazer + flowing long blond hair (same blond, different style) + black skirt + LD face
function drawSprite_femaleLarry(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;

    // Long flowing blond hair sides (drawn behind body)
    ctx.fillStyle = '#F0B840';
    _ellipse(cx - u*7, headY + u*3, u*2.5, u*5.5);
    _ellipse(cx + u*7, headY + u*3, u*2.5, u*5.5);

    // Pink blazer
    ctx.fillStyle = '#cc4488';
    _roundRect(cx - u*6, y + u*13, u*12, u*6, u*1.5);
    // White blouse collar (V-neck)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(cx - u*2, y + u*13); ctx.lineTo(cx, y + u*16.5); ctx.lineTo(cx + u*2, y + u*13); ctx.fill();
    ctx.fillStyle = '#cc4488';
    ctx.beginPath(); ctx.moveTo(cx - u*0.8, y + u*13); ctx.lineTo(cx, y + u*15.5); ctx.lineTo(cx + u*0.8, y + u*13); ctx.fill();

    // Black skirt (flares slightly)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(cx - u*5.5, y + u*18);
    ctx.lineTo(cx - u*7, y + u*22);
    ctx.lineTo(cx + u*7, y + u*22);
    ctx.lineTo(cx + u*5.5, y + u*18);
    ctx.closePath(); ctx.fill();

    // Legs (skin tone, heels)
    ctx.fillStyle = '#E8A060';
    ctx.fillRect(cx - u*4, y + u*21.5, u*2.2, u*2);
    ctx.fillRect(cx + u*1.8, y + u*21.5, u*2.2, u*2);

    // Wild blond hair — same poof top as standard LD
    ctx.fillStyle = '#F0B840';
    ctx.beginPath(); ctx.arc(cx, headY - u, u * 7.5, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();
    _circle(cx - u * 5.5, headY - u * 0.5, u * 3);
    _circle(cx + u * 5.5, headY - u * 0.5, u * 3);
    // Orange-tan skin
    ctx.fillStyle = '#E8A060';
    _ellipse(cx, headY, u * 5, u * 5.5);
    // Rosy cheeks (slightly more pronounced)
    ctx.fillStyle = 'rgba(220,100,60,0.25)';
    _circle(cx - u * 3.5, headY + u * 1.2, u * 2);
    _circle(cx + u * 3.5, headY + u * 1.2, u * 2);
    _eyes(cx, headY + u * 0.5, u);
}

// ============================================================
// HORSES
// ============================================================

function _drawHorseBody(ctx, x, y, sz, maneColor) {
    const u = sz / 20;
    const bx = x + sz / 2 + u;
    const by = y + u * 11;

    // TAIL
    ctx.fillStyle = maneColor;
    ctx.beginPath(); ctx.ellipse(bx + u*8, by - u*1, u*1.8, u*5, 0.35, 0, Math.PI*2); ctx.fill();

    // BODY — barrel
    ctx.fillStyle = '#8B4513';
    ctx.beginPath(); ctx.ellipse(bx - u*1, by + u*0.5, u*8, u*4, 0, 0, Math.PI*2); ctx.fill();

    // NECK — wider trapezoid connecting body to head
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(bx - u*1.5, by - u*4.5);
    ctx.lineTo(bx - u*6.5, by - u*5);
    ctx.lineTo(bx - u*8,   by - u*10);
    ctx.lineTo(bx - u*6,   by - u*10);
    ctx.closePath(); ctx.fill();

    // HEAD — tall skull + forward muzzle
    ctx.fillStyle = '#9B5020';
    ctx.beginPath();
    ctx.moveTo(bx - u*6,    by - u*10);
    ctx.lineTo(bx - u*8.5,  by - u*11.5);
    ctx.lineTo(bx - u*9.5,  by - u*10);
    ctx.lineTo(bx - u*10.5, by - u*9);
    ctx.lineTo(bx - u*11,   by - u*7);
    ctx.lineTo(bx - u*11,   by - u*5.5);
    ctx.lineTo(bx - u*9,    by - u*5.5);
    ctx.lineTo(bx - u*9,    by - u*7);
    ctx.lineTo(bx - u*6,    by - u*7);
    ctx.closePath(); ctx.fill();

    // MANE — wide and prominent along the neck crest
    ctx.fillStyle = maneColor;
    ctx.beginPath(); ctx.ellipse(bx - u*5.5, by - u*7.5, u*2.8, u*5, -0.2, 0, Math.PI*2); ctx.fill();
    // Forelock tuft at poll
    ctx.beginPath(); ctx.arc(bx - u*8.5, by - u*11.5, u*1.8, 0, Math.PI * 2); ctx.fill();

    // EYE
    ctx.fillStyle = '#111111'; _circle(bx - u*8.5, by - u*10.5, u*0.85);
    // NOSTRIL
    ctx.fillStyle = '#6B3010'; _circle(bx - u*10.5, by - u*6, u*0.55);

    // LEGS
    ctx.fillStyle = '#7B4010';
    const lw = u*2, lh = u*5.5;
    [bx-u*5.5, bx-u*2, bx+u*2, bx+u*5.5].forEach(lx => ctx.fillRect(lx, by + u*4.5, lw, lh));

    // HOOVES
    ctx.fillStyle = '#1a0800';
    [bx-u*5.5, bx-u*2, bx+u*2, bx+u*5.5].forEach(lx => ctx.fillRect(lx, by + u*9.5, lw, u*0.9));
}

function drawSprite_horse(x, y, sz) {
    _drawHorseBody(ctx, x, y, sz, '#3a2008');
}

function drawSprite_loyalHorse(x, y, sz) {
    const u = sz / 20, bx = x + sz / 2 + u, by = y + u * 11;
    _drawHorseBody(ctx, x, y, sz, '#3a2008');
    // Tiny yellow bow — incredibly small, normal shade of yellow
    ctx.fillStyle = '#c8a020';
    _circle(bx - u * 5.5, by - u * 9, u * 1.1);
    ctx.fillStyle = '#b89010';
    _circle(bx - u * 7,   by - u * 9.2, u * 0.7);
    _circle(bx - u * 4,   by - u * 9.2, u * 0.7);
}

// ============================================================
// ENEMY UNITS
// ============================================================

function drawSprite_enemyHaras(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2, headY = y + u * 9;
    ctx.fillStyle = '#4a0000';
    _roundRect(cx - u * 6, y + u * 13, u * 12, u * 6, u * 1.5);
    _head(cx, headY, u, '#8B5E3C', '#111111');
    _eyes(cx, headY + u * 0.5, u);
    _brow(cx, headY - u * 1.5, u, 'evil');
    _legs(cx, y + u * 17.5, u, '#1a0000');
}

function drawSprite_guard(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2;
    ctx.fillStyle = '#445566'; _roundRect(cx - u*6, y + u*13, u*12, u*7, u*1.5);
    ctx.fillStyle = '#cc9900'; _circle(cx, y + u*15.5, u*1.5);
    ctx.fillStyle = '#667788';
    _circle(cx, y + u*8, u*5.5);
    ctx.fillRect(cx - u*5.5, y + u*8, u*11, u*5.5);
    ctx.beginPath(); ctx.arc(cx, y + u*13.5, u*5.5, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#aaccff'; ctx.fillRect(cx - u*3.5, y + u*8.5, u*7, u*2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(cx - u*3.5, y + u*8.5, u*7, u*0.7);
    ctx.fillStyle = '#111111';
    ctx.fillRect(cx - u*5, y + u*18, u*4, u*2.5);
    ctx.fillRect(cx + u*1, y + u*18, u*4, u*2.5);
}

function drawSprite_robot(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2;
    ctx.fillStyle = '#666666'; _roundRect(cx - u*5.5, y + u*11.5, u*11, u*8, u);
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(cx - u*3.5, y + u*13, u*7, u*1.5);
    ctx.fillRect(cx - u*3.5, y + u*16, u*7, u*1.5);
    ctx.fillStyle = '#444444';
    _roundRect(cx - u*9.5, y + u*11.5, u*4, u*6, u*0.8);
    _roundRect(cx + u*5.5,  y + u*11.5, u*4, u*6, u*0.8);
    ctx.fillStyle = '#888888'; _roundRect(cx - u*5, y + u*4, u*10, u*8, u*1.5);
    ctx.fillStyle = '#aaaaaa'; ctx.fillRect(cx - u*0.6, y, u*1.2, u*5);
    ctx.fillStyle = '#00aaff'; _circle(cx, y, u*1.3);
    ctx.fillStyle = '#ff0000';
    _circle(cx - u*2.5, y + u*7.5, u*1.8); _circle(cx + u*2.5, y + u*7.5, u*1.8);
    ctx.fillStyle = '#ff8888';
    _circle(cx - u*2.5, y + u*7.5, u*0.85); _circle(cx + u*2.5, y + u*7.5, u*0.85);
    ctx.fillStyle = '#555555';
    ctx.fillRect(cx - u*5, y + u*18.5, u*3.5, u*2.5);
    ctx.fillRect(cx + u*1.5, y + u*18.5, u*3.5, u*2.5);
}

function drawSprite_dummy(x, y, sz) {
    const u = sz / 20, cx = x + sz / 2;
    ctx.fillStyle = '#554433';
    ctx.fillRect(cx - u*1.5, y + u*2, u*3, u*18);
    ctx.fillRect(cx - u*7, y + u*9, u*14, u*2.5);
    ctx.fillStyle = '#998877'; _ellipse(cx, y + u*7, u*5, u*5.5);
    ctx.strokeStyle = '#cc2200'; ctx.lineWidth = Math.max(1.5, u*1.5); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - u*2.5, y + u*4.5); ctx.lineTo(cx + u*2.5, y + u*9.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + u*2.5, y + u*4.5); ctx.lineTo(cx - u*2.5, y + u*9.5); ctx.stroke();
    ctx.lineWidth = 1; ctx.lineCap = 'butt';
    ctx.strokeStyle = '#776655'; ctx.lineWidth = Math.max(0.5, u*0.6);
    ctx.beginPath(); ctx.arc(cx, y + u*7, u*3.5, 0.3, Math.PI - 0.3); ctx.stroke();
    ctx.lineWidth = 1;
}

// ============================================================
// SPRITES DISPATCH TABLE
// ============================================================

const SPRITES = {
    haras:              drawSprite_haras,
    minion:             drawSprite_minion,
    civilian:           drawSprite_civilian,
    larryDunk:          drawSprite_larryDunk,
    cainAbel:           drawSprite_cainAbel,
    mrRuno:             drawSprite_mrRuno,
    zeusLarry:          drawSprite_zeusLarry,
    britishLarry:       drawSprite_britishLarry,
    survivalistLarry:   drawSprite_survivalistLarry,
    paraplegicLarry:    drawSprite_paraplegicLarry,
    axeLarry:           drawSprite_axeLarry,
    cerealLarry:        drawSprite_cerealLarry,
    investmentLarry:    drawSprite_investmentLarry,
    femaleLarry:        drawSprite_femaleLarry,
    horse:              drawSprite_horse,
    loyalHorse:         drawSprite_loyalHorse,
    enemyHaras:         drawSprite_enemyHaras,
    guard:              drawSprite_guard,
    robot:              drawSprite_robot,
    dummy:              drawSprite_dummy,
};

// ============================================================
// DRAW UNIT
// ============================================================

function drawUnit(unit, x, y) {
    const drawFn = SPRITES[unit.spriteKey] || SPRITES.minion;
    const teamColor = unit.team === 'player'
        ? 'rgba(50,100,200,0.4)'
        : unit.team === 'neutral'
            ? 'rgba(200,200,50,0.4)'
            : 'rgba(200,50,50,0.4)';
    ctx.fillStyle = teamColor;
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    drawFn(x + 4, y + 4, TILE_SIZE - 8);

    if (unit.hp > 0) {
        const barX = x + 4, barY = y + TILE_SIZE - 6, barW = TILE_SIZE - 8, barH = 4;
        ctx.fillStyle = '#300'; ctx.fillRect(barX, barY, barW, barH);
        const pct = unit.hp / unit.maxHp;
        ctx.fillStyle = pct > 0.5 ? '#0a0' : pct > 0.25 ? '#aa0' : '#a00';
        ctx.fillRect(barX, barY, barW * pct, barH);
    }
    if (unit.acted && unit.team === 'player') {
        // Dimmed overlay — clearly exhausted
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    } else if (!unit.acted && unit.team === 'player') {
        // Ready-to-act indicator: bright blue border
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.85)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.lineWidth = 1;
    }
}
