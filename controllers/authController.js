const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const nodemailer = require("nodemailer"); // Import nodemailer

const prisma = new PrismaClient();

const blacklistedTokens = [];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Check if the token is blacklisted
const isTokenBlacklisted = (token) => {
  return blacklistedTokens.includes(token);
};

// JWT Token Generation Function
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Passport Setup for GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: { githubId: profile.id },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              username: profile.username || profile.displayName,
              email: profile.emails[0]?.value,
              githubId: profile.id,
              role: "USER",
            },
          });
        }

        const token = generateToken(user);
        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Register Route
const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "All fields (username, email, password) are required.",
    });
  }

  try {
    // Check if email is already registered
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        message:
          "Email is already registered. Please log in or use another email.",
      });
    }

    // Check if username is already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username is already taken. Please choose another one.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || "USER",
        loginAttempts: 0, // Initialize login attempts
        failedLoginAttempts: 0, // Initialize failed login attempts
        isLocked: false, // Initialize account lock status
      },
    });

    // Return successful response
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    // Return error response
    res.status(500).json({
      message: "An error occurred while registering the user.",
      error: error.message,
    });
  }
};

// Login Route
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please register first." });
    }

    if (user.isLocked) {
      return res.status(403).json({
        message:
          "Your account is locked due to too many failed login attempts.",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "User authenticated via OAuth. Use OAuth to log in.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      await prisma.user.update({
        where: { email },
        data: {
          loginAttempts: { increment: 1 },
        },
      });

      // Lock the account if login attempts exceed the limit
      if (user.loginAttempts + 1 >= 5) {
        await prisma.user.update({
          where: { email },
          data: {
            isLocked: true,
          },
        });

        // Send email notification
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Account Locked",
            text: "Your account has been locked due to too many failed login attempts.",
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }

        return res.status(403).json({
          message: "Your account has been locked. An email has been sent.",
        });
      }

      return res.status(401).json({ message: "Invalid password." });
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { email },
      data: {
        loginAttempts: 0,
      },
    });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      auth: true,
      token,
      id: user.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while logging in.",
      error: error.message,
    });
  }
};

// Logout Route
const logout = (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  blacklistedTokens.push(token);
  res.status(200).json({ message: "Logout successful" });
};

module.exports = { register, login, logout, isTokenBlacklisted };
