import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { ENV } from "../lib/env.js";

export function createSessionMiddleware() {
  const PgSession = connectPgSimple(session);

  return session({
    store: new PgSession({
      conObject: {
        connectionString: ENV.DATABASE_URL,
      },
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: ENV.NODE_ENV === "production" && !ENV.CLIENT_URL?.includes("localhost"),
      httpOnly: true,
      sameSite: "strict",
    },
  });
}
