const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const swaggerDocs = require("./swagger");

dotenv.config();

const prisma = new PrismaClient();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve static files

// Swagger docs setup
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
