const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: { // Thời gian tạo bình luận (timestamp)
    type: Number,
    default: Date.now,
  },
  updatedAt: { // Thời gian cập nhật bình luận (timestamp)
    type: Number,
    default: Date.now,
  },
}, {
  versionKey: false,
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;