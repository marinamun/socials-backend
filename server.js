const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

//CORS
app.use(cors());

// Use the connection string from MongoDB Compass
const mongoURI = "mongodb://localhost:27017/socialsDB";

// Connect to MongoDB using Mongoose
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});

//FOR USERS:
// Import user routes
const userRoutes = require("./routes/userRoutes.js");

app.use(express.json());

// Use the user routes
app.use("/api/users", userRoutes);

//START THE SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
