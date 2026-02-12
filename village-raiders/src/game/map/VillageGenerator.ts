import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TOTAL_SEARCHABLE_OBJECTS,
  MAX_KEYS,
} from '../constants';
import { TILES } from './TileRegistry';
import { BUILDING_TEMPLATES, JAIL_TEMPLATE, BuildingTemplate } from './BuildingTemplates';
import { MapData, ObjectPlacement, ObjectType, LootType } from '../types';

function make2D(w: number, h: number, fill: number): number[][] {
  return Array.from({ length: h }, () => new Array(w).fill(fill));
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function rollLootType(): LootType {
  const r = Math.random();
  if (r < 0.30) return LootType.HEART;
  if (r < 0.50) return LootType.SPEED;
  if (r < 0.65) return LootType.SHIELD;
  return LootType.EMPTY;
}

export function generateVillage(): MapData {
  const ground = make2D(MAP_WIDTH, MAP_HEIGHT, TILES.GRASS);
  const structures = make2D(MAP_WIDTH, MAP_HEIGHT, -1);
  const decoration = make2D(MAP_WIDTH, MAP_HEIGHT, -1);
  const buildingZones: { x: number; y: number; w: number; h: number }[] = [];

  // Occupied grid (true = something already placed here)
  const occupied = make2D(MAP_WIDTH, MAP_HEIGHT, 0);

  // Mark borders as occupied (buffer zone)
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (x < 4 || x >= MAP_WIDTH - 4 || y < 4 || y >= MAP_HEIGHT - 4) {
        occupied[y][x] = 1;
      }
    }
  }

  // ─── Step 1: Path Network ───
  const cx = Math.floor(MAP_WIDTH / 2);
  const cy = Math.floor(MAP_HEIGHT / 2);

  function drawPath(x1: number, y1: number, x2: number, y2: number, width: number): void {
    if (x1 === x2) {
      // vertical
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      for (let y = minY; y <= maxY; y++) {
        for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
          const px = x1 + dx;
          if (px >= 0 && px < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
            ground[y][px] = TILES.PATH;
          }
        }
      }
    } else {
      // horizontal
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      for (let x = minX; x <= maxX; x++) {
        for (let dy = -Math.floor(width / 2); dy <= Math.floor(width / 2); dy++) {
          const py = y1 + dy;
          if (x >= 0 && x < MAP_WIDTH && py >= 0 && py < MAP_HEIGHT) {
            ground[py][x] = TILES.PATH;
          }
        }
      }
    }
  }

  // Main roads
  drawPath(cx, 20, cx, MAP_HEIGHT - 20, 3);
  drawPath(20, cy, MAP_WIDTH - 20, cy, 3);

  // Village square at intersection
  for (let y = cy - 4; y <= cy + 4; y++) {
    for (let x = cx - 4; x <= cx + 4; x++) {
      ground[y][x] = TILES.PATH;
    }
  }

  // Secondary paths branching off main roads
  const branchesH = [cy - 60, cy - 30, cy + 30, cy + 60];
  const branchesV = [cx - 60, cx - 30, cx + 30, cx + 60];

  for (const by of branchesH) {
    if (by > 20 && by < MAP_HEIGHT - 20) {
      const extent = rand(40, 80);
      drawPath(cx - extent, by, cx + extent, by, 2);
    }
  }
  for (const bx of branchesV) {
    if (bx > 20 && bx < MAP_WIDTH - 20) {
      const extent = rand(40, 80);
      drawPath(bx, cy - extent, bx, cy + extent, 2);
    }
  }

  // Mark paths as occupied with buffer to keep trees/buildings away
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (ground[y][x] === TILES.PATH) {
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < MAP_HEIGHT && nx >= 0 && nx < MAP_WIDTH) {
              occupied[ny][nx] = 1;
            }
          }
        }
      }
    }
  }

  // ─── Step 2: Place Jail at north edge ───
  const jailX = cx - Math.floor(JAIL_TEMPLATE.width / 2);
  const jailY = 8;

  placeBuilding(structures, decoration, occupied, JAIL_TEMPLATE, jailX, jailY, buildingZones);

  // Draw path from jail to main road
  drawPath(cx, jailY + JAIL_TEMPLATE.height, cx, 20, 1);

  // Find jail door position
  let jailDoorX = 0;
  let jailDoorY = 0;
  for (let dy = 0; dy < JAIL_TEMPLATE.height; dy++) {
    for (let dx = 0; dx < JAIL_TEMPLATE.width; dx++) {
      if (JAIL_TEMPLATE.structure[dy][dx] === TILES.JAIL_DOOR) {
        jailDoorX = jailX + dx;
        jailDoorY = jailY + dy;
      }
    }
  }

  // ─── Step 3: Place Buildings ───
  let buildingsPlaced = 0;
  const targetBuildings = 20;
  let attempts = 0;

  while (buildingsPlaced < targetBuildings && attempts < 500) {
    attempts++;
    const template = BUILDING_TEMPLATES[rand(0, BUILDING_TEMPLATES.length - 1)];
    const px = rand(15, MAP_WIDTH - 15 - template.width);
    const py = rand(15, MAP_HEIGHT - 15 - template.height);

    if (canPlaceBuilding(occupied, template, px, py)) {
      placeBuilding(structures, decoration, occupied, template, px, py, buildingZones);
      // Draw a path from door downward until it hits an existing path
      const doorX = px + Math.floor(template.width / 2);
      const doorY = py + template.height;
      for (let dy = 0; dy < 15; dy++) {
        const py2 = doorY + dy;
        if (py2 >= MAP_HEIGHT) break;
        ground[py2][doorX] = TILES.PATH;
        if (doorX + 1 < MAP_WIDTH) ground[py2][doorX + 1] = TILES.PATH;
        // Stop if we reached an existing path
        if (dy > 1 && ground[py2][doorX] === TILES.PATH) {
          // Check if adjacent tile was already a path before we set it
        }
      }
      buildingsPlaced++;
    }
  }

  // ─── Step 4: Place Fences around some building clusters ───
  for (let i = 0; i < 4 && i < buildingZones.length; i++) {
    const zone = buildingZones[i];
    const fx1 = Math.max(4, zone.x - 2);
    const fy1 = Math.max(4, zone.y - 2);
    const fx2 = Math.min(MAP_WIDTH - 5, zone.x + zone.w + 2);
    const fy2 = Math.min(MAP_HEIGHT - 5, zone.y + zone.h + 2);

    for (let x = fx1; x <= fx2; x++) {
      if (structures[fy1][x] === -1 && ground[fy1][x] !== TILES.PATH) {
        structures[fy1][x] = TILES.FENCE;
      }
      if (structures[fy2][x] === -1 && ground[fy2][x] !== TILES.PATH) {
        structures[fy2][x] = TILES.FENCE;
      }
    }
    for (let y = fy1; y <= fy2; y++) {
      if (structures[y][fx1] === -1 && ground[y][fx1] !== TILES.PATH) {
        structures[y][fx1] = TILES.FENCE;
      }
      if (structures[y][fx2] === -1 && ground[y][fx2] !== TILES.PATH) {
        structures[y][fx2] = TILES.FENCE;
      }
    }
  }

  // ─── Step 5: Place Trees ───
  for (let y = 10; y < MAP_HEIGHT - 10; y += rand(8, 14)) {
    for (let x = 10; x < MAP_WIDTH - 10; x += rand(8, 14)) {
      const tx = x + rand(-2, 2);
      const ty = y + rand(-2, 2);
      if (
        tx > 4 && tx < MAP_WIDTH - 5 &&
        ty > 4 && ty < MAP_HEIGHT - 5 &&
        !occupied[ty][tx] &&
        structures[ty][tx] === -1 &&
        ground[ty][tx] === TILES.GRASS
      ) {
        structures[ty][tx] = TILES.TREE_TRUNK;
        if (ty > 0) decoration[ty - 1][tx] = TILES.TREE_CANOPY;
        occupied[ty][tx] = 1;
        // mark neighbors as occupied to space trees apart
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            const ny = ty + dy;
            const nx = tx + dx;
            if (ny >= 0 && ny < MAP_HEIGHT && nx >= 0 && nx < MAP_WIDTH) {
              occupied[ny][nx] = 1;
            }
          }
        }
      }
    }
  }

  // ─── Step 6: Place Water Feature (small pond near center) ───
  const pondX = cx + rand(8, 15);
  const pondY = cy + rand(8, 15);
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const wx = pondX + dx;
      const wy = pondY + dy;
      if (
        wx > 4 && wx < MAP_WIDTH - 5 &&
        wy > 4 && wy < MAP_HEIGHT - 5 &&
        structures[wy][wx] === -1 &&
        ground[wy][wx] === TILES.GRASS &&
        Math.abs(dx) + Math.abs(dy) < 5
      ) {
        ground[wy][wx] = TILES.WATER;
        structures[wy][wx] = TILES.WATER;
      }
    }
  }

  // ─── Step 7: Place Searchable Objects ───
  const objectPlacements: ObjectPlacement[] = [];
  const objectTypes = [ObjectType.CRATE, ObjectType.BARREL, ObjectType.BUSH];
  let objectsPlaced = 0;
  let objAttempts = 0;

  while (objectsPlaced < TOTAL_SEARCHABLE_OBJECTS && objAttempts < 2000) {
    objAttempts++;
    const ox = rand(10, MAP_WIDTH - 10);
    const oy = rand(10, MAP_HEIGHT - 10);

    if (
      structures[oy][ox] === -1 &&
      ground[oy][ox] === TILES.GRASS &&
      !isNearJailDoor(ox, oy, jailDoorX, jailDoorY, 3)
    ) {
      const type = objectTypes[rand(0, 2)];
      // Crates/barrels prefer near buildings, bushes in open areas
      if (type === ObjectType.BUSH || isNearBuilding(occupied, ox, oy, 8)) {
        objectPlacements.push({
          x: ox,
          y: oy,
          type,
          contents: LootType.EMPTY, // will be assigned below
        });
        occupied[oy][ox] = 1;
        objectsPlaced++;
      }
    }
  }

  // Assign keys to first 10 objects (shuffled)
  shuffle(objectPlacements);
  for (let i = 0; i < Math.min(MAX_KEYS, objectPlacements.length); i++) {
    objectPlacements[i].contents = LootType.KEY;
  }
  // Assign random loot to remaining
  for (let i = MAX_KEYS; i < objectPlacements.length; i++) {
    objectPlacements[i].contents = rollLootType();
  }

  // ─── Step 8: Determine Player Spawn ───
  // Spawn at village center (on a path tile)
  const playerSpawn = { x: cx, y: cy + 2 };

  // ─── Step 9: Flood Fill Reachability Check ───
  const reachable = floodFill(ground, structures, playerSpawn.x, playerSpawn.y);

  // Filter out unreachable objects
  const reachableObjects = objectPlacements.filter(
    (o) => reachable[o.y][o.x],
  );

  // Ensure we still have at least 10 key-bearing objects
  let keyCount = reachableObjects.filter((o) => o.contents === LootType.KEY).length;
  if (keyCount < MAX_KEYS) {
    // Re-assign keys to reachable objects
    for (const obj of reachableObjects) {
      obj.contents = rollLootType();
    }
    shuffle(reachableObjects);
    for (let i = 0; i < Math.min(MAX_KEYS, reachableObjects.length); i++) {
      reachableObjects[i].contents = LootType.KEY;
    }
  }

  return {
    ground,
    structures,
    decoration,
    objectPlacements: reachableObjects,
    playerSpawn,
    jailDoor: { x: jailDoorX, y: jailDoorY },
    buildingZones,
  };
}

