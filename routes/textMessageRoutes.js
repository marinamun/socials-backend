const { ObjectId } = require("mongoose").Types;
const express = require("express");
const router = express.Router();
const TextMessage = require("../models/Textmessage.model");

// Fetch chat history between two users
router.get("/:senderId/:recipientId", async (req, res) => {
  const { senderId, recipientId } = req.params;

  try {
    // Validate ObjectIds before querying
    if (!ObjectId.isValid(senderId) || !ObjectId.isValid(recipientId)) {
      return res.status(400).json({ error: "Invalid ObjectId format" });
    }

    const messages = await TextMessage.find({
      $or: [
        { senderId: new ObjectId(senderId), recipientId: new ObjectId(recipientId) },
        { senderId: new ObjectId(recipientId), recipientId: new ObjectId(senderId) }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

module.exports = router;
