const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  upload,
} = require("../controllers/itemController");

const router = express.Router();

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
