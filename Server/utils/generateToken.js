const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign(
    { userId:user._id,role:user.role},
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

module.exports = generateToken;
