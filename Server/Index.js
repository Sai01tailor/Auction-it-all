require("dotenv").config();
const cluster = require("node:cluster");
const os = require("os");
const connectDB = require("./connection");
const app = require("./app");

const PORT = process.env.PORT || 3000;
const totalCPUS = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} started | Forking ${totalCPUS} workers`);

  for (let i = 0; i < totalCPUS; i++) {
    cluster.fork();
  }

  const workerRestarts = new Map();
  const MAX_RESTARTS = 3;
  const RESTART_WINDOW_MS = 10_000; // 10 seconds

  cluster.on("exit", (worker, code, signal) => {
    const pid = worker.process.pid;
    console.warn(`Worker ${pid} exited | code: ${code} | signal: ${signal}`);

    const now = Date.now();
    const restarts = workerRestarts.get(pid) || [];

    // Keep only restarts within the time window
    const recentRestarts = restarts.filter((t) => now - t < RESTART_WINDOW_MS);

    if (recentRestarts.length < MAX_RESTARTS) {
      recentRestarts.push(now);
      const newWorker = cluster.fork();
      workerRestarts.set(newWorker.process.pid, recentRestarts);
      console.log(`Restarted worker as ${newWorker.process.pid}`);
    } else {
      console.error(
        `Worker ${pid} crashed ${MAX_RESTARTS} times in ${RESTART_WINDOW_MS / 1000}s — not restarting`
      );

      // If all workers are dead, shut down
      if (Object.keys(cluster.workers).length === 0) {
        console.error("All workers dead. Shutting down primary.");
        process.exit(1);
      }
    }
  });
} else {
  // Worker: exit cleanly if DB fails — don't hang around to be respawned endlessly
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error(`Worker ${process.pid} failed to connect to DB:`, err.message);
      process.exit(1); // clean exit, primary decides whether to respawn
    });
}
