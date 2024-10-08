const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const helmet = require("helmet"); // Import Helmet
const rateLimit = require("express-rate-limit"); // Import rate limiting
const { PrismaClient } = require("@prisma/client");
const swaggerDocs = require("./swagger");

dotenv.config();

const prisma = new PrismaClient();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiting to all requests
app.use(limiter);

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    referrerPolicy: { policy: "no-referrer" },
  })
);

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(passport.initialize());

swaggerDocs(app);

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/items", itemRoutes);

// Start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
}

startServer();
