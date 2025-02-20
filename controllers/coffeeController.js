const Coffee = require("../models/coffee");
const { cloudinary } = require("../config/cloudinary");

// ➤ Add a new coffee rating
const addCoffee = async (req, res, next) => {
  try {
  

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const { name, rating, description } = req.body;
    const parsedRating = Number(rating);

    if (!name || !rating) {
      return res.status(400).json({ message: "Name and rating are required" });
    }

    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: "coffee_ratings" },
      async (error, uploadResult) => {
        if (error) return res.status(500).json({ message: "Image upload failed", error });

        const coffee = new Coffee({
          name,
          image: uploadResult.secure_url, // Store Cloudinary URL
          rating: parsedRating,
          description,
          userId: req.user,
        });

        await coffee.save();
        res.status(201).json(coffee);
      }
    );

    result.end(req.file.buffer); // Send file buffer to Cloudinary
  } catch (error) {
    next(error);
  }
};

// ➤ Get all coffee ratings
const getAllCoffees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const coffees = await Coffee.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email"); // Add this

    const total = await Coffee.countDocuments();

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: coffees,
    });
  } catch (error) {
    next(error);
  }
};

// ➤ Get all coffee ratings for the logged-in user
const getUserCoffees = async (req, res, next) => {
  try {
    const coffees = await Coffee.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(coffees);
  } catch (error) {
    next(error);
  }
};

// ➤ Get a single coffee rating by ID
const getCoffeeById = async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid coffee ID" });
    }

    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) return res.status(404).json({ message: "Coffee not found" });

    res.json(coffee);
  } catch (error) {
    next(error);
  }
};

// ➤ Update Coffee Review
const updateCoffee = async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid coffee ID" });
    }

    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) return res.status(404).json({ message: "Coffee not found" });

    if (coffee.userId.toString() !== req.user) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, rating, description } = req.body;

    coffee.name = name || coffee.name;
    coffee.rating = rating || coffee.rating;
    coffee.description = description || coffee.description;

    const updatedCoffee = await coffee.save();
    res.json(updatedCoffee);
  } catch (error) {
    next(error);
  }
};

// ➤ Delete Coffee Review
const deleteCoffee = async (req, res, next) => {
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
    next(error);
  }
};

module.exports = {
  addCoffee,
  getAllCoffees,
  getUserCoffees,
  getCoffeeById,
  updateCoffee,
  deleteCoffee,
};
