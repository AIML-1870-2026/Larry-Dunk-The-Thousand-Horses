// ============================================================
// GRID HELPERS — terrain, movement, attack range
// ============================================================

function getTerrain(gx, gy) {
    if (gx < 0 || gy < 0 || gx >= game.gridW || gy >= game.gridH) return Terrain.WALL;
    return game.grid[gy][gx];
}

function getUnitAt(gx, gy) {
    return game.units.find(u => u.alive && u.gx === gx && u.gy === gy);
}

function getManhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getMovementTiles(unit) {
    const tiles = [];
    const visited = {};
    const queue = [{ x: unit.gx, y: unit.gy, cost: 0 }];
    visited[`${unit.gx},${unit.gy}`] = 0;

    while (queue.length > 0) {
        const cur = queue.shift();
        tiles.push({ x: cur.x, y: cur.y });

        const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        for (const [dx, dy] of dirs) {
            const nx = cur.x + dx;
            const ny = cur.y + dy;
            const key = `${nx},${ny}`;
            const terrain = getTerrain(nx, ny);
            const newCost = cur.cost + terrain.moveCost;
            const occupant = getUnitAt(nx, ny);

            if (newCost <= unit.mov && (!visited.hasOwnProperty(key) || visited[key] > newCost)) {
                if (!occupant || occupant.team === unit.team) {
                    visited[key] = newCost;
                    queue.push({ x: nx, y: ny, cost: newCost });
                }
            }
        }
    }

    return tiles.filter(t => {
        const occ = getUnitAt(t.x, t.y);
        return !occ || occ === unit;
    });
}

function getAttackTiles(unit, fromX, fromY) {
    const tiles = [];
    const range = unit.range || 1;
    for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
            if (Math.abs(dx) + Math.abs(dy) <= range && (dx !== 0 || dy !== 0)) {
                const tx = fromX + dx;
                const ty = fromY + dy;
                if (tx >= 0 && ty >= 0 && tx < game.gridW && ty < game.gridH) {
                    const target = getUnitAt(tx, ty);
                    if (target && target.team !== unit.team && target.team !== 'neutral' && target.alive) {
                        tiles.push({ x: tx, y: ty });
                    }
                }
            }
        }
    }
    return tiles;
}
