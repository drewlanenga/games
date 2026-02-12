import { LootType } from '../types';

export function rollLoot(): LootType {
  const roll = Math.random();
  if (roll < 0.30) return LootType.HEART;
  if (roll < 0.50) return LootType.SPEED;
  if (roll < 0.65) return LootType.SHIELD;
  return LootType.EMPTY;
}
