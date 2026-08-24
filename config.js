require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 1800,
  appUrl: process.env.APP_URL || "http://localhost:1800",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/authPassport",
  sessionSecret: process.env.SESSION_SECRET || (isProduction ? "" : "local-development-secret-change-me"),
  sessionSecure: process.env.SESSION_SECURE === "true" || isProduction,
  trustProxy: process.env.TRUST_PROXY === "true" || isProduction,
  sessionDomain: process.env.SESSION_DOMAIN || undefined
};

if (config.sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters.");
}

module.exports = config;
