require("dotenv").config();
const connectDB = require("./connection");
const app = require("./app");

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
