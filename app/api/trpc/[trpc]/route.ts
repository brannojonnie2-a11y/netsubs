import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@server/routers';
import { createTRPCContext } from '@server/_core/context';

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async ({ req }) => {
      return createTRPCContext({ req: req as any, res: {} as any });
    },
  });
};

export const GET = handler;
export const POST = handler;
