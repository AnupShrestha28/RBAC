const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createItem = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  try {
    const item = await prisma.item.create({
      data: {
        name,
        description,
        userId,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the item.",
      error: error.message,
    });
  }
};

const getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { userId: req.user.id },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching items.",
      error: error.message,
    });
  }
};

const getItemById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const item = await prisma.item.findUnique({ where: { id, userId } });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied." });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while fetching the item.",
      error: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, description } = req.body;

  try {
    const item = await prisma.item.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied." });
    }

    const updatedItem = await prisma.item.update({
      where: {
        id: item.id,
      },
      data: {
        name,
        description,
      },
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating the item.",
      error: error.message,
    });
  }
};

const deleteItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const item = await prisma.item.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied." });
    }

    await prisma.item.delete({
      where: {
        id,
      },
    });

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the item.",
      error: error.message,
    });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};
