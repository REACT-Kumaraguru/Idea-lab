import http from "node:http";

const TARGET_HOST = "localhost";
const TARGET_PORT = 5003;
const TOTAL_REQUESTS = 500;
const CONCURRENCY = 50;

console.log(`=======================================================`);
console.log(`🚀 SIMULATING LIVE CAMPUS TRAFFIC`);
console.log(`Target: http://${TARGET_HOST}:${TARGET_PORT}`);
console.log(`Total Requests: ${TOTAL_REQUESTS} | Concurrency: ${CONCURRENCY}`);
console.log(`=======================================================\n`);

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: CONCURRENCY,
});

const endpoints = [
  "/api/health/ready",
  "/api/health",
  "/api/ich2026/problems",
];

let completed = 0;
let success = 0;
let failed = 0;
const latencies = [];

const startTime = Date.now();

function makeRequest(index) {
  return new Promise((resolve) => {
    const endpoint = endpoints[index % endpoints.length];
    const reqStart = Date.now();

    const req = http.request(
      {
        host: TARGET_HOST,
        port: TARGET_PORT,
        path: endpoint,
        method: "GET",
        agent: agent,
        timeout: 5000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          const duration = Date.now() - reqStart;
          latencies.push(duration);
          if (res.statusCode >= 200 && res.statusCode < 400) {
            success++;
          } else {
            failed++;
          }
          completed++;
          resolve();
        });
      }
    );

    req.on("error", (err) => {
      failed++;
      completed++;
      resolve();
    });

    req.on("timeout", () => {
      req.destroy();
      failed++;
      completed++;
      resolve();
    });

    req.end();
  });
}

async function runLoadTest() {
  const queue = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i);
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const idx = queue.shift();
      if (idx !== undefined) {
        await makeRequest(idx);
      }
    }
  });

  await Promise.all(workers);

  const totalTime = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = (completed / totalTime).toFixed(1);

  console.log(`\n=======================================================`);
  console.log(`📊 LOAD TEST RESULTS (LIVE BACKEND SIMULATION)`);
  console.log(`=======================================================`);
  console.log(`Total Requests Sent   : ${completed}`);
  console.log(`Successful (2xx/3xx)  : ${success}`);
  console.log(`Failed / Timed Out    : ${failed}`);
  console.log(`Success Rate          : ${((success / completed) * 100).toFixed(2)}%`);
  console.log(`Total Execution Time  : ${totalTime.toFixed(2)}s`);
  console.log(`Throughput            : ${rps} requests/second`);
  console.log(`-------------------------------------------------------`);
  console.log(`Median Latency (p50)  : ${p50} ms`);
  console.log(`95th Percentile (p95) : ${p95} ms`);
  console.log(`99th Percentile (p99) : ${p99} ms`);
  console.log(`=======================================================\n`);
}

runLoadTest().catch(console.error);
