// ============================================================
// UNIT FACTORY
// isLarryDunk: true triggers Tetris capture instead of normal death
// ============================================================

function createUnit(type, gx, gy, team) {
    const templates = {
        haras: {
            name: 'Haras', hp: 30, atk: 8, def: 5, mov: 4, range: 2,
            spriteKey: 'haras', special: 'Brain Chip Control'
        },
        minion: {
            name: 'Minion', hp: 15, atk: 5, def: 2, mov: 3, range: 1,
            spriteKey: 'minion', special: 'Expendable'
        },
        civilian: {
            name: 'Civilian', hp: 8, atk: 0, def: 0, mov: 0, range: 1,
            spriteKey: 'civilian', special: 'Cannot fight'
        },
        larryDunk: {
            name: 'Larry Dunk', hp: 35, atk: 7, def: 7, mov: 3, range: 1,
            spriteKey: 'larryDunk', special: 'Brain Chipped',
            desc: 'If target survives your attack, they and adjacent enemies lose 1 range until your next turn.',
            isLarryDunk: true
        },
        cainAbel: {
            name: 'Cain & Abel', hp: 40, atk: 9, def: 6, mov: 3, range: 1,
            spriteKey: 'cainAbel', special: '2 Attacks/Turn',
            desc: 'Attacks twice every turn.',
            isLarryDunk: true
        },
        mrRuno: {
            name: 'Mr. Runo', hp: 35, atk: 12, def: 4, mov: 3, range: 1,
            spriteKey: 'mrRuno', special: 'Huge Biceps',
            desc: 'Massive ATK. Cannot be recaptured by Tetris — those biceps resist all chips.',
            isLarryDunk: true
        },
        zeusLarry: {
            name: 'Zeus Larry Dunk', hp: 50, atk: 11, def: 5, mov: 3, range: 3,
            spriteKey: 'zeusLarry', special: 'Lightning',
            desc: 'Range 3 — strikes from three tiles away.',
            isLarryDunk: true
        },
        britishLarry: {
            name: 'British Larry Dunk', hp: 32, atk: 8, def: 6, mov: 3, range: 1,
            spriteKey: 'britishLarry', special: 'Spray Tan (British)',
            desc: 'If target survives your attack, they and adjacent enemies lose 1 range until your next turn.',
            isLarryDunk: true
        },
        financierLarry: {
            name: 'Financier Larry Dunk', hp: 28, atk: 10, def: 4, mov: 4, range: 1,
            spriteKey: 'financierLarry', special: 'Cannibalism',
            desc: 'Heals HP equal to damage dealt on every attack.',
            isLarryDunk: true
        },
        // ---- New Larry Dunk variants ----
        paraplegicLarry: {
            name: 'Paraplegic Superhero Larry', hp: 30, atk: 9, def: 3, mov: 3, range: 3,
            spriteKey: 'paraplegicLarry', special: 'Eye Bullets',
            desc: 'Fires eye bullets from 3 tiles away.',
            isLarryDunk: true
        },
        axeLarry: {
            name: 'Axe Murderer Larry Dunk', hp: 36, atk: 13, def: 3, mov: 3, range: 1,
            spriteKey: 'axeLarry', special: 'Chain Kill',
            desc: 'Killing an enemy triggers one free follow-up attack on the nearest adjacent target.',
            isLarryDunk: true
        },
        cerealLarry: {
            name: 'Cereal Mascot Larry Dunk', hp: 25, atk: 6, def: 4, mov: 4, range: 1,
            spriteKey: 'cerealLarry', special: 'Invisible',
            desc: 'Enemies cannot see or target this unit.',
            isLarryDunk: true,
            invisible: true  // enemy AI ignores this unit as target
        },
        investmentLarry: {
            name: 'Investment Group Larry Dunk', hp: 30, atk: 15, def: 5, mov: 2, range: 1,
            spriteKey: 'investmentLarry', special: 'Ad Break',
            desc: 'Attacking triggers an unskippable ad. Highest ATK in the roster, lowest MOV.',
            isLarryDunk: true
        },
        femaleLarry: {
            name: 'Female Larry Dunk', hp: 16, atk: 4, def: 2, mov: 4, range: 1,
            spriteKey: 'femaleLarry', special: 'Bad Driving',
            desc: '20% chance to land 1 tile off-target when moving.',
            isLarryDunk: true,
            badDriving: true  // 20% chance to land 1 tile off on move
        },
        // ---- Other units ----
        horse: {
            name: 'Horse', hp: 20, atk: 6, def: 3, mov: 6, range: 1,
            spriteKey: 'horse', special: 'Cavalry'
        },
        loyalHorse: {
            name: 'Loyal Horse', hp: 25, atk: 8, def: 5, mov: 7, range: 1,
            spriteKey: 'loyalHorse', special: 'The One Horse'
        },
        guard: {
            name: 'Guard', hp: 18, atk: 6, def: 4, mov: 3, range: 1,
            spriteKey: 'guard', special: ''
        },
        dummy: {
            name: 'Dummy', hp: 10, atk: 2, def: 1, mov: 0, range: 1,
            spriteKey: 'dummy', special: 'Cannot move'
        },
        enemyHaras: {
            name: 'Rival Haras', hp: 28, atk: 9, def: 5, mov: 4, range: 2,
            spriteKey: 'enemyHaras', special: 'Multiverse Clone'
        },
        robot: {
            name: 'Robot', hp: 22, atk: 7, def: 6, mov: 3, range: 1,
            spriteKey: 'robot', special: 'Mechanical'
        }
    };

    const t = templates[type] || templates.minion;
    return {
        ...t,
        type,
        maxHp: t.hp,
        gx,
        gy,
        team,
        acted: false,
        alive: true,
        isLarryDunk: t.isLarryDunk || false,
        invisible: t.invisible || false,
        badDriving: t.badDriving || false,
        attacksLeft: type === 'cainAbel' ? 2 : 1
    };
}
