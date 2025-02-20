const mongoose = require("mongoose");

const CoffeeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Coffee name
  image: { type: String, required: true }, // Image URL or base64
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating 1-5
  description: { type: String }, // Optional description
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to user
}, { timestamps: true }); // Adds createdAt and updatedAt fields

module.exports = mongoose.model("Coffee", CoffeeSchema);
