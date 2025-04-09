
const PostModel = require('../models/PostModel');
const UserModel = require('../models/UserModel');
const mongoose = require("mongoose");
const { validationResult } = require('express-validator');


// Tạo bài đăng
const createPost = async (req, res) => {

     try {

          const { content, imageUrl } = req.body;

          // Lấy userId từ token đã đăng nhập
          const luserID = req.user.userID;
          const username = req.user.username;
          console.log("id người đăng bài: ", luserID)
          const existingUser = await UserModel.findOne({ luserID });

          if (existingUser) {
               return res.status(201).json({ message: 'người đăng bài không tồn tại', status: false });
          }

          // Tạo bài viết mới
          const newPost = new PostModel({
               userID: luserID,
               username: username,
               content,
               imageUrl

          });

          // Lưu bài viết vào database
          await newPost.save();

          return res.status(201).json({ message: "Đăng bài thành công", post: newPost });
     } catch (error) {
          console.error("Lỗi đăng bài:", error);
          return res.status(500).json({ message: "Lỗi server đăng bài" });
     }
};

// Lấy bài đăng theo PostId
const getPostByUsernameAndPostId = async (req, res) => {
     try {

          const { postId } = req.params;

          console.log("id bài đăng: ", postId)

          if (!mongoose.Types.ObjectId.isValid(postId)) {
               return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
          }

          const post = await PostModel.findOne({ _id: postId });
          if (!post) {
               return res.status(404).json({ message: 'Bài đăng không tồn tại' });
          }

          return res.status(200).json({ post });
     } catch (error) {
          console.error('Lỗi lấy bài đăng:', error);
          return res.status(500).json({ message: 'Lỗi server lấy bài đăng' });
     }
};

// Lấy bài đăng theo username (lấy tất cả bài đăng của username)
const getPostsByUser = async (req, res) => {
     try {
          const { username } = req.params; // Lấy username từ URL
          console.log("username để lấy bài đăng:", username);

          // Tìm user theo username
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

          // Tìm các bài đăng của người dùng
          const posts = await PostModel.find({ userID: user.userID  }).sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo (mới nhất trước)

          return res.status(200).json({ posts });
     } catch (error) {
          console.error('Lỗi lấy bài đăng của người dùng:', error);
          return res.status(500).json({ message: 'Lỗi server lấy bài đăng của người dùng', error: error.message });
     }
};

//Update bài đăng
const updatePost = async (req, res) => {
     try {
          const { postId } = req.params;
          const { content, imageUrl, videoUrl } = req.body;
          const luserID = req.user.userID;

          console.log("postId để cập nhật:", postId);
          console.log("userId của người cập nhật:", luserID);

          if (!mongoose.Types.ObjectId.isValid(postId)) {
               return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
          }

          const post = await PostModel.findById(postId);
          if (!post) {
               return res.status(404).json({ message: 'Bài đăng không tồn tại' });
          }
          if (post.userID.toString() !== luserID) {
               return res.status(403).json({ message: 'Bạn không có quyền cập nhật bài đăng này!' })
          }

          const updateData = {};
          if (content !== undefined) {
               updateData.content = content;
          }
          if (imageUrl !== undefined) {
               updateData.imageUrl = imageUrl;
          }
          if (videoUrl !== undefined) {
               updateData.videoUrl = videoUrl;
          }
          if (req.body.content === undefined) {
               updateData.$unset = { ...updateData.$unset, content: 1 };
          }
          if (req.body.imageUrl === undefined) {
               updateData.$unset = { ...updateData.$unset, imageUrl: 1 };
          }
          if (req.body.videoUrl === undefined) {
               updateData.$unset = { ...updateData.$unset, videoUrl: 1 };
          }
          updateData.updatedAt = Date.now();

          const updatedPost = await PostModel.findByIdAndUpdate(
               postId,
               updateData,
               { new: true }
          );
          return res.status(200).json({ message: 'Cập nhật bài đăng thành công', post: updatedPost });

     } catch (error) {
          console.error('Lỗi cập nhật bài đăng:', error);
          return res.status(500).json({ message: 'Lỗi server update bài đăng', error: error.message });
     }
};

// delete bài đăng
const deletePost = async (req, res) => {
     try {
          const { postId } = req.params; // Lấy postId từ URL
          const luserID = req.user.userID; // Lấy userId từ token

          console.log("postId để xóa:", postId);
          console.log("userId của người xóa:", luserID);

          // Kiểm tra postId hợp lệ
          if (!mongoose.Types.ObjectId.isValid(postId)) {
               return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
          }

          // Tìm bài đăng để kiểm tra quyền
          const post = await PostModel.findById(postId);
          if (!post) {
               return res.status(404).json({ message: 'Bài đăng không tồn tại' });
          }

          // Kiểm tra quyền xóa
          if (post.userID.toString() !== luserID.toString()) {
               return res.status(403).json({ message: 'Bạn không có quyền xóa bài đăng này' });
          }

          // Xóa bài đăng
          await PostModel.findByIdAndDelete(postId);

          return res.status(200).json({ message: 'Xóa bài đăng thành công' });

     } catch (error) {
          console.error('Lỗi xóa bài đăng:', error);
          return res.status(500).json({ message: 'Lỗi server xóa bài đăng', error: error.message });
     }
};


module.exports = { createPost, getPostByUsernameAndPostId, deletePost, updatePost, getPostsByUser };
