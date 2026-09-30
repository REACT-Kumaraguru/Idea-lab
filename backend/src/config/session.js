import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";
import { sequelize } from "../lib/db.js";
import { ENV } from "../lib/env.js";

const SequelizeStore = connectSessionSequelize(session.Store);

let sessionStore = null;

export function getSessionStore() {
  if (!sessionStore) {
    sessionStore = new SequelizeStore({
      db: sequelize,
      tableName: "Sessions",
      checkExpirationInterval: 15 * 60 * 1000,
      expiration: 7 * 24 * 60 * 60 * 1000,
    });
    sessionStore.sync().catch((err) => {
      console.warn("[session] Session table sync notice:", err.message);
    });
  }
  return sessionStore;
}

export function createSessionMiddleware() {
  const secretKey = ENV.SESSION_SECRET || "development-secret-key-12345";
  const store = getSessionStore();

  return session({
    store,
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
