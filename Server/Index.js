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