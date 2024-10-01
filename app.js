const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const helmet = require("helmet"); // Import Helmet
const { PrismaClient } = require("@prisma/client");
const swaggerDocs = require("./swagger");

dotenv.config();

const prisma = new PrismaClient();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();

// Use Helmet with custom configuration for enhanced security
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable default CSP (for now)
    frameguard: { action: "deny" }, // Prevent clickjacking
    hsts: { maxAge: 31536000, includeSubDomains: true }, // Force HTTPS
    referrerPolicy: { policy: "no-referrer" }, // Controls the Referer header
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
