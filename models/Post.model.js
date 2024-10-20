const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  image: {
    type: String,
    default: null,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //an array of users that liked the post
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", // array of comment ids
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Post model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
