require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const coffeeRoutes = require("./routes/coffeeRoutes");
const userRoutes = require("./routes/userRoutes");


app.use(express.json()); // Allows JSON request bodies
app.use(express.urlencoded({ extended: true })); // 🛠️ Fix for Multer to handle files
app.use(express.static("public")); // Optional: Serve static files if needed

app.get("/", (req, res) => {
  res.send("Welcome to the Coffee Rating API");
});

// Call the database connection
connectDB(); 

// Routes
app.use("/api/coffee", coffeeRoutes);
app.use("/api/users", userRoutes); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
