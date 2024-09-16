const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const prisma = require("./prismaClient");
const swaggerDocs = require("./swagger");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();

app.use(express.json());

swaggerDocs(app);

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/items", itemRoutes);

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
