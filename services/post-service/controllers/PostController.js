
const PostModel = require('../models/PostModel');
const UserModel = require('../models/UserModel');
const LikeModel = require('../models/LikeModel');
const CommentsModel = require('../models/CommentsModel');
const mongoose = require("mongoose");
const { validationResult } = require('express-validator');


// Tạo bài đăng
const createPost = async (req, res) => {
    try {
        // Lấy cả content, imageUrl, và videoUrl từ req.body
        const { content, imageUrls, videoUrl } = req.body;

        const luserID = req.user.userID; // Lấy ID từ token (giả sử đây là _id của user)
        const username = req.user.username; // Lấy username từ token
        
        if (!content && (!imageUrls || imageUrls.length === 0) && !videoUrl) {
            return res.status(400).json({ message: 'Bài đăng phải có nội dung, hình ảnh hoặc video.', status: false });
        }


        const newPost = new PostModel({
            userID: luserID, // Nên là _id của user
            username: username,
            content: content || "", 
            imageUrls: imageUrls && Array.isArray(imageUrls) ? imageUrls : [],
            videoUrl: videoUrl || ""
        });

        await newPost.save();
        // Trả về status: true để client dễ kiểm tra
        return res.status(201).json({ message: "Đăng bài thành công", post: newPost, status: true });

    } catch (error) {
        console.error("Lỗi đăng bài:", error);
        if (error.name === 'ValidationError') {
            // Lỗi từ Mongoose validation (ví dụ nếu có trường required khác bị thiếu trong model)
            return res.status(400).json({ message: "Dữ liệu không hợp lệ: " + error.message, errors: error.errors, status: false });
        }
        return res.status(500).json({ message: "Lỗi server khi đăng bài", error: error.message, status: false });
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
          const posts = await PostModel.find({ userID: user.userID }).sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo (mới nhất trước)

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

// Lấy tất cả bài đăng từ các user đang theo dõi
const getFeedPosts = async (req, res) => {
     try {
         const currentUserId = req.user.userID; // Lấy _id của user từ token
 
         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 10;
         const skip = (page - 1) * limit;
 
         // Tìm người dùng hiện tại để lấy danh sách following
         const currentUser = await UserModel.findOne({ userID: new mongoose.Types.ObjectId(currentUserId) });
 
         if (!currentUser) {
             return res.status(404).json({ message: 'Người dùng không tồn tại' });
         }
 
         
         let followingObjectIds = [];
         if (currentUser.following && Array.isArray(currentUser.following)) {
             followingObjectIds = currentUser.following
                 .map(id => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null)
                 .filter(id => id !== null);
         }
         if (mongoose.Types.ObjectId.isValid(currentUser._id)) { // Sử dụng _id từ currentUser đã tìm được
              followingObjectIds.push(currentUser._id);
         }
         followingObjectIds = [...new Set(followingObjectIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));
 
 
         if (followingObjectIds.length === 0) {
              return res.status(200).json({ feedPosts: [], currentPage: page, totalPages: 0, totalPosts: 0 });
         }
 
         // Lấy tổng số bài đăng phù hợp
         const totalPosts = await PostModel.countDocuments({ userID: { $in: followingObjectIds } });
         const totalPages = Math.ceil(totalPosts / limit);
 
         // 1. Lấy danh sách bài đăng gốc (đã populate userID)
         const originalFeedPosts = await PostModel.find({ userID: { $in: followingObjectIds } })
             .sort({ createdAt: -1 })
             .skip(skip)
             .limit(limit)
             .populate({
                 path: 'userID', // Trường trong PostModel
                 model: 'Users', // Tên model User
                 select: 'username profilePicture' // Các trường cần lấy
             })
             .lean(); // Sử dụng lean() để trả về plain JavaScript objects, giúp thêm trường mới dễ hơn
 
         // Nếu không có bài đăng nào thì trả về luôn
         if (!originalFeedPosts || originalFeedPosts.length === 0) {
              return res.status(200).json({ feedPosts: [], currentPage: page, totalPages: 0, totalPosts: 0 });
         }
 
         // 2. Lấy danh sách các postId từ feed
         const postIds = originalFeedPosts.map(post => post._id);
 
         // 3. Tìm các lượt thích của người dùng hiện tại cho các bài đăng này
         const userLikes = await LikeModel.find({
             userId: currentUserId, // Tìm theo _id của user
             postId: { $in: postIds } // Chỉ tìm trong các post của feed
         }).select('postId'); // Chỉ cần lấy postId
 
         // 4. Tạo một Set chứa các postId mà người dùng đã thích để tra cứu nhanh
         const likedPostIds = new Set(userLikes.map(like => like.postId.toString()));
 
         // 5. Thêm trường isLikedByCurrentUser vào mỗi bài đăng
         const feedPostsWithLikeStatus = originalFeedPosts.map(post => ({
             ...post, // Giữ lại tất cả các trường của bài đăng gốc
             isLikedByCurrentUser: likedPostIds.has(post._id.toString()) // Kiểm tra xem postId có trong Set không
         }));
 
 
         return res.status(200).json({
             feedPosts: feedPostsWithLikeStatus, // Trả về mảng bài đăng đã có thêm trạng thái like
             currentPage: page,
             totalPages,
             totalPosts
         });
 
     } catch (error) {
         console.error('Lỗi lấy feed bài đăng:', error);
         if (error.name === 'CastError') {
              return res.status(400).json({ message: 'ID người dùng hoặc bài đăng không hợp lệ.', error: error.message });
         }
         if (error.name === 'MissingSchemaError') {
              console.error("Lỗi Populate: Model chưa được đăng ký hoặc tên model sai.", error.message);
              return res.status(500).json({ message: 'Lỗi server: Cấu hình model tham chiếu bị lỗi.', error: error.message });
         }
         return res.status(500).json({ message: 'Lỗi server lấy feed bài đăng', error: error.message });
     }
 };

// Tìm kiếm bài đăng
const searchPosts = async (req, res) => {
     try {
          const { keyword } = req.query; // Lấy từ khóa từ query parameter
          console.log("Từ khóa tìm kiếm:", keyword);

          if (!keyword) {
               return res.status(400).json({ message: 'Vui lòng cung cấp từ khóa tìm kiếm' });
          }

          // Tạo regex để tìm kiếm không phân biệt hoa thường và có thể tìm kiếm một phần của từ
          const regex = new RegExp(keyword, 'i');

          // Tìm kiếm các bài đăng có nội dung chứa từ khóa
          const searchPosts = await PostModel.find({ content: { $regex: regex } })
               .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo (mới nhất trước)

          return res.status(200).json({ searchPosts });

     } catch (error) {
          console.error('Lỗi tìm kiếm bài đăng:', error);
          return res.status(500).json({ message: 'Lỗi server tìm kiếm bài đăng', error: error.message });
     }
};

// like bài đăng
const toggleLikePost = async (req, res) => {
     try {
         const { postId } = req.params;
         const userId = req.user.userID; // Lấy _id của user từ token
 
         if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
             return res.status(400).json({ message: 'ID bài đăng hoặc người dùng không hợp lệ' });
         }
 
         const post = await PostModel.findById(postId);
         if (!post) {
             return res.status(404).json({ message: 'Bài đăng không tồn tại' });
         }
 
         const existingLike = await LikeModel.findOne({ postId: postId, userId: userId });
 
         let updatedPost;
         let message;
         let isLikedByCurrentUser; // Đổi tên biến liked thành isLikedByCurrentUser
 
         if (existingLike) {
             // --- UNLIKE ---
             await LikeModel.findByIdAndDelete(existingLike._id);
             updatedPost = await PostModel.findByIdAndUpdate(
                 postId,
                 { $pull: { likes: existingLike._id } },
                 { new: true }
             ).populate({ path: 'userID', model: 'Users', select: 'username profilePicture' }); // Giữ lại populate
 
             message = 'Đã bỏ thích bài đăng';
             isLikedByCurrentUser = false; // Trạng thái mới là false
 
         } else {
             // --- LIKE ---
             const newLike = new LikeModel({ postId: postId, userId: userId });
             await newLike.save();
             updatedPost = await PostModel.findByIdAndUpdate(
                 postId,
                 { $push: { likes: newLike._id } },
                 { new: true }
             ).populate({ path: 'userID', model: 'Users', select: 'username profilePicture' }); // Giữ lại populate
 
             message = 'Đã thích bài đăng';
             isLikedByCurrentUser = true; // Trạng thái mới là true
         }
 
         if (!updatedPost) {
              return res.status(500).json({ message: 'Lỗi cập nhật trạng thái like của bài đăng' });
         }
 
         // Trả về thông tin bài đăng đã cập nhật và trạng thái like mới
         return res.status(200).json({
             message: message,
             // Thêm trường isLikedByCurrentUser vào response
             isLikedByCurrentUser: isLikedByCurrentUser,
             post: updatedPost
         });
 
     } catch (error) {
         console.error('Lỗi xử lý like bài đăng:', error);
         return res.status(500).json({ message: 'Lỗi server xử lý like bài đăng', error: error.message });
     }
 };

// Thêm bình luận
const addComment = async (req, res) => {
     try {
         const { postId } = req.params;
         const { content } = req.body;
         const userId = req.user.userID;
         const username = req.user.username; // Lấy username từ req.user
 
         if (!mongoose.Types.ObjectId.isValid(postId)) {
             return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
         }
 
         if (!content || content.trim() === '') {
             return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
         }
 
         const newComment = new CommentsModel({ postId: postId, userId: userId, username: username, content: content.trim() });
         await newComment.save();
 
         // (Tùy chọn) Cập nhật mảng comments trong PostModel
         await PostModel.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
 
         return res.status(201).json({ message: 'Đã bình luận', comment: newComment });
 
     } catch (error) {
         console.error('Lỗi thêm bình luận:', error);
         return res.status(500).json({ message: 'Lỗi server thêm bình luận', error: error.message });
     }
 };
 
//  Get  danh sách bình luận
const getComments = async (req, res) => {
     try {
         const { postId } = req.params;
 
         if (!mongoose.Types.ObjectId.isValid(postId)) {
             return res.status(400).json({ message: 'ID bài đăng không hợp lệ' });
         }
 
         const comments = await CommentsModel.find({ postId: postId })
             .sort({ createdAt: 1 }); // Sắp xếp theo thời gian tạo (cũ nhất trước)
             // .populate('userId', 'username profilePicture'); // (Tùy chọn) Lấy thông tin người dùng
 
         return res.status(200).json({ comments });
 
     } catch (error) {
         console.error('Lỗi lấy bình luận:', error);
         return res.status(500).json({ message: 'Lỗi server lấy bình luận', error: error.message });
     }
 };

module.exports = { createPost, getPostByUsernameAndPostId, deletePost, updatePost, getPostsByUser, getFeedPosts, searchPosts, toggleLikePost, addComment, getComments };
