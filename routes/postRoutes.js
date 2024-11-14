const express = require("express");
const Post = require("../models/Post.model");
const router = express.Router();
const cloudinary = require("../cloudinaryConfig");

// Create a new post
router.post("/", async (req, res) => {
  const { userId, content, uploadedImage } = req.body;
  try {
    let imageUrl = null;

    // Upload the image to Cloudinary if provided
    if (uploadedImage) {
      const uploadResponse = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${uploadedImage}`,
        { folder: "posts" }
      );
      imageUrl = uploadResponse.secure_url;
    }

  
    let newPost = new Post({
      userId,
      content,
      image: imageUrl,
    });

    const savedPost = await newPost.save();

    const populatedPost = await Post.findById(savedPost._id).populate(
      "userId",
      "username profilePicture"
    );

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(400).json({ error: "Failed to create post" });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("userId");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a post
// Get a single post by ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "username profilePicture"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Failed to fetch post" });
  }
});

// Update a post
router.put("/:id", async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Delete a post by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like a post. Check first if they already liked it, if they did, unlike it. Like a toggle.
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(req.body.userId)) {
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.body.userId
      );
    } else {
      post.likes.push(req.body.userId);
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
