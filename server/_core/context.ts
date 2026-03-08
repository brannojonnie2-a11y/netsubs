import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: { headers: Headers; cookies?: any };
  res: any;
  user: User | null;
};

export async function createTRPCContext(opts: {
  req: Request | { headers: Headers; cookies?: any };
  res?: any;
}): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Convert Next.js Request to a format the SDK can handle
    const req = opts.req instanceof Request ? opts.req : opts.req;
    user = await sdk.authenticateRequest(req as any);
  } catch (error) {
    // Authentication is optional for public procedures
    user = null;
  }

  return {
    req: opts.req as any,
    res: opts.res || {},
    user,
  };
}

// Legacy export for compatibility
export { createTRPCContext as createContext };
