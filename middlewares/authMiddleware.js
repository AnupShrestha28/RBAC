const jwt = require("jsonwebtoken");
const { isTokenBlacklisted } = require("../controllers/authController");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(403).json({ message: "Token is required." });

  // Check if the token is blacklisted
  if (isTokenBlacklisted(token)) {
    return res
      .status(401)
      .json({ message: "Token has been blacklisted. Please log in again." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid Token." });
    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken };
