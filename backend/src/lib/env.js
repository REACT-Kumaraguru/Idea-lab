import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT || 3000,
  MYSQL_URI: process.env.MYSQL_URI,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV
};
