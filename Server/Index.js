require("dotenv").config();
const http = require("http"); 
const connectDB = require("./connection");
const app = require("./app");
const { initSockets } = require("./sockets/socket"); 
const startCronJobs = require("./jobs/scheduler");
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start cron jobs
connectDB();
startCronJobs();

// 1. Wrap the Express app in a standard Node HTTP server
const server = http.createServer(app);

// 2. Attach Socket.io to that HTTP server
initSockets(server);

// 3. Listen on the 'server' instead of 'app'
server.listen(PORT, () => {
  console.log(`✅ Server started successfully on port ${PORT}`);
});

// ── Self-ping to keep Render free tier alive ───────────────────────
const RENDER_URL = process.env.RENDER_URL || '';
const KEEPALIVE_INTERVAL = parseInt(process.env.KEEPALIVE_INTERVAL || '300', 10) * 1000; // Default 5 minutes

if (RENDER_URL) {
  // Wait 30s after startup before first ping
  setTimeout(() => {
    setInterval(async () => {
      try {
        const res = await fetch(`${RENDER_URL}/health`);
        console.log(`[Keepalive] Ping → ${res.status}`);
      } catch (err) {
        console.error(`[Keepalive] Ping failed: ${err.message}`);
      }
    }, KEEPALIVE_INTERVAL);
  }, 30000); // 30 seconds delay

  console.log(`[Keepalive] Self-ping active → ${RENDER_URL}/health every ${KEEPALIVE_INTERVAL / 1000}s`);
} else {
  console.log('[Keepalive] RENDER_URL not set, self-ping disabled (local development)');
}