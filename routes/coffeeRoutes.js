const express = require("express");
const Coffee = require("../models/coffee");
const protect = require("../middleware/authMiddleware"); // Import auth middleware
const router = express.Router();
const { upload } = require("../config/cloudinary");

// ➤ Add a new coffee rating (Protected)
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { name, rating, description } = req.body;
    const image = req.file ? req.file.path : null; // Get uploaded image URL

    const coffee = new Coffee({ name, image, rating, description, userId: req.user });
    await coffee.save();
    
    res.status(201).json(coffee);
  } catch (error) {
    res.status(500).json({ message: "Error adding coffee", error });
  }
});

// ➤ Get all coffee ratings (Public)
router.get("/", async (req, res) => {
  try {
    const coffees = await Coffee.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(coffees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coffees", error });
  }
});

// ➤ Get all coffee ratings for logged-in user (Protected)
router.get("/my-coffees", protect, async (req, res) => {
  try {
    const coffees = await Coffee.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(coffees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user coffees", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) return res.status(404).json({ message: "Coffee not found" });

    res.json(coffee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coffee", error });
  }
});

//Update Coffee Review (Protected)
router.put("/:id", protect, async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);

    if (!coffee) return res.status(404).json({ message: "Coffee not found" });
    if (coffee.userId.toString() !== req.user) return res.status(403).json({ message: "Not authorized" });

    coffee.name = req.body.name || coffee.name;
    coffee.rating = req.body.rating || coffee.rating;
    coffee.description = req.body.description || coffee.description;

    const updatedCoffee = await coffee.save();
    res.json(updatedCoffee);
  } catch (error) {
    res.status(500).json({ message: "Error updating coffee", error });
  }
});

// ➤ Delete Coffee Review (Protected)
router.delete("/:id", protect, async (req, res) => {
  try {
    // Validate ObjectId before querying the database
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid coffee ID" });
    }

    const coffee = await Coffee.findById(req.params.id);

    if (!coffee) return res.status(404).json({ message: "Coffee not found" });

    // Check if the logged-in user owns this coffee review
    if (coffee.userId.toString() !== req.user) {
      return res.status(403).json({ message: "Not authorized to delete this coffee" });
    }

    await coffee.deleteOne();
    res.json({ message: "Coffee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting coffee", error });
  }
});

module.exports = router;
