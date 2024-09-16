const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const router = express.Router();

router.post("/add", verifyToken, createItem);
router.get("/getAll", verifyToken, getAllItems);
router.get("/getItem/:id", verifyToken, getItemById);
router.put("/edit/:id", verifyToken, updateItem);
router.delete("/delete/:id", verifyToken, deleteItem);

module.exports = router;
