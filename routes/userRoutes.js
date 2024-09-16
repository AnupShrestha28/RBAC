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

router.get("/", verifyToken, checkRole(["ADMIN", "SUPER_ADMIN"]), getAllUsers);
router.get(
  "/:id",
  verifyToken,
  checkRole(["ADMIN", "SUPER_ADMIN", "MODERATOR"]),
  getUserById
);
router.put(
  "/:id",
  verifyToken,
  checkRole(["ADMIN", "SUPER_ADMIN"]),
  updateUser
);
router.delete("/:id", verifyToken, checkRole(["SUPER_ADMIN"]), deleteUser);

module.exports = router;
