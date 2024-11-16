const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for CORS and JSON
app.use(cors());

//adjust the size of files that can be uplaoaded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/socialsDB";

if (!mongoURI) {
  console.error("Error: MONGO_URI environment variable not set");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define routes for Express
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const textMessageRoutes = require("./routes/textMessageRoutes");

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/messages", textMessageRoutes);

// Serve static files (if any)
app.use("/media", express.static(path.join(__dirname, "media")));

// Create the HTTP server using Express
const server = http.createServer(app);

// Initialize Socket.IO on the same server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Import your TextMessage model
const TextMessage = require("./models/Textmessage.model");
const { ObjectId } = require("mongoose").Types;

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", async (data) => {
    console.log("Received message data:", data);

    const { Types } = require("mongoose");

    /*     console.log("Type of senderId:", typeof data.senderId, "Value:", data.senderId);
    console.log("Type of recipientId:", typeof data.recipientId, "Value:", data.recipientId); */

    try {
      if (
        !Types.ObjectId.isValid(data.senderId) ||
        !Types.ObjectId.isValid(data.recipientId)
      ) {
        console.error("Invalid ObjectId format");
        return;
      }

      const senderObjectId = new Types.ObjectId(data.senderId);
      const recipientObjectId = new Types.ObjectId(data.recipientId);

      const newMessage = new TextMessage({
        senderId: senderObjectId,
        recipientId: recipientObjectId,
        content: data.content,
        timestamp: new Date(),
      });

      await newMessage.save();
      console.log("Message saved to MongoDB:", newMessage);

      io.emit("receive_message", newMessage);
    } catch (err) {
      console.error("Error saving message to MongoDB:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