function canPlaceBuilding(
  occupied: number[][],
  template: BuildingTemplate,
  px: number,
  py: number,
): boolean {
  // Check with 2-tile buffer
  for (let dy = -2; dy < template.height + 2; dy++) {
    for (let dx = -2; dx < template.width + 2; dx++) {
      const ny = py + dy;
      const nx = px + dx;
      if (ny < 0 || ny >= MAP_HEIGHT || nx < 0 || nx >= MAP_WIDTH) return false;
      if (occupied[ny][nx]) return false;
    }
  }
  return true;
}

function placeBuilding(
  structures: number[][],
  decoration: number[][],
  occupied: number[][],
  template: BuildingTemplate,
  px: number,
  py: number,
  buildingZones: { x: number; y: number; w: number; h: number }[],
): void {
  for (let dy = 0; dy < template.height; dy++) {
    for (let dx = 0; dx < template.width; dx++) {
      const tile = template.structure[dy][dx];
      const decTile = template.decoration[dy][dx];
      const nx = px + dx;
      const ny = py + dy;

      if (tile !== -1) {
        structures[ny][nx] = tile;
      }
      if (decTile !== -1) {
        decoration[ny][nx] = decTile;
      }
      occupied[ny][nx] = 1;
    }
  }

  // Mark buffer around building as occupied
  for (let dy = -1; dy <= template.height; dy++) {
    for (let dx = -1; dx <= template.width; dx++) {
      const ny = py + dy;
      const nx = px + dx;
      if (ny >= 0 && ny < MAP_HEIGHT && nx >= 0 && nx < MAP_WIDTH) {
        occupied[ny][nx] = 1;
      }
    }
  }

  buildingZones.push({ x: px, y: py, w: template.width, h: template.height });
}

