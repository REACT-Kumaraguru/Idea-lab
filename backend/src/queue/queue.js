import { Queue } from "bullmq";
import { ENV } from "../lib/env.js";

export const OTP_EMAIL_QUEUE_NAME = "otp-email";

/** BullMQ + ioredis require this for blocking operations. */
function connectionOptions() {
  return {
    host: ENV.REDIS_HOST || "127.0.0.1",
    port: Number(ENV.REDIS_PORT) || 6379,
    ...(ENV.REDIS_PASSWORD ? { password: ENV.REDIS_PASSWORD } : {}),
    maxRetriesPerRequest: null,
  };
}

export function isQueueEnabled() {
  return Boolean(ENV.REDIS_HOST && String(ENV.REDIS_HOST).trim());
}

let _queue = null;

export function getOtpEmailQueue() {
  if (!isQueueEnabled()) return null;
  if (!_queue) {
    _queue = new Queue(OTP_EMAIL_QUEUE_NAME, {
      connection: connectionOptions(),
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 5000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    });
  }
  return _queue;
}

/**
 * Enqueue OTP email job. API returns immediately after this resolves.
 * @param {{ to: string, otp: string, purpose: 'register' | 'reset' }} data
 */
export async function addOtpEmailJob(data) {
  const queue = getOtpEmailQueue();
  if (!queue) {
    throw new Error("Redis queue is not configured");
  }
  const jobId = `${data.purpose}:${data.to}:${Date.now()}`;
  await queue.add(
    "send-otp",
    { to: data.to, otp: data.otp, purpose: data.purpose },
    { jobId }
  );
}

export async function closeOtpEmailQueue() {
  if (_queue) {
    await _queue.close();
    _queue = null;
  }
}
