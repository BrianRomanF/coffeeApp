const express = require("express");
const { upload } = require("../config/cloudinary");
const protect = require("../middleware/authMiddleware");

const {
  addCoffee,
  getAllCoffees,
  getUserCoffees,
  getCoffeeById,
  updateCoffee,
  deleteCoffee
} = require("../controllers/coffeeController");

const router = express.Router();

router.post("/", protect,  upload.single("image"), addCoffee);
router.get("/", getAllCoffees);
router.get("/my-coffees", protect, getUserCoffees);
router.get("/:id", getCoffeeById);
router.put("/:id", protect, updateCoffee);
router.delete("/:id", protect, deleteCoffee);

module.exports = router;
