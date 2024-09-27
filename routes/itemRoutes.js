const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  addView,
  addLike,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  upload,
} = require("../controllers/itemController");

const router = express.Router();

/**
 * @swagger
 * /items/{itemId}/view:
 *   post:
 *     summary: Add a view to an item
 *     security:
 *       - bearerAuth: []
 *     tags: [Items]
 */
router.post("/:itemId/view", verifyToken, addView);

/**
 * @swagger
 * /items/{itemId}/like:
 *   post:
 *     summary: Add a like to an item
 *     security:
 *       - bearerAuth: []
 *     tags: [Items]
 */
router.post("/:itemId/like", verifyToken, addLike);

/**
 * @swagger
 * /items/{itemId}/comment:
 *   post:
 *     summary: Add a comment to an item
 *     security:
 *       - bearerAuth: []
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 */
router.post("/:itemId/comment", verifyToken, addComment);

/**
 * @swagger
 * /items/{itemId}/comments:
 *   get:
 *     summary: Get all comments for an item
 *     security:
 *       - bearerAuth: []
 *     tags: [Items]
 */
router.get("/:itemId/comments", verifyToken, getComments);

/**
 * @swagger
 * /comments/{commentId}/edit:
 *   put:
 *     summary: Update a comment by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 */
router.put("/:commentId/edit", verifyToken, updateComment);

/**
 * @swagger
 * /comments/{commentId}/delete:
 *   delete:
 *     summary: Delete a comment by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
router.delete("/:commentId/delete", verifyToken, deleteComment);

/**
 * @swagger
 * /items/add:
 *   post:
 *     summary: Create a new item
 *     security:
 *       - bearerAuth: []
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Item created successfully
 */
router.post("/add", verifyToken, createItem);

/**
 * @swagger
 * /items/getAll:
 *   get:
 *     summary: Get all items
 *     security:
 *       - bearerAuth: []
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: Successfully fetched all items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/getAll", verifyToken, getAllItems);

/**
 * @swagger
 * /items/getItem/{id}:
 *   get:
 *     summary: Get item by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched the item
 */
router.get("/getItem/:id", verifyToken, getItemById);

/**
 * @swagger
 * /items/edit/{id}:
 *   put:
 *     summary: Update an item by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 */
router.put("/edit/:id", verifyToken, updateItem);

/**
 * @swagger
 * /items/delete/{id}:
 *   delete:
 *     summary: Delete an item by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 */
router.delete("/delete/:id", verifyToken, deleteItem);

module.exports = router;
