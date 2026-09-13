// MOCKED — in-memory proxy for Prisma in AI Studio container
const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {},
  delete: async () => ({}),
  upsert: async (d: any) => d?.create ?? {},
  $queryRaw: async () => {
    throw new Error('PostgreSQL database offline');
  },
  $disconnect: async () => {},
  $connect: async () => {},
};

export const prisma: any = new Proxy({}, { get: () => noOp });
