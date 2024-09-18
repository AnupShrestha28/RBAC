const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");
const formatSize = require("../utils/formatSize"); // Import the formatSize function

// Multer configuration for storing images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000, // 1MB size limit for the uploaded file
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (!mimetype || !extname) {
      return cb("Error: Images Only!");
    }

    // If file exceeds size limit
    if (file.size > 1000000) {
      return cb("Error: File size exceeds 1MB!");
    }

    cb(null, true);
  },
}).single("photo");

const createItem = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ message: err });
    }

    console.log("File upload successful", req.file); // Log file details

    const { name, description } = req.body;
    const userId = req.user.id;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null; // Store the file path
    const photoSizeInBytes = req.file ? req.file.size : null; // Store size in bytes

    try {
      const item = await prisma.item.create({
        data: {
          name,
          description,
          photoUrl,
          photoSize: photoSizeInBytes, // Store size in bytes
          userId,
        },
      });
      res.status(201).json({
        ...item,
        photoSize: formatSize(photoSizeInBytes), // Include formatted size in response
      });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({
        message: "An error occurred while creating the item.",
        error: error.message,
      });
    }
  });
};

const getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany();

    const formattedItems = items.map((item) => ({
      ...item,
      photoSize: item.photoSize ? formatSize(item.photoSize) : null, // Format photoSize
    }));

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error("Database error:", error);
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
    const item = await prisma.item.findUnique({
      where: { id, userId },
    });

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
      where: { id, userId },
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied." });
    }

    const updatedItem = await prisma.item.update({
      where: { id: item.id },
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
      where: { id },
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
  upload,
};
