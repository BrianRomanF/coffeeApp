const Coffee = require("../models/coffee");
const { cloudinary } = require("../config/cloudinary");

// ➤ Add a new coffee rating
const addCoffee = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "coffee_ratings",
    });

    const coffee = new Coffee({
      name: req.body.name,
      image: result.secure_url, // Store Cloudinary URL
      rating: req.body.rating,
      description: req.body.description,
      userId: req.user,
    });

    await coffee.save();
    res.status(201).json(coffee);
  } catch (error) {
    console.error("❌ Error adding coffee:", error);
    res.status(500).json({ message: "Error adding coffee", error });
  }
};

// ➤ Get all coffee ratings
const getAllCoffees = async (req, res) => {
  try {
    const coffees = await Coffee.find().sort({ createdAt: -1 });
    res.json(coffees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coffees", error });
  }
};

// ➤ Get all coffee ratings for the logged-in user
const getUserCoffees = async (req, res) => {
  try {
    const coffees = await Coffee.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(coffees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user coffees", error });
  }
};

// ➤ Get a single coffee rating by ID
const getCoffeeById = async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) return res.status(404).json({ message: "Coffee not found" });

    res.json(coffee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coffee", error });
  }
};

// ➤ Update Coffee Review
const updateCoffee = async (req, res) => {
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
};

// ➤ Delete Coffee Review
const deleteCoffee = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid coffee ID" });
    }

    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) return res.status(404).json({ message: "Coffee not found" });

    if (coffee.userId.toString() !== req.user) {
      return res.status(403).json({ message: "Not authorized to delete this coffee" });
    }

    await coffee.deleteOne();
    res.json({ message: "Coffee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting coffee", error });
  }
};

module.exports = { addCoffee, getAllCoffees, getUserCoffees, getCoffeeById, updateCoffee, deleteCoffee };
