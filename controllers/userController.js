const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while fetching users.",
        error: error.message,
      });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // Ensure id is passed and is a valid UUID or format
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while fetching the user.",
        error: error.message,
      });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    // Ensure id is passed and is a valid UUID or format
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Update the user
    const user = await prisma.user.update({
      where: { id },
      data: { username, email, role },
    });

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while updating the user.",
        error: error.message,
      });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Ensure id is passed and is a valid UUID or format
    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Delete the user
    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while deleting the user.",
        error: error.message,
      });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
