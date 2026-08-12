import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5003,

  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  SESSION_SECRET: process.env.SESSION_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5175",

  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,

  MAIL_FROM: process.env.MAIL_FROM || "Idea Lab <noreply.idealab@kct.ac.in>",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  /** Set to true/1/yes to block hackathon student registration + new PoC/submission uploads. */
  HACKATHON_REGISTRATION_CLOSED: process.env.HACKATHON_REGISTRATION_CLOSED,
  HACKATHON_REGISTRATION_CLOSED_MESSAGE: process.env.HACKATHON_REGISTRATION_CLOSED_MESSAGE,

  /** When set, OTP emails are enqueued (BullMQ) instead of blocking the API. */
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};
