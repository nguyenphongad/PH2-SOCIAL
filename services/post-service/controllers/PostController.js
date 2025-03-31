
const PostModel = require('../models/PostModel');
const mongoose = require("mongoose");
const { validationResult } = require('express-validator');
const UserModel = require('../models/UserModel');



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

// Lấy bài đăng theo ID
const getPostByUsernameAndPostId = async (req, res) => {
     try {

          const { username, postId } = req.params;

          console.log("username đăng bài: ", username)
          console.log("id bài đăng: ", postId)

          if (!mongoose.Types.ObjectId.isValid(postId)) {
               return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
          }

          const user = await UserModel.findOne({ username: username });
          if (!user) {
               return res.status(404).json({ message: 'Người dùng không tồn tại' });
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


module.exports = { createPost, getPostByUsernameAndPostId, deletePost };
