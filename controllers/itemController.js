const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { body, param, validationResult } = require("express-validator");
const formatSize = require("../utils/formatSize");

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
    fileSize: 1000000,
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

    cb(null, true);
  },
}).single("photo");

const checkUserExists = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user !== null;
};

// Add a view to an item
const addView = async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;

  // Validate request params
  await param("itemId")
    .isUUID()
    .withMessage("Item ID must be a valid UUID")
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user and item exist
    const userExists = await checkUserExists(userId);
    const itemExists = await prisma.item.findUnique({ where: { id: itemId } });
    if (!userExists || !itemExists) {
      return res.status(404).json({ message: "User or Item not found" });
    }

    // Add view (or check if already viewed)
    const view = await prisma.view.upsert({
      where: { userId_itemId: { userId, itemId } },
      update: {},
      create: { userId, itemId },
    });

    res.status(201).json(view);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding view", error: error.message });
  }
};

// Add a like to an item
const addLike = async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;

  // Validate request params
  await param("itemId")
    .isUUID()
    .withMessage("Item ID must be a valid UUID")
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userExists = await checkUserExists(userId);
    const itemExists = await prisma.item.findUnique({ where: { id: itemId } });
    if (!userExists || !itemExists) {
      return res.status(404).json({ message: "User or Item not found" });
    }

    // Check if the user already liked the item
    const existingLike = await prisma.like.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });

    if (existingLike) {
      // If the like exists, remove it (dislike)
      await prisma.like.delete({
        where: { userId_itemId: { userId, itemId } },
      });
      return res
        .status(200)
        .json({ message: "Disliked the item successfully" });
    } else {
      // If the like does not exist, add it
      const like = await prisma.like.create({
        data: { userId, itemId },
      });
      return res
        .status(201)
        .json({ message: "Liked the item successfully", like });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating like status", error: error.message });
  }
};

// Add a comment to an item
const addComment = [
  body("comment").notEmpty().withMessage("Comment cannot be empty").isString(),
  param("itemId").isUUID().withMessage("Item ID must be a valid UUID"),
  async (req, res) => {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { comment } = req.body;

    // Validate request body and params
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userExists = await checkUserExists(userId);
      const itemExists = await prisma.item.findUnique({
        where: { id: itemId },
      });
      if (!userExists || !itemExists) {
        return res.status(404).json({ message: "User or Item not found" });
      }

      const newComment = await prisma.comment.create({
        data: { userId, itemId, comment },
      });

      res.status(201).json(newComment);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding comment", error: error.message });
    }
  },
];

// Get all comments for an item
const getComments = [
  param("itemId").isUUID().withMessage("Item ID must be a valid UUID"),
  async (req, res) => {
    const { itemId } = req.params;

    // Validate request params
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const comments = await prisma.comment.findMany({
        where: { itemId },
        include: { user: { select: { username: true } } },
      });

      res.status(200).json(comments);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching comments", error: error.message });
    }
  },
];

const createItem = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ message: err });
    }

    const { name, description } = req.body;
    const userId = req.user.id;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const photoSizeInBytes = req.file ? req.file.size : null;

    // Check if user exists
    const userExists = await checkUserExists(userId);
    if (!userExists) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    try {
      const item = await prisma.item.create({
        data: {
          name,
          description,
          photoUrl,
          photoSize: photoSizeInBytes,
          userId,
        },
      });
      res.status(201).json({
        ...item,
        photoSize: formatSize(photoSizeInBytes),
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
    const items = await prisma.item.findMany({
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    const formattedItems = items.map((item) => ({
      ...item,
      photoSize: item.photoSize ? formatSize(item.photoSize) : null,
      likeCount: item._count.likes,
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
    // Find the item with its creator's ID and the counts of likes and views
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        _count: {
          select: { likes: true, views: true },
        },
        user: {
          select: { id: true }, // Select the item creator's userId
        },
      },
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied." });
    }

    // Prepare the response data
    const responseData = {
      id: item.id,
      name: item.name,
      description: item.description,
      photoUrl: item.photoUrl,
      photoSize: formatSize(item.photoSize),
      likeCount: item._count.likes,
    };

    // If the current user is the creator of the item, include the view count
    if (item.user.id === userId) {
      responseData.viewCount = item._count.views;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({
      message: "An error occurred while fetching the item.",
      error: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ message: err });
    }

    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;
    const newPhotoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const newPhotoSizeInBytes = req.file ? req.file.size : null;

    // Check if user exists
    const userExists = await checkUserExists(userId);
    if (!userExists) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    try {
      // Find the existing item
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

      // Delete the old photo file if a new photo is uploaded
      if (item.photoUrl && newPhotoUrl) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "uploads",
          path.basename(item.photoUrl)
        );
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("Old file deletion error:", err);
        });
      }

      // Update the item in the database
      const updatedItem = await prisma.item.update({
        where: { id },
        data: {
          name,
          description,
          photoUrl: newPhotoUrl || item.photoUrl,
          photoSize: newPhotoSizeInBytes || item.photoSize,
        },
      });

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while updating the item.",
        error: error.message,
      });
    }
  });
};

const deleteItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Find the item to be deleted
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

    // Delete the file from the server
    if (item.photoUrl) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(item.photoUrl)
      );
      fs.unlink(filePath, (err) => {
        if (err) console.error("File deletion error:", err);
      });
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
  addView,
  addLike,
  addComment,
  getComments,
  upload,
};
