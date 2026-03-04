// ============================================================
// CONSTANTS & GAME STATE
// Larry Dunk: The Thousand Horses
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 48;
const GRID_OFFSET_X = 16;
const GRID_OFFSET_Y = 40;

const GamePhase = {
    TITLE: 'title',
    CUTSCENE: 'cutscene',
    PLAYER_TURN: 'playerTurn',
    UNIT_SELECTED: 'unitSelected',
    UNIT_MOVED: 'unitMoved',
    ATTACK_SELECT: 'attackSelect',
    ENEMY_TURN: 'enemyTurn',
    ANIMATION: 'animation',
    VICTORY: 'victory',
    DEFEAT: 'defeat',
    ENDING: 'ending',
    TETRIS: 'tetris',
    AD_BREAK: 'adBreak'
};

let game = {
    phase: GamePhase.TITLE,
    currentLevel: 0,
    turn: 1,
    units: [],
    grid: [],
    gridW: 0,
    gridH: 0,
    selectedUnit: null,
    moveTiles: [],
    attackTiles: [],
    cursor: { x: 0, y: 0 },
    animations: [],
    cutsceneQueue: [],
    cutsceneIndex: 0,
    camera: { x: 0, y: 0 },
    levelComplete: false,
    betrayalTriggered: false,
    horsesCollected: 0,
    pendingAdBreak: null,
    _adCountdownTimer: null,
    hoveredUnit: null,
    capturedLarryDunks: [],   // persistent: types captured via Tetris across levels
    selectedLarryDunks: [],   // per-battle: types chosen in pre-level selector
    _ldSelectorCallback: null,
    _ldSelectorMaxSlots: 0
};

const Terrain = {
    PLAIN:     { name: 'Plain',     color: '#3a6b35', moveCost: 1,  defBonus: 0 },
    FOREST:    { name: 'Forest',    color: '#2a4a25', moveCost: 2,  defBonus: 2 },
    MOUNTAIN:  { name: 'Mountain',  color: '#6a6a6a', moveCost: 3,  defBonus: 3 },
    WALL:      { name: 'Wall',      color: '#3a3a3a', moveCost: 99, defBonus: 0 },
    WATER:     { name: 'Water',     color: '#2a4a7a', moveCost: 99, defBonus: 0 },
    PORTAL:    { name: 'Portal',    color: '#6a2a8a', moveCost: 1,  defBonus: 0 },
    TEMPLE:    { name: 'Temple',    color: '#8a8a5a', moveCost: 1,  defBonus: 2 },
    CLOUD:     { name: 'Cloud',     color: '#7ab8d8', moveCost: 1,  defBonus: 1 },
    LAVA:      { name: 'Lava',      color: '#8a2a0a', moveCost: 99, defBonus: 0 },
    THRONE:    { name: 'Throne',    color: '#aa8833', moveCost: 1,  defBonus: 4 },
    OFFICE_FLOOR: { name: 'Office Floor', color: '#4e5868', moveCost: 1,  defBonus: 0 },
    GYM_FLOOR: { name: 'Gym Floor', color: '#8a7a5a', moveCost: 1,  defBonus: 0 },
    EQUIPMENT: { name: 'Equipment', color: '#5a5a5a', moveCost: 2,  defBonus: 1 },
    EXIT:      { name: 'Exit',      color: '#aa3333', moveCost: 1,  defBonus: 0 }
};
