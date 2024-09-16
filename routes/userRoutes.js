const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/roleMiddleware");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully fetched all users
 */
router.get("/", verifyToken, checkRole(["ADMIN", "SUPER_ADMIN"]), getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Successfully fetched the user
 *     description: Accessible by ADMIN, SUPER_ADMIN, and MODERATOR
 */
router.get(
  "/:id",
  verifyToken,
  checkRole(["ADMIN", "SUPER_ADMIN", "MODERATOR"]),
  getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *             example:
 *               username: "John Doe"
 *               email: "john.doe@example.com"
 *               role: "ADMIN"
 *     responses:
 *       200:
 *         description: User updated successfully
 *     description: Accessible by ADMIN or SUPER_ADMIN
 */
router.put(
  "/:id",
  verifyToken,
  checkRole(["ADMIN", "SUPER_ADMIN"]),
  updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *     description: Only accessible by SUPER_ADMIN
 */
router.delete("/:id", verifyToken, checkRole(["SUPER_ADMIN"]), deleteUser);

module.exports = router;
