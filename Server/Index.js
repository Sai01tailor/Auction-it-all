require("dotenv").config();
const http = require("http"); // <-- ADDED: Node's native HTTP module
const connectDB = require("./connection");
const app = require("./app");
const { initSockets } = require("./sockets/socket"); // <-- ADDED: Import your socket engine

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// 1. Wrap the Express app in a standard Node HTTP server
const server = http.createServer(app);

// 2. Attach Socket.io to that HTTP server
initSockets(server);

// 3. Listen on the 'server' instead of 'app'
server.listen(PORT, () => {
  console.log(`✅ Server started successfully on port ${PORT}`);
});