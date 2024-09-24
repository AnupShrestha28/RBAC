const express = require("express");
const passport = require("passport");
const { register, login, logout } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", verifyToken, logout);

// GitHub OAuth Routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    const { user, token } = req.user;
    res.status(200).json({
      message: "GitHub authentication successful",
      user,
      token,
    });
  }
);

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.status(200).json({
      message: "Logged in with Google",
      user: req.user,
    });
  }
);

module.exports = router;
