require("dotenv").config();
const connectDB = require("./connection");
const app = require("./app");

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Start the single-threaded Express server
app.listen(PORT, () => {
  console.log(`✅ Server started successfully on port ${PORT}`);
});