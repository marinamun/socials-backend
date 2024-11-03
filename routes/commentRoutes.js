const express = require("express");
const Comment = require("../models/Comment.model");
const router = express.Router();

// Create a  comment
router.post("/", async (req, res) => {
  const newComment = new Comment(req.body);
  try {
    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Get all comments from one post id
router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate("userId", "username")
      .populate("replies.userId", "username");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a comment
router.put("/:id", async (req, res) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json(updatedComment);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Delete a comment by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Tp reply to a specific comment
router.post("/:commentId/reply", async (req, res) => {
  const { commentId } = req.params;
  const { userId, content } = req.body;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Create the reply object
    const reply = {
      userId,
      content,
      createdAt: new Date(),
    };

    comment.replies.push(reply);

    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ message: "Failed to add reply" });
  }
});

module.exports = router;
