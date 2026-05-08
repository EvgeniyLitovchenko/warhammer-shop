import '@testing-library/jest-dom/vitest';
import type { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import { beforeEach, vi } from 'vitest';

export const prismaMock = mockDeep<PrismaClient>();
export const authMock = vi.fn();

vi.mock('@/lib/db', () => ({ prisma: prismaMock }));
vi.mock('@/auth', () => ({ auth: authMock }));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const cookieStore = {
  get: vi.fn(() => undefined),
  set: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(() => false),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieStore),
  headers: vi.fn(async () => new Headers()),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error(`NEXT_REDIRECT:${url}`);
    (error as Error & { digest: string }).digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw error;
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/event-bus', () => ({
  emitAdminEvent: vi.fn(),
  onAdminEvent: vi.fn(() => () => undefined),
}));

beforeEach(() => {
  mockReset(prismaMock);
  authMock.mockReset();
  cookieStore.get.mockReset().mockReturnValue(undefined);
  cookieStore.set.mockReset();
  cookieStore.delete.mockReset();
});

export type PrismaMock = DeepMockProxy<PrismaClient>;
export const cookieStoreMock = cookieStore;