function isNearBuilding(occupied: number[][], x: number, y: number, radius: number): boolean {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const ny = y + dy;
      const nx = x + dx;
      if (ny >= 0 && ny < MAP_HEIGHT && nx >= 0 && nx < MAP_WIDTH) {
        if (occupied[ny][nx]) return true;
      }
    }
  }
  return false;
}

function isNearJailDoor(x: number, y: number, jdx: number, jdy: number, dist: number): boolean {
  return Math.abs(x - jdx) <= dist && Math.abs(y - jdy) <= dist;
}

function floodFill(
  ground: number[][],
  structures: number[][],
  startX: number,
  startY: number,
): boolean[][] {
  const visited = make2D(MAP_WIDTH, MAP_HEIGHT, 0) as unknown as boolean[][];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      visited[y][x] = false;
    }
  }

  const blocked = new Set<number>([TILES.WALL, TILES.FENCE, TILES.TREE_TRUNK, TILES.WATER, TILES.JAIL_WALL]);
  const stack: [number, number][] = [[startX, startY]];
  visited[startY][startX] = true;

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (
        nx >= 0 && nx < MAP_WIDTH &&
        ny >= 0 && ny < MAP_HEIGHT &&
        !visited[ny][nx]
      ) {
        const structTile = structures[ny][nx];
        if (structTile === -1 || !blocked.has(structTile)) {
          visited[ny][nx] = true;
          stack.push([nx, ny]);
        }
      }
    }
  }

  return visited;
}
