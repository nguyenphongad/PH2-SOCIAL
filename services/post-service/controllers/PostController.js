
const PostModel = require('../models/PostModel');
const mongoose = require("mongoose");
const { validationResult } = require('express-validator');
const UserModel = require('../models/UserModel');

const createPost = async (req, res) => {

     try {

          const { content, imageUrl } = req.body;

          // Lấy userId từ token đã đăng nhập
          const luserID = req.user.userID;


          console.log(luserID)

          const existingUser = await UserModel.findOne({ luserID });

          if (existingUser) {
               return res.status(201).json({ message: 'người đăng bài không tồn tại', status: false });
          }

          // Tạo bài viết mới
          const newPost = new PostModel({
               userID: luserID,
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

module.exports = { createPost };
