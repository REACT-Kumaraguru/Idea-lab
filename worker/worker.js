import "./register-env.js";
import { Worker } from "bullmq";
import { sendOtpEmailDirect } from "../backend/src/email/sendOtpEmailDirect.js";
import { OTP_EMAIL_QUEUE_NAME } from "../backend/src/queue/queue.js";
import { ENV } from "../backend/src/lib/env.js";

function log(...args) {
  console.log(new Date().toISOString(), "[email-worker]", ...args);
}

function connectionOptions() {
  return {
    host: ENV.REDIS_HOST || "127.0.0.1",
    port: Number(ENV.REDIS_PORT) || 6379,
    ...(ENV.REDIS_PASSWORD ? { password: ENV.REDIS_PASSWORD } : {}),
    maxRetriesPerRequest: null,
  };
}

if (!ENV.REDIS_HOST || !String(ENV.REDIS_HOST).trim()) {
  log("FATAL: REDIS_HOST is not set. Set REDIS_HOST (e.g. redis or localhost).");
  process.exit(1);
}

if (!ENV.SMTP_USER || !ENV.SMTP_PASS) {
  log("FATAL: SMTP_USER / SMTP_PASS not set.");
  process.exit(1);
}

const concurrency = Number(process.env.EMAIL_WORKER_CONCURRENCY) || 10;

const worker = new Worker(
  OTP_EMAIL_QUEUE_NAME,
  async (job) => {
    const { to, otp, purpose } = job.data;
    if (!to || !otp || !purpose) {
      throw new Error("Invalid job payload: expected { to, otp, purpose }");
    }
    log(`job ${job.id} start ${purpose} -> ${to}`);
    await sendOtpEmailDirect({ to, otp, purpose });
    log(`job ${job.id} sent OK`);
  },
  {
    connection: connectionOptions(),
    concurrency,
  }
);

worker.on("completed", (job) => {
  log(`completed id=${job.id}`);
});

worker.on("failed", (job, err) => {
  log(`FAILED id=${job?.id} attempts=${job?.attemptsMade}: ${err?.message || err}`);
});

worker.on("error", (err) => {
  log("Worker runtime error:", err?.message || err);
});

async function shutdown(signal) {
  log(`received ${signal}, closing worker...`);
  try {
    await worker.close();
  } catch (e) {
    log("close error:", e.message);
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

log(
  `started queue="${OTP_EMAIL_QUEUE_NAME}" redis=${ENV.REDIS_HOST}:${ENV.REDIS_PORT || 6379} concurrency=${concurrency}`
);
