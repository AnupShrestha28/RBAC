const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const prisma = require("./prismaClient");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();

app.use(express.json()); // Middleware for parsing JSON

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/items", itemRoutes);

// Check database connection before starting the server
async function startServer() {
  try {
    // Test the database connection
    await prisma.$connect();
    console.log("Database connected successfully");

    // Start the server
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
}

startServer();
