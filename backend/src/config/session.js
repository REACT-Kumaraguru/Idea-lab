import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { ENV } from "../lib/env.js";

export function createSessionMiddleware() {
  const secretKey = ENV.SESSION_SECRET || "development-secret-key-12345";
  const isPostgres = ENV.DATABASE_URL && ENV.DATABASE_URL.startsWith("postgres");

  const sessionStore = isPostgres
    ? new (connectPgSimple(session))({
        conObject: {
          connectionString: ENV.DATABASE_URL,
        },
        tableName: "session",
        createTableIfMissing: true,
      })
    : undefined;

  return session({
    ...(sessionStore ? { store: sessionStore } : {}),
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: ENV.NODE_ENV === "production" && !ENV.CLIENT_URL?.includes("localhost"),
      httpOnly: true,
      sameSite: "lax",
    },
  });
}
