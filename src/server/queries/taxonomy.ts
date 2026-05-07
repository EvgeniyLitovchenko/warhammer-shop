import type { GameSystem } from '@prisma/client';
import { prisma } from '@/lib/db';

export async function listFactions(system: GameSystem | null) {
  return prisma.faction.findMany({
    where: system ? { system } : undefined,
    orderBy: { name: 'asc' },
  });
}

export async function listTopCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
  });
}
